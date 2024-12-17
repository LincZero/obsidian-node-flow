/**
 * 项节点数据
 * 
 * 一些统一的检查校验
 */
export function factoryFlowData_item(parsedData:any|string): {code: number, msg: string, data: object} {
    // 使用demo数据
    if (typeof parsedData === "string") {
      if (parsedData.startsWith("demo")) { parsedData = JSON.parse(JSON.stringify(testData_itemData)) }
      else { return {code: -1, msg: "error demo: "+parsedData, data: {}}  }
    }

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

const testData_itemData = {
  "nodes": [
    {
      "id": 6,
      "data": {
        "label": "itemData testData",
        "valueType": "itemData valueType",
        // 可选(自动布局) "bounds": { "x": 373, "y": 47, "width": 422.84503173828125, "height": 164.31304931640625 },
        "items": [
          {
            "id": "01",
            "name": "null",
            "refType": "input",
            "valueType": "item-default",
            "value": "",
          },
          {
            "id": "02",
            "name": "null",
            "refType": "output",
            "valueType": "item-default",
            "value": "",
          },
          {
            "id": "03",
            "name": "color",
            "refType": "input",
            "valueType": "item-color",
            "value": "#2283fc",
          },
          {
            "id": "1",
            "name": "number",
            "refType": "input",
            // 可选 "ref": "", 用于指向传递过来的节点id和位置?
            "valueType": "item-default",
            "value": "123",
            // 可选 "widgetType": ""
          },
          {
            "id": "2",
            "name": "number",
            "refType": "output",
            "valueType": "item-default",
            "value": "456",
          },
          {
            "id": "3",
            "name": "vName",
            "refType": "value",
            "valueType": "item-default",
            "value": "vValue",
          },
          {
            "id": "4",
            "name": "clip",
            "refType": "input",
            "valueType": "item-default",
            "value": "",
          },
          {
            "id": "5",
            "name": "clip",
            "refType": "output",
            "valueType": "item-default",
            "value": "",
          },
          {
            "id": "6",
            "name": "selectName",
            "refType": "value",
            "valueType": "item-dropdown",
            "value": "select1|select2|select3",
          },
          {
            "id": "7",
            "name": "markdown",
            "refType": "value",
            "valueType": "item-markdown",
            "value": "## Markdown\n\n**bord** *italic* ==highlight== ~~del~~",
          }
        ],
      }
    }
  ]
}
