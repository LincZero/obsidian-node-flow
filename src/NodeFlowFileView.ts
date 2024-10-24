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
    else if (this.file.name.endsWith(".workflow.json")) jsonType = "nodeflow-comfyui"
    else if (this.file.name.endsWith(".canvas.json")) jsonType = "nodeflow-canvas"
    // TODO 通过json内容来判断json类型
    
    this.contentEl.empty();
    const div_child = this.contentEl.createEl("div"); div_child.classList.add("nf-autoDie"); div_child.setAttribute("style", "height: 100%");
    factoryVueDom(jsonType, div_child, this.data, false); // (需要挂载一个会死亡的div)
  }

  clear() {
    this.data = "";
  }
}
