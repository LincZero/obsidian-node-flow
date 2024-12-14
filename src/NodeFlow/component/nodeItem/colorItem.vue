<!-- 颜色项 -->

<template>
  <div :class="'default-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div v-if="props.data.value" class="node-item-value" :style="'background:'+props.data.value">
      {{ props.data.value }} 
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
</script>

<style scoped>
.node-item-value {
  border-radius: 8px;
  padding: 0 8px;
}
</style>
