import { createApp, App as VueApp } from 'vue';
import VueTest from './component/VueTest.vue';
import MyVueFlow from './component/MyVueFlow.vue';
import { NodeFlowViewFlag } from './NodeFlowView'
import { WorkspaceLeaf } from 'obsidian';

// 在div内创建指定的 Vue UI
export function factoryVueDom(div:HTMLElement, flag:string = "test"):void {
  // part1. 外壳部分
  const el_shell = document.createElement("div"); div.appendChild(el_shell); el_shell.classList.add("nf-shell-mini");
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
    const el_shell = document.createElement("div"); containerEl.appendChild(el_shell); el_shell.classList.add("nf-shell-view");
    if (flag == "vueflow") {
      const _app = createApp(MyVueFlow, {});
      _app.mount(el_shell);
    } else if (flag == "comfyui") {
      const _app = createApp(MyVueFlow, {});
      _app.mount(el_shell);
    }
    else {
      const _app = createApp(VueTest, {});
      _app.mount(el_shell);
    }
  }

  // part3. 节点流内容
  if (flag == "vueflow") {
    const _app = createApp(MyVueFlow, {});
    _app.mount(el_shell);
  } else if (flag == "comfyui") {
    const _app = createApp(MyVueFlow, {});
    _app.mount(el_shell);
  }
  else {
    const _app = createApp(VueTest, {});
    _app.mount(el_shell);
  }
}
