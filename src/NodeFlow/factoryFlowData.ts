import {
  testData_vueflow,
  testData_vueflow_withoutPos,
  testData_vueflow_customNode,
  testData_obcanvas,
  testData_comfyUI
} from "./test/testData"
import {
  testData2
} from "./test/testData2"

/**
 * 解析并转化json，将各种类型的json转化为统一的vueflow形式
 * 
 * TODO 缺少Schema校验，提高稳定性
 */
export function factoryFlowData(type:string = "vueflow", json:string = "{nodes:[],edges:[]}"): {code: number, msg: string, data: object} {
  // demo时，使用默认数据源
  if (type == "nodeflow-test") { return {code: -2, msg: "msg: " + json, data: {}} }
  else if (type == "nodeflow-vueflow") { type = "vueflow"; }
  else if (type == "nodeflow-vueflow-demo") { type = "vueflow"; json = JSON.stringify(testData_vueflow) }
  else if (type == "nodeflow-vueflow-demo2") { type = "vueflow"; json = JSON.stringify(testData_vueflow_withoutPos) }
  else if (type == "nodeflow-vueflow-demo3") { type = "vueflow"; json = JSON.stringify(testData_vueflow_customNode) }
  else if (type == "nodeflow-obcanvas") { type = "obcanvas"; }
  else if (type == "nodeflow-obcanvas-demo") { type = "obcanvas"; json = JSON.stringify(testData_obcanvas) }
  else if (type == "nodeflow-comfyui") { type = "comfyui"; }
  else if (type == "nodeflow-comfyui-demo") { type = "comfyui"; json = JSON.stringify(testData_comfyUI) }
  else if (type == "nodeflow-comfyui-demo2") { type = "comfyui"; json = JSON.stringify(testData2) }

  // 统一检查
  if (json.trim()=="") {
    return {code: -1, msg: "error: json content is empty", data: {}}
  }
  let parsedData;
  try {
    parsedData = JSON.parse(json)
    if (!parsedData) { return {code: -1, msg: "error: not a legitimate json", data: {}} }
  } catch (error) {
    return {code: -1, msg: "error: not a legitimate json: " + error, data: {}}
  }

  // 类型分发
  let result: {code: number, msg: string, data: object}; // TODO：优化，应该减少json的解析次数，很多大json的。应该是code msg data模式
  if (type == "comfyui") {
    result = factoryFlowData_comfyui(parsedData)
  }
  else if (type=="obcanvas") {
    result = factoryFlowData_obcanvas(parsedData)
  } else if (type == "vueflow") {
    result = {code: 0, msg: "", data: parsedData}
  } else {
    return {code: -1, msg: "error: invalid json type: " + type, data: {}}
  }

  // 再次检查
  if (result.code != 0) return result
  if (!result.data.hasOwnProperty("nodes")) {return {code: -1, msg: "json without nodes attrs", data: {}}}
  if (!result.data.hasOwnProperty("edges")) {return {code: -1, msg: "json without edges attrs", data: {}}}
  return result
}

function factoryFlowData_obcanvas(parsedData:any): {code: number, msg: string, data: object} {
  try {
    let nodes_new: object[] = []
    const nodes = parsedData.nodes;
    nodes.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: item.id,
        position: { x: item.x, y: item.y },
        data: { label: item.text.trim() },
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
    return {code: -1, msg: "error: obcanvas json parse fail", data: {}}
  }
}

// TODO 需要注意，普通节点和群组，节点id和标题都是不在宽高尺寸里面的！当前是高度+30，y-30，的方式临时解决
function factoryFlowData_comfyui(parsedData:any): {code: number, msg: string, data: object} {
  try {
    let nodes_new: object[] = []
    const nodes = parsedData.nodes;
    nodes.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: ""+item.id,
        position: { x: item.pos["0"], y: item.pos["1"]-30 },
        data: {
          label: item.hasOwnProperty("title")?item.title:item.type,
          type: item.type,
          inputs: item.inputs,
          outputs: item.outputs,
          widgets_values: item.widgets_values,
        },
        ...(item.hasOwnProperty("size") ?  // 使用 `扩展运算符` 灵活简化
          { width: item.size["0"]+"px", height: item.size["1"]+30+"px" }
          : {}
        ),
        // 数据舍弃：
        // item.size
        // item.properties["Node name for S&R"]
        // item.widgets_values
        type: "comfyui",    // 数据新增
      });
    })

    /**
     * comfyui的edges规则比较特殊
     * 
     * 以 testData_comfyUI 数据为例： (注意id是从3~9共7个节点)
     * - nodes
     *   该部分存储了一部分和线有关的数据，我之前写nodeeditor也有过经验，是为了方便数据传递减少调用次数的优化
     *   按信息量来说是冗余信息
     *   
     *   node_id| inputs_link| outputs_link
     *   3      | 1,4,6,2    | [7]
     *   4      |            | [1][3,5][8]
     *   5      |            | [2]
     *   6      | 3          | [4]
     *   7      | 5          | [6]
     *   8      | 7,8        | [9]
     *   9      | 9          | 
     * 
     * - links
     *   信息应该是：[线的id, fromNode, fromIndex, toNode, toIndex, 线段类型]
     *   "links": [
     *     [1,4,0,3,0,"MODEL"],
     *     [2,5,0,3,3,"LATENT"],
     *     [3,4,1,6,0,"CLIP"],
     *     [4,6,0,3,1,"CONDITIONING"],
     *     [5,4,1,7,0,"CLIP"],
     *     [6,7,0,3,2,"CONDITIONING"],
     *     [7,3,0,8,0,"LATENT"],
     *     [8,4,2,8,1,"VAE"],
     *     [9,8,0,9,0,"IMAGE"]
     *   ],
     * 
     * 然后特别需要注意：handle的from/to或source/target的标注是相对于线而言的，不是相对于节点而言的!
     */
    let edges_new: object[] = []
    const edges = parsedData.links;
    edges.forEach((item:any) => {
      edges_new.push({
        // 数据转移：
        id: ""+item[0],
        source: ""+item[1],
        sourceHandle: "source-"+item[2],
        target: ""+item[3],
        targetHandle: "target-"+item[4],
        // 数据舍弃：
        // 线类型
        // 数据新增：
        // type: "default",
      });
    })

    const groups = parsedData.groups;
    let index:number = 0
    groups.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: "group-"+index++,
        position: { x: item.bounding[0], y: item.bounding[1] },
        width: item.bounding[2]+"px",
        height: item.bounding[3]+30+"px",
        data: { label: item.title },
        ...(item.hasOwnProperty("color") ?
          { style: {
            backgroundColor: item.color+"44", // 1/4透明
            zIndex: -1,
          }} :
          {}
        ),
        type: "comfyui-group", // 数据新增
      });
    })
    return { code: 0, msg: "", data: {nodes: nodes_new, edges: edges_new}}
  } catch (error) {
    return {code: -1, msg: "error: comfyui json parse fail: "+error, data: {}}
  }
}
