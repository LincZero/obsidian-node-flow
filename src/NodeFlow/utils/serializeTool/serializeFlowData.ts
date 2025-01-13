export function serializeFlowData (jsonType: string, jsonData: any): {code: number, msg: string, data: string} {
  if (jsonType == "nodeflow-item") {
    return serializeFlowData_item(jsonData)
  }
  else if (jsonType == "nodeflow-itemlist") {
    return serializeFlowData_listitem(jsonData)
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

function serializeFlowData_listitem(jsonData: any) {
  return { code: -1, msg: "Failed to serialize listitem flowData", data: ""}
}
