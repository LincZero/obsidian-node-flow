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
import { ComputedRef, computed, ref, watch } from 'vue';
const props = defineProps<{
  data: any,
}>();
if (!props.data.value) props.data.value = "0"; // [!code]

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNodeId, useNodesData,          // TheNode
  useNodeConnections,               // Near。注意: useHandleConnections API弃用，用useNodeConnections替代
} from '@vue-flow/core'
const _useNodeId: string = useNodeId()
const _useNodesData: ComputedRef<any> = useNodesData(_useNodeId)

// 流程控制 - 操作
const _useSourceConnections: ComputedRef<any> = useNodeConnections({ handleType: 'target' })
const _useTargetConnections: ComputedRef<any> = useNodeConnections({ handleType: 'source' })
import { useFlowControl } from './useFlowControl'
const flowControl = useFlowControl(_useNodeId, _useSourceConnections, _useTargetConnections, async () => {
  await new Promise(resolve => setTimeout(resolve, props.data.value));
  console.log(`debugConsole, nodeId:${_useNodeId} handleId:${props.data.id} delay:${props.data.value}`);
  return true
})

// 流程控制 - 钩子 (注意修改和监听的都是父节点的数据，而不是本handle的数据)
_useNodesData.value.data['runState'] = 'none'
watch(_useNodesData, (newVal, oldVal) => { // watch: props.data.runState
  if (newVal.data.runState == 'running') {
    flowControl();
  }
});
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
  border: solid 1px currentColor;
  cursor: pointer;
}
</style>
