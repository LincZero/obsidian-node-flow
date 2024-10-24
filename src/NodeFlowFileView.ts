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

    let jsonType:string = "nodeflow-comfyui"
    if (this.file.name.endsWith("workflow_json")) jsonType = "nodeflow-comfyui"
    else if (this.file.name.endsWith("canvas_json")) jsonType = "nodeflow-canvas"
    
    this.contentEl.empty();
    factoryVueDom(jsonType, this.containerEl, this.data, false);
  }

  clear() {
    this.data = "";
  }
}
