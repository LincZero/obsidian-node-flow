// https://vueflow.dev/examples/layout.html

import dagre from '@dagrejs/dagre'
import { Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'

/**
 * 可组合以在图上运行布局算法
 * 
 * 它使用 `dagre` 库来计算节点和边的布局
 * 
 * 使用：
 * ```ts
 * const { layout } = useLayout()
 * nodes.value = layout(nodes.value, edges.value, direction)
 * const { fitView } = useVueFlow()
 * nextTick(() => { fitView() })
 * ```
 * 
 * dagreGroup原理：
 * dagreGroup会独立存储一份节点位置模型 (这里面可能有内存一致性问题)
 * 为方便起见接下来我会称该项目的图数据为 "原节点数据"，dagreGroup的图数据为 "dagre库节点数据"
 * 1. `原节点数据` --同步节点大小与线数据--> `dagre库节点数据`
 * 2. `dagre库节点数据` 进行自动布局
 * 3. `dagre库节点数据` --同步位置数据--> `原节点数据`
 * 
 * @return
 * layout函数必须返回的形式使用！并且layout的首次使用应当在节点初始化后！否则 `findNode` 获取节点失败
 * 如果遇到bug，很大概率需要检查findNode函数是否能获取成功
 * 这里为什么要返回函数而不直接使用？因为这里使用了闭包
 */
export function useLayout() {
  // 闭包环境 (这些变量会在每个返回的layout闭包实体中单独存一份，且因为layout闭包实体而延长生命周期)
  const { findNode } = useVueFlow()
  const graph = ref(new dagre.graphlib.Graph())
  const previousDirection = ref('LR')

  /** 
   *  一个函数，原型为 (nodes: any, edges: any, direction: any) => any
   * 输入节点、边、顺序后，会计算并返回新的节点位置
   * 
   * @param direction 方向，LR或其他
   */
  function layout(nodes, edges, direction) {
    // 更新闭包缓存
    // 我们创建一个新的图实例，以防一些节点/边被删除，否则dagre会表现得好像它们还在那里
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: direction })
    graph.value = dagreGraph
    previousDirection.value = direction


    // 1. 同步节点和线数据到dagre库
    for (const node of nodes) {
      if (node.data.type == "group") continue // 跳过节点组

      // 如果你的布局需要节点的宽度和高度，你可以使用内部节点的dimensions属性 (`GraphNode` type)
      const graphNode = findNode(node.id)
      dagreGraph.setNode(node.id, { width: graphNode?.dimensions?.width??150, height: graphNode?.dimensions?.height??50 })

      // if (!graphNode) { console.warn("cannot find node by id: ", node.id) }
      // else { console.log("success find node by id: ", node.id, "w/h: ", graphNode?.dimensions?.width, graphNode?.dimensions?.height) }
    }
    for (const edge of edges) {
      dagreGraph.setEdge(edge.source, edge.target)
    }

    // step2. dagre库自动布局
    dagre.layout(dagreGraph)

    // step3. 同步dagre库位置数据回来
    return nodes.map((node) => {
      if (node.data.type == "group") return node // 跳过节点组
      
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        targetPosition: (direction === 'LR') ? Position.Left : Position.Top,
        sourcePosition: (direction === 'LR') ? Position.Right : Position.Bottom,
        position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      }
    })
  }

  return { layout }
}

/**
 * 用于对节点组的排序进行补强
 */
function layout2(nodes, edges, direction) {
  // 更新闭包缓存
  // 我们创建一个新的图实例，以防一些节点/边被删除，否则dagre会表现得好像它们还在那里
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction })
  graph.value = dagreGraph
  previousDirection.value = direction


  // 1. 同步节点和线数据到dagre库
  for (const node of nodes) {
    // 如果你的布局需要节点的宽度和高度，你可以使用内部节点的dimensions属性 (`GraphNode` type)
    const graphNode = findNode(node.id)
    dagreGraph.setNode(node.id, { width: graphNode?.dimensions?.width??150, height: graphNode?.dimensions?.height??50 })

    // if (!graphNode) { console.warn("cannot find node by id: ", node.id) }
    // else { console.log("success find node by id: ", node.id, "w/h: ", graphNode?.dimensions?.width, graphNode?.dimensions?.height) }
  }
  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target)
  }

  // step2. dagre库自动布局
  dagre.layout(dagreGraph)

  // step3. 同步dagre库位置数据回来
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      targetPosition: (direction === 'LR') ? Position.Left : Position.Top,
      sourcePosition: (direction === 'LR') ? Position.Right : Position.Bottom,
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
    }
  })
}
