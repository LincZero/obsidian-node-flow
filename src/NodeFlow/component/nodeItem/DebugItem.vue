<!--
调试项

需要注意的是，由于NodeFlow V1.1后采用的项类型代替节点类型的策略。
如果计算和程序需要左右节点的属性时，可以不直接判断节点类型，而是采用鸭子方法

在debug中，用于表示节点结构的方式有几种：
  原json -> 归一化json(将不同结构的json规范为统一结构的json) -> NodesData结构
-->

<template>
  <div :class="'debug-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div v-if="props.data.value" class="node-item-value">
      <div><span>---TheNode-----</span></div>
      <div><span>useNodeId: {{ _useNodeId }}</span></div>
      <div><button @click="console.log(_useNode)">useNode</button></div>
      <div><button @click="console.log(ref_useNodesData)">useNodesData</button></div>
      <div><span>---TheHandle---</span></div>
      <div><button @click="console.log(data)">componentData</button></div>
      <div><button @click="console.log(ref_useNodesData.data.items)">listItem type use</button></div>
      <div><span>---TheOutter---</span></div>
      <div><button @click="console.log(_useEdge)">useEdge</button></div>
      <div><button @click="console.log(_useHandleConnections)">useHandleConnections</button></div>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>
  
<script setup lang="ts">
import { ComputedRef, computed } from 'vue';
const props = defineProps<{
  // parent: any, // 父节点
  data: any
}>();

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNode, useNodeId, useNodesData, useEdge,
  useHandleConnections,
  useVueFlow
} from '@vue-flow/core'
const _useNodeId: string = useNodeId()
const _useNode: object = useNode(useNodeId())
const ref_useNodesData: ComputedRef<any> = useNodesData(_useNodeId)
const _useEdge: object = useEdge()

// 非通用，根据节点数据格式而定
const _useHandleConnections: any = computed(()=>{ // watch useNodesData()
  const _useHandleConnections_tmp: any[] = []
  for (let item of ref_useNodesData.value.data.items) {
    let type: 'source'|'target'
    if (item['refType']=='o' || item['refType']=='output') { type = 'source' }
    else if (item['refType']=='i' || item['refType']=='input') { type = 'target' }
    else { continue } // 不连线的

    _useHandleConnections_tmp.push(useHandleConnections({
      nodeId: _useNodeId,
      id: item['id'],
      type: type
    }))
  }
  return _useHandleConnections_tmp
})

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
