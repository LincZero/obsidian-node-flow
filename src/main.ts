import { Plugin, TFile } from "obsidian";
import { MarkdownPostProcessorContext, WorkspaceLeaf } from "obsidian"
import { factoryVueDom } from './NodeFlow/factoryVueDom'
import { setting } from "./NodeFlow/setting";

import { NodeFlowViewFlag, NodeFlowView, fn_newView } from './NodeFlowView'
import { NodeFlowFileViewFlag, NodeFlowFileView } from './NodeFlowFileView'

interface NodeFlowPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: NodeFlowPluginSettings = {
  mySetting: 'default'
}

export default class NodeFlowPlugin extends Plugin {
  settings: NodeFlowPluginSettings;

  async onload() {
    await this.loadSettings();

    // 注册 - 代码块
    const code_type_list = [
      "nodeflow-test",
      "nodeflow-vueflow", "nodeflow-vueflow-demo", "nodeflow-vueflow-demo2", "nodeflow-vueflow-demo3",
      "nodeflow-obcanvas", "nodeflow-obcanvas-demo",
      "nodeflow-comfyui", "nodeflow-comfyui-demo", "nodeflow-comfyui-demo2",
      "nodeflow-list", "nodeflow-list-demo"
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
    this.registerExtensions(["json"], NodeFlowFileViewFlag);

    // 注册 - 事件 (新格式二)
    this.registerEvent(
      this.app.workspace.on('file-open', async (file: TFile) => {
        // 通用检查
        if (!file) return
        // @ts-ignore
        const div_leaf: HTMLElement = this.app.workspace.activeLeaf.containerEl
        if (!div_leaf) return
        let div_view: HTMLElement = div_leaf.querySelector(".view-content")
        if (!div_view) return
        let div_child: HTMLElement;

        // 从文件格式到json格式的映射
        let jsonType:string = ""
        if (file.name.endsWith("workflow.json.md")) jsonType = "nodeflow-comfyui";
        else if (file.name.endsWith(".canvas.md")) jsonType = "nodeflow-obcanvas";

        // 视图处理
        if (jsonType != "") {
          const value:string = await this.app.vault.cachedRead(file)
          // 参考excalidraw中的做法：
          // .view-content
          //   .markdown-source-view (-)
          //   .markdown-reading-view (-)
          //   .markdown-excalidraw-wrapper (+)
          div_child = div_view.querySelector(":scope>.markdown-source-view"); if (div_child) div_child.classList.add("nf-style-display-none");
          div_child = div_view.querySelector(":scope>.markdown-reading-view"); if (div_child) div_child.classList.add("nf-style-display-none");
          div_child = div_view.querySelector(":scope>.nf-autoDie"); if (div_child) { div_view.removeChild(div_child) }                  // 删除nf视图
          div_child = div_view.createEl("div"); div_child.classList.add("nf-autoDie");                                                  // 创建nf视图
          factoryVueDom(jsonType, div_child, value, false)                                                                              //     并挂载 (需要挂载到一个会死亡的div)
        } else {
          div_child = div_view.querySelector(":scope>.markdown-source-view"); if (div_child) div_child.classList.remove("nf-style-display-none");
          div_child = div_view.querySelector(":scope>.markdown-reading-view"); if (div_child) div_child.classList.remove("nf-style-display-none");
          div_child = div_view.querySelector(":scope>.nf-autoDie"); if (div_child) { div_view.removeChild(div_child) }                  // 删除nf视图
        }
      })
    )

    // 监听 - 禁用滚轮点击/长按
    // 无法监听在节点画布中的滚轮点击事件
    // document.addEventListener('mousedown', (event: MouseEvent) => {
    //   if (event.button === 1) { // 检查是否为滚轮点击（中间键）
    //       event.preventDefault(); // 阻止默认行为
    //       console.log('滚轮被点击');
    //   }
    // });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
