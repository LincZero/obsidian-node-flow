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
  // 而且 useVueFlow 要在 setup 阶段被运行
  const { findNode } = useVueFlow()

  /** 
   * 一个函数，原型为 (nodes: any, edges: any, direction: any) => any
   * 输入节点、边、顺序后，会计算并返回新的节点位置
   * 
   * @param direction 方向，`LR` 或其他
   * @param amend 修正. 'none' 不生效，'center' 为重心对齐
   */
  function calcLayout(nodes, edges, direction, amend='none') {
    // step0. 准备
    // 我们创建一个新的画布实例，以防一些节点/边被删除。并配置
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({
      rankdir: direction,   // 方向 (上一层往下一层的方向)
      ranksep: 50,          // 节点间隔 (不同级)，default: 50
      // align: 'DL',       // 对齐 (同一层的节点之间怎么对齐)，default: DR (LR rankdird)
      nodesep: 60,          // 节点间隔 (同级节点之间)，default: 50
    })

    // step1. 同步节点和线数据到dagre库画布
    for (const node of nodes) {
      if (node.data.type == "group") continue // 跳过节点组
      const nodeFound = findNode(node.id)
      // 注意：可以使用内部节点的dimensions属性 (`GraphNode` type) 获取宽高
      // 被嵌套的节点没有宽高尺寸
      dagreGraph.setNode(node.id, { width: nodeFound?.dimensions?.width || 150, height: nodeFound?.dimensions?.height || 50 })
      // console.log('node id w h:', node.id, nodeFound?.dimensions?.width, nodeFound?.dimensions?.height)
      // if (!nodeFound) { console.warn("cannot find node by id: ", node.id) }
      // else { console.log("success find node by id: ", node.id, "w/h: ", nodeFound?.dimensions?.width, nodeFound?.dimensions?.height) }
    }
    for (const edge of edges) {
      dagreGraph.setEdge(edge.source, edge.target)
    }

    // step2. dagre库自动布局
    dagre.layout(dagreGraph)
    // console.log('dagre ', dagreGraph) // nodes {h w x y rank }, rank 是第几个level(rank)的意思

    // step3. 同步dagre库位置数据回来 (这里不更新源数据，在外面自行更新)
    let max_rank = 0
    let newNodes = nodes.map((node) => {
      if (node.data.type == "group") return node // 跳过节点组
      
      const nodeWithPosition = dagreGraph.node(node.id)
      if (nodeWithPosition.rank > max_rank) max_rank = nodeWithPosition.rank
      return {
        ...node,
        targetPosition: (direction === 'LR') ? Position.Left : Position.Top,
        sourcePosition: (direction === 'LR') ? Position.Right : Position.Bottom,
        position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      }
    })

    if (amend == 'none') return newNodes

    // step4. (new) 数据修正。rank的计算是对的，但xy的计算有问题。这里复用一下rank，然后我自己重算一下x, y
    // 强制LR布局
    // 如果画布分成了多个不相连的部分，没有判断这种情况并进行额外优化，效果会比较差
    const list_rankNodes = []
    const list_maxY = []
    const list_maxX = []
    ;{
      let maxX = 0
      const ranksep = 50 // x, 不同rank
      const nodesep = 60 // y, 同rank。因为有id额外显示，这里稍大一点显示会更好
      for (let currentRank=0; currentRank<max_rank+2; currentRank+=2) { // 遍历所有rank [0, max_rank, step2] 步进不知道为什么是2，很奇怪

        const currentRankNodes = [] // 用于给后面的遍历加速
        let currentRankWidth = 0    // 同级盒宽度 (最终不含边距)
        let currentRankHeight = 0   // 同级盒高度 (最终不含边距)
        for (const node of newNodes) { // 遍历同一rank下的所有节点，把这些节点加在一起看成一个有x,y属性的box
          const dagreGraphNode = dagreGraph.node(node.id)
          if (dagreGraphNode.rank != currentRank) continue

          // x,y (左上对齐 + 内部撑开)
          // 该步骤只调整y。如果比所有的源节点都高 (比y要小)，那么下降为最高的那个源节点 (自个大y)。从而形成更好的对齐
          if (amend == 'top') {
            let sourceMinY = null // 有可能没有上游节点
            for (const edge of edges) {
              if (edge.target == node.id) {
                const lastNode = dagreGraph.node(edge.source)
                if (!sourceMinY) sourceMinY = lastNode.y
                else sourceMinY = Math.min(sourceMinY, lastNode.y)
              }
            }

            dagreGraphNode.x = maxX
            dagreGraphNode.y = currentRankHeight
            if (sourceMinY) dagreGraphNode.y = Math.max(sourceMinY, dagreGraphNode.y)
          }
          // x,y (中心对齐 + 内部撑开)
          // TODO 可以再优化：例如上游节点再分出多个下游节点时。可以绑定成组再整体移动。但1->n和n->1混合时不好弄
          else if (amend == 'center') {
            let sourceMinY = null // 有可能没有上游节点。源节点中最靠上的那个的中心点
            for (const edge of edges) {
              if (edge.target == node.id) {
                const lastNode = dagreGraph.node(edge.source)
                if (!sourceMinY) sourceMinY = (lastNode.y + lastNode.height/2)
                else sourceMinY = Math.min(sourceMinY, (lastNode.y + lastNode.height/2))
              }
            }

            dagreGraphNode.x = maxX
            dagreGraphNode.y = currentRankHeight
            if (sourceMinY) {
              if (currentRankHeight == 0) { // 同一rank的第一个元素有一个特权：高度可以突破0往上
                dagreGraphNode.y = sourceMinY - dagreGraphNode.height/2
              } else {
                dagreGraphNode.y = Math.max(sourceMinY, (dagreGraphNode.y + dagreGraphNode.height/2)) - dagreGraphNode.height/2
              }
            }
          }

          // currentBox
          currentRankNodes.push(node)
          if (dagreGraphNode.width > currentRankWidth) currentRankWidth = dagreGraphNode.width
          currentRankHeight = dagreGraphNode.y + dagreGraphNode.height + nodesep
        }

        // x,y (弃用 ~~选用~~) (这个是不使用内部撑开时的用法)
        // if (amend == 'center') {
        //   for (const node of currentRankNodes) {
        //     const dagreGraphNode = dagreGraph.node(node.id)
        //     dagreGraphNode.x = maxX + (currentRankWidth - dagreGraphNode.width)/2 // x的修改是可选的
        //     dagreGraphNode.y = dagreGraphNode.y - currentRankHeight/2 + 500       // 500是避免位置太靠上
        //   }
        // }

        if (currentRankHeight > nodesep) currentRankHeight -= nodesep
        maxX += currentRankWidth + ranksep
        list_rankNodes.push(currentRankNodes)
        list_maxY.push(currentRankHeight)
        list_maxX.push(currentRankWidth)
      }
    }

    newNodes = nodes.map((node) => {
      if (node.data.type == "group") return node // 跳过节点组
      
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        targetPosition: (direction === 'LR') ? Position.Left : Position.Top,
        sourcePosition: (direction === 'LR') ? Position.Right : Position.Bottom,
        position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      }
    })

    return newNodes
  }
  return { calcLayout }
}
