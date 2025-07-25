<!--
主画布的容器（画布外的一层）

作用：
1. 显示容器 (主要为了在局部模式和全局模式之间切换)
2. 提供按钮
3. 提供适配底层的方法接收 (如何渲染，如何保存更新序列化内容)
-->

<template>
  <div ref="CanFullScreen" :class="_isMini?'normal-size':'full-size'">
    <!-- 主画布 -->
    <!-- TODO 有空捋一下这里，全屏这块有些代码应该抽离复用 -->
    <div :class="_isMini?'nf-shell-mini':'nf-shell-view'">
      <NodeFlow ref="RefChild" :nfNodes="nfNodes" :jsonData="nfNodes.jsonData.value" :isMini="_isMini" :isShowControls="_isShowControls"/>
    </div>

    <!-- 工具栏 -->
    <div class="nf-toolbar">
      <button class="nf-btn" @click="fn_saveChange()" v-if="saveable">Save</button>
      <DropdownButton class="nf-btn" :label="'Full screen'" :fn="() => fn_fullScreen()" #default="{ selectItem }">
        <button class="nf-btn" @click="selectItem('Full screen', () => fn_fullScreen())">Full screen</button>
        <button class="nf-btn" @click="selectItem('New view', () => _fn_newView())">New view</button>
      </DropdownButton>
      <DropdownButton class="nf-btn" :label="'LR layout (center)'" :fn="() => fn_autoPos('LR', 'center')" #default="{ selectItem }">
        <button class="nf-btn" @click="selectItem('LR layout', () => fn_autoPos('LR'))">LR layout</button>
        <button class="nf-btn" @click="selectItem('TB layout', () => fn_autoPos('TB'))">TB layout</button>
        <button class="nf-btn" @click="selectItem('LR layout (center)', () => fn_autoPos('LR', 'center'))">LR layout (center)</button>
        <button class="nf-btn" @click="selectItem('LR layout (top)', () => fn_autoPos('LR', 'top'))">LR layout (top)</button>
      </DropdownButton>
      <button class="nf-btn" @click="fn_initView()" title="点击时自动缩放移动画布">Init view</button>
      <button class="nf-btn" @click="fn_initZoom()" ref="zoomButton"
        title="点击时缩放倍数设为一。悬浮并滚动时缩放 (方便单手不按住Ctrl操作)">Zoom area</button>
      <button class="nf-btn" @click="fn_switchAllowScroll()">Ex lock</button>
      <button class="nf-btn" @click="_isShowControls = !_isShowControls">Show Controls</button>
      <!-- TODO 修改成 "允许编辑和监听快捷键" 功能 -->
      <DropdownButton class="nf-btn" :label="'Copy md'" :fn="() => nfNodes.fn_copyData('mdData')" #default="{ selectItem }">
        <button class="nf-btn" @click="selectItem('Print json', () => nfNodes.fn_printData('jsonData'))">Print json</button>
        <button class="nf-btn" @click="selectItem('Print md', () => nfNodes.fn_printData('mdData'))">Print md</button>
        <button class="nf-btn" @click="selectItem('Print raw', () => nfNodes.fn_printData('rawData'))">Print raw</button>
        <button class="nf-btn" @click="selectItem('Copy json', () => nfNodes.fn_copyData('jsonData'))">Copy json</button>
        <button class="nf-btn" @click="selectItem('Copy md', () => nfNodes.fn_copyData('mdData'))">Copy md</button>
        <button class="nf-btn" @click="selectItem('Copy raw', () => nfNodes.fn_copyData('rawData'))">Copy raw</button>
      </DropdownButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// 自身属性、通用导入
import { NFNodes } from '../utils/NFNodes'
const props = withDefaults(defineProps<{
  nfNodes: NFNodes,
  isMini: boolean,
  fn_newView?: () => Promise<void>, // 在新视图中显示画布
  fn_save?: (str: string) => void,  // 保存
}>(), {
  fn_newView: async ()=>{},
  fn_save: ()=>{}
})
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
const _fn_newView = computed(() => props.fn_newView || fn_fullScreen); // 缺失则设置默认值，只读
const _isMini = ref(props.isMini) // 缺失则设置默认值，可写
const _isShowControls = ref(!props.isMini)

// 组件 - 节点画布。会往这里传递一个布局方法
import NodeFlow from './NodeFlow.vue'

// 组件 - 工具栏
import DropdownButton from '../utils/dropdownButton.vue'

// 按钮 - 自动调整顺序
function fn_autoPos(position: string, amend='none') { props.nfNodes.autoSet_layout(position, amend) }

// #region 按钮 - 是否禁用滚动
const isAllowScroll = ref(true);
function fn_switchAllowScroll() {
  const exDiv1: HTMLElement|null = document.body // vuepress等使用
  const exDiv2: HTMLElement|null = document.querySelector('.workspace-leaf.mod-active .markdown-source-view .cm-scroller') // obsidian使用
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
// #endregion

// #region 按钮 - 全屏
const CanFullScreen = ref()
import { switchFullScreen } from "./fullScreen"
function fn_fullScreen() {
  switchFullScreen(CanFullScreen.value, _isMini)
}
// #endregion

// #region 按钮 - 保存修改
import { serializeFlowData } from '../../utils/serializeTool/serializeFlowData'
const saveable = true; // [环境]仅obsidian等可写环境需要，vuepress这种非可写环境不需要
function fn_saveChange () {
  if (!props.hasOwnProperty("fn_save")) return
  const result = serializeFlowData(props.nfNodes.jsonType.value, props.nfNodes.jsonData.value)
  if (result.code == 0) {
    props.nfNodes.jsonStr.value = result.data
    props.fn_save(result.data)
  }
  else {
    console.error("无法保存修改", result)
  }
}
// #endregion

// #region 按钮 - InitView
function fn_initView() {
  fitView({
    offset: { x: 0, y: 0 }
  })
}
// #endregion

// #region 按钮 - ZommArea (单手缩放、重置大小)
const { zoomIn, zoomOut, zoomTo, setMinZoom, setMaxZoom, fitView } = useVueFlow()
const zoomButton = ref()
onMounted(() => {
  document.addEventListener('wheel', (event)=>{
    if (!zoomButton.value || !zoomButton.value.contains(event.target)) return
    event.preventDefault();
    setMaxZoom(3);
    setMinZoom(0.1);
    if (event.deltaY > 0) {
      zoomOut()
    } else {
      zoomIn()
    }
  }, { passive: false });
})
onUnmounted(() => {
  document.removeEventListener('wheel', ()=>{})
})
function fn_initZoom() {
  zoomTo(1)
}
// #endregion
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
  height: calc(100% - 26px);
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
