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
  Range,
  RangeSet,
  StateEffect,
  StateField,
  Transaction,
} from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

// #region editable-codeblock
import { EditableCodeblock, loadPrism2 } from '../../NodeFlow/component/general/EditableCodeblock';
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
    this.settings.saveMode = 'oninput'
    this.settings.renderMode = 'textarea'

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

/// 自定义CM的装饰器部件
class CodeblockWidget extends WidgetType {
  state: EditorState;
  oldView: EditorView;
  fromPos: number; // TODO 未能动态更新
  toPos: number;
  widget: EditableCodeblockInCm|null = null;
  updateContent_all: (newContent: string) => void; // 更新所有
  updateContent_local: (newContent: string) => void; // 仅更新

  constructor(
    state: EditorState,
    oldView: EditorView,
    readonly content_local_sub: string,
    readonly lang: string,
    fromPos: number,
    toPos: number,
    updateContent_all: (newContent: string) => void,
  ) {
    super()
    this.state = state;
    this.oldView = oldView;
    this.fromPos = fromPos;
    this.toPos = toPos;
    // 注意: all是全文，local是影响部分，sub是影响部分再去除代码围栏前后缀的部分
    const content_all: string = state.doc.toString();

    // content_local
    this.updateContent_all = updateContent_all
    this.updateContent_local = (newContent_local: string) => {
      const before = content_all.substring(0, fromPos);
      const after = content_all.substring(toPos);
      const langMatch = content_all.substring(fromPos).match(/^```(\w+)?\n/);
      const lang = langMatch ? langMatch[1] || '' : '';
      const newContent_all = `${before}\`\`\`${lang}\n${newContent_local}\n\`\`\`${after}`;
      this.updateContent_all(newContent_all)
    }
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement('div');
    container.className = 'editable-codeblock-p';
    
    // 创建您的 EditableCodeblock 组件
    this.widget = new EditableCodeblockInCm(
      this.state,
      this.oldView,
      this.fromPos,
      this.toPos,
      this.lang, 
      this.content_local_sub,
      container,
      this.updateContent_local
    )
    
    this.widget.render();
    return container;
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
 * 
 * TODO 优化。这里没有用到旧装饰集和映射，像anyblock obsidian程序那边是用到的，可以减少渲染、加速程序。
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

  const list_rangeSpec: {
    fromPos: number;
    toPos: number;
    text: string; // 代码块内容
    lang: string; // 代码块语言
  }[] = []
  // #region 2. 得到新范围集 (更新后)
  syntaxTree(state).iterate({ // 遍历文档语法树
    enter(node) {
      // 识别Markdown代码块
      if (node.name != 'FencedCode') return

      const fromPos = node.from;
      const toPos = node.to;
      const text = state.sliceDoc(fromPos, toPos);
      
      // 提取代码块内容和语言
      const match = text.match(/^```(\w+)?\n([\s\S]*?)\n```$/);
      if (!match) return
      const lang = match[1] || '';
      const content = match[2];
      if (lang != 'js') return // TODO 临时，便于查看使用和不使用的区别
      
      list_rangeSpec.push({
        fromPos,
        toPos,
        text: content,
        lang: lang
      })
    }
  })
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
      const decoration = Decoration.mark({class: "cm-line-yellow"})
      list_decoration_change.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))

      // 策略二: 光标 - 不变化
      // widget_curosr.widget.focus()
    }
    // 光标从内出来
    else if (isCursonIn_last) {
      const decoration = Decoration.replace({
        widget: new CodeblockWidget(state, oldView, rangeSpec.text, rangeSpec.lang, rangeSpec.fromPos, rangeSpec.toPos, updateContent_all),
        inclusive: true,
        block: true,
      })
      list_decoration_change.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))
    }
    // 光标一直在外 - 不变化
    else {
      const decoration = Decoration.replace({
        widget: new CodeblockWidget(state, oldView, rangeSpec.text, rangeSpec.lang, rangeSpec.fromPos, rangeSpec.toPos, updateContent_all),
        inclusive: true,
        block: true,
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
  console.log(`CodeMirror 装饰集变化: ${debug_count1} -${debug_count2}+${debug_count3}+${debug_count4}`)
  // #endregion

  return decorationSet
}

/**
 * EditableCodeblock 的通用 CodeMirror 插件
 * 
 * 使用：一个页面对应一个
 */
export class EditableCodeblockCm {
  view: EditorView;
  state: EditorState;
  mdStr: string;
  updateContent_all: (newContent: string) => void;

  constructor(view: EditorView, mdStr: string, updateContent_all: (newContent: string) => void) {
    this.view = view
    this.state = view.state
    this.mdStr = mdStr
    this.updateContent_all = updateContent_all

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
        // 不要直接用 this.view.state，会延后，要用 tr.state
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
