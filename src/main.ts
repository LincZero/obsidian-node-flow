import { Plugin } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian"
import { factoryVueDom } from './vueAdapt'
import { NodeFlowViewFlag, NodeFlowView } from './NodeFlowView'

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

    // 代码块部分
    this.registerMarkdownCodeBlockProcessor("nodeflow-test",
      (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        factoryVueDom(blockEl, "test")
      }
    )
    this.registerMarkdownCodeBlockProcessor("nodeflow-vueflow",
      (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        factoryVueDom(blockEl, "vueflow")
      }
    )
    this.registerMarkdownCodeBlockProcessor("nodeflow-comfyui",
      (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        factoryVueDom(blockEl, "comfyui")
      }
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
