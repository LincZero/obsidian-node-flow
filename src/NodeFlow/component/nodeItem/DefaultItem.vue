<!-- 默认项 -->

<template>
  <div :class="'default-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div v-if="props.data.value" class="node-item-value">
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
.default-item {
  /* layout */
  box-sizing: border-box;
  min-height: 24px;
  height: auto;

  padding: 1px 0px;
}
.default-item.has-value {
  padding: 1px 12px;
  border-radius: 13px;
  border: solid 1px #616161;
  background-color: #222222;
}
</style>
