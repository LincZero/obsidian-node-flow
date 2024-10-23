<!-- ComfyUI专用的节点 -->

<template>
  <div class="comfyui-node comfyui-group">
    <div class="comfyui-node-title">
      <span style="display: inline-block; height: 10px; width: 10px; border-radius: 5px; background-color: #666666;"></span>
      <span style="display: inline-block; margin-left: 10px;">{{ data.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, useVueFlow } from '@vue-flow/core'
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
.comfyui-group {
  z-index: -2;
}

/* 下面的同ComfyUINode的样式 */
.comfyui-node {
  height: 100%;
  width: 100%;
  border-radius:8px;
}

.comfyui-node .comfyui-node-title {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  padding: 0 12px;

  border-radius: 8px 8px 0 0;
  color: #999999;
  background-color: #2e4656;
}
</style>
