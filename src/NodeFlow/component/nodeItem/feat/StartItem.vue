<!--
功能项 - 从该节点开始执行流程
-->

<template>
  <div :class="'flowstart-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div class="node-item-value"
      title="点击可以从此开启运行节点流程"
      @click="debugConsole_start()"
      :style="'background:' + (_useNodesData?.data?.isRunning?'green;':'red;')">
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>
  
<script setup lang="ts">
import { ComputedRef, computed, ref, watch } from 'vue';
const props = defineProps<{
  data: any,
}>();
if (!props.data.value) props.data.value = ''; // [!code]

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNodeId, useNodesData,
  useVueFlow,
} from '@vue-flow/core'
const { updateNodeData, getConnectedEdges, nodes } = useVueFlow()
const _useNodeId: string = useNodeId()
const _useNodesData: ComputedRef<any> = useNodesData(_useNodeId)

// 流程控制 - 最开始
const debugConsole_start = async () => {
  // 局部开始不需要清空状态，有可能想保留一部分缓存不重新计算
  // for (const node of nodes.value) { node.data.runState = 'none'; updateNodeData(node.id, node.data); } // fn_clearAllNodesState
  _useNodesData.value.data.runState = 'ready'; updateNodeData(_useNodeId, _useNodesData.value.data);
}
</script>

<style scoped>
.flowstart-item {
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.flowstart-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.flowstart-item .node-item-value { /** 一般应该是没内容的，就是个圆点。24=(18)+6 */
  height: 8px;
  width: 8px;
  margin: 8px 0 8px 9px;

  line-height: calc(100% - 4px);
  border-radius: 12px;
  cursor: pointer;
}
</style>
