/**
 * Editable Block - CM Version
 */

import { EditableCodeblock as EditableCodeblock, loadPrism2 } from '../../../General/EditableBlock/EditableBlock_Code';

// prism
import Prism from "prismjs" // 导入代码高亮插件的core（里面提供了其他官方插件及代码高亮样式主题，你只需要引入即可）
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import "prismjs/themes/prism-okaidia.min.css" // 主题, okaidia和tomorrow都是不错黑夜主题
loadPrism2.fn = () => {
  return Prism
}

// codemirror
import {
  EditorView,
} from '@codemirror/view';
import {
  EditorSelection,
  EditorState,
} from '@codemirror/state';

export class EditableBlock_Cm extends EditableCodeblock {
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
