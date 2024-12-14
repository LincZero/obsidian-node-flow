<!-- Markdown项 -->

<template>
  <div ref="MdArea">
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
import { onMounted, ref } from 'vue';
const MdArea = ref()

// md渲染 - 声明函数
let renderMarkdownFn: (markdown: string, el: HTMLElement, ctx?: any) => void;
function redefine_renderMarkdown(callback: (markdown: string, el: HTMLElement, ctx?: any) => void) {
  renderMarkdownFn = callback
}

// md渲染 - 定义，obsidian版本
import { MarkdownRenderChild, MarkdownRenderer, App } from 'obsidian'
import { nfSetting } from 'src/NodeFlow/utils/setting';
redefine_renderMarkdown((markdown: string, el: HTMLElement, ctx?: any): void => {
  el.classList.add("markdown-rendered")
  const mdrc: MarkdownRenderChild = new MarkdownRenderChild(el);
  if (ctx) ctx.addChild(mdrc);
  else if (nfSetting.ctx) nfSetting.ctx.addChild(mdrc);
  // @ts-ignore 新接口，但旧接口似乎不支持
  MarkdownRenderer.render(nfSetting.app, markdown, el, nfSetting.app.workspace.activeLeaf?.view?.file?.path??"", mdrc)
})

// md渲染 - 执行
onMounted(() => {
  if (!MdArea.value || !renderMarkdownFn) return
  renderMarkdownFn(props.data.value, MdArea.value as HTMLElement)
})
</script>
