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

  // part2. 控件组
  const el_btn_newView = document.createElement("button"); el_toolbar.appendChild(el_btn_newView); el_btn_newView.classList.add("nf-btn-newView"); el_btn_newView.textContent="OpenInLeafView";
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

  // part3. 节点流内容
  mountVue(el_shell) // 代码块，替换为节点流画布
  
  function mountVue(el_shell: HTMLElement) {
    // 解析并转化json
    let result: {code: number, data: string}
    result = factoryUniJson(jsonType, mdStr)
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
}

/// 解析并转化json，将各种类型的json转化为统一的vueflow形式
function factoryUniJson(type:string = "vueflow", json:string = "{}"): {code: number, data: string} {
  // 统一检查
  if (json.trim()=="") {
    return {code: -1, data: "error: json content is empty"}
  }
  try {
    const parsedData = JSON.parse(json)
    if (!parsedData) { return {code: -1, data: "error: not a legitimate json"} }
  } catch (error) {
    return {code: -1, data: "error: not a legitimate json: " + error}
  }

  // 类型分发
  if (type == "comfyui") {
    return {code: -1, data: "error: not supported yet: comfyui"}
  }
  else if (type=="obcanvas") {
    return {code: -1, data: "error: not supported yet: obcanvas"}
  } else if (type == "vueflow") {
    return {code: 0, data: json}
  } else {
    return {code: -1, data: "error: invalid json type: " + type}
  }
}
