<!-- 用于控制画布操控功能的开关 -->

<template>
  <Panel position="top-right">
    <div class="fold-title">
      <button @click="isFold2=!isFold2">Nodes Tool {{isFold2?"v":"^"}}</button>
    </div>
    <div v-show="!isFold2" class="fold-content">
      <div title="复制并黏贴当前选中节点">
        <button @click="copyAndPaste()">Copy&Paste</button>
      </div>
    </div>
    <div class="fold-title">
      <button @click="isFold1=!isFold1">Canvas Config {{isFold1?"v":"^"}}</button>
    </div>
    <div v-show="!isFold1" class="fold-content">
      <div>
        <label for="draggable" title="允许拖拽节点">
          Nodes draggable
          <input id="draggable" v-model="nodesDraggable" type="checkbox" class="vue-flow__draggable" />
        </label>
      </div>
      <div>
        <label for="connectable" title="允许连接节点">
          Nodes connectable
          <input id="connectable" v-model="nodesConnectable" type="checkbox"/>
        </label>
      </div>
      <div>
        <label for="selectable" title="允许选择元素">
          Elements selectable
          <input id="selectable" v-model="elementsSelectable" type="checkbox"/>
        </label>
      </div>
      <div>
        <label for="zoomonscroll" title="滚轮时,进行缩放">
          Zoom on scroll
          <input id="zoomonscroll" v-model="zoomOnScroll" type="checkbox"/>
        </label>
      </div>
      <div>
        <label for="zoomonpinch" title="Ctrl滚动时,进行缩放">
          Zoom on pinch
          <input id="zoomonpinch" v-model="zoomOnPinch" type="checkbox"/>
        </label>
      </div>
      <div>
        <label for="panonscroll" title="滚轮时,进行滚动">
          Pan on scroll
          <input id="panonscroll" v-model="panOnScroll" type="checkbox"/>
        </label>
      </div>
      <div>
        <label title="滚轮时,进行滚动的方向">
          Pan on scroll mode
          <select v-model="panOnScrollMode">
            <option value="free">Free</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
      </div>
      <div>
        <label for="zoomondbl" title="双击时进行放大">
          Zoom on double click
          <input id="zoomondbl" v-model="zoomOnDoubleClick" type="checkbox"/>
        </label>
      </div>
      <div>
        <label for="panemoveable" title="允许拖拽画布">
          Pane movable
          <input id="panemoveable" v-model="panOnDrag" type="checkbox"/>
        </label>
      </div>
      <div>
        <label for="capturezoompaneclick" title="在窗格上捕获?">
          Capture on pane click
          <input id="capturezoompaneclick" v-model="captureZoomClick" type="checkbox"/>
        </label>
      </div>
      <div>
        <label for="capturezoompanescroll" title="在窗格上捕获?">
          Capture on pane scroll
          <input id="capturezoompanescroll" v-model="captureZoomScroll" type="checkbox"/>
        </label>
      </div>
      <div>
        <label title="放大视图">
          <button :onclick="onZoomIn">Zoom in</button>
        </label>
      </div>
      <div>
        <label title="缩小视图">
          <button :onclick="onZoomOut">Zoom out</button>
        </label>
      </div>
    </div>
  </Panel>
</template>


<script setup lang="ts">
import { Panel, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
import { nfSetting } from '../../utils/main/setting'
let isFold1 = ref(true);
let isFold2 = ref(true);

const {
  // 开关配置类
  nodesDraggable,
  nodesConnectable,
  elementsSelectable,
  zoomOnScroll,
  zoomOnDoubleClick,
  zoomOnPinch,
  panOnScroll,
  panOnScrollMode,
  panOnDrag,
  // 监听类
  onConnect,
  onNodeDragStop,
  onPaneClick,
  onPaneScroll,
  onPaneContextMenu,
  onNodeDragStart,
  onMoveEnd,
  addEdges,
  // 功能类
  zoomIn,
  zoomOut,
  setMinZoom,
  setMaxZoom,
} = useVueFlow()

// 全局设置
const captureZoomClick = ref(false)
const captureZoomScroll = ref(false)
onConnect((params) => addEdges(params)) // nodesConnectable只是是否允许拖拽线出来，加这行后两个端点之间的线在鼠标松开后才能保持
// zoomOnScroll.value = true;

// 按钮

//   复制并黏贴
function copyAndPaste() {}

//   缩放
const onZoomIn = ()=>{ setMaxZoom(3); zoomIn(); };
const onZoomOut = ()=>{ setMinZoom(0.1); zoomOut(); };
onZoomIn(); onZoomOut(); // 应用缩放限制，set(Max/Min)Zoom后要zoom(In/Out)才能生效

// 一些钩子，都是打印
onNodeDragStart((e) => nfSetting.isDebug && console.log('Drag start', e))
onNodeDragStop((e) => nfSetting.isDebug && console.log('Drag stop', e))
onPaneClick((event) => nfSetting.isDebug && captureZoomClick.value && console.log('Pane click', event))
onPaneScroll((event) => nfSetting.isDebug && captureZoomScroll.value && console.log('Pane scroll', event))
onPaneContextMenu((event) => nfSetting.isDebug && captureZoomClick.value && console.log('Pane ctx menu', event))
onMoveEnd((flowTransform) => nfSetting.isDebug && console.log('Move end', flowTransform))
</script>

<style scoped>
.vue-flow__panel {
  display:flex;
  flex-direction:column;
  gap:2px;
  font-size:12px;
  font-weight:600;

  overflow-y: auto;
}

.vue-flow__panel .fold-title {
  width: 100%;
  height: 24px;
  margin: 2px 0;
}
.vue-flow__panel .fold-title button {
  width: 100%;
  height: 100%;
}

.vue-flow__panel .fold-content {
  background-color:#2d3748;
  padding:10px;
  border-radius:8px;
  box-shadow:0 0 10px #00000080;
  color:#fff;
  display:flex;
  flex-direction:column;
  gap:2px;
  font-size:12px;
  font-weight:600;
}

.vue-flow__panel .fold-content div,
.vue-flow__panel .fold-content button,
.vue-flow__panel .fold-content select,
.vue-flow__panel .fold-content label {
  height: 24px;
  width: 100%;
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
  line-height: 24px;
}
.vue-flow__panel .fold-content>div {
  margin-bottom: 2px;
}
.vue-flow__panel .fold-content>div>label {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:5px;
  cursor:pointer;
}
</style>
