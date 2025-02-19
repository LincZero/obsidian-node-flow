<!--
流程控制项 - Eval
-->

<template>
  <div :class="'floweval-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
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
if (!props.data.value) props.data.value = "console.log('debug output')"; // [!code]

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNode, useNodeId, useNodesData, // TheNode
  useNodeConnections,               // Other。注意: useHandleConnections API弃用，用useNodeConnections替代
  useEdge, useVueFlow,
} from '@vue-flow/core'
const { updateNodeData, getConnectedEdges } = useVueFlow()
const _useNodeId: string = useNodeId()
const _useNode: object = useNode(useNodeId())
const _useNodesData: ComputedRef<any> = useNodesData(_useNodeId)
const _useTargetConnections: ComputedRef<any> = useNodeConnections({ handleType: 'source' })
const targetNodesId: string[] = Array.from(new Set(_useTargetConnections.value.map((connection:any) => connection.target)))
const _useTargetNodesData: ComputedRef<any> = useNodesData(targetNodesId)

// 流程控制 - 执行主要操作、触发下一节点
const debugConsole = async () => {
  // 该节点的操作
  // ... 其他操作 // [!code]
  try { // [!code]
    // eval(props.data.value) // 建议优先用 new Function 而非 eval
    const func = new Function(props.data.value);
    func();
    console.log(`debugConsole, nodeId:${_useNodeId} handleId:${props.data.id}`);
  } catch (error) {
    console.error(`debugConsole, nodeId:${_useNodeId} handleId:${props.data.id} error:`, error);
  }
  _useNodesData.value.data.runState = 'over'; updateNodeData(_useNodeId, _useNodesData.value.data);

  // 然后尝试运行下一个节点的debugConsole
  if (_useTargetNodesData.value.length > 0) {
    _useTargetNodesData.value[0].data.runState = 'running'; updateNodeData(_useTargetNodesData.value[0].id, _useTargetNodesData.value[0].data);
  } else {
    console.log(`debugConsole, end`);
  } 
};

// 流程控制 - 钩子 (注意修改和监听的都是父节点的数据，而不是本handle的数据)
_useNodesData.value.data['runState'] = 'none'
watch(_useNodesData, (newVal, oldVal) => { // watch: props.data.runState
  if (newVal.data.runState == 'running') {
    debugConsole();
  }
});

</script>

<style scoped>
.floweval-item {
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.floweval-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.floweval-item .node-item-value { /** 一般应该是没内容的，就是个圆点。24=(18)+6 */
  height: 8px;
  width: 8px;
  margin: 8px 0 8px 9px;

  border-radius: 12px;
  border: solid 1px currentColor;
  cursor: pointer;
}
</style>
