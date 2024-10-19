import { ItemView, WorkspaceLeaf } from 'obsidian';

export default class NodeFlowView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }
  getViewType(): string {
    return "NodeFlowView";
  }
  getDisplayText(): string {
    return "NodeFlowView";
  }
  getIcon(): string {
    return "dice";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    let content = container.createEl("div", {
        cls: "nf-view"
    });
  }
  async onClose() {
  }
}
