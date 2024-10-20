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

  /// part2. 控件组
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
    if (jsonType == "vueflow") {
      const _app = createApp(MyVueFlow, {
        jsonData: (mdStr.trim()=="")?"":factoryUniJson("vueflow", mdStr)
      });
      _app.mount(el_shell);
    } else if (jsonType == "comfyui") {
      const _app = createApp(MyVueFlow, {
        jsonData: (mdStr.trim()=="")?"":factoryUniJson("comfyui", mdStr)
      });
      _app.mount(el_shell);
    }
    else {
      const _app = createApp(VueTest);
      _app.mount(el_shell);
    }
  }
}

function factoryUniJson(type:string = "vueflow", json:string = "{}"): string {
  if (type=="cmofyui") {}
  const jsonData: string = json;
  return jsonData
}

// 仅测试用json
const only_test = `{
  "nodes": [
    {"id": "1", "type": "input", "position": {"x": 250, "y": 5}, "data": {"label": "Node 11"}},
    {"id": "2", "position": {"x": 100, "y": 100}, "data": {"label": "Node 12"}},
    {"id": "3", "type": "output", "position": {"x": 400, "y": 200}, "data": {"label": "Node 13"}},
    {"id": "4", "type": "special", "position": {"x": 600, "y": 100}, "data": {"label": "Node 14", "hello": "world"}}
  ],
  "edges": [
    {"id": "e1->2", "source": "1", "target": "2"},
    {"id": "e2->3", "source": "2", "target": "3", "animated": true},
    {"id": "e3->4", "type": "special", "source": "3", "target": "4", "data": {"hello": "world"}}
  ]
}`
