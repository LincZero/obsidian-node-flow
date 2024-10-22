import { createApp, App as VueApp } from 'vue';
import VueTest from './component/VueTest.vue';
import NodeFlowContainerS from './component/NodeFlowContainerS.vue';
import NodeFlowContainerL from './component/NodeFlowContainerL.vue';
import { NodeFlowViewFlag } from './NodeFlowView'
import { WorkspaceLeaf } from 'obsidian';

/// 在div内创建指定的 Vue UI
export function factoryVueDom(jsonType:string = "test", div:HTMLElement, mdStr:string = ""):void {
  // 代码块，替换为节点流画布
  const targetEl = div
  const targetVue = NodeFlowContainerS
  mountVue(targetEl, targetVue)
  
  /// 将targetVue挂载到targetEl上
  function mountVue (targetEl:HTMLElement, targetVue:any) {
    // 解析并转化json
    let result: {code: number, msg: string, data: object}
    result = factoryFlowData(jsonType, mdStr)
    if (result.code != 0) {
      const _app = createApp(VueTest, {
        data: result.msg
      });
      _app.mount(targetEl);
      return
    }

    // 根据新json生成节点流
    const _app = createApp(targetVue, {
      jsonData: result.data,
      fn_newView: fn_newView
    });
    _app.mount(targetEl);
  }

  const cahce_workspace = this.app.workspace // 防止在Vue的上下文中，不存在workspace
  /// 在Obsidian的新视图中显示节点画布
  async function fn_newView() {
    // 如果没有该Docker视图则创建一个
    if (cahce_workspace.getLeavesOfType(NodeFlowViewFlag).length === 0) {
      await cahce_workspace.getRightLeaf(false).setViewState({
        type: NodeFlowViewFlag,
        active: true,
      })
    }
    const NodeFlowLeaf: WorkspaceLeaf = cahce_workspace.getLeavesOfType(NodeFlowViewFlag)[0]

    // 前置/展开该Docker视图
    cahce_workspace.revealLeaf(NodeFlowLeaf)

    // 更新该视图中的内容
    const containerEl: HTMLElement = NodeFlowLeaf.view.containerEl;
    containerEl.innerHTML = ""   

    // 新的叶子视图，替换为节点流画布
    const targetEl = containerEl
    const targetVue = NodeFlowContainerL
    mountVue(targetEl, targetVue)
  }
}

/**
 * 解析并转化json，将各种类型的json转化为统一的vueflow形式
 * 
 * TODO 缺少Schema校验，提高稳定性
 */
function factoryFlowData(type:string = "vueflow", json:string = "{}"): {code: number, msg: string, data: object} {
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

function factoryFlowData_comfyui(parsedData:any): {code: number, msg: string, data: object} {
  try {
    let nodes_new: object[] = []
    const nodes = parsedData.nodes;
    nodes.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: ""+item.id,
        position: { x: item.pos["0"], y: item.pos["1"] },
        data: {
          label: item.type,
          inputs: item.inputs,
          outputs: item.outputs,
          widgets_values: item.widgets_values,
        },
        // 数据舍弃：
        // item.size
        // item.properties["Node name for S&R"]
        // item.widgets_values
        // 数据新增：
        type: "comfyui",
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

    return { code: 0, msg: "", data: {nodes: nodes_new, edges: edges_new}}
  } catch (error) {
    return {code: -1, msg: "error: comfyui json parse fail", data: {}}
  }
}
