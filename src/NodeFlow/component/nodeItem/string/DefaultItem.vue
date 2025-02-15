<!-- 默认项 -->

<template>
  <div ref="TextArea2" :class="'default-item  node-item-slot ' + props.data.refType + (writable_value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <NFTextArea :data="data" :isHideBorder="true"></NFTextArea>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
import NFTextArea from '../../utils/NFTextArea.vue'
import { computed } from 'vue';

const props = defineProps<{
  data: any
}>()

// 可写属性
const writable_value = computed({
  get: () => props.data.value,
  set: (value) => { props.data.value = value }, // 不触发数据驱动则无需 return updateNodeData(props.id, props.data)
})
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
  padding: 1px 0;
  border: solid 1px #616161;
  border-radius: 13px;
  background-color: #222222;
}
.default-item.has-value .node-item-name { padding: 0 12px; }
.default-item.has-value .node-item-value { padding: 0 12px; }

.node-item-name {
  /* height: calc(24px - 4px); 可以被撑高*/
  line-height: calc(24px - 4px);
}
.node-item-value {
  /* height: calc(24px - 4px); 可以被撑高*/
  line-height: calc(24px - 4px);
  margin: 0;
  margin-left: 4px;
}
textarea.node-item-value {
  /* overflow: auto; */
  overflow: hidden;
  white-space: pre;
  resize: none; /* 禁止用户手动调整大小 */
  border-radius: 12px;
  line-height: 20px;
}

/* 有i/o类型时 */
.default-item .node-item-value { /* default/input/i */
  text-align: right;
  margin-left: 8px;
  margin-right: 0;
}
.default-item.output .node-item-value, .default-item.o .node-item-value {
  text-align: left;
  margin-left: 0;
  margin-right: 8px;
}
</style>
