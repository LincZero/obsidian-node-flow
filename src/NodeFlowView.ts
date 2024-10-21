import { ItemView, WorkspaceLeaf } from 'obsidian';

export const  NodeFlowViewFlag = "NodeFlowView"

/**
 * 用于在Obsidian中打开新的叶子视图，并显示节点流
 */
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
