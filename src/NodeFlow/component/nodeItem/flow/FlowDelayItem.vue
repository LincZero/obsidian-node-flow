<!--
流程控制项 - 延时
-->

<template>
  <div :class="'flowdelay-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div style="height:0; clear: both;"></div>
    <div class="node-item-value2">
      <NFTextArea :data="data"></NFTextArea>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>
  
<script setup lang="ts">
import NFTextArea from '../../utils/NFTextArea.vue'
const props = defineProps<{
  data: any,
}>();
if (!props.data.value) props.data.value = "0"; // [!code]

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNodeId, useNodesData,          // TheNode
} from '@vue-flow/core'
const _useNodeId: string = useNodeId()

// 流程控制 - 操作
import { inject } from 'vue';
import { type NFNode } from '../../utils/NFNode';
const nfNode:NFNode = inject('nfNode');
nfNode.fn = async () => {
  await new Promise(resolve => setTimeout(resolve, props.data.value));
  console.log(`debugConsole, nodeId:${_useNodeId} handleId:${props.data.id} delay:${props.data.value}`);
  return true
}
</script>

<style scoped>
.flowdelay-item { 
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.flowdelay-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.flowdelay-item .node-item-value { /** 一般应该是没内容的，就是个圆点。24=(18)+6 */
  height: 8px;
  width: 8px;
  margin: 8px 0 8px 9px;

  border-radius: 12px;
  cursor: pointer;
}
</style>
