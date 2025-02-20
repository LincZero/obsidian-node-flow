import { useVueFlow } from '@vue-flow/core'

/**
 * 流程控制
 */
export function useFlowControl(thisId: string, _useSourceConnections: any, _useTargetConnections: any) {
  // 闭包。缓存需要在setup环境下执行获取的东西，并闭包
  const { updateNodeData, findNode } = useVueFlow()

  return async function flowControl () {
    // step1. 处理上一节点
    // 获取上一个节点的值
    // TODO socket值的获取很烦，不能直接获取，要绕个大弯。有非常大的优化空间。如item的寻找速度可以优化，用key-value
    for (const connection of _useSourceConnections.value) {
      const sourceNode = findNode(connection.source)
      const sourceItems = sourceNode.data.items
      let sourceValue = ""
      for (const item of sourceItems) {
        if (item.id == connection.sourceHandle) {
          sourceValue = item.cacheValue ?? item.value // cahceView > defaultView(value)
          break
        }
      }
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
    const thisData = findNode(thisId)
    thisData.data.runState = 'over'; updateNodeData(thisId, thisData.data);
  
    // step3. 处理后面节点
    // 尝试运行下一个节点的debugConsole
    // TODO 不要激发全部的下层节点，毕竟有failed分支
    const targetNodesId: string[] = Array.from(new Set(_useTargetConnections.value.map((connection:any) => connection.target)))
    for (const nodeId of targetNodesId) {
      const data = findNode(nodeId).data
      data.runState = 'running'; updateNodeData(nodeId, data);
    }
    if (targetNodesId.length == 0) {
      console.log(`flowControl, end`);
    }
  }
}
