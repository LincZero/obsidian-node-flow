<!-- Markdown项 -->

<template>
  <div :class="'markdown-item  node-item-slot ' + props.data.refType">
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

<style scoped>
.markdown-item {
  box-sizing: border-box;
  min-height: 24px;
  height: auto;

  padding: 1px 12px;
  border: solid 1px #616161;
  background-color: #222222;
  border-radius: 13px;
}
.markdown-item .node-item-name, .markdown-item .node-item-value {
  float: none !important;
}
</style>
