import { useVueFlow } from '@vue-flow/core'
import {
  useNodeId, useNodesData,          // TheNode
  useNodeConnections,               // Other。注意: useHandleConnections API弃用，用useNodeConnections替代
} from '@vue-flow/core'
import { ComputedRef, computed, ref, unref, toRaw, watch } from 'vue';

/**
 * 流程控制
 * 
 * 流程: 获取值 -> 执行回调函数 + 缓存值 -> 激发下一节点
 */
export function useFlowControl(fn : (ctx:any)=>Promise<boolean> = async () => { return true }) {
  return new NFNode(useNodeId(), fn)
}

// 带控制的节点类
// 
// 一致性：仅开始运行时会自动同步一次数据，平时不确保一致性。或者调用update方法自动更新以保证一致性
// 
// 注意项
// - use类: **必须**在setup作用域下构造 (使用了inject的use组合函数)，完成闭包
// - 控制附加、装饰类: 如果节点流像NodeFlow的V1.0版本那样是用于纯显示的，则可以去除对该类的依赖和使用
// - 功能类、运行时类、RAII类: 仅控制流程，尽量不存储状态，避免需要维护一致性
// 
// 封装成类主要是为了：
// 1. 方便在中间插入自定义行为
// 2. 方便evalItem中用户脚本的调用
//
// 流程
// 1. setup作用域创建实例，自动注册watch
// 2. 手动启动 start()
//   1. 清空上下文 | start_ctxInit   | 重初始化 ctx
//   2. 处理上游节点 | start_dealLast | 填充 ctx.sourceValues
//   3. 处理自身节点 | start_dealSelf | 填充 ctx.targetValues
//   4. 处理下游节点 | start_dealLast
class NFNode {
  // 静态的东西
  nodeId: string
  private fn: (ctx: any) => Promise<boolean>;
  private _useNodesData: ComputedRef<any>
  private _useSourceConnections: ComputedRef<any>
  private _useTargetConnections: ComputedRef<any>
  private updateNodeData
  private findNode

  // 运行时参数，仅运行时能保证一致性
  // 是将items转化为的更适合运行的版本: 
  // 1. 区分io (仅视觉使用时不区分target、source。仅当需要流程控制时才区分他们)
  // 2. 数组转对象，调用更快
  // 3. 不同的环境使用不同的上下文。js可以用vue proxy，python等可以用object，走http需要较精简
  // 4. 不与ctx2引用同一对象，避免干扰ctx2的数据驱动，或者方便http io时使用
  //    不然ctx会产生一个没有数据驱动的变化并同步到ctx2，然后ctx2的变化会视为没有变化 (本质是代理拦截操作)，不引起数据驱动
  private ctx: {
    targetValues: {[key:string]: any},
    sourceValues: {[key:string]: any},
  }
  // Proxy类型，用于将ctx内容的修改同步回去
  private ctx2: {
    targetValues: {[key:string]: any},
    sourceValues: {[key:string]: any},
  }

  constructor(nodeId: string, fn: (ctx: any) => Promise<boolean>) {
    this.nodeId = nodeId
    this.fn = fn
    this._useNodesData = useNodesData(this.nodeId)
    this._useSourceConnections = useNodeConnections({ handleType: 'target' })
    this._useTargetConnections = useNodeConnections({ handleType: 'source' })
    const { updateNodeData, findNode } = useVueFlow()
    this.updateNodeData = updateNodeData
    this.findNode = findNode

    // 流程控制 - 钩子 (注意修改和监听的都是节点的数据，而不是handle的数据)
    this._useNodesData.value.data['runState'] = 'none'
    watch(this._useNodesData, (newVal, oldVal) => { // watch: props.data.runState
      if (newVal.data.runState == 'ready') {
        this.start();
      }
    });
    
    console.log('>>> UseNFNode ' + this.nodeId)
  }

  // 被调用：主动触发或被动触发
  public async start() {
    await this.start_ctxInit()

    // step1. 处理上一节点
    await this.start_dealLast()
  
    // step2. 处理本节点
    await this.start_dealSelf()
  
    // step3. 处理、激发下一个节点
    await this.start_dealNext()
  }

  // 清空、准备上下文对象
  public async start_ctxInit() {
    this.ctx = {
      targetValues: {},
      sourceValues: {},
    }
    this.ctx2 = {
      targetValues: {},
      sourceValues: {},
    }

    const thisItems = this._useNodesData.value.data.items
    for (const item of thisItems) {
      if (item.refType == 'o' || item.refType == 'output' || item.refType == 'io') {
        this.ctx2.targetValues[item.id] = item;
        this.ctx.targetValues[item.id] = {
          id: item.id,
          name: item.name,
          value: item.value,
          cacheValue: undefined,
        }
      }
      if (item.refType != 'o' && item.refType != 'output') {
        this.ctx2.sourceValues[item.id] = item;
        this.ctx.sourceValues[item.id] = {
          id: item.id,
          name: item.name,
          value: item.value,
          cacheValue: undefined,
        }
      }
    }
  }

  // 处理上一节点
  // 获取上一个节点的值，遍历所有连接线
  public async start_dealLast() {
    for (const connection of this._useSourceConnections.value) {
      const sourceNode = this.findNode(connection.source)

      // 上游节点状态检查
      if (sourceNode.data.runState != 'over') { // 前面的节点没准备好，等待下一次被激活
        console.warn(`#${this.nodeId} 前面的 #${connection.source} 没准备好，等待再次被激发`)
        // TODO 有线程冲突风险，一个方法是加个定时器待会再检查一下
        // 好像不会变回none，好像updateNodeData重复赋值runState同一个值也会触发watch来着
        // thisData.data.runState = 'ready'; updateNodeData(this.id, thisData.data);
        // const thisData = findNode(this.id)
        return
      }

      // 上游节点项的值获取
      const sourceItems = sourceNode.data.items
      for (const item of sourceItems) { // TODO socket值的获取很烦，不能直接获取，要绕个大弯。有非常大的优化空间。如item的寻找速度可以优化，用key-value
        if (item.id == connection.sourceHandle) {
          // 自身节点项的值
          const newValue = (item.cacheValue ?? item.value) + '';
          this.ctx2.sourceValues[connection.targetHandle].cacheValue = newValue; this.ctx.sourceValues[connection.targetHandle].cacheValue = newValue
          break
        }
      }
    }
  }

  // 处理自身节点
  public async start_dealSelf() {
    const thisData = this.findNode(this.nodeId)
    thisData.data.runState = 'running'; this.updateNodeData(this.nodeId, thisData.data);

    // 执行自定义代码
    const result = await this.fn(this.ctx)
    if (!result) {
      thisData.data.runState = 'error'; this.updateNodeData(this.nodeId, thisData.data);
      return
    }

    // 将输出结果同步回去
    for (const [key, item] of Object.entries(this.ctx.targetValues)) {
      const tmp = this.ctx2.targetValues[key]
      if (tmp) {
        tmp.id = item.id
        tmp.name = item.name
        tmp.value = item.value
        tmp.cacheValue = item.cacheValue ?? item.value
      }
    }
    thisData.data.runState = 'over'; this.updateNodeData(this.nodeId, thisData.data);
  }

  // 处理、激发下一个节点
  // TODO 不要激发全部的下层节点
  // - 可能有failed分支
  // - 下个节点要等待所有上游节点才能触发
  public async start_dealNext() {
    const targetNodesId: string[] = Array.from(new Set(this._useTargetConnections.value.map((connection:any) => connection.target))) // 避免重复
    for (const nodeId of targetNodesId) {
      const data = this.findNode(nodeId).data
      data.runState = 'ready'; this.updateNodeData(nodeId, data);
    }
    if (targetNodesId.length == 0) {
      console.log(`flowControl, end`);
    }
  }
}
