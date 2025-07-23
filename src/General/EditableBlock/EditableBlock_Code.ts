/**
 * General editable code blocks based on shiki/prismjs
 * 
 * This module previously relied on the `Obsidian` API,
 * but has now been changed to a general module: editable code blocks.
 * 
 * TODO: fix textareaPre x-scrool
 */ 

// [!code hl]
import { EditableBlock, global_refresh_cache } from './EditableBlock';
import { LLOG } from './LLog';
// import {
// 	transformerNotationDiff,
// 	transformerNotationHighlight,
// 	transformerNotationFocus,
// 	transformerNotationErrorLevel,
// 	transformerNotationWordHighlight,

// 	transformerMetaHighlight,
// 	transformerMetaWordHighlight,
// } from '@shikijs/transformers';
// import { bundledThemesInfo, codeToHtml } from 'shiki'; // 8.6MB

export const loadPrism2 = {
	// can override
	fn: async (): Promise<any> => {
		// import Prism from "prismjs"
		// return Prism

		return null
	}
}

/** Class definitions in rust style, The object is separated from the implementation
 *
 * use by extends: export default class EditableCodebloc2 extends EditableCodeblock {
 *     override enable_editarea_listener
 *     override emit_render
 *     override emit_save
 * }
 */
export class EditableCodeblock extends EditableBlock {
	/// first render
	async render(): Promise<void> {
		switch (this.settings.renderMode) {
			case 'textarea':
				return this.renderTextareaPre()
			case 'pre':
				return this.emit_render(this.el)
			case 'editablePre':
				return this.renderEditablePre()
			default:
				throw new Error('Unreachable')
		}
	}

	/** param this.settings.saveMode onchange/oninput
	 * 
	 * onCall: renderMode === 'textarea'
	 */
	private renderTextareaPre(): void {
		// dom
		// - div.editable-codeblock
		//   - span > pre > code
		//   - textarea
		//   - div.language-edit
		
		// div
		const div = document.createElement('div'); this.el.appendChild(div); div.classList.add('editable-codeblock', 'editable-textarea')

		// span
		const span = document.createElement('span'); div.appendChild(span);
		void this.emit_render(span) // only here use span as arg

		// textarea
		const textarea = document.createElement('textarea'); div.appendChild(textarea);
		const attributes = {
			'resize-none': '', 'autocomplete': 'off', 'autocorrect': 'off', 'autocapitalize': 'none', 'spellcheck': 'false',
		};
		Object.entries(attributes).forEach(([key, val]) => {
			textarea.setAttribute(key, val);
		});
		textarea.value = this.outerInfo.source ?? this.innerInfo.source_old;

		// [!code hl]
		// language-edit
		let editInput: HTMLInputElement|undefined
		// const editEl = document.createElement('div'); div.appendChild(editEl); editEl.classList.add('language-edit');
		// editEl.setAttribute('align', 'right');
		// editInput = document.createElement('input'); editEl.appendChild(editInput);
		// editInput.value = this.outerInfo.language_type + this.outerInfo.language_meta

		// readmode and markdown reRender not shouldn't change
		if (this.isReadingMode || this.isMarkdownRendered) {
			textarea.setAttribute('readonly', '')
			textarea.setAttribute('display', '')
			if (editInput) { editInput.setAttribute('readonly', '') }
			return
		}

		// ---------- is sync --------------

		// #region textarea - async part - composition start/end
		let isComposing = false; // Is in the input method combination stage. Can fix input method (like chinese) invalid. The v-model in the Vue version also has this problem.
		textarea.addEventListener('compositionstart', () => {
			isComposing = true
		});

		textarea.addEventListener('compositionend', () => {
			isComposing = false
			// updateCursorPosition(); // (option)
		});
		// #endregion

		// #region textarea - async part - oninput/onchange
		// refresh/save strategy1: input no save
		if (this.settings.saveMode == 'onchange') {
			textarea.oninput = (ev): void => {			
				emit_change((ev.target as HTMLTextAreaElement).value, true, false, false)
			}
			// TODO: fix: not emit onchange when no change, and is-no-saved class will not remove. 
			textarea.onchange = (ev): void => { // save must on oninput: avoid: textarea --update--> source update --update--> textarea (lose curosr position)
				emit_change((ev.target as HTMLTextAreaElement).value, true, true, false)
			}
		}
		// refresh/save strategy2: cache and rebuild
		else {
			void Promise.resolve().then(() => {
				if (!global_refresh_cache.pos) return
				this.cursorPosition_apply(textarea, global_refresh_cache.pos.start, global_refresh_cache.pos.end)
				textarea.focus()
				global_refresh_cache.pos = null
				// return
			})
			textarea.oninput = (ev): void => {
				emit_change((ev.target as HTMLTextAreaElement).value, true, true, true) // old: isRender is true
			}
		}

		// Note: Saving does not necessarily trigger rendering (this is only the case in environments such as ob)
		const emit_change = (newValue: string, isRender: boolean, isSave: boolean, isSavePos: boolean): void => {
			if (isComposing) return
			this.outerInfo.source = newValue
			if (isRender) {
				void this.emit_render(div)
				div.classList.add('is-no-saved');
			}
			if (isSavePos) {
				global_refresh_cache.pos = this.cursorPosition_save(textarea)
			}
			if (isSave) {
				div.classList.remove('is-no-saved'); void this.emit_save(false, true)
			}
		}
		// #endregion

		// #region textarea - async part - keydown
		if (editInput) {
			this.enable_editarea_listener(textarea, undefined, undefined, (ev)=>{
				const selectionEnd: number = textarea.selectionEnd
				const textBefore = textarea.value.substring(0, selectionEnd)
				const linesBefore = textBefore.split('\n')
				if (linesBefore.length !== textarea.value.split('\n').length) return

				ev.preventDefault() // safe: tested: `prevent` can still trigger `onChange
				editInput.setSelectionRange(0, 0)
				editInput.focus()
			})
		} else {
			this.enable_editarea_listener(textarea)
		}
		// #endregion

		// #region language-edit - async part
		if (editInput) {
			if (this.settings.saveMode != 'oninput') {
				// no support
			}
			{
				editInput.oninput = (ev): void => {
					if (isComposing) return

					const newValue = (ev.target as HTMLInputElement).value
					const match = /^(\S*)(\s?.*)$/.exec(newValue)
					if (!match) throw new Error('This is not a regular expression matching that may fail')
					this.outerInfo.language_type = match[1]
					this.outerInfo.language_meta = match[2]
					void this.emit_render(div)
					div.classList.add('is-no-saved'); 
				}
				editInput.onchange = (ev): void => { // save must on oninput: avoid: textarea --update--> source update --update--> textarea (lose curosr position)
					const newValue = (ev.target as HTMLInputElement).value
					const match = /^(\S*)(\s?.*)$/.exec(newValue)
					if (!match) throw new Error('This is not a regular expression matching that may fail')
					this.outerInfo.language_type = match[1]
					this.outerInfo.language_meta = match[2]
					div.classList.remove('is-no-saved'); void this.emit_save(true, false)
				}
			}

			this.enable_editarea_listener(editInput, undefined, (ev)=>{
				ev.preventDefault() // safe: tested: `prevent` can still trigger `onChange
				const position = textarea.value.length
				textarea.setSelectionRange(position, position)
				textarea.focus()
			}, undefined)
		}
		// #endregion
	}

	/** param this.settings.saveMode onchange/oninput
	 * 
	 * onCall: renderMode === 'editablePre'
	 * 
	 * ## editable pre or code?
	 * 
	 * - (default) editable pre
	 *   - bug: pre maybe has multiple code el (firefox no, chrome will)
	 *     fix: ??? (There is no solution for the time being)
	 * - editable code
	 *   - bug: focus area for chick more small
	 *     fix: code display inline->block
	 *   - bug: cursor in lastline when newLine
	 *     fix: fix progarm bug
	 *   - bug: hard to use focus style
	 *     fix: `:has()` (only support in new version browser)
	 */
	private async renderEditablePre(): Promise<void> {
		// dom
		// - div.editable-codeblock.editable-pre
		//   - pre
		//     - code.language-<codeType>

		// div
		const div = document.createElement('div'); this.el.appendChild(div); div.classList.add('editable-codeblock', 'editable-pre')

		// pre, code
		await this.emit_render(div)
		let pre: HTMLPreElement|null = div.querySelector(':scope>pre')
		let code: HTMLPreElement|null = div.querySelector(':scope>pre>code')
		code.setAttribute('contenteditable', 'true'); code.setAttribute('spellcheck', 'false')
		if (!pre || !code) { LLOG.error('render failed. can\'t find pre/code 1'); return }
		this.enable_editarea_listener(code)

		// readmode and markdown reRender not shouldn't change
		if (this.isReadingMode || this.isMarkdownRendered) {
			code.setAttribute('readonly', '')
			return
		}

		// #region code - async part - composition start/end
		let isComposing = false; // is in the input method combination stage, can fix chinese input method invalid
		code.addEventListener('compositionstart', () => {
			isComposing = true
		});

		code.addEventListener('compositionend', () => {
			isComposing = false
			// updateCursorPosition(); // (option)
		});
		// #endregion
		
		// #region code - async part - oninput/onchange
		// refresh/save strategy1: input no save
		if (this.settings.saveMode == 'onchange') {
			void Promise.resolve().then(() => {
				if (!global_refresh_cache.pos) return
				if (!pre || !code) { LLOG.error('render failed. can\'t find pre/code 11'); global_refresh_cache.pos = null; return }
				this.cursorPosition_apply(pre, global_refresh_cache.pos.start, global_refresh_cache.pos.end)
				global_refresh_cache.pos = null
			})
			code.oninput = (ev): void => {
				emit_change((ev.target as HTMLPreElement).innerText, true, false, false) // .textContent more fast, but can't get new line by 'return' (\n yes, br no)
			}
			//   pre/code without onchange, use blur event
			code.addEventListener('blur', (ev): void => { // save must on oninput: avoid: textarea --update--> source update --update--> textarea (lose curosr position)
				emit_change((ev.target as HTMLPreElement).innerText, false, true, false) // .textContent more fast, but can't get new line by 'return' (\n yes, br no)
			})
		}
		// refresh/save strategy2: cache and rebuild
		else {
			void Promise.resolve().then(() => {
				if (!global_refresh_cache.pos) return
				if (!pre || !code) { LLOG.error('render failed. can\'t find pre/code 21'); global_refresh_cache.pos = null; return }
				this.cursorPosition_apply(pre, global_refresh_cache.pos.start, global_refresh_cache.pos.end)
				global_refresh_cache.pos = null
			})
			code.oninput = (ev): void => {
				emit_change((ev.target as HTMLPreElement).innerText, false, true, true) // .textContent more fast, but can't get new line by 'return' (\n yes, br no)
				// old save more simple: void this.emit_render(div)
			}
		}

		// Note: Saving does not necessarily trigger rendering (this is only the case in environments such as ob).
		const emit_change = (newValue: string, isRender: boolean, isSave: boolean, isSavePos: boolean): void => {
			if (isComposing) return
			if (!pre || !code) { LLOG.error('render failed. can\'t find pre/code 12'); return }

			this.outerInfo.source = newValue // prism use textContent and shiki use innerHTML, Their escapes from `</>` are different
			if (isRender) {
				void Promise.resolve().then(async () => { // like vue nextTick, ensure that the cursor is behind
					pre = div.querySelector(':scope>pre')
					code = div.querySelector(':scope>pre>code')
					if (!pre || !code) { LLOG.error('render failed. can\'t find pre/code 13'); global_refresh_cache.pos = null; return }

					// save pos
					global_refresh_cache.pos = this.cursorPosition_save(pre)

					// pre, code
					await this.emit_render(div)
					div.classList.add('is-no-saved');

					// restore pos
					if (!global_refresh_cache.pos) return
					this.cursorPosition_apply(pre, global_refresh_cache.pos.start, global_refresh_cache.pos.end)
					global_refresh_cache.pos = null
				})
			}
			if (isSavePos) {
				global_refresh_cache.pos = this.cursorPosition_save(pre)
			}
			if (isSave) {
				div.classList.remove('is-no-saved'); void this.emit_save(false, true)
			}
		}
		// #endregion
	}

	// /**
	//  * @deprecated There will be a strong sense of lag, and the experience is not good.
	//  * you should use `renderPre` version
	//  */
	// renderPre_debounced = debounce(async (targetEl:HTMLElement): Promise<void> => {
	// 	void this.renderPre(targetEl)
	// 	LLOG.log('debug renderPre debounced')
	// }, 200)

	/** Render code to targetEl
	 * 
	 * - render version: first render
	 * - emit_render version: Content has changed. Please reload/re-render.
	 * 
	 * onCall: renderMode === 'pre'
	 * 
	 * why reuse code element?
	 * - reduce the refresh rate
	 * - avoid rebind event listeners, like focus, blur, input, keydown, etc.
	 * - avoid re focus
	 * 
	 * Otherwise, additional work will be required later on:
	 * - this.enable_editarea_listener(code)
	 * - ... rebind event
	 * 
	 * param this.settings.renderEngine shiki/prism
	 * @param targetEl in which element should the result be rendered
	 * - targetEl (usually a div)
	 *   - pre
	 *     - code
	 */
	override async emit_render(targetEl:HTMLElement): Promise<void> {
		// source correct.
		// When the last line of the source is blank (with no Spaces either),
		// prismjs and shiki will both ignore the line,
		// this causes `textarea` and `pre` to fail to align.
		let source: string = this.outerInfo.source ?? this.innerInfo.source_old
		if (source.endsWith('\n')) source += '\n'

		// pre html string - shiki, insert `<pre>...<pre/>`
		if (this.settings.renderEngine == 'shiki') {
			// [!code hl]
			// // check theme, TODO: use more theme
			// let theme = ''
			// for (const item of bundledThemesInfo) {
			// 	if (item.id == this.settings.theme) { theme = this.settings.theme; break }
			// }
			// if (theme === '') {
			// 	theme = 'andromeeda'
			// 	// LLOG.warn(`no support theme '${this.settings.theme}' temp in this render mode`) // [!code error] TODO fix
			// }

			// const preStr:string = await codeToHtml(source, {
			// 	lang: this.innerInfo.language_old,
			// 	theme: theme,
			// 	meta: { __raw: this.outerInfo.language_meta },
			// 	// https://shiki.style/packages/transformers
			// 	transformers: [
			// 		transformerNotationDiff({ matchAlgorithm: 'v3' }),
			// 		transformerNotationHighlight(),
			// 		transformerNotationFocus(),
			// 		transformerNotationErrorLevel(),
			// 		transformerNotationWordHighlight(),

			// 		transformerMetaHighlight(),
			// 		transformerMetaWordHighlight(),
			// 	],
			// })

			// const code: HTMLPreElement|null = targetEl.querySelector('pre>code')
			// if (!code) {
			// 	targetEl.innerHTML = preStr // prism use textContent and shiki use innerHTML, Their escapes from `</>` are different
			// }
			// else {
			// 	const parser = new DOMParser();
  			// 	const doc = parser.parseFromString(preStr, 'text/html');
			// 	const codeElement = doc.querySelector('pre>code')
			// 	if (!codeElement) { LLOG.error('shiki return preStr without code tag', doc); return }
			// 	code.innerHTML = codeElement.innerHTML
			// }
		}
		// pre html string - prism, insert `<pre>...<pre/>`
		else {
			const prism = await loadPrism2.fn()
			if (!prism) {
				LLOG.error('warning: withou Prism')
				return
			}

			// sure `targetEl > pre> one code`
			let pre: HTMLPreElement|null = targetEl.querySelector('pre')
			let code: HTMLPreElement|null = pre?.querySelector(':scope>code')
			const textarea: HTMLTextAreaElement|null = targetEl.querySelector('textarea')

			if (!pre) { // maybe lose textarea
				targetEl.innerHTML = ''
				pre = document.createElement('pre'); targetEl.appendChild(pre);
			}
			if (!code) {
				code = document.createElement('code') as HTMLPreElement; pre.appendChild(code); code.classList.add('language-'+this.outerInfo.language_type);
			}
			else if (pre.children?.length??0 > 1) {
				pre.innerHTML = ''
				pre.appendChild(code)
			}

			// render
			if (textarea) textarea.value = source // It may not be an update triggered by the change of the textarea (where the value is directly set)
			code.textContent = source; // prism use textContent and shiki use innerHTML, Their escapes from `</>` are different
			prism.highlightElement(code)
		}
	}
}
