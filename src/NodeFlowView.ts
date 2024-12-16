import { nfSetting } from "./NodeFlow/utils/main/setting";
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
    return "workflow"; // https://lucide.dev/icons/
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

/// 在Obsidian的新视图中显示节点画布
export async function fn_newView(): Promise<HTMLElement> {
  // 如果没有该Docker视图则创建一个
  const cahce_workspace = nfSetting.cahce_workspace
  if (cahce_workspace.getLeavesOfType(NodeFlowViewFlag).length === 0) {
    await cahce_workspace.getRightLeaf(false).setViewState({
      type: NodeFlowViewFlag,
      active: true,
    })
  }
  const NodeFlowLeaf: WorkspaceLeaf = cahce_workspace.getLeavesOfType(NodeFlowViewFlag)[0]

  // 前置/展开该Docker视图
  cahce_workspace.revealLeaf(NodeFlowLeaf)

  // 更新该视图中的内容
  const containerEl: HTMLElement = NodeFlowLeaf.view.containerEl;
  containerEl.empty();
  return containerEl
}
