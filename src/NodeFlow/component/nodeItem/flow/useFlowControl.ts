import { useVueFlow } from '@vue-flow/core'

/**
 * 流程控制
 */
export function useFlowControl(thisId: string, _useSourceConnections: any, _useTargetConnections: any, fn = async ()=>{ return true }) {
  // 闭包。缓存需要在setup作用域下执行获取的东西 (使用了inject的use组合函数)，并闭包
  const { updateNodeData, findNode } = useVueFlow()

  return async function flowControl () {
    // step1. 处理上一节点
    // 获取上一个节点的值
    // 遍历所有连接线
    for (const connection of _useSourceConnections.value) {
      // 对端节点项的值
      let sourceValue = ""
      const sourceNode = findNode(connection.source)
      const sourceItems = sourceNode.data.items
      for (const item of sourceItems) { // TODO socket值的获取很烦，不能直接获取，要绕个大弯。有非常大的优化空间。如item的寻找速度可以优化，用key-value
        if (item.id == connection.sourceHandle) {
          sourceValue = item.cacheValue ?? item.value // cahceView > defaultView(value)
          break
        }
      }

      // 自身节点项的值
      const thisNode = findNode(thisId)
      const thisItems = thisNode.data.items
      for (const item of thisItems) {
        if (item.id == connection.targetHandle) {
          item.cacheValue = sourceValue // cahceView > defaultView(value)
          break
        }
      }
    }
  
    // step2. 处理本节点
    const result = await fn()
    const thisData = findNode(thisId)
    if (!result) {
      thisData.data.runState = 'error'; updateNodeData(thisId, thisData.data);
      return
    }
    thisData.data.runState = 'over'; updateNodeData(thisId, thisData.data);
  
    // step3. 处理、激发下一个节点
    // TODO 不要激发全部的下层节点
    // - 可能有failed分支
    // - 下个节点要等待所有上游节点才能触发
    const targetNodesId: string[] = Array.from(new Set(_useTargetConnections.value.map((connection:any) => connection.target))) // 避免重复
    for (const nodeId of targetNodesId) {
      const data = findNode(nodeId).data
      data.runState = 'running'; updateNodeData(nodeId, data);
    }
    if (targetNodesId.length == 0) {
      console.log(`flowControl, end`);
    }
  }
}
