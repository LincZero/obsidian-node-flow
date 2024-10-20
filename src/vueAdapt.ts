import { createApp, App as VueApp } from 'vue';
import VueTest from './component/VueTest.vue';
import MyVueFlow from './component/MyVueFlow.vue';
import { NodeFlowViewFlag } from './NodeFlowView'
import { WorkspaceLeaf } from 'obsidian';

// 在div内创建指定的 Vue UI
export function factoryVueDom(jsonType:string = "test", div:HTMLElement, mdStr:string = ""):void {
  // part1. 外壳部分
  const el_shell: HTMLElement = document.createElement("div"); div.appendChild(el_shell); el_shell.classList.add("nf-shell-mini");
  const el_toolbar = document.createElement("div"); div.appendChild(el_toolbar); el_toolbar.classList.add("nf-toolbar");

  // part2. 节点流内容
  mountVue(el_shell) // 代码块，替换为节点流画布
  function mountVue(el_shell: HTMLElement) {
    // 解析并转化json
    let result: {code: number, data: string}
    result = factoryFlowData(jsonType, mdStr)
    if (result.code != 0) {
      const _app = createApp(VueTest, {
        data: result.data
      });
      _app.mount(el_shell);
      return
    }

    // 根据新json生成节点流
    const _app = createApp(MyVueFlow, {
      jsonData: result.data
    });
    _app.mount(el_shell);
  }

  // part3. 控件组
  {
    const el_btn_newView = document.createElement("button"); el_toolbar.appendChild(el_btn_newView); el_btn_newView.classList.add("nf-btn-newView"); el_btn_newView.textContent="OpenInLeafView";
    // 按钮1，在新叶子视图中显示
    el_btn_newView.onclick = async (ev: MouseEvent) => {
      // 如果没有该Docker视图则创建一个
      if (this.app.workspace.getLeavesOfType(NodeFlowViewFlag).length === 0) {
        await this.app.workspace.getRightLeaf(false).setViewState({
          type: NodeFlowViewFlag,
          active: true,
        })
      }
      const NodeFlowLeaf: WorkspaceLeaf = this.app.workspace.getLeavesOfType(NodeFlowViewFlag)[0]

      // 前置/展开该Docker视图
      this.app.workspace.revealLeaf(NodeFlowLeaf)

      // 更新该视图中的内容
      const containerEl: HTMLElement = NodeFlowLeaf.view.containerEl;
      containerEl.innerHTML = ""
      const el_shell: HTMLElement = document.createElement("div"); containerEl.appendChild(el_shell); el_shell.classList.add("nf-shell-view");
      mountVue(el_shell) // 自定义叶子视图，替换为节点流画布
    }
    // 按钮2，调试输出对应的json
    const el_btn_showJson = document.createElement("button"); el_toolbar.appendChild(el_btn_showJson); el_btn_showJson.classList.add("nf-btn-showJson"); el_btn_showJson.textContent="ShowJson";
    el_btn_showJson.onclick = async (ev: MouseEvent) => {
      console.log("showJson debug: ", factoryFlowData(jsonType, mdStr))
    }
    // 按钮3，自动重调位置
    const el_btn_autoPos = document.createElement("button"); el_toolbar.appendChild(el_btn_autoPos); el_btn_autoPos.classList.add("nf-btn-autoPos"); el_btn_autoPos.textContent="AutoPos";
    el_btn_autoPos.onclick = async (ev: MouseEvent) => {
      // TODO
    }
  }
}

/**
 * 解析并转化json，将各种类型的json转化为统一的vueflow形式
 * 
 * TODO 缺少Schema校验，提高稳定性
 */
function factoryFlowData(type:string = "vueflow", json:string = "{}"): {code: number, data: string} {
  // 统一检查
  if (json.trim()=="") {
    return {code: -1, data: "error: json content is empty"}
  }
  let parsedData;
  try {
    parsedData = JSON.parse(json)
    if (!parsedData) { return {code: -1, data: "error: not a legitimate json"} }
  } catch (error) {
    return {code: -1, data: "error: not a legitimate json: " + error}
  }

  // 类型分发
  if (type == "comfyui") {
    return {code: -1, data: "error: not supported yet: comfyui"}
  }
  else if (type=="obcanvas") {
    return factoryFlowData_obcanvas(parsedData)
  } else if (type == "vueflow") {
    return {code: 0, data: json}
  } else {
    return {code: -1, data: "error: invalid json type: " + type}
  }
}

function factoryFlowData_obcanvas(parsedData:any): {code: number, data: string} {
  try {
    let nodes_new: object[] = []
    const nodes = parsedData.nodes;

    nodes.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: item.id,
        type: item.type,
        position: { x: item.x, y: item.y },
        data: { label: item.text.trim() }
        // 数据舍弃：
        // item.width
        // item.height
        // item.type == "text"
        // 数据新增：
        // type == "default"
      });
    })

    let edges_new: object[] = []
    const edges = parsedData.edges;
    edges.forEach((item:any) => {
      edges_new.push({
        // 数据转移：
        id: item.id,
        source: item.fromNode,
        target: item.toNode
        // 数据舍弃：
        // fromSide == "right/left/top/bottom"
        // toSide == "right/left/top/bottom"
        // 数据新增：
        // type == "default"
      });
    })

    return { code: 0, data: JSON.stringify({nodes: nodes_new, edges: edges_new})}
  } catch (error) {
    return {code: -1, data: "error: obcanvas json parse fail"}
  }
}
