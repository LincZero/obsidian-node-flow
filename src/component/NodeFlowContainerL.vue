<!-- 显示容器 -->

<template>
  <div class="nf-shell-view">
    <NodeFlow :jsonData="jsonData" />
  </div>
  <div class="nf-toolbar">
    <button class="nf-btn-newView" @click="props.fn_newView">newView</button>
    <button class="nf-btn-showJson" @click="fn_showJson">showJson</button>
    <button class="nf-btn-autoPos">autoPos</button>
    <button class="nf-btn-lock">lock</button>
  </div>
</template>

<script setup lang="ts">
import NodeFlow from './NodeFlow.vue'

import { ref } from 'vue'
const props = defineProps<{
  jsonData?: object,
  fn_newView?: () => Promise<void>;
}>()

function fn_showJson() {
  console.log("debug json: ", props.jsonData)
}
</script>

<style scoped>
.nf-shell-view {
  height: 100%;
}
</style>
