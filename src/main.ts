import { Plugin, TFile } from "obsidian";
import { MarkdownPostProcessorContext, WorkspaceLeaf } from "obsidian"
import { factoryVueDom } from './NodeFlow/factoryVueDom'
import { setting } from "./NodeFlow/setting";

import { NodeFlowViewFlag, NodeFlowView, fn_newView } from './NodeFlowView'
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

    // 注册 - 文件类型扩展 (新格式一)
    this.registerExtensions(["workflow_json"], NodeFlowFileViewFlag);
    this.registerExtensions(["canvas_json"], NodeFlowFileViewFlag);

    // 注册 - 事件 (新格式二)
    this.registerEvent(
      this.app.workspace.on('file-open', async (file: TFile) => {
        // 通用检查
        if (!file) return
        // @ts-ignore
        let div: HTMLElement = this.app.workspace.activeLeaf.containerEl
        if (!div) return

        // 从文件格式到json格式的映射
        let jsonType:string = ""
        if (file.name.endsWith("workflow.json.md")) jsonType = "nodeflow-comfyui";
        else if (file.name.endsWith(".canvas.md")) jsonType = "nodeflow-obcanvas";

        // 视图处理
        if (jsonType != "") {
          const value:string = await this.app.vault.cachedRead(file)
          // fn_newView().then(div => {})
          // 参考excalidraw中的做法：
          // .view-content
          //   .markdown-source-view (-)
          //   .markdown-reading-view (-)
          //   .markdown-excalidraw-wrapper (+)
          div = div.querySelector(".view-content")
          div.querySelector(":scope>.markdown-source-view")?.setAttribute("style", "display:none")
          div.querySelector(":scope>.markdown-reading-view")?.setAttribute("style", "display:none")
          const div_child = div.querySelector(":scope>.nf-autoDie"); if (div_child) { div.removeChild(div_child) } // 删除nf视图
          div = div.createEl("div"); div.classList.add("nf-autoDie"); div.setAttribute("style", "height: 100%");   // 创建nf视图
          factoryVueDom(jsonType, div, value, false)                                                     //     并挂载
        } else {
          div = div.querySelector(".view-content")
          div.querySelector(":scope>.markdown-source-view")?.setAttribute("style", "display:flex")
          div.querySelector(":scope>.markdown-reading-view")?.setAttribute("style", "display:flex")
          const div_child = div.querySelector(":scope>.nf-autoDie"); if (div_child) { div.removeChild(div_child) } // 删除nf视图
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
