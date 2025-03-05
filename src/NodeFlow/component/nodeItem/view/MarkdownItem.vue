<!-- Markdown项 -->

<template>
  <div
    class="markdown-item  node-item-slot"
    :class="{...props.data.refType, 'has-value': props.data.value != '', 'mulline-value': props.data.value.includes('\n') }">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div v-if="props.data.value" class="node-item-value" ref="MdArea">
      <!-- 脚本填充内容 -->
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
import { onMounted, ref } from 'vue';
const MdArea = ref()

// md渲染 - 声明函数
import { nfSetting } from '../../../utils/main/setting';
let renderMarkdownFn: (markdown: string, el: HTMLElement, ctx?: any) => void = nfSetting.fn_renderMarkdown

// md渲染 - 执行
onMounted(() => {
  if (!MdArea.value || !renderMarkdownFn) return
  renderMarkdownFn(props.data.value, MdArea.value as HTMLElement)
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

.markdown-item.has-value.mulline-value .node-item-value {
  padding: 12px;
}
.markdown-item.has-value:not(.mulline-value) .node-item-value {
  padding: 0 12px;
}
</style>
