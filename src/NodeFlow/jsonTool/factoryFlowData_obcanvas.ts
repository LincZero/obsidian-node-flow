import {
  testData_obcanvas,
} from "../test/testData"

/**
 * obsidian canvas数据转通用节点流数据
 */
export function factoryFlowData_obcanvas(parsedData:any): {code: number, msg: string, data: object} {
  // 使用demo数据
  if (parsedData == "demo") { parsedData = JSON.parse(JSON.stringify(testData_obcanvas)) }
  else { console.error("error demo") }

  try {
    let nodes_new: object[] = []
    const nodes = parsedData.nodes;
    nodes.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: item.id,
        position: { x: item.x, y: item.y },
        data: {
          label: (item.hasOwnProperty("text")) ? item.text :
            (item.hasOwnProperty("file")) ? item.file : "Error Type: " + item.type
        },
        // 数据舍弃：
        // item.width
        // item.height
        // item.type == "text"
        // 数据新增：
        type: "obcanvas",
      });
    })

    let edges_new: object[] = []
    const edges = parsedData.edges;
    edges.forEach((item:any) => {
      edges_new.push({
        // 数据转移：
        id: item.id,
        source: item.fromNode,
        target: item.toNode,
        sourceHandle: item.fromSide,
        targetHandle: item.toSide,
        // 数据新增：
        // type == "default"
        markerEnd: 'arrowclosed',
      });
    })

    return { code: 0, msg: "", data: {nodes: nodes_new, edges: edges_new}}
  } catch (error) {
    return {code: -1, msg: "error: obcanvas json parse fail: "+error, data: {}}
  }
}
