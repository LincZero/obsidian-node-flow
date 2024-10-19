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

    this.registerMarkdownCodeBlockProcessor("vue-test",
      (
        src: string,                                // 代码块内容
        blockEl: HTMLElement,                       // 代码块渲染的元素
        ctx: MarkdownPostProcessorContext           // 上下文
      ) => {
        const root_div = document.createElement("div");  blockEl.appendChild(root_div); root_div.classList.add("vue-shell");
        factoryVueDom(root_div, "vue-test")
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
