<!-- Obsidian专用的节点 -->

<template>
  <div class="obcanvas-node" :type="data.type">
    <MarkdownItem v-show="data.type != 'group'" :data="newData"></MarkdownItem>
  </div>

  <Handle id="left" type="target" :position="Position.Left" />
  <Handle id="top" type="target" :position="Position.Top" />
  <Handle id="right" type="source" :position="Position.Right" />
  <Handle id="bottom" type="source" :position="Position.Bottom" />
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
// const props = defineProps({
//   id: {
//     type: String,
//     required: true,
//   },
//   data: {
//     type: Object,
//     required: true,
//   },
// })
const props = defineProps<{
  id: string,
  data: any
}>()
import { ref } from 'vue';
const newData = ref({
  name: "",
  value: props.data.label,
  refType: "value",
  valueType: "item-markdown",
})

import MarkdownItem from '../nodeItem/view/MarkdownItem.vue';
</script>

<style scoped>
/** 注意，.vue-flow__node-obcanvas>.obcanvas-node 结构中，前者在该styles scoped作用域之外 */
.obcanvas-node {
  width: 100%;
  height: 100%;

  /* border:1px solid #777; */
  /* padding:10px; */
  /* border-radius:10px; */
  /* background:#f5f5f5; */
  display:flex;
  /* flex-direction:column; */
  /* justify-content:space-between; */
  align-items:center;
  /* gap:10px; */
  /* max-width:250px; */

  flex-direction:row;
  flex-wrap:wrap;
  justify-content:center;
  /* max-width:90%; */
  margin:auto;
  gap:4px;

  /* ob */
  /* padding: 16px 24px; */
  border: 1px solid currentColor;
  border-radius:12px;
}

.obcanvas-node[type="group"] {
  /* background-color: rgba($color:#00a2db, $alpha:0.8); */
  background-color: #00a2db22;
}

.obcanvas-node .markdown-item {
  width: 100%;
  height: 100%;
}

.vue-flow__handle {
  background: none;
  border: none;
}
</style>
