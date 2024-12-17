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
      <button class="nf-btn" @click="fn_fullScreen()">Full screen</button>
      <button class="nf-btn" @click="_fn_newView()">New view</button>
      <DropdownButton class="nf-btn" :label="'LR layout'" :fn="() => fn_autoPos('LR')" #default="{ selectItem }">
        <button class="nf-btn" @click="selectItem('LR layout', () => fn_autoPos('LR'))">LR layout</button>
        <button class="nf-btn" @click="selectItem('TB layout', () => fn_autoPos('TB'))">TB layout</button>
      </DropdownButton>
      <DropdownButton class="nf-btn" :label="'Copy md'" :fn="() => fn_copyData('mdData')" #default="{ selectItem }">
        <button class="nf-btn" @click="selectItem('Print json', () => fn_printData('jsonData'))">Print json</button>
        <button class="nf-btn" @click="selectItem('Print md', () => fn_printData('mdData'))">Print md</button>
        <button class="nf-btn" @click="selectItem('Print raw', () => fn_printData('rawData'))">Print raw</button>
        <button class="nf-btn" @click="selectItem('Copy json', () => fn_copyData('jsonData'))">Copy json</button>
        <button class="nf-btn" @click="selectItem('Copy md', () => fn_copyData('mdData'))">Copy md</button>
        <button class="nf-btn" @click="selectItem('Copy raw', () => fn_copyData('rawData'))">Copy raw</button>
      </DropdownButton>
      <button class="nf-btn" @click="fn_switchAllowScroll()">Ex lock</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 自身属性、通用导入
const props = defineProps<{
  rawData?: string, // 仅打印用
  mdData?: string,  // 仅打印用
  jsonData: any,
  isMini: boolean,
  fn_newView?: () => Promise<void>,
}>()
import { computed, ref } from 'vue'
const _fn_newView = computed(() => props.fn_newView || fn_fullScreen); // 缺失则设置默认值，只读
const _isMini = ref(props.isMini) // 缺失则设置默认值，可写

// 组件 - 节点画布
import NodeFlow from './NodeFlow.vue'
const RefChild = ref<{
  layoutGraph: (direction: string)=>void,
}>();

// 组件 - 工具栏
import DropdownButton from '../utils/dropdownButton.vue'

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
import { switchFullScreen } from "./fullScreen"
function fn_fullScreen() {
  switchFullScreen(CanFullScreen.value, _isMini)
}

//   按钮 - 展示json数据
function fn_printData(type:"mdData"|"rawData"|"jsonData") {
  let data: any
  if (type == "mdData") data = "\n" + props.mdData
  else if (type == "rawData") data = "\n" + props.rawData
  else data = props.jsonData
  console.log("Debug json:", data)
}

//   按钮 - 拷贝到黏贴版
function fn_copyData (type:"mdData"|"rawData"|"jsonData") {
  let data: string
  if (type == "mdData") data = props.mdData
  else if (type == "rawData") data = props.rawData
  else { const _rawData = computed(() => props.rawData || "error: get raw data error"); data = _rawData.value }

  navigator.clipboard.writeText(data).then(() => {
    console.log('Info: copy success');
  }, () => {
    console.error('Error: copy fail');
  });
}
</script>

<style scoped>
.full-size {
  height: 100%;
}
.normal-size {
  /* margin-bottom: 22px; ob不需要，似乎vuepress需要 */
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
  height: 26px;
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
