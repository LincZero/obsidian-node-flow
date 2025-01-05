<!--
调试项

需要注意的是，由于NodeFlow V1.1后采用的项类型代替节点类型的策略。
如果计算和程序需要左右节点的属性时，可以不直接判断节点类型，而是采用鸭子方法
-->

<template>
  <div :class="'debug-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div v-if="props.data.value" class="node-item-value">
      <div><span>useNodeId: {{ _useNodeId }}</span></div>
      <div><button @click="console.log(_useNode)">useNode</button></div>
      <div><button @click="console.log(_useNodesData)">useNodesData</button></div>
      <div><button @click="console.log(_useEdge)">useEdge</button></div>
      <div><button @click="console.log(_useHandleConnections)">useHandleConnections</button></div>
      <div><button @click="console.log(_useNodesData.data.items)">listItem type use</button></div>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>
  
<script setup lang="ts">
const props = defineProps<{
  parent: any, // 父节点
  data: any
}>();

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNode, useNodeId, useNodesData, useEdge,
  useHandleConnections,
  useVueFlow
} from '@vue-flow/core'
const _useNodeId: string = useNodeId()
const _useNode = useNode(useNodeId())
const _useNodesData = useNodesData(_useNodeId).value
const _useEdge = useEdge()

// 非通用，根据节点数据格式而定
// TODO 这个有问题……button动态获取不了，静态可以。那途中连线状态变更要怎么办？
const _useHandleConnections: any[] = []
for (let item of _useNodesData.data.items) {
  let type: 'source'|'target'
  if (item['refType']=='o' || item['refType']=='output') { type = 'source' }
  else if (item['refType']=='i' || item['refType']=='input') { type = 'target' }
  else { continue } // 不连线的

  _useHandleConnections.push(useHandleConnections({
    nodeId: _useNodeId,
    id: item['id'],
    type: type
  }))
}
</script>

<style scoped>
.debug-item {
  /* layout (20+2+2)+4 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.debug-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.debug-item .node-item-value {
  /* height: 24px; */
  /* padding: 2px 14px; */
  line-height: calc(24px - 4px);
  border-radius: 12px;
  border: solid 1px currentColor;
}

.debug-item .node-item-value>* {
  padding: 2px 14px;

  box-sizing: border-box;
  height: 24px;
  line-height: calc(24px - 4px);
  margin: 0;
}
.debug-item .node-item-value>* * {
  box-sizing: border-box;
  height: calc(24px - 4px);
  line-height: calc(24px - 4px);
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
