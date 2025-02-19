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
// 为了简化，默认值会忽略掉
function serializeFlowData_listitem(jsonData: any) {
  let newText = ""
  newText += "- nodes\n"
  // Node
  for (let node of jsonData.nodes) {
    newText += `  - ${node.id}${node.id==node.data.label?'':':'+node.data.label}\n`
    // Handle
    for (let socket of node.data.items) {
      newText += `    - ${socket.id}${socket.id==socket.name?'':':'+socket.name}, \
${(socket.refType=='v'||socket.refType=='value')?'':socket.refType}${socket.valueType=='item-default'?'':':'+socket.valueType}\
${(socket.value.trim()=='')?'':', '+socket.value}\n`
    }
  }
  newText += "- edges\n"
  // Edge
  for (let edge of jsonData.edges) {
    newText += `  - ${edge.source}, ${edge.sourceHandle}, ${edge.target}, ${edge.targetHandle}\n`
  }

  return { code: 0, msg: "", data: newText }
}
