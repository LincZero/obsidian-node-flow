import { Plugin } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian"
import { factoryVueDom } from './vueAdapt'

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

    this.registerMarkdownCodeBlockProcessor("nodeflow-test",
      (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const vueEl = document.createElement("div");  blockEl.appendChild(vueEl); vueEl.classList.add("vue-shell");
        factoryVueDom(vueEl, "test")
      }
    )
    this.registerMarkdownCodeBlockProcessor("nodeflow-vueflow",
      (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const vueEl = document.createElement("div");  blockEl.appendChild(vueEl); vueEl.classList.add("vue-shell");
        factoryVueDom(vueEl, "vueflow")
      }
    )
    this.registerMarkdownCodeBlockProcessor("nodeflow-comfyui",
      (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        const vueEl = document.createElement("div");  blockEl.appendChild(vueEl); vueEl.classList.add("vue-shell");
        factoryVueDom(vueEl, "comfyui")
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
