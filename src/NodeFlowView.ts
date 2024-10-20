import { ItemView, WorkspaceLeaf } from 'obsidian';

export const  NodeFlowViewFlag = "NodeFlowView"

export class NodeFlowView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }
  getViewType(): string {
    return NodeFlowViewFlag;
  }
  getDisplayText(): string {
    return NodeFlowViewFlag;
  }
  getIcon(): string {
    return "dice";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    let content = container.createEl("div", {
        cls: "nf-shell-view"
    });
  }
  async onClose() {
  }
}
