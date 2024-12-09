export const testData_itemData = {
  "nodes": [
    {
      "id": 6,
      "name": "CLIP文本编码器",
      "valueType": "CLIPTextEncode",
      // 可选(自动布局) "bounds": { "x": 373, "y": 47, "width": 422.84503173828125, "height": 164.31304931640625 },
      "items": [
        {
          "id": "1",
          "name": "clip",
          "refType": "input",
          // 可选 "ref": "", 用于指向传递过来的节点id和位置?
          "valueType": "CLIP",
          "value": "",
          // 可选 "widgetType": ""
        },
        {
          "id": "2",
          "name": "clip",
          "refType": "output",
          "valueType": "CLIP",
          "value": "",
        },
        {
          "id": "3",
          "name": "",
          "refType": "value",
          "valueType": "CLIP",
          "value": "",
        }
      ],
    }
  ]
}
