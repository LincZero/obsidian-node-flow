import { Plugin } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian"
import { factoryVueDom } from './vueAdapt'
import { NodeFlowViewFlag, NodeFlowView } from './NodeFlowView'
import { testData_vueflow, testData_obcanvas, testData_comfyUI } from "./testData"

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
    this.registerMarkdownCodeBlockProcessor("nodeflow-test", (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    factoryVueDom("test", blockEl, src)
    })
    this.registerMarkdownCodeBlockProcessor("nodeflow-vueflow", (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      factoryVueDom("vueflow", blockEl, src)
    })
    this.registerMarkdownCodeBlockProcessor("nodeflow-vueflow-demo", (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      factoryVueDom("vueflow", blockEl, JSON.stringify(testData_vueflow))
    })
    this.registerMarkdownCodeBlockProcessor("nodeflow-comfyui", (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      factoryVueDom("comfyui", blockEl, src)
    })
    this.registerMarkdownCodeBlockProcessor("nodeflow-comfyui-demo", (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      factoryVueDom("comfyui", blockEl, JSON.stringify(testData_comfyUI))
    })
    this.registerMarkdownCodeBlockProcessor("nodeflow-obcanvas", (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      factoryVueDom("obcanvas", blockEl, src)
    })
    this.registerMarkdownCodeBlockProcessor("nodeflow-obcanvas-demo", (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      factoryVueDom("obcanvas", blockEl, JSON.stringify(testData_obcanvas))
    })
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
