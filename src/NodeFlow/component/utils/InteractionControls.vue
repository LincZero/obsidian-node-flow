<!-- 用于控制画布操控功能的开关 -->

<template>
  <Panel position="top-right">
    <div class="fold-title">
      <button id="zoomin" @click="isFold=!isFold">Fold</button>
    </div>
    <div v-show="!isFold" class="fold-content">
      <div>
        <label class="label" for="draggable">
          Nodes draggable
          <input id="draggable" v-model="nodesDraggable" type="checkbox" class="vue-flow__draggable" />
        </label>
      </div>
      <div>
        <label class="label" for="connectable">
          Nodes connectable
          <input id="connectable" v-model="nodesConnectable" type="checkbox" class="vue-flow__connectable" />
        </label>
      </div>
      <div>
        <label class="label" for="selectable">
          Elements selectable
          <input id="selectable" v-model="elementsSelectable" type="checkbox" class="vue-flow__selectable" />
        </label>
      </div>
      <div>
        <label class="label" for="zoomonscroll">
          Zoom on scroll
          <input id="zoomonscroll" v-model="zoomOnScroll" type="checkbox" class="vue-flow__zoomonscroll" />
        </label>
      </div>
      <div>
        <label class="label" for="zoomonpinch">
          Zoom on pinch
          <input id="zoomonpinch" v-model="zoomOnPinch" type="checkbox" class="vue-flow__zoomonpinch" />
        </label>
      </div>
      <div>
        <label class="label" for="panonscroll">
          Pan on scroll
          <input id="panonscroll" v-model="panOnScroll" type="checkbox" class="vue-flow__panonscroll" />
        </label>
      </div>
      <div>
        <label class="label">
          Pan on scroll mode
          <select id="panonscrollmode" v-model="panOnScrollMode" class="vue-flow__panonscrollmode">
            <option value="free">Free</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
      </div>
      <div>
        <label class="label" for="zoomondbl">
          Zoom on double click
          <input id="zoomondbl" v-model="zoomOnDoubleClick" type="checkbox" class="vue-flow__zoomondbl" />
        </label>
      </div>
      <div>
        <label class="label" for="panemoveable">
          Pane movable
          <input id="panemoveable" v-model="panOnDrag" type="checkbox" class="vue-flow__panemoveable" />
        </label>
      </div>
      <div>
        <label class="label" for="capturezoompaneclick">
          Capture on pane click
          <input id="capturezoompaneclick" v-model="captureZoomClick" type="checkbox" class="vue-flow__capturezoompaneclick" />
        </label>
      </div>
      <div>
        <label class="label" for="capturezoompanescroll">
          Capture on pane scroll
          <input id="capturezoompanescroll" v-model="captureZoomScroll" type="checkbox" class="vue-flow__capturezoompanescroll" />
        </label>
      </div>
      <div>
        <label class="label">
          Zoom in
          <button id="zoomin" :onclick="onZoomIn" class="vue-flow__capturezoompanescroll">+</button>
        </label>
      </div>
      <div>
        <label class="label">
          Zoom out
          <button id="zoomout" :onclick="onZoomOut" class="vue-flow__capturezoompanescroll">-</button>
        </label>
      </div>
    </div>
  </Panel>
</template>


<script setup lang="ts">
import { Panel, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
import { nfSetting } from '../../utils/main/setting'

const {
  nodesDraggable,
  nodesConnectable,
  elementsSelectable,
  zoomOnScroll,
  zoomOnDoubleClick,
  zoomOnPinch,
  panOnScroll,
  panOnScrollMode,
  panOnDrag,
  onConnect,
  onNodeDragStop,
  onPaneClick,
  onPaneScroll,
  onPaneContextMenu,
  onNodeDragStart,
  onMoveEnd,
  addEdges,
  zoomIn,
  zoomOut,
  setMinZoom,
  setMaxZoom,
} = useVueFlow()

// 全局设置
let isFold = ref(true);
const captureZoomClick = ref(false)
const captureZoomScroll = ref(false)
onConnect((params) => addEdges(params)) // nodesConnectable只是是否允许拖拽线出来，加这行后两个端点之间的线在鼠标松开后才能保持
const onZoomIn = ()=>{ setMaxZoom(3); zoomIn(); };
const onZoomOut = ()=>{ setMinZoom(0.1); zoomOut(); };
onZoomIn(); onZoomOut(); // 应用缩放限制，set(Max/Min)Zoom后要zoom(In/Out)才能生效

// 都是打印
onNodeDragStart((e) => nfSetting.isDebug && console.log('Drag start', e))
onNodeDragStop((e) => nfSetting.isDebug && console.log('Drag stop', e))
onPaneClick((event) => nfSetting.isDebug && captureZoomClick.value && console.log('Pane click', event))
onPaneScroll((event) => nfSetting.isDebug && captureZoomScroll.value && console.log('Pane scroll', event))
onPaneContextMenu((event) => nfSetting.isDebug && captureZoomClick.value && console.log('Pane ctx menu', event))
onMoveEnd((flowTransform) => nfSetting.isDebug && console.log('Move end', flowTransform))
</script>

<style scoped>
.vue-flow__panel {
    background-color:#2d3748;
    padding:10px;
    border-radius:8px;
    box-shadow:0 0 10px #00000080;
    color:#fff;
    display:flex;
    flex-direction:column;
    gap:2px;
    font-size:12px;
    font-weight:600
}

.vue-flow__panel .label {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:5px;
    cursor:pointer
}

.vue-flow__panel .fold-title {
  width: 100%;
  margin-bottom: 10px;
}
.vue-flow__panel .fold-title button {
  width: 100%;
}

.fold-content>div {
  height: 24px;
}
</style>
