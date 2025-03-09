<!-- Markdown项 -->

<template>
  <div
    class="markdown-item  node-item-slot"
    :class="{...props.data.refType, 'has-value': writable_value != '', 'mulline-value': writable_value.includes('\n') }">
    <span class="node-item-name" v-if="props.data.name">{{ props.data.name }}</span>
    <div class="node-item-value nodrag nowhell" spellcheck="false" v-if="props.data.value" ref="MdArea" :title="data.cacheValue" contenteditable="true">
      <!-- 脚本填充内容 -->
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
import { computed, nextTick, onMounted, ref, watch } from 'vue';
const MdArea = ref()

// 实际显示和可写属性
if (!props.data.value) props.data.value = ''
import { useVueFlow } from '@vue-flow/core';
const { findNode } = useVueFlow()
const parentNode = findNode(props.data.parentId)
const writable_value = computed({
  get: () => {
    let ret:string
    // 显示cacheValue的情况
    if (parentNode && parentNode.data.runState != 'none' && props.data.cacheValue && props.data.value != '') {
      ret = props.data.cacheValue
    }
    // 显示value的情况
    else {
      ret = props.data.value
    }
    nextTick(() => { 
      MdArea.value.innerHTML = ''
      renderMarkdownFn(ret, MdArea.value as HTMLElement)
    })
    return ret
  },
  set: (value) => { props.data.value = value }, // 不触发数据驱动则无需 return updateNodeData(props.id, props.data)
})

// md渲染 - 声明函数
import { nfSetting } from '../../../utils/main/setting';
let renderMarkdownFn: (markdown: string, el: HTMLElement, ctx?: any) => void = nfSetting.fn_renderMarkdown

// md渲染 - 执行
onMounted(() => {
  if (!MdArea.value || !renderMarkdownFn) return
  renderMarkdownFn(writable_value.value, MdArea.value as HTMLElement)
})
</script>

<style>
.markdown-item .markdown-rendered>div:first-child>* { /* mdit版 */
  margin-top: 4px;
}
</style>

<style scoped>
/* string, md共用. 主要是根据value的不同有三种样式 */
.markdown-item {
  box-sizing: border-box;
  min-height: 24px; /* (20+4+0)+4 */
  height: auto;

  padding: 2px 0px;
}
.markdown-item .node-item-name { line-height: calc(24px - 4px); }
.markdown-item .node-item-value { line-height: calc(24px - 4px); }
/* 1. 无value */
.markdown-item:not(.has-value) {
  background: none;
  border: 0;
}
 /* 2. 单行value */
.markdown-item.has-value:not(.mulline-value) {
  height: 24px;
  padding: 1px 0;
  background-color: #222222;
  border: solid 1px #616161;
  border-radius: 13px;
}
.markdown-item.has-value:not(.mulline-value) .node-item-name { padding: 0 12px; }
.markdown-item.has-value:not(.mulline-value) .node-item-value { margin-left: 4px; }
/* 3. 多行value */
.markdown-item.has-value.mulline-value {
  background: none;
}
.markdown-item.has-value.mulline-value .node-item-name {
  float: none !important;
}
.markdown-item.has-value.mulline-value .node-item-value {
  float: none !important;
  background-color: #222222;
  border: solid 1px #616161;
  border-radius: 13px;
}

/* --- */

.markdown-item .node-item-value {
  max-height: 700px;
  max-width: 500px;
  overflow: auto;
}
.markdown-item .node-item-value:hover {
  cursor: text;
}
.markdown-item.has-value.mulline-value .node-item-value {
  padding: 12px;
}
.markdown-item.has-value:not(.mulline-value) .node-item-value {
  padding: 0 12px;
}
</style>
