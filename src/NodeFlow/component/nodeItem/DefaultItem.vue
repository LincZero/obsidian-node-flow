<!-- 默认项 -->

<template>
  <div :class="'default-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <textarea v-if="props.data.value" class="node-item-value" :value="props.data.value" :rows="props.data.value.split('\n').length"></textarea>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
import { onMounted, ref } from 'vue';
</script>

<style scoped>
.default-item {
  /* layout */
  box-sizing: border-box;
  min-height: 24px;
  height: auto;

  padding: 2px 0px;
}
.default-item.has-value {
  padding: 1px 12px;
  border: solid 1px #616161;
  border-radius: 13px;
  background-color: #222222;
}
.node-item-name {
  /* height: calc(24px - 4px); 可以被撑高*/
  line-height: calc(24px - 4px);
}
.node-item-value {
  /* height: calc(24px - 4px); 可以被撑高*/
  line-height: calc(24px - 4px);
  
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  margin-left: 4px;
}
.default-item .node-item-value { text-align: right; margin-left: 2px;} /* default/input/i */
.default-item.output .node-item-value { text-align: left; margin-right: 2px; }
.default-item.o .node-item-value { text-align: left; margin-right: 2px; }

textarea {
  overflow: hidden;
  overflow-y: auto;
  resize: none; /* 禁止用户手动调整大小 */
}
</style>
