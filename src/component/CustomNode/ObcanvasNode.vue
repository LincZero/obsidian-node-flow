<!-- Obsidian专用的节点 -->

<template>
  <div class="obcanvas-node">
    {{ data.label }}
  </div>

  <Handle id="left" type="target" :position="Position.Left" />
  <Handle id="top" type="target" :position="Position.Top" />
  <Handle id="right" type="source" :position="Position.Right" />
  <Handle id="bottom" type="source" :position="Position.Bottom" />
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
})

</script>

<style scoped>
/** 注意，.vue-flow__node-obcanvas>.obcanvas-node 结构中，前者在该styles scoped作用域之外 */
.obcanvas-node {
  /* border:1px solid #777; */
  /* padding:10px; */
  /* border-radius:10px; */
  /* background:#f5f5f5; */
  display:flex;
  /* flex-direction:column; */
  /* justify-content:space-between; */
  align-items:center;
  /* gap:10px; */
  max-width:250px;

  flex-direction:row;
  flex-wrap:wrap;
  justify-content:center;
  /* max-width:90%; */
  margin:auto;
  gap:4px;

  /* ob */
  padding: 16px 24px;
  border: 1px solid currentColor;
  border-radius:8px;
}

.vue-flow__handle {
  background: none;
  border: none;
}
</style>
