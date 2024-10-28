<!-- 显示容器 -->

<template>
  <div ref="CanFullScreen" :class="_isMini?'normal-size':'full-size'">
    <!-- TODO 有空捋一下这里，全屏这块有些代码应该抽离复用 -->
    <div :class="_isMini?'nf-shell-mini':'nf-shell-view'">
      <NodeFlow ref="RefChild" :jsonData="jsonData" :isMini="_isMini"/>
    </div>
    <div class="nf-toolbar">
      <button class="nf-btn-fullScreen" @click="fn_fullScreen()">fullScreen</button>
      <button class="nf-btn-newView" @click="props.fn_newView">newView</button>
      <button class="nf-btn-printJson" @click="fn_printJson">printJson</button>
      <button class="nf-btn-autoPos" @click="fn_autoPos('LR')">autoPosLR</button>
      <button class="nf-btn-autoPos" @click="fn_autoPos('TB')">autoPosTB</button>
      <button class="nf-btn-lock" @click="fn_switchAllowScroll()">exLock</button>
    </div>
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
const _isMini = ref(props.isMini)

// 组件 - 节点画布
import NodeFlow from './NodeFlow.vue'
const RefChild = ref<{
  layoutGraph: (direction: string)=>void,
}>();

// 按钮 - 展示json数据
function fn_printJson() {
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

// 按钮 - 全屏
const CanFullScreen = ref()
import { switchFullScreen } from "./utils/fullScreen"
function fn_fullScreen() {
  switchFullScreen(CanFullScreen.value, _isMini)
}
</script>

<style scoped>
.full-size {
  height: 100%;
}
.normal-size {
  margin-bottom: 22px;
}

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
