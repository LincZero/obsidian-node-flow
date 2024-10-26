<!-- 显示容器 -->

<template>
  <div :class="isMini?'nf-shell-mini':'nf-shell-view'">
    <NodeFlow ref="RefChild" :jsonData="jsonData" :isMini="isMini"/>
  </div>
  <div class="nf-toolbar">
    <button class="nf-btn-newView" @click="props.fn_newView">newView</button>
    <button class="nf-btn-showJson" @click="fn_showJson">showJson</button>
    <button class="nf-btn-autoPos" @click="fn_autoPos('LR')">autoPosLR</button>
    <button class="nf-btn-autoPos" @click="fn_autoPos('TB')">autoPosTB</button>
    <button class="nf-btn-lock" @click="fn_switchAllowScroll()">exLock</button>
  </div>
</template>

<script setup lang="ts">
// 自身属性、通用导入
const props = defineProps<{
  jsonData?: object,
  fn_newView?: () => Promise<void>,
  isMini: boolean
}>()
import { ref } from 'vue'

// 组件 - 节点画布
import NodeFlow from './NodeFlow.vue'
const RefChild = ref<{
  layoutGraph: (direction: string)=>void,
}>();

// 按钮 - 展示json数据
function fn_showJson() {
  console.log("debug json: ", props.jsonData)
}

// 按钮 - 自动调整顺序
function fn_autoPos(position: string) { RefChild.value.layoutGraph(position) }

// 按钮 - 是否禁用滚动
const isAllowScroll = ref(true);
function fn_switchAllowScroll() {
  if (isAllowScroll.value) {
    isAllowScroll.value = false
    document.body.style.overflow = 'hidden';
    (document.querySelector('.markdown-source-view .cm-scroller') as HTMLElement).style.overflow = 'hidden'
  } else {
    isAllowScroll.value = true
    document.body.style.overflow = '';
    (document.querySelector('.markdown-source-view .cm-scroller') as HTMLElement).style.overflow = ''
  }
}
</script>

<style scoped>
.nf-shell-mini {
  width: 100%;
  height: 500px;
  border: 1px solid currentColor;
  border-radius: 8px;
  overflow: hidden;
}

.nf-shell-view {
  height: calc(100% - 24px);
  overflow: hidden;
}

.nf-toolbar {
  height: 24px;
}
.nf-toolbar>button {
  height: 24px;
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 4px;
  padding-top: 0;
  padding-bottom: 0;
  border: 1px solid transparent;
  outline: none;
}
</style>
