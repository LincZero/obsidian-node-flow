import {
  testData_vueflow,
  testData_vueflow_withoutPos,
  testData_vueflow_customNode,
  testData_obcanvas,
  testData_comfyUI,
  testData_list
} from "./test/testData"
import {
  testData2
} from "./test/testData2"

/**
 * 解析并转化json，将各种类型的json转化为统一的vueflow形式
 * 
 * TODO 缺少Schema校验，提高稳定性
 * 
 * @param jsonType 说明了第二个参数的结构类型
 * @param json 不一定是json，list版本的语法是纯文本
 */
export function factoryFlowData(jsonType:string = "vueflow", json:string = "{nodes:[],edges:[]}"): {code: number, msg: string, data: object} {
  // demo时，使用默认数据源
  if (jsonType == "nodeflow-test") { return {code: -2, msg: "msg: " + json, data: {}} }
  else if (jsonType == "nodeflow-vueflow") { jsonType = "vueflow"; }
  else if (jsonType == "nodeflow-vueflow-demo") { jsonType = "vueflow"; json = JSON.stringify(testData_vueflow) }
  else if (jsonType == "nodeflow-vueflow-demo2") { jsonType = "vueflow"; json = JSON.stringify(testData_vueflow_withoutPos) }
  else if (jsonType == "nodeflow-vueflow-demo3") { jsonType = "vueflow"; json = JSON.stringify(testData_vueflow_customNode) }
  else if (jsonType == "nodeflow-obcanvas") { jsonType = "obcanvas"; }
  else if (jsonType == "nodeflow-obcanvas-demo") { jsonType = "obcanvas"; json = JSON.stringify(testData_obcanvas) }
  else if (jsonType == "nodeflow-comfyui") { jsonType = "comfyui"; }
  else if (jsonType == "nodeflow-comfyui-demo") { jsonType = "comfyui"; json = JSON.stringify(testData_comfyUI) }
  else if (jsonType == "nodeflow-comfyui-demo2") { jsonType = "comfyui"; json = JSON.stringify(testData2) }
  else if (jsonType == "nodeflow-list") { jsonType = "list" }
  else if (jsonType == "nodeflow-list-demo") { jsonType = "list", json = testData_list }

  // 统一检查
  let parsedData;
  if (jsonType != "list") {
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
  let result: {code: number, msg: string, data: object}; // TODO：优化，应该减少json的解析次数，很多大json的。应该是code msg data模式
  if (jsonType == "comfyui") {
    result = factoryFlowData_comfyui(parsedData)
  }
  else if (jsonType=="obcanvas") {
    result = factoryFlowData_obcanvas(parsedData)
  } else if (jsonType == "vueflow") {
    result = {code: 0, msg: "", data: parsedData}
  } else if (jsonType == "list") {
    result = factoryFlowData_list(json)
  } else {
    return {code: -1, msg: "error: invalid json type: " + jsonType, data: {}}
  }

  // 再次检查
  if (result.code != 0) return result
  if (!result.data.hasOwnProperty("nodes")) {return {code: -1, msg: "json without nodes attrs", data: {}}}
  if (!result.data.hasOwnProperty("edges")) {return {code: -1, msg: "json without edges attrs", data: {}}}
  return result
}

/**
 * obsidian canvas数据转通用节点流数据
 */
function factoryFlowData_obcanvas(parsedData:any): {code: number, msg: string, data: object} {
  try {
    let nodes_new: object[] = []
    const nodes = parsedData.nodes;
    nodes.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: item.id,
        position: { x: item.x, y: item.y },
        data: {
          label: (item.hasOwnProperty("text")) ? item.text :
            (item.hasOwnProperty("file")) ? item.file : "Error Type: " + item.type
        },
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
    return {code: -1, msg: "error: obcanvas json parse fail: "+error, data: {}}
  }
}

/**
 * comfyui数据转通用节点流数据
 * 
 * TODO 需要注意，普通节点和群组，节点id和标题都是不在宽高尺寸里面的！当前是高度+30，y-30，的方式临时解决
 */
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

/**
 * 将md list文本转化为对应json
 * 
 * 为了通用性我分成两步：
 * 1. md list 转 self-children json (每个object有且只有self和children两个属性)
 * 2. self&child json 再转 nodes&edges json
 * 
 * 命名说明：
 * - cache_前缀表示缓存前几次遍历的东西，current_前缀标签当前循环的东西
 * - mCache_(mapCache) 前缀表示基于level等级/其他index下标的缓存 (非全缓存)，是列表，其下标与内容是相对应的
 *   通常简化为 `map_` 前缀
 * - lCache_ (lastCache) 前缀表示仅缓存上一次便利的东西
 *   通常简化为 `last_` 前缀
 * - aCache_(allCache) 前缀表示缓存所有遍历过的东西 (其实map也可能是这种)
 *   通常简化为 `result_` 前缀
 */
function factoryFlowData_list(md:string): {code: number, msg: string, data: object} {
  // step1. 先转 self-children json
  // 其中self-children是基本的所有数据集，是通用的结构。而self_data数据是重复冗余、用来缓存的工具，是非通用的结构
  type type_selfChildren = {
    self: string,
    self_data: {
      // 仅node+socket用
      id: string,
      parentId: string,
      type?: string,
      // 仅noode用
      name: string,
      inputs?: object[],
      outputs?: object[],
      widgets_values?: string[],
      // 仅edge用
      from_node?: string,
      from_socket?: string,
      to_node?: string,
      to_socket?: string,
    }
    children: type_selfChildren[],
  }
  let result_items:type_selfChildren[] = []       // 最终构建成果
  try {
    let map_indent: number[] = []                 // 缓存当前每个缩进等级对应的空格数 (注意一致性v) (其中下标0对应level0对应0缩进/0空格)
    let map_item: type_selfChildren[] = []        // 缓存当前每个缩进等级对应的最新项 (注意一致性^)
    // let last_indent;                           // 上次缩进空格，等同 cache_list_indent[cache_list_indent.length-1]
    // let last_item;                             // 上次项，等同 cache_list_item[cache_list_item.length-1]
    let current_line:string                       // 当前行
    let current_indent;                           // 当前缩进空格 (从0开始)
    let current_level:number                      // 当前级别。level表示位于第几层中嵌套中 (最外层是0)
    let current_item:type_selfChildren            // 当前项
    for (current_line of md.split("\n")) {
      // 仅追加
      const result_exp = current_line.match(/(^\s*)(- )?(.*)/);
      if (!result_exp) continue
      if (!result_exp[2]) {
        if (map_indent.length>0) map_item[map_item.length-1].self += result_exp[3] // TODO 暂不支持换行+空格
        continue
      }

      // change: current_indent
      current_indent = result_exp[1].length

      // change: current_level & map_indent (小心一致性v)
      current_level = -1
      for (let i=0; i<map_indent.length; i++) {
        if (map_indent[i] >= current_indent) { // eg. [0, 2, 4] & indent 1/2 -> [0, 2] & level 1
          map_indent = map_indent.slice(0, i+1)
          current_level = i
          break;
        }
      }
      if (current_level == -1) { // eg. [0, 2, 4] & indent 6 -> [0, 2, 4, 6] & level 3
        map_indent.push(current_indent)
        current_level = map_indent.length-1
      }

      // change: current_item & map_item
      // 解析 k(:v)? 串
      // TODO 暂不支持内容有逗号和冒号
      let ll_content:string[][] = []
      ;{
        const content = result_exp[3]
        const l_content = content.split(",")
        for (let item of l_content) {
          ll_content.push(item.trim().split(":"))
        }
      }
      current_item = {
        self: result_exp[3],
        children: [],
        self_data: {
          // 节点用
          id: ll_content[0][0],
          parentId: "",
          name: ll_content[0][1]??ll_content[0][0],
          inputs: [],
          outputs: [],
          widgets_values: [],
          // socket用
          ...(!ll_content[1]||!ll_content[1][0])?{type: "node"}:{type: ll_content[1][0]},
          // 线用
          ...(!ll_content[3])?{}:{from_node: ll_content[0][0], from_socket: ll_content[1][0], to_node: ll_content[2][0], to_socket: ll_content[3][0]}
        }
      }
      map_item = map_item.slice(0, map_indent.length)
      map_item[current_level] = current_item

      // change: result_items
      if (current_level == 0) {
        result_items.push(current_item)
      } else {
        map_item[current_level-1].children.push(current_item)
        current_item.self_data.parentId = map_item[current_level-1].self_data.id
        if (current_item.self_data.type == "input" || current_item.self_data.type == "i") map_item[current_level-1].self_data.inputs.push({id: current_item.self_data.id, name: current_item.self_data.name})
        else if (current_item.self_data.type == "output" || current_item.self_data.type == "o") map_item[current_level-1].self_data.outputs.push({id: current_item.self_data.id, name: current_item.self_data.name})
        else if (current_item.self_data.type == "value" || current_item.self_data.type == "v") map_item[current_level-1].self_data.widgets_values.push(current_item.self_data.name)
        else if (current_item.self_data.type == "node" || current_item.self_data.type == "n") {} // 表示前一个是节点组
      }
    }
  } catch (error) {
    return {code: -1, msg: "error: list parse fail: "+error, data: {}}
  }

  // step2. self&children json 再转 nodes&edges array
  // TODO 先假设不支持节点组，先假设不支持隐藏nodes和edges根节点
  {
    if (result_items.length != 2) return {code: -1, msg: "error: without rootNode: edges and edges", data: {}}

    // 遍历 - 节点
    let nodes_new:object[] = []
    recursion_node(result_items[0].children)
    function recursion_node(items: type_selfChildren[]) {
      for (let item of items) {
        if (item.self_data.type != "node") continue // socket不处理
        nodes_new.push({
          id: item.self_data.id,
          data: {
            label: item.self_data.name,
            inputs: item.self_data.inputs,
            outputs: item.self_data.outputs,
            widgets_values: item.self_data.widgets_values,
          },
          position: { x: 0, y: 0 },
          ...(item.self_data.parentId==""||item.self_data.parentId=="nodes")?{}:{parentNode: item.self_data.parentId},
          type: "comfyui",
        })
        recursion_node(item.children)
      }
    }

    // 遍历 - 线
    let edges_new:object[] = []
    let edge_id = 0
    recursion_edge(result_items[1].children)
    function recursion_edge(items: type_selfChildren[]) {
      for (let item of items) {
        edges_new.push({
          id: edge_id++,
          source: item.self_data.from_node,
          sourceHandle: item.self_data.from_socket,
          target: item.self_data.to_node,
          targetHandle: item.self_data.to_socket,
        })
        recursion_edge(item.children)
      }
    }

    // 处理完成
    return { code: 0, msg: "", data: {nodes: nodes_new, edges: edges_new}}
  }
}
