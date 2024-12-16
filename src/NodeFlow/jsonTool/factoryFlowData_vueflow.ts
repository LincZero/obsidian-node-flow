import {
  testData_vueflow,
  testData_vueflow_withoutPos,
  testData_vueflow_customNode,
} from "../test/testData"

export function factoryFlowData_vueflow(parsedData:any): {code: number, msg: string, data: object} {
  // 使用demo数据
  if (parsedData == "demo") { parsedData = JSON.parse(JSON.stringify(testData_vueflow)) }
  else if (parsedData == "demo2") { parsedData = JSON.parse(JSON.stringify(testData_vueflow_withoutPos)) }
  else if (parsedData == "demo3") { parsedData = JSON.parse(JSON.stringify(testData_vueflow_customNode)) }
  else { console.error("error demo") }

  return {code: 0, msg: "", data: parsedData}
}
