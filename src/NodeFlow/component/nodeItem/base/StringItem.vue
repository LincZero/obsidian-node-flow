<!-- 字符串项/默认项

调试测试:
    - 多行md, :item-markdown, # 多行md1
多行md2
   - 多行str, :item-string, 多行str1
多行str2
   - 仅name,,
   - 仅value:,, 仅value
   - 都有,, 都有
-->

<template>
  <div ref="TextArea2"
    class="string-item  node-item-slot"
    :class="{...props.data.refType, 'has-value': props.data.value != '', 'mulline-value': props.data.value.includes('\n') }">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <NFTextArea class="node-item-value" :data="data" :isHideBorder="true"></NFTextArea>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
import NFTextArea from '../../utils/NFTextArea.vue'
import { computed } from 'vue';

const props = defineProps<{
  data: any
}>()
</script>

<style scoped>
/* string, md共用. 主要是根据value的不同有三种样式 */
.string-item {
  box-sizing: border-box;
  min-height: 24px;
  height: auto;

  padding: 2px 0px;
}
.string-item .node-item-name { line-height: calc(24px - 4px); }
.string-item .node-item-value { line-height: calc(24px - 4px); }
/* 1. 无value */
.string-item:not(.has-value) {
  background: none;
  border: 0;
}
 /* 2. 单行value */
.string-item.has-value:not(.mulline-value) {
  padding: 1px 0;
  background-color: #222222;
  border: solid 1px #616161;
  border-radius: 13px;
}
.string-item.has-value:not(.mulline-value) .node-item-name { padding: 0 12px; }
.string-item.has-value:not(.mulline-value) .node-item-value { margin-left: 4px; }
/* 3. 多行value */
.string-item.has-value.mulline-value {
  background: none;
}
.string-item.has-value.mulline-value .node-item-name {
  float: none !important;
}
.string-item.has-value.mulline-value .node-item-value {
  float: none !important;
  background-color: #222222;
  border: solid 1px #616161;
  border-radius: 13px;
}

/* --- */

/* 有i/o类型时 */
.string-item .node-item-value { /* default/input/i */
  text-align: right;
}
.string-item.output .node-item-value, .string-item.o .node-item-value {
  text-align: left;
}
</style>
