/**
 * obsidian canvas数据转通用节点流数据
 */
export function factoryFlowData_obcanvas(parsedData:any|string): {code: number, msg: string, data: object} {
  // 使用demo数据
  if (typeof parsedData === "string") {
    if (parsedData == "demo") { parsedData = JSON.parse(JSON.stringify(testData_obcanvas)) }
    else { return {code: -1, msg: "error demo: "+parsedData, data: {}}  }
  }

  try {
    let nodes_new: object[] = []
    const nodes = parsedData.nodes;
    nodes.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: item.id,
        position: { x: item.x, y: item.y },
        ...(item.width ? {width: item.width+'px'} : {}),
        ...(item.height ? {height: item.height+'px'} : {}), // 通常只有group类型有高度
        data: {
          label: (item.hasOwnProperty("text")) ? item.text :  // type: text
            (item.hasOwnProperty("file")) ? item.file :       // type: 
            (item.hasOwnProperty("label")) ? item.label :     // type: group
            "Error Type: " + item.type,
          type: item.type,
        },
        // 数据新增：
        type: "obcanvas",
        ...(item.type=='group' ? {style: {zIndex: '-1'}}: {}),
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

export const testData_obcanvas = {
  "nodes":[
    {"id":"d1acdb5136ffb1f1","x":25,"y":70,"width":250,"height":60,"type":"text","text":"## Title\n\n**Test** *1*\n"},
    {"id":"f7dc36d69da1bb36","x":330,"y":70,"width":250,"height":60,"type":"text","text":"~~Test~~ ==2==\n"}
  ],
  "edges":[
    {"id":"fc3f1bc43902aac9","fromNode":"d1acdb5136ffb1f1","fromSide":"right","toNode":"f7dc36d69da1bb36","toSide":"left"}
  ]
}
