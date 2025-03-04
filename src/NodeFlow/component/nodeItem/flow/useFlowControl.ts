import { useVueFlow } from '@vue-flow/core'
import {
  useNodeId, useNodesData,          // TheNode
  useNodeConnections,               // Other。注意: useHandleConnections API弃用，用useNodeConnections替代
} from '@vue-flow/core'
import { ComputedRef, computed, ref, watch } from 'vue';

/**
 * 流程控制
 * 
 * 流程: 获取值 -> 执行回调函数 + 缓存值 -> 激发下一节点
 */
export function useFlowControl(fn = async ()=>{ return true }) {
  return new NFNode(useNodeId(), fn)
}

// 带控制的节点类
// 
// 注意项
// - 控制附加、装饰类: 如果节点流像NodeFlow的V1.0版本那样是用于纯显示的，则可以去除对该类的依赖和使用
// - use类: 需要在setup作用域下构造 (使用了inject的use组合函数)，完成闭包
// - 功能类、运行时类、RAII类: 仅控制流程，尽量不存储状态，避免需要维护一致性
// 
// 封装成类主要是为了：
// 1. 方便在中间插入自定义行为
// 2. 方便evalItem中用户脚本的调用
class NFNode {
  // 静态的东西
  id: string
  fn: Function
  private _useSourceConnections: ComputedRef<any>
  private _useTargetConnections: ComputedRef<any>
  private updateNodeData: Function
  private findNode: Function

  // 仅用于运行缓存
  private thisNode: any

  // 仅视觉使用时不区分target、source。仅当需要流程控制时才区分他们
  // public: ctx

  constructor(id: string, fn: Function) {
    this.id = id
    this.fn = fn
    this._useSourceConnections = useNodeConnections({ handleType: 'target' })
    this._useTargetConnections = useNodeConnections({ handleType: 'source' })
    const { updateNodeData, findNode } = useVueFlow()
    this.updateNodeData = updateNodeData
    this.findNode = findNode
    
    console.log('>>> UseNFNode ' + this.id)
  }

  public async start() {
    // step1. 处理上一节点
    this.start_dealLast()
  
    // step2. 处理本节点
    const thisData = this.findNode(this.id)
    thisData.data.runState = 'running'; this.updateNodeData(this.id, thisData.data);
    const result = await this.fn()
    if (!result) {
      thisData.data.runState = 'error'; this.updateNodeData(this.id, thisData.data);
      return
    }
    thisData.data.runState = 'over'; this.updateNodeData(this.id, thisData.data);
  
    // step3. 处理、激发下一个节点
    this.start_dealNext()
  }

  // 处理上一节点
  // 获取上一个节点的值，遍历所有连接线
  public async start_dealLast() {
    for (const connection of this._useSourceConnections.value) {
      // 对端节点项的值
      const sourceNode = this.findNode(connection.source)
      if (sourceNode.data.runState != 'over') { // 前面的节点没准备好，等待下一次被激活
        console.warn(`#${this.id} 前面的 #${connection.source} 没准备好，等待再次被激发`)
        // TODO 有线程冲突风险，一个方法是加个定时器待会再检查一下
        // 好像不会变回none，好像updateNodeData重复赋值runState同一个值也会触发watch来着
        // thisData.data.runState = 'ready'; updateNodeData(this.id, thisData.data);
        // const thisData = findNode(this.id)
        return
      }
      const sourceItems = sourceNode.data.items
      let sourceValue = ""
      for (const item of sourceItems) { // TODO socket值的获取很烦，不能直接获取，要绕个大弯。有非常大的优化空间。如item的寻找速度可以优化，用key-value
        if (item.id == connection.sourceHandle) {
          sourceValue = item.cacheValue ?? item.value // cahceView > defaultView(value)
          break
        }
      }

      // 自身节点项的值
      const thisNode = this.findNode(this.id)
      const thisItems = thisNode.data.items
      for (const item of thisItems) {
        if (item.id == connection.targetHandle) {
          item.cacheValue = sourceValue // cahceView > defaultView(value)
          break
        }
      }
    }
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
