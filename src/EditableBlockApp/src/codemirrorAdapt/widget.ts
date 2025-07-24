import {
  EditorView,
  Decoration,         // 装饰
  type DecorationSet, // 装饰集
  WidgetType,         // 装饰器部件
} from '@codemirror/view';
import {
  EditorSelection,
  EditorState,
  Extension,
} from '@codemirror/state';

import { EditableBlock_Cm } from "./EditableBlock_Cm"
import { EditableCodeblockCm } from './index_cm'

// #region 扩展
import { basicSetup, minimalSetup } from "codemirror"
import { markdown } from "@codemirror/lang-markdown"
import { keymap, lineNumbers } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands"
import { oneDark } from "@codemirror/theme-one-dark"

import {
  highlightActiveLine,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLineGutter,
  keymap as keymapExt
} from "@codemirror/view";
import { history, historyKeymap } from "@codemirror/commands";
import { indentOnInput } from "@codemirror/language";
import { indentWithTab } from "@codemirror/commands";
// import { foldGutter, foldKeymap } from "@codemirror/fold";
// import { bracketMatching } from "@codemirror/matchbrackets";
// import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
// import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
// import { searchKeymap } from "@codemirror/search";

// import * as HyperMD from 'hypermd'
import ixora from '@retronav/ixora'; // 可以全部导入或分开导入
const cm_extension: Extension[] = [ // codemirror 扩展
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  // bracketMatching(),
  // closeBrackets(),
  // autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  keymapExt.of([
    ...defaultKeymap,
    ...historyKeymap,
    // ...closeBracketsKeymap,
    // ...searchKeymap,
    // ...foldKeymap,
    // ...completionKeymap,
    indentWithTab // 保留Tab缩进
  ]),

  // basicSetup,      // 基础设置
  // keymap.of(defaultKeymap), // 默认快捷键
  markdown(),       // markdown 语言支持
  oneDark,          // 黑暗主题
  // extension_update, // 监听更新
  // editableCodeBlock_viewPlugin,
  ixora,            // 一组扩展 (标题、列表、代码块、引用块、图像、html等)
]
// #endregion

export let global_store: {
  pos: { fromPos: number, toPos: number }|null,
  root_state: EditorState|null // 只接受根部state，不接受嵌套时的state
} = {
  pos: null,
  root_state: null
}

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

/// 自定义CM的装饰器部件 - 引用块
export class QuoteWidget extends WidgetType {
  state: EditorState; // 非即时
  oldView: EditorView;
  fromPos: number; // TODO 未能动态更新
  toPos: number;
  updateContent_all: (newContent: string) => void; // 更新所有
  updateContent_local: (newContent: string) => void; // 仅更新
  focusLine: number|null = null; // 是否生成后自动聚焦及聚焦位置。由于toDOM时机后缀，所以用这个来控制
  el: HTMLElement|null = null; // toDOM生成的元素

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
    this.updateContent_local = (newContent_local: string) => { // TODO 应该使用 quote mark 标志
      const before = content_all.substring(0, fromPos);
      const after = content_all.substring(toPos);
      let newContent_local2 = newContent_local.split('\n').map(line => '> ' + line).join('\n')
      const newContent_all = `${before}${newContent_local2}${after}`;
      // console.log('teset', fromPos, toPos, newContent_all)
      
      // 更新内容。用cm api代替旧的 updateContent_all。
      // 注意: 
      // - 顺序上，失焦是先触发外部 cm 的 tr，才触发内部的事件
      // - state是拷贝，不是实时的。而用拷贝去更新会运行时控制台报错
      // this.updateContent_all(newContent_all)
      // 
      // TODO 方案一：是 updateContent_all，缺点是太多没必要的也更新，容易丢失光标
      // 方案二：是直接用 state 更新，缺点是被嵌套两层后（如引用块包引用块），无法编辑
      // 方案三：后续需要更新到方案三，一直把from、to往上游传输，直到到达root cm编辑器。
      // 只有在root cm中才有权限进行更新，且以root cm的分块作为最小更新单位！
      if (global_store.root_state) {
        this.state = global_store.root_state
      }
      else {
        console.warn('global_state is null')
        return
      }
      const transaction = this.state.update({
        changes: {
          from: this.fromPos,
          to: this.toPos,
          insert: newContent_local2,
        },
        userEvent: "input",
      })
      oldView.dispatch(transaction)
      this.toPos = this.fromPos + newContent_local2.length

      if (this.el) this.el.classList.remove('is-no-saved');
    }
  }

  toDOM(view: EditorView): HTMLElement {
    let saveMode: 'oninput'|'onchange' = 'onchange'
    this.el = document.createElement('div');

    // 可编辑引用块。附带光标位置恢复逻辑
    // TODO 目前这里只是简单实现，没有 EditableCodeblock 那么完善、快捷键、中文输入等都存在问题
    const extension_update = EditorView.updateListener.of(update => {
      // 内容变化
      if (update.docChanged) {
        if (true) { // saveMode == 'oninput'
          this.el.classList.add('is-no-saved');
          return
        }

        // 光标位置存储
        global_store.pos = {
          fromPos: update.state.selection.main.from,
          toPos: update.state.selection.main.to,
        }

        const newContent = update.state.doc.toString()
        this.updateContent_local(newContent)
        return
      }
      if (update.focusChanged) { // 焦点进入或离开
        if (update.transactions.length == 0) { // 失焦
          global_store.pos = null // 失焦不用存位置

          const newContent = update.state.doc.toString()
          this.updateContent_local(newContent)
          return
        }
      }
    })
    // const extensions = this.state.facet(EditorState.extensions); // 从现有编辑器的状态中提取扩展，好像是旧api
    const quote = document.createElement('div'); this.el.appendChild(quote); quote.className = 'editable-codeblock-quote';
    const newView = new EditorView({
      doc: this.content_local_sub,
      extensions: [
        cm_extension,
        extension_update
      ],
      parent: quote,
    })
    const _editableCodeblockCm = new EditableCodeblockCm(newView, this.content_local_sub, (newStr: string) => {
      this.updateContent_local(newStr)
    })

    // 初始光标
    if (this.focusLine != null) {
      const selection = EditorSelection.create([
          EditorSelection.cursor(this.focusLine == -1 ? this.content_local_sub.length : this.focusLine)
      ])
      setTimeout(() => { // TODO 这里依然有问题：滚动条
        const transaction = newView.state.update({
          selection,
          userEvent: "select"
        })
        newView.dispatch(transaction)
        newView.focus()
      }, 0);
    }
    // 光标位置恢复
    else if (global_store.pos) {
      const selection = EditorSelection.create([
          EditorSelection.cursor(global_store.pos.fromPos)
      ])
      setTimeout(() => { // TODO 这里依然有问题：滚动条
        const transaction = newView.state.update({
          selection,
          userEvent: "select"
        })
        newView.dispatch(transaction)
        newView.focus()
      }, 0);

      global_store.pos = null
    }

    return this.el
  }
}
