import { factoryFlowData_vueflow } from "./factoryFlowData_vueflow"
import { factoryFlowData_obcanvas } from "./factoryFlowData_obcanvas"
import { factoryFlowData_comfyui } from "./factoryFlowData_comfyui"
import { factoryFlowData_list } from "./factoryFlowData_list"
import { factoryFlowData_item } from "./factoryFlowData_item"

/**
 * 解析并转化json，将各种类型的json转化为统一的vueflow形式 (统一的 {nodes:[],edges:[]} 格式)
 * 
 * TODO 缺少Schema校验，提高稳定性
 * 
 * @param jsonType 说明了第二个参数的结构类型
 * @param json 不一定是json，list版本的语法是纯文本
 */
export function factoryFlowData(jsonType:string = "vueflow", json:string = "{nodes:[],edges:[]}"): {code: number, msg: string, data: object} {
  // 统一检查，json是否合法
  let parsedData;
  if (json.startsWith("demo")) {}
  else if (jsonType == "list") {}
  else {
    if (json.trim()=="") {
      return {code: -1, msg: "error: json content is empty", data: {}}
    }
    try {
      parsedData = JSON.parse(json)
      if (!parsedData) { return {code: -1, msg: "error: not a legitimate json", data: {}} }
    } catch (error) {
      return {code: -1, msg: "error: not a legitimate json: " + error, data: {}}
    }
  }

  // 类型分发
  let result: {code: number, msg: string, data: any};
  if (jsonType == "nodeflow-comfyui") {
    result = factoryFlowData_comfyui(parsedData)
  } else if (jsonType=="nodeflow-obcanvas") {
    result = factoryFlowData_obcanvas(parsedData)
  } else if (jsonType == "nodeflow-vueflow") {
    result = factoryFlowData_vueflow(parsedData)
  } else if (jsonType == "nodeflow-list") {
    result = factoryFlowData_list(json)
  } else if (jsonType == "nodeflow-item") {
    result = factoryFlowData_item(parsedData)
  } else {
    return {code: -1, msg: "error: invalid json type: " + jsonType, data: {}}
  }

  // 再次检查
  if (result.code != 0) return result
  if (!result.data.hasOwnProperty("nodes")) {return {code: -1, msg: "json without nodes attrs", data: {}}}
  if (!result.data.hasOwnProperty("edges")) { result.data.edges = [] }
  return result
}
