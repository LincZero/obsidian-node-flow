export function serializeFlowData (jsonType: string, jsonData: any): {code: number, msg: string, data: string} {
  if (jsonType == "nodeflow-item") {
    return serializeFlowData_item(jsonData)
  }
  else if (jsonType == "nodeflow-listitem") {
    return serializeFlowData_listitem(jsonData)
  }
  else if (jsonType == "nodeflow-list") {
    return serializeFlowData_listitem(jsonData) // listitem向下兼容list，这里用listitem的序列化程序就行了
  }
  return { code: -1, msg: "No supported serialization in this jsonType: " + jsonType, data: ""}
}

function serializeFlowData_item(jsonData: any) {
  // 要点：将nodes的type和valueType去掉
  const newJsonData: any = { nodes: [], edges: [] }
  for (let node of jsonData.nodes) {
    newJsonData.nodes.push({
      id: node.id,
      data: node.data
    })
  }
  newJsonData.edges = jsonData.edges
  return { code: 0, msg: "", data: JSON.stringify(newJsonData, null, 2) }
}

// 暂时不支持嵌套nodeitem
function serializeFlowData_listitem(jsonData: any) {
  let newText = ""
  newText += "- nodes\n"
  for (let node of jsonData.nodes) {
    newText += `  - ${node.id}:${node.data.label}\n`
    for (let item of node.data.items) {
      newText += `    - ${item.id}:${item.name}, ${item.refType}:${item.valueType}, ${item.value}\n`
    }
  }
  newText += "- edges\n"
  for (let edge of jsonData.edges) {
    newText += `  - ${edge.source}, ${edge.sourceHandle}, ${edge.target}, ${edge.targetHandle}\n`
  }

  return { code: 0, msg: "", data: newText }
}
