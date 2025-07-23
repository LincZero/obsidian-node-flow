/**
 * General editable code blocks based on shiki/prismjs
 * 
 * This module previously relied on the `Obsidian` API,
 * but has now been changed to a general module: editable code blocks.
 * 
 * TODO: fix textareaPre x-scrool
 */ 

import './EditableBlock.css'
import { LLOG } from './LLog';

/** Outer info
 * 
 * Outside editor (option, use when codeblock in another editable area)
 * from ctx.getSectionInfo(el) // [!code warning] There may be indentation
 * 
 * Life cycle: One codeblock has one.
 * Pay attention to consistency.
 */
export interface OuterInfo {
	prefix: string, // `> - * + ` // [!code warning] Because of the list nest, first-line indentation is not equal to universal indentation.
	flag: string, // (```+|~~~+)

	language_meta: string, // allow both end space, allow blank
	language_type: string, // source code, can be an alias

	source: string|null,
}

/** Inner info
 * 
 * From obsidian callback args // [!code warning] It might be old data in oninput/onchange method
 * 
 * Life cycle: One codeblock has one.
 * Pay attention to consistency.
 */
export interface InnerInfo {
	language_old: string, // to lib, can't be an alias (eg. c++ -> cpp, sh -> shell, ...)
	source_old: string,
}

/** RAII, use: setValue -> refresh -> getValue -> reSetNull
 * 
 * Note: The "save" operation should not cause the entire document to be updated.
 * Otherwise, it would be impossible to determine which `EditableBlock` the cursor restoration refers to.
 */
export let global_refresh_cache: {pos:null|{start:number, end:number}} = {pos: null}
// let global_isLiveMode_cache: boolean = true // TODO can add option, default cm or readmode // TODO add a state show: isSaved

/** Class definitions in rust style, The object is separated from the implementation
 *
 * use by extends: export default class EditableCodebloc2 extends EditableCodeblock {
 *     override enable_editarea_listener
 *     override emit_render
 *     override emit_save
 * }
 */
export class EditableBlock {
	// - el: (container)
	//   - thisEl: .editable-codeblock
	el: HTMLElement;
	// thisEl: HTMLElement;

	// 丢弃依赖
	// plugin: { app: App; settings: Settings };
	// ctx: MarkdownPostProcessorContext;
	// editor: Editor|null; // Cache to avoid focus changes. And the focus point may not be correct when creating the code block. It can be updated again when oninput
	
	// redundancy
	isReadingMode: boolean = false; // uneditable when true
	isMarkdownRendered: boolean = false;  // uneditable when true
	settings: {
		theme: string;
		renderMode: 'textarea'|'pre'|'editablePre'|'codemirror';
		renderEngine: 'shiki'|'prismjs';
		saveMode: 'onchange'|'oninput'
	} = {
		theme: 'obsidian-theme',
		renderMode: 'textarea',
		renderEngine: 'shiki',
		saveMode: 'onchange'
	}
	config: {
		useTab: boolean;
		tabSize: number;
	} = {
		useTab: true,
		tabSize: 4,
	}

	innerInfo: InnerInfo;
	outerInfo: OuterInfo;

	constructor(language_old:string, source_old:string, el:HTMLElement) {
		// 丢弃依赖
		// this.plugin = plugin
		// this.ctx = ctx
		// this.isReadingMode = ctx.containerEl.hasClass('markdown-preview-section') || ctx.containerEl.hasClass('markdown-preview-view');
		// this.isMarkdownRendered = !ctx.el.hasClass('.cm-preview-code-block') && ctx.el.hasClass('markdown-rendered') // TODO fix: can't check codeblock in Editor codeblock

		this.el = el
		this.innerInfo = {
			language_old: language_old,
			source_old: source_old,
		}
		this.outerInfo = this.init_outerInfo(language_old)
		this.outerInfo.source = this.innerInfo.source_old
	}

	/// (can override)
	init_outerInfo(language_old:string): OuterInfo {
		return {
			prefix: '',
			flag: '', // null flag
			language_meta: '',
			language_type: language_old,
			source: null, // null flag
		}
	}

	/// TODO: fix: after edit, can't up/down to root editor
	/// @param el: HTMLTextAreaElement|HTMLInputElement|HTMLPreElement
	protected enable_editarea_listener(el: HTMLElement, cb_tab?: (ev: KeyboardEvent)=>void, cb_up?: (ev: KeyboardEvent)=>void, cb_down?: (ev: KeyboardEvent)=>void): void {
		if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable)) return

		el.addEventListener('focus', () => {
			// update about outter
		})

		// #region textarea - async part - keydown
		el.addEventListener('keydown', (ev: KeyboardEvent) => { // `tab` key、~~`arrow` key~~
			// var name: (`[` `]` represents the cursors at both ends)
			//   ABCD
			// (2)  AB[(1)CD(3)		// selectionStart, selectionStart_start, selectionStart_end
			// (5)  AB](4)CD(6)    	// selectionEnd,   selectionEnd_start,   selectionEnd_end
			//   ABCD
			if (ev.key == 'Tab') {
				if (cb_tab) { cb_tab(ev); return }
				ev.preventDefault()
				const isShiftTab: boolean = ev.shiftKey;

				// get indent
				const indent_space = ' '.repeat(this.config.tabSize)
				let indent = this.config.useTab ? '\t' : indent_space
				
				if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
					const nodeText: string = el.value
					const selectionStart: number = el.selectionStart ?? 0
					const selectionEnd: number = el.selectionEnd ?? 0
					const selectionStart_start: number = nodeText.lastIndexOf('\n', selectionStart - 1) + 1 // fix -1 by +1
					let selectionEnd_end: number = nodeText.indexOf('\n', selectionEnd) // fix -1 by use text length
					if (selectionEnd_end == -1) selectionEnd_end = nodeText.length

					// auto indent (otpion)
					{
						const selectionStart_line: string = nodeText.substring(selectionStart_start, selectionEnd_end)
						if (selectionStart_line.startsWith('\t')) indent = '\t'
						else if (selectionStart_line.startsWith(' ')) indent = indent_space
					}

					// change - indent, if selected content
					if (selectionStart != selectionEnd || isShiftTab) {
						const before = nodeText.substring(0, selectionStart_start) // maybe with end `\n`
						const after = nodeText.substring(selectionEnd_end) // maybe with start `\n`
						let center = nodeText.substring(selectionStart_start, selectionEnd_end) // without both `\n`
						const center_lines = center.split('\n')

						if (isShiftTab) {
							// new value: before + newCenter + after
							let indent_subCount = 0
							const indent_subCount_start: 0|1 = center_lines[0].startsWith(indent) ? 1 : 0
							center = center_lines.map(line => {
								if (line.startsWith(indent)) {
									indent_subCount++
									return line.slice(indent.length);
								}
								return line
							}).join('\n')
							el.value = before + center + after

							// new cursor pos
							el.selectionStart = selectionStart - indent.length * indent_subCount_start
							el.selectionEnd = selectionEnd - indent.length * indent_subCount
						}
						else {
							center = center_lines.map(line => indent + line).join('\n')
							el.value = before + center + after

							// new cursor pos
							el.selectionStart = selectionStart + indent.length * 1
							el.selectionEnd = selectionEnd + indent.length * center_lines.length
						}
					}
					// change - insert
					else {
						// new value: cursorBefore + tab + cusrorAfter
						el.value = el.value.substring(0, selectionStart) + indent + el.value.substring(selectionEnd)

						// new cursor pos
						el.selectionStart = el.selectionEnd = selectionStart + indent.length
					}
				}
				else { // pre/code
					let pre: HTMLPreElement
					let code: HTMLPreElement
					if (el.tagName === 'CODE') {
						pre = el.parentElement as HTMLPreElement
						code = el as HTMLPreElement
					}
					else {
						pre = el as HTMLPreElement
						code = el.querySelector(':scope>code') as HTMLPreElement
					}

					const selection = window.getSelection();
					if (!selection || selection.rangeCount === 0) return

					const nodeText = pre.textContent ?? ''
					const pos = this.cursorPosition_save(pre)
					if (!pos) return
					const selectionStart: number = pos.start
					const selectionEnd: number = pos.end
					const selectionStart_start: number = nodeText.lastIndexOf('\n', selectionStart - 1) + 1 // fix -1 by +1
					let selectionEnd_end: number = nodeText.indexOf('\n', selectionEnd) // fix -1 by use text length
					if (selectionEnd_end == -1) selectionEnd_end = nodeText.length

					// auto indent (otpion)
					{
						const selectionStart_line: string = nodeText.substring(selectionStart_start, selectionEnd_end)
						if (selectionStart_line.startsWith('\t')) indent = '\t'
						else if (selectionStart_line.startsWith(' ')) indent = indent_space
					}
					
					// change - indent, if selected content
					if (selectionStart != selectionEnd || isShiftTab) {
						const before = nodeText.substring(0, selectionStart_start) // maybe with end `\n`
						const after = nodeText.substring(selectionEnd_end) // maybe with start `\n`
						let center = nodeText.substring(selectionStart_start, selectionEnd_end) // without both `\n`
						const center_lines = center.split('\n')

						if (isShiftTab) {
							// new value: before + newCenter + after
							let indent_subCount = 0
							const indent_subCount_start: 0|1 = center_lines[0].startsWith(indent) ? 1 : 0
							center = center_lines.map(line => {
								if (line.startsWith(indent)) {
									indent_subCount++
									return line.slice(indent.length);
								}
								return line
							}).join('\n')
							this.outerInfo.source = before + center + after

							// new cursor pos TODO
							global_refresh_cache.pos = {
								start: selectionStart - indent.length * indent_subCount_start,
								end: selectionEnd - indent.length * indent_subCount
							}
						}
						else {
							center = center_lines.map(line => indent + line).join('\n')
							this.outerInfo.source = before + center + after

							// new cursor pos TODO
							global_refresh_cache.pos = {
								start: selectionStart + indent.length * 1,
								end: selectionEnd + indent.length * center_lines.length
							}
						}

						code.innerText = before + center + after
					}
					// change - insert
					else {
						// new value
						const selectionRange = selection.getRangeAt(0) // first node, .startOffset is right, .endOffset maybe error
						const textNode: Node = document.createTextNode(indent)
						selectionRange.deleteContents()
						selectionRange.insertNode(textNode)

						// new cursor pos
						const newRange = document.createRange();
						newRange.setStartAfter(textNode);
						newRange.collapse(true);
						selection.removeAllRanges();
						selection.addRange(newRange);
					}
				}

				el.dispatchEvent(new InputEvent('input', { // emit input event
					inputType: 'insertText',
					data: indent,
					bubbles: true,
					cancelable: true
				}));
				return
			}
		})
		// #endregion
	}

	async emit_render(targetEl:HTMLElement): Promise<void> {}

	/** Save textarea text content to codeBlock markdown source
	 * 
	 * Data security (Importance)
	 * - Make sure `Ctrl+z` is normal: use transaction
	 * - Make sure check error: try-catch
	 * - Make sure to remind users of errors: use Notice
	 * - Avoid overwriting the original data with incorrect data, this is unacceptable
	 * 
	 * Refresh strategy1 (unable): real-time save, debounce
	 * - We need to ensure that the textarea element is not recreated when updating
	 *   the content of the code block. It should be reused to avoid changes in the cursor position.
	 * - Reduce the update frequency and the number of transactions.
	 *   Multiple calls within a certain period of time will only become one. (debounce)
	 * 
	 * Refresh strategy2 (enable): onchange emit
	 * - It is better implemented under the obsidian architecture.
	 *   Strategy1 requires additional processing: cache el
	 * - ~~Disadvantage: Can't use `ctrl+z` well in the code block.~~
	 *   textarea can be `ctrl+z` normally
	 * - Afraid if the program crashes, the frequency of save is low
	 * 
	 * Other / Universal
	 * - This should be a universal module. It has nothing to do with the logic of the plugin.
	 * - Indent process
	 * 
	 * @param isUpdateLanguage reduce modifications and minimize mistakes, can be used to increase stability
	 * @param isUpdateSource   reduce modifications and minimize mistakes, can be used to increase stability
	 */
	emit_save(isUpdateLanguage: boolean, isUpdateSource: boolean): Promise<void> {
		return new Promise<void>((resolve, reject) => {})
	}

	/**
	 * 聚焦到可编辑区域
	 * 
	 * 场景：处理光标从外部(cm)移动到该组件里的情况
	 * 可能的元素：textarea 或 pre>code[contenteditable="true"]
	 * 
	 * @param line 聚焦并将光标置于指定位置，允许负数索引。TODO 目前仅textarea模式支持
	 */
	focus(line?: number): void {
		const textarea: HTMLTextAreaElement|null = this.el.querySelector('textarea')
		const editableArea: HTMLElement|null = this.el.querySelector('[contenteditable="true"]')

		if (textarea) {
			textarea.focus()

			if (line == undefined) return
			// 计算目标行（处理负数索引）
			const lines = textarea.value.split('\n');
			const lineCount = lines.length;
			const targetLine = line < 0 // 目标行
				? Math.max(0, lineCount + line)  // 负索引转换
				: Math.min(line, lineCount - 1); // 确保不越界
			
			// 计算目标位置
			let pos = 0;
			for (let i = 0; i < targetLine; i++) {
				pos += lines[i].length + 1; // +1为换行符
			}

			textarea.setSelectionRange(pos, pos);
			return
		}
		else if (editableArea) {
			editableArea.focus()
			return
		}
	}

	// ------------------ utils ------------------

	/** get selection to a `[contenteditable=true]` element
	 * 
	 * @param container HTMLTextAreaElement|`*[contenteditable=true]`, the latter is more complex
	 * @return Generally, it will save to "global_refresh_cache.pos"
	 */ 
	public cursorPosition_save(container: Node): null|{start: number, end: number} {
		if (container instanceof HTMLTextAreaElement) {
			return {
				start: container.selectionStart,
				end: container.selectionEnd,
			}
		}

		const selection = window.getSelection()
		if (!selection || selection.rangeCount === 0) return null

		const range: Range = selection.getRangeAt(0) // first node, startOffset is range, endOffset maybe error

		// get start
		const preRange: Range = document.createRange()
		preRange.selectNodeContents(container)
		preRange.setEnd(range.startContainer, range.startOffset)
		const start = preRange.toString().length

		return {
			start,
			end: start + range.toString().length
		}
	}

	/** apply selection to a `[contenteditable=true]` element
	 * 
	 * @param container HTMLTextAreaElement|`*[contenteditable=true]`, the latter is more complex
	 * @param start Generally, it will get from "global_refresh_cache.pos"
	 */ 
	public cursorPosition_apply(container: Node, start: number, end: number): void {
		if (container instanceof HTMLTextAreaElement) {
			container.setSelectionRange(global_refresh_cache.pos.start, global_refresh_cache.pos.end)
			return
		}

		// get range
		const range: Range = document.createRange()
		let charIndex = 0
		let isFoundStart = false
		let isFoundEnd = false
		function traverse(node: Node): void {
			if (node.nodeType === Node.TEXT_NODE) { // pre/code is Node.ELEMENT_NODE, not inconformity
				const nextIndex = charIndex + (node.nodeValue?.length ?? 0)
				if (!isFoundStart && start >= charIndex && start <= nextIndex) { // start
					range.setStart(node, start - charIndex)
					isFoundStart = true
				}
				if (isFoundStart && !isFoundEnd && end >= charIndex && end <= nextIndex) { // end
					range.setEnd(node, end - charIndex)
					isFoundEnd = true
				}
				charIndex = nextIndex
			} 
			else {
				for (const child of node.childNodes) {
					traverse(child)
					if (isFoundEnd) break
				}
			}
		}
		traverse(container)

		const selection = window.getSelection()
		selection?.removeAllRanges()
		selection?.addRange(range)
	}
}
