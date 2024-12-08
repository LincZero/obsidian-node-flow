<!-- 显示容器 (主要为了在局部模式和全局模式之间切换) -->

<template>
  <div ref="CanFullScreen" :class="_isMini?'normal-size':'full-size'">
    <!-- 主画布 -->
    <!-- TODO 有空捋一下这里，全屏这块有些代码应该抽离复用 -->
    <div :class="_isMini?'nf-shell-mini':'nf-shell-view'">
      <NodeFlow ref="RefChild" :jsonData="jsonData" :isMini="_isMini"/>
    </div>

    <!-- 工具栏 -->
    <div class="nf-toolbar">
      <button class="nf-btn nf-btn-fullscreen" @click="fn_fullScreen()">fullScreen</button>
      <button class="nf-btn nf-btn-newview" @click="_fn_newView()">newView</button>
      <DropdownButton class="nf-btn" :label='"autoPosLR"' :fn="() => fn_autoPos('LR')" #default="{ selectItem }">
        <button class="nf-btn nf-btn-autopos" @click="selectItem('autoPosLR', () => fn_autoPos('LR'))">autoPosLR</button>
        <button class="nf-btn nf-btn-autopos" @click="selectItem('autoPosTB', () => fn_autoPos('TB'))">autoPosTB</button>
      </DropdownButton>
      <DropdownButton class="nf-btn" :label='"printJson"' :fn="fn_printJson" #default="{ selectItem }">
        <button class="nf-btn nf-btn-printjson" @click="selectItem('printJson', fn_printJson)">printJson</button>
        <button class="nf-btn nf-btn-copyMd" @click="selectItem('copyMd', () => fn_copyRaw(true))">copyMd</button>
        <button class="nf-btn nf-btn-copyjson" @click="selectItem('copyJson', () => fn_copyRaw(false))">copyJson</button>
      </DropdownButton>
      <button class="nf-btn nf-btn-lock" @click="fn_switchAllowScroll()">exLock</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 自身属性、通用导入
const props = defineProps<{
  jsonData: object,
  isMini: boolean,
  rawData?: string,
  fn_newView?: () => Promise<void>,
}>()
import { computed, ref } from 'vue'
const _fn_newView = computed(() => props.fn_newView || fn_fullScreen); // 缺失则设置默认值，只读
const _rawData = computed(() => props.rawData || "error: get raw data error");
const _isMini = ref(props.isMini) // 缺失则设置默认值，可写

// 组件 - 节点画布
import NodeFlow from './NodeFlow.vue'
const RefChild = ref<{
  layoutGraph: (direction: string)=>void,
}>();

// 组件 - 工具栏
import DropdownButton from '../utils/dropdownButton.vue'

//   按钮 - 展示json数据
function fn_printJson() {
  console.log("debug json: ", props.jsonData)
}

//   按钮 - 自动调整顺序
function fn_autoPos(position: string) { RefChild.value?.layoutGraph(position) }

//   按钮 - 是否禁用滚动
const isAllowScroll = ref(true);
function fn_switchAllowScroll() {
  const exDiv1: HTMLElement|null = document.body // vuepress等使用
  const exDiv2: HTMLElement|null = document.querySelector('.markdown-source-view .cm-scroller') // obsidian使用
  if (isAllowScroll.value) {
    isAllowScroll.value = false
    if (exDiv1) exDiv1.classList.add("nf-style-overflow-hidden")
    if (exDiv2) exDiv2.classList.add("nf-style-overflow-hidden")
  } else {
    isAllowScroll.value = true
    if (exDiv1) exDiv1.classList.remove("nf-style-overflow-hidden")
    if (exDiv2) exDiv2.classList.remove("nf-style-overflow-hidden")
  }
}

//   按钮 - 全屏
const CanFullScreen = ref()
import { switchFullScreen } from "../utils/fullScreen"
function fn_fullScreen() {
  switchFullScreen(CanFullScreen.value, _isMini)
}

//   按钮 - 拷贝到黏贴版
function fn_copyRaw (isWithCodeBlock: boolean) {
  // const str = _rawData.value
  navigator.clipboard.writeText(_rawData.value).then(() => {
    console.log('info: 已复制文本');
  }, () => {
    console.error('error: 无法复制文本');
  });
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
.nf-toolbar>.nf-btn {
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
