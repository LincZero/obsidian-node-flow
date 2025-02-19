<!--
默认流程 (没有流程控制socket，用来模拟普通数据socket的流程行为)

不以 Flow 开头是因为流程控制项是比数据项要慢触发的，依靠flow前缀来识别是否是标准的带流程控制的项

而这个本质不是流程控制来的，是用来给没有流程控制项的节点一个默认行为的东西
-->

<template>
  <div :class="'fdefault-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
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
  useNodeId, useNodesData,          // TheNode
  useNodeConnections,               // Near。注意: useHandleConnections API弃用，用useNodeConnections替代
  useVueFlow,
} from '@vue-flow/core'
const { updateNodeData, findNode } = useVueFlow()
const _useNodeId: string = useNodeId()
const _useNodesData: ComputedRef<any> = useNodesData(_useNodeId)

const _useSourceConnections: ComputedRef<any> = useNodeConnections({ handleType: 'target' })
const sourceNodesId: string[] = Array.from(new Set(_useSourceConnections.value.map((connection:any) => connection.source)))
const _useSourceNodesData: ComputedRef<any> = useNodesData(sourceNodesId)

const _useTargetConnections: ComputedRef<any> = useNodeConnections({ handleType: 'source' })
const targetNodesId: string[] = Array.from(new Set(_useTargetConnections.value.map((connection:any) => connection.target)))
const _useTargetNodesData: ComputedRef<any> = useNodesData(targetNodesId)

// 流程控制 - 执行主要操作、触发下一节点
const debugConsole = async () => {
  // 该节点的操作
  // ... 其他操作 // [!code]

  // 获取上一个节点的值
  // TODO
  // 不过这里很烦，不能直接获取，要绕个大弯。有非常大的优化空间：
  // 一是item的寻找速度可以优化，用key-value
  for (const connection of _useSourceConnections.value) {
    const sourceNode = findNode(connection.source)
    const sourceItems = sourceNode.data.items
    let sourceValue = ""
    for (const item of sourceItems) {
      if (item.id == connection.sourceHandle) {
        console.log("ttt", item, item.value, item.id, item.valueType)
        sourceValue = item.value
        break
      }
    }

    const thisNode = findNode(_useNodeId)
    const thisItems = thisNode.data.items
    for (const item of thisItems) {
      if (item.id == connection.targetHandle) {
        item.value = sourceValue
        break
      }
    }
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
.fdefault-item {
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.fdefault-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.fdefault-item .node-item-value { /** 一般应该是没内容的，就是个圆点。24=(18)+6 */
  height: 8px;
  width: 8px;
  margin: 8px 0 8px 9px;

  line-height: calc(100% - 4px);
  border-radius: 12px;
  border: solid 1px currentColor;
  cursor: pointer;
}
</style>
