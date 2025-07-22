<template>
  <div ref="ref_container" class="app-codemirror"></div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

import { EditorView, basicSetup } from "codemirror"
import { markdown } from "@codemirror/lang-markdown"
import { DecorationSet, keymap } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorState, StateField } from '@codemirror/state'
// import * as HyperMD from 'hypermd'
import ixora from '@retronav/ixora'; // 可以全部导入或分开导入

import { EditableCodeblockCm } from "../index_cm"

const props = defineProps<{
  mdData: any
}>()
const ref_container = ref<HTMLElement | null>(null)

// 初始化 CodeMirror
const ref_editorView = ref<EditorView | null>(null)
function initEditor() {
  if (!ref_container.value) return

  const view = new EditorView({ // 也可以分开创建state和view，方便复用
    doc: props.mdData.string,
    extensions: [       // codemirror 扩展
      basicSetup,       // 基础设置
      keymap.of(defaultKeymap), // 默认快捷键
      markdown(),       // markdown 语言支持
      oneDark,          // 黑暗主题
      extension_update, // 监听更新
      // editableCodeBlock_viewPlugin,
      ixora,            // 一组扩展 (标题、列表、代码块、引用块、图像、html等)
    ],
    parent: ref_container.value,
  })
  // 使用 EditableCodeblock 插件
  const _editableCodeblockCm = new EditableCodeblockCm(view, props.mdData, (newStr: string) => {
    props.mdData.string = newStr
  }, true)

  ref_editorView.value = view

  // 使用 HyperMD 用法，参考 https://github.com/laobubu/HyperMD/blob/master/docs/zh-CN/quick-start.md
  // HyperMD.fromTextArea(textareaEl, option) // 仅使用 HyperMD
  // 将已有的 CodeMirror 转为 HyperMD
  // HyperMD.fromTextArea(ref_container2.value)
  // if (ref_editorView.value) {
  //   HyperMD.switchToHyperMD(ref_editorView.value as any)
  // }
}

// cm -> str
const extension_update = EditorView.updateListener.of(update => {
  if (update.docChanged) {
    const newContent = update.state.doc.toString()
    props.mdData.string = newContent
  }
})

// str -> cm 更新编辑器内容
watch(() => props.mdData.string, (newVal) => {
  if (!ref_editorView.value) return
  const current = ref_editorView.value.state.doc.toString()
  if (current !== newVal) {
    ref_editorView.value.dispatch({
      changes: {
        from: 0,
        to: current.length,
        insert: newVal
      }
    })
  }
})

// /** ViewPlugin方式
//  * @deprecated create_viewPlugin 废弃
//  */
// const cb = (from: number, to: number, newContent: string) => {
//   // 更新Markdown中的代码块内容
//   const original = props.mdData.string;
//   const before = original.substring(0, from);
//   const after = original.substring(to);
//   const langMatch = original.substring(from).match(/^```(\w+)?\n/);
//   const lang = langMatch ? langMatch[1] || '' : '';
  
//   const updated = `${before}\`\`\`${lang}\n${newContent}\n\`\`\`${after}`;
//   props.mdData.string = updated
// }
// const editableCodeBlock_viewPlugin = create_viewPlugin(cb)

onMounted(() => {
  initEditor()
})
</script>

<style lang="scss" scoped>
.app-codemirror {
  height: 100%;
}
</style>

<style lang="scss">
.cm-editor {
  height: calc(100% - 10px);
  font-family: inherit;
}
</style>
