import { useVueFlow } from '@vue-flow/core'
import {
  useNodeId, useNodesData,          // TheNode
  useNodeConnections,               // Other。注意: useHandleConnections API弃用，用useNodeConnections替代
} from '@vue-flow/core'
import { ComputedRef, computed, ref, unref, toRaw, watch } from 'vue';

interface ctx_type {
  sourceValues: {[key:string]: any},
  targetValues: {[key:string]: any},
  // sourceFlowValues: {[key:string]: any},
  // targetFlowValues: {[key:string]: any},
  check: Function
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
//
// TODO
// 重构，重构为一个可以用于node服务端的结构，当用像express node作为后端时，保持逻辑一致性
export class NFNode {
  // 静态的东西
  public readonly nodeId: string
  public propData: any
  public fn: (ctx: ctx_type) => Promise<boolean> = async () => { return true };
  private _useNodesData: ComputedRef<any>
  private _useSourceConnections: ComputedRef<any>
  private _useTargetConnections: ComputedRef<any>
  private readonly updateNodeData
  private readonly findNode

  // 运行时参数，仅运行时能保证一致性
  // 是将items转化为的更适合运行的版本: 
  // 1. 区分io (仅视觉使用时不区分target、source。仅当需要流程控制时才区分他们)
  // 2. 数组转对象，调用更快
  // 3. 不同的环境使用不同的上下文。js可以用vue proxy，python等可以用object，走http需要较精简
  // 4. 不与ctx2引用同一对象，避免干扰ctx2的数据驱动，或者方便http io时使用
  //    不然ctx会产生一个没有数据驱动的变化并同步到ctx2，然后ctx2的变化会视为没有变化 (本质是代理拦截操作)，不引起数据驱动
  // sourceValues全部就续 + targetFlowValues中至少一个就续，则激发自身
  
  public ctx: ctx_type
  // Proxy类型，用于将ctx内容的修改同步回去
  private ctx2: {
    sourceValues: {[key:string]: any},
    targetValues: {[key:string]: any},
    // sourceFlowValues: {[key:string]: any},
    // targetFlowValues: {[key:string]: any},
  }

  public static useFactoryNFNode(propData:any) {
    return new NFNode(useNodeId(), propData)
  }

  private constructor(nodeId: string, propData: any) {
    this.nodeId = nodeId
    this.propData = propData
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

  // 语法糖，用于检查需要的变量是否存在
  // 判断ctx中是否都有这些变量，如有任意一个缺失，抛出错误
  public static check(_ctx: any, source: [], target: []) {
    const missingSourceValues = source.filter(key => !(key in _ctx.sourceValues));
    if (missingSourceValues.length > 0) {
      throw new Error(`Missing source values: ${missingSourceValues.join(', ')}`);
    }
    const missingTargetValues = target.filter(key => !(key in _ctx.targetValues));
    if (missingTargetValues.length > 0) {
      throw new Error(`Missing target values: ${missingTargetValues.join(', ')}`);
    }
  }

  // 被调用：主动触发或被动触发
  public async start() {
    let ret: boolean;

    // step0. 初始化，TODO 有多个上游节点时，这里不应该被重复调用
    await this.start_ctxInit()

    // step1. 处理上一节点
    ret = await this.start_dealLast()
    if (!ret) return
  
    // step2. 处理本节点
    ret = await this.start_dealSelf()
    if (!ret) return
  
    // step3. 处理、激发下一个节点
    await this.start_dealNext()
  }

  // 清空、准备上下文对象
  private async start_ctxInit() {
    this.ctx = {
      targetValues: {},
      sourceValues: {},
      check: NFNode.check
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
          cacheValue: item.value, // 如果没有上游节点，就是自身默认值
        }
      }
      if (item.refType != 'o' && item.refType != 'output') {
        this.ctx2.sourceValues[item.id] = item;
        this.ctx.sourceValues[item.id] = {
          id: item.id,
          name: item.name,
          value: item.value,
          cacheValue: item.value, // 如果没有上游节点，就是自身默认值
        }
      }
    }
  }

  // 处理上一节点
  // 获取上一个节点的值，遍历所有连接线
  private async start_dealLast(): Promise<boolean> {
    for (const connection of this._useSourceConnections.value) {
      const sourceNode = this.findNode(connection.source)

      // 上游节点状态检查
      if (sourceNode.data.runState != 'over') { // 前面的节点没准备好，等待下一次被激活
        console.warn(`#${this.nodeId} 前面的 #${connection.source} 没准备好，等待再次被激发`)
        // TODO 有线程冲突风险，一个方法是加个定时器待会再检查一下
        // 好像不会变回none，好像updateNodeData重复赋值runState同一个值也会触发watch来着
        // thisData.data.runState = 'ready'; updateNodeData(this.id, thisData.data);
        // const thisData = findNode(this.id)
        return false
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
    return true
  }

  // 处理自身节点
  private async start_dealSelf(): Promise<boolean> {
    this.propData.runState = 'running'; this.updateNodeData(this.nodeId, this.propData);

    // 执行自定义代码
    const result = await this.fn(this.ctx)
    if (!result) {
      this.propData.runState = 'error'; this.updateNodeData(this.nodeId, this.propData);
      // 不return，出错了也要同步结果回去 (会有错误信息)
    }

    // 将输出结果同步回去 (TODO 思考是否应该不要只遍历输出节点，万一想看一下呢？)
    for (const [key, item] of Object.entries(this.ctx.targetValues)) {
      const tmp = this.ctx2.targetValues[key]
      if (tmp) {
        tmp.id = item.id
        tmp.name = item.name
        tmp.value = item.value
        tmp.cacheValue = item.cacheValue ?? item.value
      }
    }

    if (this.propData.runState == 'error') return false
    this.propData.runState = 'over'; this.updateNodeData(this.nodeId, this.propData);
    return true
  }

  // 处理、激发下一个节点
  // TODO 不要激发全部的下层节点
  // - 可能有failed分支
  // - 下个节点要等待所有上游节点才能触发
  private async start_dealNext() {
    if (this._useNodesData.value.data.runState != 'over') {
      console.warn(`#${this.nodeId} 状态 ${this._useNodesData.value.data.runState}，停止向后激发`)
      return
    }
    const targetNodesId: string[] = Array.from(new Set(this._useTargetConnections.value.map((connection:any) => connection.target))) // 避免重复
    for (const nodeId of targetNodesId) {
      const data = this.findNode(nodeId).data // TODO 这里最好能获取到 propsData，不然可能有bug
      data.runState = 'ready'; this.updateNodeData(nodeId, data); // 能监听到 ready->ready，watch newVal 允许用相等的值重复赋值
    }
    if (targetNodesId.length == 0) {
      console.log(`flowControl, end`);
    }
  }
}
