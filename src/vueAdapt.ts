import { createApp, App as VueApp } from 'vue';
import VueTest from './component/VueTest.vue';
import MyVueFlow from './component/MyVueFlow.vue';
import NodeFlowView from './NodeFlowView'

// 在div内创建指定的 Vue UI
export function factoryVueDom(div:HTMLElement, flag:string = "test"):void {
  // part1. 外壳部分
  const el_shell = document.createElement("div"); div.appendChild(el_shell); el_shell.classList.add("nf-shell");
  const el_toolbar = document.createElement("div"); div.appendChild(el_toolbar); el_toolbar.classList.add("nf-toolbar");

  /// part2. 控件组
  const el_btn_newView = document.createElement("div"); el_toolbar.appendChild(el_btn_newView); el_btn_newView.classList.add("nf-btn-newView");
  el_btn_newView.onclick = async (ev: MouseEvent) => {
    if (this.app.workspace.getLeavesOfType("NodeFlowView").length === 0) {
      await this.app.workspace.getRightLeaf(false).setViewState({
        type: "NodeFlowView",
        active: true,
      })
    }

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType("NodeFlowView")[0]
    )
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
