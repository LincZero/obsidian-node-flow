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
  fromPos: number;
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
  fromPos: number;
  toPos: number;
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
    
    // 设置更新回调
    // editableCodeblock.onSave = (newContent: string) => {
    //   this.updateCallback(newContent);
    // };
    
    editableCodeblock.render();
    return container;
  }
}

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
function create_decorations(state: EditorState, view: EditorView, updateContent_all: (newContent: string) => void): DecorationSet {
  const decorationRange: Range<Decoration>[] = []; // 装饰组，区分 type DecorationSet = RangeSet<Decoration>;
  // const state = view.state;
  
  // 遍历文档语法树
  syntaxTree(state).iterate({
    enter(node) {
      // 识别Markdown代码块
      if (node.name === 'FencedCode') {
        const from = node.from;
        const to = node.to;
        const text = state.sliceDoc(from, to);
        
        // 提取代码块内容和语言
        const match = text.match(/^```(\w+)?\n([\s\S]*?)\n```$/);
        if (match) {
          const lang = match[1] || '';
          const content = match[2];

          if (lang != 'js') return // TODO 临时，便于查看使用和不使用的区别
          
          // 创建自定义组件装饰器
          // // v1
          // const decoration = Decoration.mark({class: "cm-line-yellow"})
          // decorationRange.push(decoration.range(from, to))

          // // v2
          // const decoration = Decoration.widget({
          //   widget: new CodeblockWidget(state, lang, from, to, (newContent) => {
          //     updateContent_all(from, to, newContent)
          //   }),
          //   side: 1
          // });
          // decorationRange.push(decoration.range(from)) // 仅from没to，表示插入在from处，而非替换

          // v3
          const decoration = Decoration.replace({
            widget: new CodeblockWidget(state, view, content, lang, from, to, updateContent_all),
            inclusive: true,
            block: true,
          })
          decorationRange.push(decoration.range(from, to))
        }
      }
    }
  });
  
  return Decoration.set(decorationRange);
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
        return create_decorations(tr.state, this.view, this.updateContent_all)
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

/**
 * ViewPlugin
 * 
 * @deprecated 时机不对，会在 docView 未完成时就尝试替换装饰器，导致 block replace 行为无法正常进行
 * (如果是 mark 或 widget 则可以正常工作，那还是可以用这种方式的)
 */
export function create_viewPlugin(updateContent_all: (newContent: string) => void) {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = create_decorations(view.state, updateContent_all);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = create_decorations(update.view.state, updateContent_all);
      }
    }
  }, {
    decorations: v => v.decorations
  });
}
