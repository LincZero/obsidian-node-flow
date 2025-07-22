/** EditableCodeblock 的通用 CodeMirror 插件
 * 
 * 逻辑:
 * 
 * - App -> 创建CM ->
 * - 使用EditableCodeblockCm CM插件 ->
 * - 创建CodeblockWidget部件 ->
 * - 创建EditableCodeblockInCm 组件
 * 
 * TODO fix 多个代码块时，编辑非首个代码块后，光标会跳到首个代码块
 */

import {
  EditorView,
  Decoration,         // 装饰
  type DecorationSet, // 装饰集
  WidgetType,         // 装饰器部件
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import {
  EditorSelection,
  EditorState,
  Extension,
  Range,
  RangeSet,
  StateEffect,
  StateField,
  Transaction,
} from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

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

// #region editable-codeblock
import { EditableCodeblock, loadPrism2 } from '../../General/EditableBlock/EditableBlock';
import Prism from "prismjs" // 导入代码高亮插件的core（里面提供了其他官方插件及代码高亮样式主题，你只需要引入即可）
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import "prismjs/themes/prism-okaidia.min.css" // 主题, okaidia和tomorrow都是不错黑夜主题
loadPrism2.fn = () => {
  return Prism
}
class EditableCodeblockInCm extends EditableCodeblock {
  // editor: Editor|null = null; // obsidian依赖
  state: EditorState;
  oldView: EditorView;
  fromPos: number; // TODO 未能动态更新
  toPos: number;
  updateContent_local: (newContent_local: string) => void;

  constructor(
    state: EditorState, oldView: EditorView, fromPos: number, toPos: number,
    lang: string, content: string, container: HTMLElement,
    updateContent_local: (newContent_local: string) => void
  ) {
    super(lang, content, container)
    this.settings.renderEngine = "prismjs"
    // 如果是oninput saveMode，需要注意:
    // 如果页面有多个codeblock，而其中一个codeblock的编辑导致全部重渲染，会导致光标无法确定要在哪个里
    // 这会存在问题
    this.settings.saveMode = 'oninput' // (可切换)
    // this.settings.saveMode = 'onchange'
    this.settings.renderMode = 'textarea'
    // this.settings.renderMode = 'editablePre' // (可切换)

    this.state = state
    this.oldView = oldView
    this.fromPos = fromPos
    this.toPos = toPos
    this.updateContent_local = updateContent_local
  }

  /// TODO: fix: after edit, can't up/down to root editor
	/// @param el: HTMLTextAreaElement|HTMLInputElement|HTMLPreElement
	override enable_editarea_listener(el: HTMLElement, cb_tab?: (ev: KeyboardEvent)=>void, cb_up?: (ev: KeyboardEvent)=>void, cb_down?: (ev: KeyboardEvent)=>void): void {
		if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable)) return

		super.enable_editarea_listener(el, cb_tab, cb_up, cb_down) // `tab`

		// textarea - async part - keydown
		el.addEventListener('keydown', (ev: KeyboardEvent) => { // ~~`tab` key~~、`arrow` key	
			if (ev.key == 'ArrowDown') {
				if (cb_down) { cb_down(ev); return }

				// check is the last line
				if (el instanceof HTMLInputElement) {
					// true
				} else if (el instanceof HTMLTextAreaElement) {
					const selectionEnd: number = el.selectionEnd
					const textBefore = el.value.substring(0, selectionEnd)
					const linesBefore = textBefore.split('\n')
					if (linesBefore.length !== el.value.split('\n').length) return
				} else {
					// TODO
					return
				}

				ev.preventDefault() // safe: tested: `prevent` can still trigger `onChange`
				const targetLine: number = this.state.doc.lineAt(this.toPos).number + 1 // state.doc.line 和 state.doc.lineAt 分别 pos 和 line 转换
				if (targetLine > this.state.doc.lines - 1) { // when codeblock on the last line
					// strategy1: only move to end
					// toLine--

					// strategy2: insert a blank line
          const changes = this.state.changes({
            from: this.state.doc.toString().length,
            to: this.state.doc.toString().length,
            insert: "\n"
          })
          this.state.update({changes})
				}

        const targetPos = this.state.doc.line(targetLine).from;
        const selection = EditorSelection.create([
          EditorSelection.cursor(targetPos)
        ]);
        const transaction = this.oldView.state.update({
          selection,
          userEvent: "select"
        });
        this.oldView.dispatch(transaction);
        this.oldView.focus()
				return
			}
			else if (ev.key == 'ArrowUp') {
				if (cb_up) { cb_up(ev); return }

				// check is the first line
				if (el instanceof HTMLInputElement) {
					// true
				} else if (el instanceof HTMLTextAreaElement) {
					const selectionStart: number = el.selectionStart
					const textBefore = el.value.substring(0, selectionStart)
					const linesBefore = textBefore.split('\n')
					if (linesBefore.length !== 1) return
				} else {
					// TODO
					return
				}

				ev.preventDefault() // safe: tested: `prevent` can still trigger `onChange`
				let targetLine: number = this.state.doc.lineAt(this.fromPos).number - 1 // state.doc.line 和 state.doc.lineAt 分别 pos 和 line 转换
				if (targetLine < 0) { // when codeblock on the frist line
					// strategy1: only move to start
					// toLine = 0

					// strategy2: insert a blank line
					targetLine = 0
          const changes = this.state.changes({
            from: 0,
            to: 0,
            insert: "\n"
          })
          this.state.update({changes})
				}
        this.oldView.focus()
        const targetPos = this.state.doc.line(targetLine).from;
        const selection = EditorSelection.create([
          EditorSelection.cursor(targetPos)
        ]);
        const transaction = this.oldView.state.update({
          selection,
          userEvent: "select"
        });
        this.oldView.dispatch(transaction);
        this.oldView.focus()
				return
			}
			/*else if (ev.key == 'ArrowRight') {
			}
			else if (ev.key == 'ArrowLeft') {
			}*/
		})
	}

  emit_save(isUpdateLanguage: boolean, isUpdateSource: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.updateContent_local(this.outerInfo.source)
      resolve();
    })
  }
}
// #endregion

type RangeSpec_Codeblock = {
  type: 'codeblock';
  fromPos: number;
  toPos: number;
  text_content: string; // 代码块内容
  text_lang: string; // 代码块语言
}
type RangeSpec_Quote = {
  type: 'quote';
  fromPos: number;
  toPos: number;// 不包括尾换行符
  text_content: string; // 引用块内容，去除引用块前缀
  text_mark: string; // 引用块标志
}

/// 自定义CM的装饰器部件。可分发为具体不同类型的部件
function create_widget (
  state: EditorState, oldView: EditorView, rangeSpec: RangeSpec_Codeblock | RangeSpec_Quote,
  updateContent_all: (newContent: string) => void,
  focusLine: number|null = null,
): WidgetType {
  if (rangeSpec.type == 'codeblock') {
    return new CodeblockWidget(state, oldView, rangeSpec.text_content, rangeSpec.text_lang, rangeSpec.fromPos, rangeSpec.toPos, updateContent_all, focusLine)
  } else {
    return new QuoteWidget(state, oldView, rangeSpec.text_content, rangeSpec.text_mark, rangeSpec.fromPos, rangeSpec.toPos, updateContent_all, focusLine)
  }
}

/// 自定义CM的装饰器部件 - 代码块
class CodeblockWidget extends WidgetType {
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
    const editableCodeblock = new EditableCodeblockInCm(
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

let global_cursor_pos_cache: { fromPos: number, toPos: number }|null = null
/// 自定义CM的装饰器部件 - 引用块
class QuoteWidget extends WidgetType {
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
      if (global_state) {
        this.state = global_state
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
        global_cursor_pos_cache = {
          fromPos: update.state.selection.main.from,
          toPos: update.state.selection.main.to,
        }

        const newContent = update.state.doc.toString()
        this.updateContent_local(newContent)
        return
      }
      if (update.focusChanged) { // 焦点进入或离开
        if (update.transactions.length == 0) { // 失焦
          global_cursor_pos_cache = null // 失焦不用存位置

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
    else if (global_cursor_pos_cache) {
      const selection = EditorSelection.create([
          EditorSelection.cursor(global_cursor_pos_cache.fromPos)
      ])
      setTimeout(() => { // TODO 这里依然有问题：滚动条
        const transaction = newView.state.update({
          selection,
          userEvent: "select"
        })
        newView.dispatch(transaction)
        newView.focus()
      }, 0);

      global_cursor_pos_cache = null
    }

    return this.el
  }
}

let is_prev_cursor_in = false
/** 范围选择器 + 装饰集生成器
 * 
 * @details
 * 注意三种装饰器形式:
 * - mark
 * - widget
 * - replace
 * 中， replace+块 可能出现bug:
 * > 原始文本被移除后，CodeMirror 内部依赖的 docView 结构会被破坏。
 * > 当编辑器尝试执行布局测量（如 measureVisibleLineHeights）时，无法找到被替换区域对应的文档视图
 * > 解决方法: 确保进入该函数时，docView 已经完成了。即外部可以用 StateField 而非 ViewPlugin 来实现
 */
function create_decorations(
  state: EditorState, oldView: EditorView,
  updateContent_all: (newContent: string) => void,
  tr: Transaction, // TODO tr和decorationSet 可以改为可选，如果忽略，则完全重建
  decorationSet: DecorationSet = Decoration.none,
): DecorationSet {
  // #region 1. 得到旧装饰集v2 (范围映射 旧装饰集 得到)
  try {
    decorationSet = decorationSet.map(tr.changes)
  } catch (e) {
    // 如果将tr更新的新旧对象错误混用，会出现这种问题 (之前修复了光标位置延时问题后，触发了这个问题)
    console.warn('decorationSet map error, maybe paste ab at end', e)
  }
  // #endregion

  const list_rangeSpec: (RangeSpec_Codeblock|RangeSpec_Quote)[] = []

  // #region 2. 得到新范围集 (更新后)
  syntaxTree(state).iterate({ // 遍历文档语法树
    enter(node) {
      // 识别Markdown代码块 (自带的只会识别在根部的，不会识别被嵌套的)
      if (node.name === 'FencedCode') {
        const fromPos = node.from
        const toPos = node.to
        const text = state.sliceDoc(fromPos, toPos)
        
        // 提取代码块内容和语言
        const match = text.match(/^```(\w+)?\n([\s\S]*?)\n```$/)
        if (!match) return
        const lang = match[1] || ''
        const content = match[2]
        if (lang != 'js') return // TODO 临时，便于查看使用和不使用的区别
        
        list_rangeSpec.push({
          type: 'codeblock',
          fromPos,
          toPos,
          text_content: content,
          text_lang: lang
        })
      }
      // else if (node.name === 'QuoteMark') {
      //   console.log('QuoteMark', node.from, node.to, state.sliceDoc(node.from, node.to))
      // }
      else {
        // 注意: 原规则不是基于块的，而是基于字符的。
        // 并不能很好地选择整个块的范围 (如引用块)，需要自行解析
        // Document, ATXHeading1, HeaderMark, CodeInfo, CodeText
        // Paragraph, InlineCode, CodeMark, StrongEmphasis, EmphasisMark, Emphasis
        // BulletList, ListItem, ListMark, QuoteMark
        // console.log('node.name', node.name)
      }
    }
  })
  // #endregion

  // #region 2. 得到新范围集 (更新后) 2
  let current_quote: RangeSpec_Quote|null = null
  let posCount: number = 0 // 记录该行之前的累计字符数
  for (const line of state.doc.toString().split('\n')) {
    // 非引用块。只识别在根部的，不会识别被嵌套的
    if (!line.startsWith('> ')) {
      if (current_quote) {
        list_rangeSpec.push(current_quote)
        current_quote = null
      }
      posCount += line.length + 1; continue // +1 for \n
    }
    // 引用块
    if (!current_quote) {
      current_quote = ({
        type: 'quote',
        fromPos: posCount,
        toPos: posCount + line.length,
        text_content: line.slice(2),
        text_mark: '> '
      })
    } else {
      current_quote.toPos = posCount + line.length
      current_quote.text_content += '\n' + line.slice(2)
    }
    posCount += line.length + 1; continue // +1 for \n
  }
  // 循环尾检测
  if (current_quote) {
    list_rangeSpec.push(current_quote)
    current_quote = null
  }
  // #endregion

  // #region 3. 得到新装饰集、变化集  (范围集 --生成--> 装饰集)
  // 要判断复用，所以分开范围集和装饰集
  const cursorRange = tr?.state.selection.main // TODO 目前只支持单光标
  const cursorRange_last = oldView.state.selection.main
  let list_decoration_nochange:Range<Decoration>[] = [] // 装饰集 - 无光标变动部分 -> 不会导致刷新
  let list_decoration_change:Range<Decoration>[] = []   // 装饰集 - 有光标变动部分 -> 会导致刷新
  let is_current_cursor_in = false // 当前光标是否在装饰集内
  for (const rangeSpec of list_rangeSpec) {
    // (1) 判断光标与该范围项的关系
    let isCursorIn = false // 当前光标是否在装饰集内
    let isCursonIn_last = false // 旧光标是否在装饰集内
    if (cursorRange.from >= rangeSpec.fromPos && cursorRange.from <= rangeSpec.toPos
        || cursorRange.to >= rangeSpec.fromPos && cursorRange.to <= rangeSpec.toPos
    ) {
      isCursorIn = true
    }
    if (cursorRange_last.from >= rangeSpec.fromPos && cursorRange_last.from <= rangeSpec.toPos
      || cursorRange_last.to >= rangeSpec.fromPos && cursorRange_last.to <= rangeSpec.toPos
    ) {
      isCursonIn_last = true
    }

    // (2) 创建装饰项，并添加到装饰集
    // 光标在内 (一直在内或从外进入)
    if (isCursorIn) {
      is_current_cursor_in = true

      // 策略一：该段使用源码编辑 - 变化
      // const decoration = Decoration.mark({class: "cm-line-yellow"})
      // list_decoration_change.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))

      // 策略二: 光标移入 - 变化
      // 其实最佳方法是不变化，直接把光标移入widget内。但似乎cm无法从装饰项获取到widget对象
      // 只能重新生成
      let line = 0
      if (cursorRange.from == rangeSpec.toPos || cursorRange.to == rangeSpec.toPos) {
        line = -1
      }
      const decoration = Decoration.replace({
        widget: create_widget(state, oldView, rangeSpec, updateContent_all, line),
        // inclusive: true, block: true, // 区别: 光标上下移动会跳过 block，但这个也能自行监听且感觉更合适
      })
      list_decoration_change.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))
    }
    // 光标从内出来
    else if (isCursonIn_last) {
      const decoration = Decoration.replace({
        widget: create_widget(state, oldView, rangeSpec, updateContent_all),
        // inclusive: true, block: true, // 区别: 光标上下移动会跳过 block，但这个也能自行监听且感觉更合适
      })
      list_decoration_change.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))
    }
    // 光标一直在外 - 不变化
    else {
      const decoration = Decoration.replace({
        widget: create_widget(state, oldView, rangeSpec, updateContent_all),
        // inclusive: true, block: true, // 区别: 光标上下移动会跳过 block，但这个也能自行监听且感觉更合适
      })
      list_decoration_nochange.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))
    }
  }
  // #endregion

  // #region 4. 检查变化集
  // 若没有变化项，可提前返回
  // 变化项包括: 装饰集变化, 光标进出范围集变化，编辑模式变化
  if (
    list_decoration_change.length == 0 &&
    is_current_cursor_in == is_prev_cursor_in &&
    (list_decoration_nochange.length > 0 && decorationSet != Decoration.none)
  ) {
    return decorationSet
  }
  is_prev_cursor_in = is_current_cursor_in
  // #endregion

  // #region 5. 用变化集 + 新装饰集 + 旧装饰集v2 --> 得到 旧装饰集v3
  let debug_count1 = 0, debug_count2 = 0, debug_count3 = 0, debug_count4 = 0
  // (1) 删除变化项
  decorationSet = decorationSet.update({
    filter(from, to, value) { // 全部删掉，和不变集相同的则保留
      for (let i = 0; i < list_decoration_nochange.length; i++) {
        const item = list_decoration_nochange[i]
        if (item.from == from && item.to == to) {
          debug_count1++
          list_decoration_nochange.splice(i, 1); return true;
        }
      }
      debug_count1++
      debug_count2++
      return false
    },
  })
  // (2) 新增变化项1
  // 测出了存在一个没有光标变化的新ab块 (在黏贴一段ab块文本会出现这种情况)
  for (const item of list_decoration_nochange) {
    debug_count3++
    decorationSet = decorationSet.update({
      add: [item],
    })
  }
  // (3) 新增变化项2
  for (const item of list_decoration_change) {
    debug_count4++
    decorationSet = decorationSet.update({
      add: [item],
    })
  }
  // console.log(`CodeMirror 装饰集变化: ${debug_count1} -${debug_count2}+${debug_count3}+${debug_count4}`)
  // #endregion

  return decorationSet
}

let global_state: any|null = null // 只接受根部state，不接受嵌套时的state
/**
 * EditableCodeblock 的通用 CodeMirror 插件
 * 
 * 使用：一个页面对应一个
 */
export class EditableCodeblockCm {
  view: EditorView;
  state: EditorState;
  mdStr: string;
  isRoot: boolean = false; // 是否是根部的cm
  /** 强制更新全部内容
   * 除非不得已，尽量不要使用这里传入的 updateContent_all，因为这会导致全部更新、丢失光标位置。
   * 尽量使用 cm 的tr+dispatch方法进行局部更新
   */
  updateContent_all: (newContent: string) => void;

  constructor(view: EditorView, mdStr: string, updateContent_all: (newContent: string) => void, isRoot: boolean = false) {
    this.view = view
    this.state = view.state
    this.mdStr = mdStr
    this.updateContent_all = updateContent_all
    this.isRoot = isRoot
    if (this.isRoot) global_state = this.state

    this.init_stateField()
  }
  
  init_stateField() {
    /** StateField
     * @details
     * 装饰器插件有两个主要实现方式
     * - 一个是ViewPlugin或其他
     * - 一个是StateField
     * 这两都可以传作为 cm 的 extensions 参数，或在外部通过钩子进行使用
     * 
     * 一开始我使用前者。DecorationSet.mark 和 DecorationSet.widget 都可以正常工作。
     * 但在使用 DecorationSet.replace 时，会存在非报错bug。
     * 因为原文本 (docView) 未完成。想替换时无法确认要被替换的文本范围。
     * 
     * 而后者可以。因为其 create 阶段不进行渲染，在update阶段时，docView 已经完成了。
     * 此时可以正常 replace
     */
    const codeBlockField = StateField.define<DecorationSet>({
      create: (editorState:EditorState) => Decoration.none,
      update: (decorationSet:DecorationSet, tr:Transaction) => {
        if (this.isRoot) global_state = tr.state
        // 不要直接用 this.view.state，会延后，要用 tr.state
        this.state = tr.state;
        return create_decorations(tr.state, this.view, this.updateContent_all, tr, decorationSet)
      },
      provide: (f: StateField<DecorationSet>) => EditorView.decorations.from(f)
    });

    // 用 StateEffect 来添加 StateField
    let stateEffects: StateEffect<unknown>[] = []
    if (!this.state.field(codeBlockField, false)) {
      stateEffects.push(StateEffect.appendConfig.of(
        [codeBlockField] 
      ))
    }
    this.view.dispatch({effects: stateEffects}) // 派发StateField
  }
}

// /**
//  * ViewPlugin
//  * 
//  * @deprecated 时机不对，会在 docView 未完成时就尝试替换装饰器，导致 block replace 行为无法正常进行
//  * (如果是 mark 或 widget 则可以正常工作，那还是可以用这种方式的)
//  */
// export function create_viewPlugin(updateContent_all: (newContent: string) => void) {
//   return ViewPlugin.fromClass(class {
//     decorations: DecorationSet;

//     constructor(view: EditorView) {
//       this.decorations = create_decorations(view.state, updateContent_all);
//     }

//     update(update: ViewUpdate) {
//       if (update.docChanged || update.viewportChanged) {
//         this.decorations = create_decorations(update.view.state, updateContent_all);
//       }
//     }
//   }, {
//     decorations: v => v.decorations
//   });
// }
