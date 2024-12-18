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
let renderMarkdownFn: (markdown: string, el: HTMLElement, ctx?: any) => void;
function redefine_renderMarkdown(callback: (markdown: string, el: HTMLElement, ctx?: any) => void) {
  renderMarkdownFn = callback
}

import { nfSetting } from '../../utils/main/setting';
// (二选一) md渲染 - 定义, obsidian版本
import { MarkdownRenderChild, MarkdownRenderer } from 'obsidian'
redefine_renderMarkdown((markdown: string, el: HTMLElement, ctx?: any): void => {
  el.classList.add("markdown-rendered")
  const mdrc: MarkdownRenderChild = new MarkdownRenderChild(el);
  if (ctx) ctx.addChild(mdrc);
  else if (nfSetting.ctx) nfSetting.ctx.addChild(mdrc);
  // @ts-ignore 新接口，但旧接口似乎不支持
  MarkdownRenderer.render(nfSetting.app, markdown, el, nfSetting.app.workspace.activeLeaf?.view?.file?.path??"", mdrc)
})
// (二选一) md渲染 - 定义, mdit版本
// import MarkdownIt from "markdown-it";
// const md = MarkdownIt()
// redefine_renderMarkdown((markdown: string, el: HTMLElement, ctx?: any): void => {
//   el.classList.add("markdown-rendered")

//   const result: string = (md as MarkdownIt).render(markdown)
//   const el_child = document.createElement("div"); el.appendChild(el_child); el_child.innerHTML = result;

//   // 好像没办法获取到vuepress的md对象……
//   // if (!nfSetting.md) {
//   //   console.warn("无法渲染markdown", nfSetting)
//   //   el.innerHTML = markdown
//   // }
//   // else {}
// })

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
