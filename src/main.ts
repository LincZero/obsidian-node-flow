import { Plugin, TFile } from "obsidian";
import { MarkdownPostProcessorContext, WorkspaceLeaf } from "obsidian"
import { factoryVueDom } from './NodeFlow/factoryVueDom'
import { setting } from "./NodeFlow/setting";

import { NodeFlowViewFlag, NodeFlowView } from './NodeFlowView'
import { NodeFlowFileViewFlag, NodeFlowFileView } from './NodeFlowFileView'

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

    // 注册 - 代码块
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

    // 注册 - 视图
    setting.cahce_workspace = this.app.workspace // 防止在Vue的上下文中，不存在workspace
    this.registerView(NodeFlowViewFlag, (leaf) => new NodeFlowView(leaf))
    this.registerView(NodeFlowFileViewFlag, (leaf: WorkspaceLeaf) => new NodeFlowFileView(leaf));

    // 注册 - 文件类型扩展
    this.registerExtensions(["workflow_json"], NodeFlowFileViewFlag);

    // 注册 - 事件
    this.registerEvent(
      this.app.workspace.on('file-open', (file: TFile) => {
        if (file.name.endsWith("workflow.json.md")) {
          console.log("目标类型 comfyui")
        }
      })
    )
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
