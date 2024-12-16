import {
  testData_itemData
} from "../test/itemData"

/**
 * 项节点数据
 * 
 * 一些统一的检查校验
 */
export function factoryFlowData_item(parsedData:any): {code: number, msg: string, data: object} {
    // 使用demo数据
    if (parsedData == "demo") { parsedData = JSON.parse(JSON.stringify(testData_itemData)) }
    else { console.error("error demo") }

  for (let item of parsedData["nodes"]) {
    if (!item.hasOwnProperty("position")) {
      item.position = { x: 0, y: 0 }
    }
    if (!item.hasOwnProperty("valueType") || item.valueType == "") {
      item.valueType = "item-default"
    }
    item.type = "item"
  }

  return { code: 0, msg: "", data: parsedData}
}
