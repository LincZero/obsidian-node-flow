import { factoryVueDom } from "./NodeFlow/factoryVueDom";
import { TextFileView } from "obsidian";

export const NodeFlowFileViewFlag = "NodeFlowFileView";

/**
 * 用于在Obsidian注册新的文件格式，以自定义方式打开新的格式
 */
export class NodeFlowFileView extends TextFileView {
  getViewType() {
    return NodeFlowFileViewFlag;
  }

  getViewData() {
    return this.data;
  }

  setViewData(data: string, clear: boolean) {
    this.data = data;
    this.contentEl.empty();
    factoryVueDom("nodeflow-comfyui", this.containerEl, this.data, false);
  }

  clear() {
    this.data = "";
  }
}
