import { MarkdownView, Plugin, TFile } from "obsidian";
import { MarkdownPostProcessorContext, WorkspaceLeaf } from "obsidian"
import { nfSetting, factoryVueDom } from "./NodeFlow/index"
import { NodeFlowViewFlag, NodeFlowView } from './NodeFlowView'
import { NodeFlowFileViewFlag, NodeFlowFileView } from './NodeFlowFileView'

// 设置
interface NodeFlowPluginSettings {
  isDebug: boolean;
}
const NODEFLOW_SETTINGS: NodeFlowPluginSettings = {
  isDebug: false // This command is used to control whether debugging information is printed
}

export default class NodeFlowPlugin extends Plugin {
  settings: NodeFlowPluginSettings;

  async onload() {
    await this.loadSettings();
    nfSetting.app = this.app

    // 注册 - 代码块
    const code_type_list = [
      "nodeflow-vueflow", "nodeflow-obcanvas", "nodeflow-comfyui", "nodeflow-list", "nodeflow-item", "nodeflow-listitem"
    ]
    for (let item of code_type_list) {
      this.registerMarkdownCodeBlockProcessor(item, (src: string, blockEl: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        nfSetting.ctx = ctx
        factoryVueDom(item, blockEl, src, true, (str: string) => {
          const { lineEnd, lineStart, text } = ctx.getSectionInfo(blockEl)

          const view = this.app.workspace.getActiveViewOfType(MarkdownView);
          const editor = view.editor;
          // 不修改代码块的前后围栏部分。开头是围栏头下一行的开头，结束是围栏尾的第一个字符，所以str要保证`\n`结尾
          editor.replaceRange(str+"\n", {ch:0, line:lineStart+1}, {ch:0, line:lineEnd})
        })
      })
    }

    // 注册 - 视图
    nfSetting.cahce_workspace = this.app.workspace // 防止在Vue的上下文中，不存在workspace
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
        // @ts-ignore 类型“WorkspaceLeaf”上不存在属性“containerEl”
        // const div_leaf: HTMLElement = this.app.workspace.activeLeaf.containerEl // 弃用，审查员也不会让你用
        // const div_leaf: HTMLElement = this.app.workspace.getLeaf().containerEl  // bug: 切换到锁定标签页会新增一个新标签页
        const div_leaf: HTMLElement = this.app.workspace.getActiveViewOfType(MarkdownView)?.containerEl
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

  // 设置的加载与保存
  async loadSettings() {
    const data = await this.loadData() // 如果没有配置文件则为null
    this.settings = Object.assign({}, NODEFLOW_SETTINGS, data); // 合并默认值和配置文件的值

    // 如果没有配置文件则生成一个默认值的配置文件
    if (!data) {
      this.saveData(this.settings);
    }

    nfSetting.isDebug = this.settings.isDebug
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
}
