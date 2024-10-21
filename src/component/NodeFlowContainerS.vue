<!-- 显示容器 -->

<template>
  <div class="nf-shell-mini">
    <NodeFlow ref="RefChild" :jsonData="jsonData" />
  </div>
  <div class="nf-toolbar">
    <button class="nf-btn-newView" @click="props.fn_newView">newView</button>
    <button class="nf-btn-showJson" @click="fn_showJson">showJson</button>
    <button class="nf-btn-autoPos" @click="fn_autoPos(Position.Left)">autoPosL</button>
    <button class="nf-btn-autoPos" @click="fn_autoPos(Position.Right)">autoPosR</button>
    <button class="nf-btn-autoPos" @click="fn_autoPos(Position.Top)">autoPosT</button>
    <button class="nf-btn-autoPos" @click="fn_autoPos(Position.Bottom)">autoPosB</button>
    <button class="nf-btn-lock">lock</button>
  </div>
</template>

<script setup lang="ts">
import NodeFlow from './NodeFlow.vue'
const RefChild = ref<{
  layoutGraph: (direction: Position)=>void
}>();

import { ref } from 'vue'
const props = defineProps<{
  jsonData?: object,
  fn_newView?: () => Promise<void>;
}>()

// 按钮，展示json数据
function fn_showJson() {
  console.log("debug json: ", props.jsonData)
}

// 按钮，自动调整顺序
import { Position } from '@vue-flow/core'
function fn_autoPos(position: Position) { RefChild.value.layoutGraph(position) }
</script>

<style scoped>
.nf-shell-mini {
  height: 400px;
  border: 1px solid currentColor;
  border-radius: 8px;
}
</style>
