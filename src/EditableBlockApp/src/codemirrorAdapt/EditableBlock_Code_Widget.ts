import {
  EditorView,
  WidgetType,         // 装饰器部件
} from '@codemirror/view';
import {
  EditorSelection,
  EditorState,
  Extension,
} from '@codemirror/state';

import { EditableBlock_Cm } from "./EditableBlock_Cm"
import { global_store } from './index_cm'

/// 自定义CM的装饰器部件 - 代码块
export class CodeblockWidget extends WidgetType {
  state: EditorState;
  oldView: EditorView;
  fromPos: number; // TODO 未能动态更新
  toPos: number;
  updateContent_all: (newContent: string) => void; // 更新所有
  updateContent_local: (newContent: string) => void; // 仅更新
  focusLine: number|null = null; // 是否生成后自动聚焦及聚焦位置。由于toDOM时机后缀，所以用这个来控制

  constructor(
    state: EditorState,
    oldView: EditorView,
    readonly content_local_sub: string,
    readonly lang: string,
    fromPos: number,
    toPos: number,
    updateContent_all: (newContent: string) => void,
    focusLine: number|null = null,
  ) {
    super()
    this.state = state;
    this.oldView = oldView;
    this.fromPos = fromPos;
    this.toPos = toPos;
    this.focusLine = focusLine;
    // 注意: all是全文，local是影响部分，sub是影响部分再去除代码围栏前后缀的部分
    const content_all: string = state.doc.toString();

    // content_local
    this.updateContent_all = updateContent_all
    this.updateContent_local = (newContent_local: string) => { // TODO 这里有bug：codeblock mark 标志可能不是 "```"
      const before = content_all.substring(0, fromPos);
      const after = content_all.substring(toPos);
      const langMatch = content_all.substring(fromPos).match(/^```(\w+)?\n/);
      const lang = langMatch ? langMatch[1] || '' : '';
      const newContent_all = `${before}\`\`\`${lang}\n${newContent_local}\n\`\`\`${after}`;
      this.updateContent_all(newContent_all)
    }
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement('div'); container.className = 'editable-codeblock-p';
    
    // 创建您的 EditableCodeblock 组件，自带光标位置恢复逻辑
    const editableCodeblock = new EditableBlock_Cm(
      this.state,
      this.oldView,
      this.fromPos,
      this.toPos,
      this.lang, 
      this.content_local_sub,
      container,
      this.updateContent_local
    )
    editableCodeblock.render().then(() => {
      if (this.focusLine != null) editableCodeblock.focus(this.focusLine == null ? undefined : this.focusLine)
    })
    return container
  }
}
