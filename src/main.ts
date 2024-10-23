import { Plugin } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian"
import { factoryVueDom } from './NodeFlow/factoryVueDom'
import { NodeFlowViewFlag, NodeFlowView } from './NodeFlowView'
import { setting } from "./NodeFlow/setting";

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    // 视图注册部分
    this.registerView(NodeFlowViewFlag, (leaf) => new NodeFlowView(leaf))
    setting.cahce_workspace = this.app.workspace // 防止在Vue的上下文中，不存在workspace

    // 代码块部分
    const code_type_list = [
      "nodeflow-test",
      "nodeflow-vueflow", "nodeflow-vueflow-demo", "nodeflow-vueflow-demo2", "nodeflow-vueflow-demo3",
      "nodeflow-obcanvas", "nodeflow-obcanvas-demo",
      "nodeflow-comfyui", "nodeflow-comfyui-demo", "nodeflow-comfyui-demo2",
      // TODO "nodeflow-list", 允许使用非json方式声明，再转化为json
    ]
    for (let item of code_type_list) {
      this.registerMarkdownCodeBlockProcessor(item, (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        factoryVueDom(item, blockEl, src)
      })
    }
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
