<!--
流程控制项
-->

<template>
  <div :class="'flow-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div style="height:0; clear: both;"></div>
  </div>
</template>
  
<script setup lang="ts">
const props = defineProps<{
  data: any,
}>();
if (!props.data.value) props.data.value = ''; // [!code]

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNodeId, useNodesData,          // TheNode
} from '@vue-flow/core'
const _useNodeId: string = useNodeId()

// 流程控制 - 操作 (如果是纯视觉，则无需这个部分)
import { NFNode } from '../../utils/NFNode';
const nfNode = NFNode.useGetNFNode()
if (nfNode) {
  // 特殊，暂时仅提供样式、不提供方法
  // TODO 这个文件应该要被删除，转而由IO类型完成
}
</script>

<style scoped>
.flow-item {
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.flow-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.flow-item .node-item-value { /** 一般应该是没内容的，就是个圆点。24=(18)+6 */
  height: 8px;
  width: 8px;
  margin: 8px 0 8px 9px;

  line-height: calc(100% - 4px);
  border-radius: 12px;
  cursor: pointer;
}
</style>
