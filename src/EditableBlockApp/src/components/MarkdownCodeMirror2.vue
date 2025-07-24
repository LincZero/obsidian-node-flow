<!-- 不使用 EditableCodeblock CM plugin 的版本 -->

<template>
  <div ref="ref_container" class="app-codemirror2"></div>
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

import { EditableCodeblockCm } from "../codemirrorAdapt/index_cm"

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

  ref_editorView.value = view
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

onMounted(() => {
  initEditor()
})
</script>

<style lang="scss" scoped>
.app-codemirror2 {
  height: 100%;
}
</style>

<style lang="scss">
.cm-editor {
  height: calc(100% - 10px);
  font-family: inherit;
}
</style>
