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
    const colors = ["white", "red", "orange", "yellow", "green", "cyan", "blue", "purple", "gold", "silver"]
    edges.forEach((item:any) => {
      const nameMapAttr = item[5].toLowerCase().charCodeAt(0)%10;
      edges_new.push({
        // 数据转移：
        id: ""+item[0],
        style: {
          stroke: colors[nameMapAttr]
        },
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
  /**
   * self-children-object
   * 
   * 特点: 该结构不应依赖于底层(即不依赖于vueflow)! 好处：存在更换底层库的变化、以及复用该描述语法
   * 功能、职责：除解析self-children外，负责解析一些内联语法，例如id、name、value等，**避免把这一步留到下步进行**
   * 
   * 字段内容
   * - 其中 self、children 特征：通用结构、有效信息量、嵌套结构
   * - 其中 self_data 特征：冗余的 (去除不减少信息量的)、可用于缓存、便于下一步进行嵌套转扁平化的
   */
  type type_selfChildren = type_selfChildren_node|type_selfChildren_socket|type_selfChildren_edge
  type type_selfChildren_base = {
    self: string,
    children: type_selfChildren[],
  }
  interface type_selfChildren_node extends type_selfChildren_base {
    self_data: {                                  // node
      type: "n"|"node"|"g"|"group",
      id: string,                                 // 节点id (会显示)
      name: string,                               // 节点名 (会显示)
      parentId: string,                           // 父节点id，根节点没有，为 ""
      parent: type_selfChildren|null,
      children: {                                 // 缓存节点内部数据，并根据类型区分好
        inputs: type_selfChildren_socket[],
        outputs: type_selfChildren_socket[],
        values: type_selfChildren_socket[],
      }
    }
  }
  interface type_selfChildren_socket extends type_selfChildren_base {
    self_data: {                                  // socket，在nodes-edges-array中将会被废弃掉
      type: "i"|"input"|"o"|"output"|"v"|"value",
      id: string,                                 // socketId
      name: string,                               // socket名 (会显示)
      parentId: string,                           // 父节点id，根节点没有，为 ""
      parent: type_selfChildren|null,
      value: string,                              // value类型的socket使用 (会显示，可多行)
    }
  }
  interface type_selfChildren_edge extends type_selfChildren_base {
    self_data: {                                  // edge
      type: "e"|"edge",
      id: string,                                 // 线Id, 暂时没啥用, 会自动填充的
      name: string,                               // 线名, 暂时没啥用，可能后续用来填label (不过应该用value来填会好一些吧)
      parentId: "",                               // 父节点id，暂时没啥用，暂时不存在局部声明线的情况
      parent: type_selfChildren|null,
      // value: string,                           // 线值，暂时没嗄用，可能后续可以填label
      from_node: string,
      from_socket: string,
      to_node: string,
      to_socket: string,
    }
  }

  // step1. 先转 self-children-object,
  let edge_id = 0;
  let result_items:type_selfChildren[] = []       // 最终构建成果
  try {
    let map_indent: number[] = []                 // 缓存当前每个缩进等级对应的空格数 (注意一致性v) (其中下标0对应level0对应0缩进/0空格)
    let map_item: type_selfChildren[] = []        // 缓存当前每个缩进等级对应的最新项 (注意一致性^)
    // let last_indent;                           // 上次缩进空格，等同 map_indent[map_indent.length-1]
    // let last_item;                             // 上次项，等同 map_item[map_item.length-1]
    let current_line:string                       // 当前行
    let current_indent;                           // 当前缩进空格 (从0开始)
    let current_level:number                      // 当前级别。level表示位于第几层中嵌套中 (最外层是0)
    let current_item:type_selfChildren            // 当前项
    for (current_line of md.split("\n")) {
      const result_exp = current_line.match(/(^\s*)(- )?(.*)/);
      if (!result_exp) continue

      // 仅追加
      // 有两种做法，选用后者
      // - 一是先将换行转项，再解析一个项。优点是简单些，但读项次数会x2，后期需要再遍历一遍
      // - 二是不是先解析项，发现非项再追加到项。优点是语法的内联分析完全在第一步
      if (!result_exp[2]) {
        if (map_indent.length==0) { console.warn("追加换行内容失败: 首行非列表"); continue; }
        const last_item = map_item[map_item.length-1]
        last_item.self += "\n"+result_exp[3] // TODO 暂不支持带空格前缀的换行空格
        if (!last_item.self_data.hasOwnProperty("value")) { console.warn("追加换行内容失败: 追加节点无vlaue属性"); continue; }
        // @ts-ignore ...上不存在属性“value”
        last_item.self_data.value += (last_item.self_data.value==""?"":"\n")+result_exp[3]
        continue
      }

      // change1: current_indent，缩进数
      current_indent = result_exp[1].length

      // change2: current_level & map_indent，缩进等级 (小心一致性v)
      {
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
      }

      // change3: current_item & map_item，当前内容
      {
        /**
         * 先解析
         * 
         * 解析规则
         *   解析 `k(:v)?` 串，可以构成一个二维数组。相较于一维数组，可以对语法进行精简
         *   单行value不支持内容有逗号和冒号，多行才支持
         * self格式
         *   节点 `id(:name)?`
         *   接口 `id(:name), (i|o|v|""), (value)=""`
         *   线条 `from, from socket, to, to socket, (name)?`
         */
        let ll_content:string[][] = []
        const content = result_exp[3]
        const l_content = content.split(",")
        for (let item of l_content) {
          ll_content.push(item.trim().split(":"))
        }
        // 线
        if (ll_content[3]) {
          current_item = {
            self: result_exp[3],
            children: [],
            self_data: {
              type: "edge",
              id: ""+edge_id++,
              parentId: "", parent: null,
              from_node: ll_content[0][0],
              from_socket: ll_content[1][0],
              to_node: ll_content[2][0],
              to_socket: ll_content[3][0],
              name: ll_content[4]?ll_content[4][0]:"", // TODO 思考后续要不要为了语法统一性放最前面
            }
          }
        }
        // socket
        else if (ll_content[1]) {
          current_item = {
            self: result_exp[3],
            children: [],
            self_data: {
              // @ts-ignore type类型不对
              type: (ll_content[1]&&["i","input","o","output","v","value"].includes(ll_content[1][0]))?ll_content[1][0]:"value",
              id: ll_content[0][0],
              name: ll_content[0][1]??ll_content[0][0],
              parentId: "", parent: null,
              value: ll_content[2]?ll_content[2][0]:"",
            }
          }
        }
        // node
        else {
          current_item = {
            self: result_exp[3],
            children: [],
            self_data: {
              type: "node",
              id: ll_content[0][0],
              name: ll_content[0][1]??ll_content[0][0],
              parentId: "", parent: null,
              children: {
                inputs: [],
                outputs: [],
                values: []
              }
            }
          }
        }
        map_item = map_item.slice(0, map_indent.length)
        map_item[current_level] = current_item
      }

      // change4: result_items、(parent's item)
      {
        // 根项
        if (current_level == 0) {
          result_items.push(current_item)
          // current_item.self_data.parentId = "" // default
          // current_item.self_data.parent = null // default
        }
        // 非根项，更新与父亲有关数据
        else {
          const parent_item = map_item[current_level-1]
          // 修正父节点类型，父节点不能为socket或线、且socket的父节点强制为node，node的父节点强制为group
          // 无法使用 (!["n", "node", "g", "group"].includes(parent.self_data.type)) 简化……否则飘红，代码编辑器没那么智能……
          if (parent_item.self_data.type!= "n" && parent_item.self_data.type!= "node" && parent_item.self_data.type!= "g" && parent_item.self_data.type!= "group") continue
          parent_item.children.push(current_item)
          current_item.self_data.parentId = parent_item.self_data.id; current_item.self_data.parent = parent_item;
          if (current_item.self_data.type == "input" || current_item.self_data.type == "i") { 
            parent_item.self_data.type = "node"
            parent_item.self_data.children.inputs.push(current_item as type_selfChildren_socket)
          }
          else if (current_item.self_data.type == "output" || current_item.self_data.type == "o") {
            parent_item.self_data.type = "node"
            parent_item.self_data.children.outputs.push(current_item as type_selfChildren_socket)
          }
          else if (current_item.self_data.type == "value" || current_item.self_data.type == "v") {
            parent_item.self_data.type = "node"
            parent_item.self_data.children.values.push(current_item as type_selfChildren_socket)
          }
          else if (current_item.self_data.type == "node" || current_item.self_data.type == "n") {
            parent_item.self_data.type = "group"
          }
        }
      }
    }
  } catch (error) {
    return {code: -1, msg: "error: list parse fail: "+error, data: {}}
  }

  // step2. self-children-object 再转 nodes-edges-array
  // TODO 先假设不支持节点组，先假设不支持隐藏nodes和edges根节点
  {
    if (result_items.length != 2) return {code: -1, msg: "error: without rootNode: edges and edges", data: {}}

    // 遍历 - 节点
    let nodes_new:object[] = []
    {
      recursion_node(result_items[0].children)
      function recursion_node(items: type_selfChildren[]) {
        for (let item of items) {
          if (item.self_data.type != "n" && item.self_data.type != "node" && item.self_data.type != "g" && item.self_data.type != "group") continue
          const current_node:any = {
            id: item.self_data.id,
            data: {
              type: item.self_data.type,
              label: item.self_data.name,
              inputs: item.self_data.children.inputs.map((i:type_selfChildren_socket)=>{return {id:i.self_data.id, name:i.self_data.name, value: i.self_data.value}}),
              outputs: item.self_data.children.outputs.map((i:type_selfChildren_socket)=>{return {id:i.self_data.id, name:i.self_data.name, value: i.self_data.value}}),
              values: item.self_data.children.values.map((i:type_selfChildren_socket)=>{return {id:i.self_data.id, name:i.self_data.name, value: i.self_data.value}}),
            },
            position: { x: 0, y: 0 },
            ...(item.self_data.parentId==""||item.self_data.parentId=="nodes")?{}:{parentNode: item.self_data.parentId},
            type: "common",
          }
          nodes_new.push(current_node)
          recursion_node(item.children)
        }
      }
    }

    // 遍历 - 线
    let edges_new:object[] = []
    {
      const colors = ["white", "red", "orange", "yellow", "green", "cyan", "blue", "purple", "gold", "silver"]
      recursion_edge(result_items[1].children)
      function recursion_edge(items: type_selfChildren[]) {
        for (let item of items) {
          if (item.self_data.type != "e" && item.self_data.type != "edge") continue
          const nameMapAttr = item.self_data.from_socket.toLowerCase().charCodeAt(0)%10;
          edges_new.push({
            id: item.self_data.id,
            style: { // 这里实际用的id而不是name做映射，可能存在问题
              stroke: colors[nameMapAttr]
            },
            source: item.self_data.from_node,
            sourceHandle: item.self_data.from_socket,
            target: item.self_data.to_node,
            targetHandle: item.self_data.to_socket,
          })
          recursion_edge(item.children)
        }
      }
    }

    // 处理完成
    return { code: 0, msg: "", data: {nodes: nodes_new, edges: edges_new}}
  }
}
