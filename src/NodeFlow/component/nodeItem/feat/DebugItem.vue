<!--
调试项

基本上数据都是直接数据

需要注意的是，由于NodeFlow V1.1后采用的项类型代替节点类型的策略。
如果计算和程序需要左右节点的属性时，可以不直接判断节点类型，而是采用鸭子方法

主要数据：
  在debug中，用于表示节点结构的方式有几种：
  1. 原json ->
  2. 归一化json(将不同结构的json规范为统一结构的json) ->
  3. useNodesData结构
  而他们的更新与序列化(同步)：
  1. useNodeData直接修改data对象(不能像官方示例那样用updateNodeData方法，因为更新位置通常在nodeitem中，item没有完整的node data) ->
  2. 然后转归一化json比较简单 ->
  3. 再转原json
-->

<template>
  <div :class="'debug-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div class="node-item-value">
      <div><span>---The Node-----</span></div>
      <div><span>useNodeId: {{ _useNodeId }}</span></div>
      <div><span>Size: ({{ nodeFound.dimensions.width }} x {{ nodeFound.dimensions.height }})</span></div>
      <div><span>Posi: ({{ nodeFound.position.x.toFixed(1) }}, {{ nodeFound.position.y.toFixed(1) }})</span></div>
      <div><button @click="console.log(toRaw(data.parent.self_data))">Props</button></div>
      <div><button @click="console.log(_useNode)">Node</button></div>
      <!-- Node Find 数据覆盖面上多于 NodesData -->
      <div><button @click="console.log(_useNodesData)">NodesData</button></div>
      <div><button @click="console.log(nodeFound)">Node Find</button></div>
      <div><button @click="console.log(nfNode)">NFNode</button></div>
      <div><button @click="console.log(nfNodes.findNode(_useNodeId))">NFNodesFind</button></div>
      <div><button @click="fn_compare()">Compare</button></div>
      <div><span>---The Handle---</span></div>
      <div><button @click="console.log(data)">componentData</button></div>
      <div><span>---Near Node----</span></div>
      <div><button @click="console.log(_useSourceNodesData)">SourceNodesData</button></div>
      <div><button @click="console.log(_useTargetNodesData)">TargetNodesData</button></div>
      <div><span>---Near Handle--</span></div>
      <div><button @click="console.log(_useSourceConnections)">SourceConnections</button></div>
      <div><button @click="console.log(_useTargetConnections)">TargetConnections</button></div>
      <div><span>---Near Edge----</span></div>
      <div><button @click="console.log(_getEdges)">GetEdges</button></div>
      <div><button @click="console.log(_useEdgesData1)">EdgesData1</button></div>
      <div><span>---All Node-----</span></div>
      <div><button @click="console.log(nodes)">Nodes</button></div> <!--无嵌套结构-->
      <div><button @click="console.log(nfNodes)">nfNodes</button></div> <!--无嵌套结构-->
      <div><button @click="console.log('使用PrintJson功能')">PropsNodes</button></div>
      <div><button @click="console.log(getSelectedNodes)">SelectedNodes</button></div>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>
  
<script setup lang="ts">
import { ComputedRef, computed, ref, toRaw, unref, watch } from 'vue';
const props = defineProps<{
  // parent: any, // 父节点
  data: any,
}>();
if (!props.data.value) props.data.value = '';

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
// 而 useVueFlow() 出来的函数通常则不需要。如findNode等
import {
  useNode, useNodeId, useNodesData, // TheNode
  useNodeConnections,               // Other。注意: useHandleConnections API弃用，用useNodeConnections替代
  useEdge, useEdgesData,
  useVueFlow,
  type GraphEdge,
} from '@vue-flow/core'
const { getConnectedEdges, findNode, nodes, getSelectedNodes } = useVueFlow()
const _useNodeId: string = useNodeId()
const nodeFound = findNode(_useNodeId)
const _useNode: any = useNode(_useNodeId)
const _useNodesData: ComputedRef<any> = useNodesData(_useNodeId)

const _useSourceConnections: ComputedRef<any> = useNodeConnections({ handleType: 'target' })
const sourceNodesId: string[] = Array.from(new Set(_useSourceConnections.value.map((connection:any) => connection.source)))
const _useSourceNodesData: ComputedRef<any> = useNodesData(sourceNodesId)

const _useTargetConnections: ComputedRef<any> = useNodeConnections({ handleType: 'source' })
const targetNodesId: string[] = Array.from(new Set(_useTargetConnections.value.map((connection:any) => connection.target)))
const _useTargetNodesData: ComputedRef<any> = useNodesData(targetNodesId)
// const _useTargetNode: object = useNode(_useTargetConnections.value[0]?.target)

const _getEdges: GraphEdge[] = getConnectedEdges(_useNodeId)
const _useEdgesData1: ComputedRef<any> = useEdgesData(_getEdges[0]?.id)

// 测试下来是，items都保证一致性，但node层不一定能保证……
function fn_compare() {
    console.log('debug comp object\n',
    toRaw(_useNode.node),                 // 1. 20 items       | items, label, runState, type
    toRaw(nodeFound),                     // 2. 20 items       | items, label, runState, type
    toRaw(unref(_useNodesData)),          // 3. id, type, data | items, label, runState, type
    toRaw(nfNodes.findNode(_useNodeId)),  // 4. 6 itmes, 假position | items, label, runState, type
    toRaw(props.data.parent),             // 5. self, self_data, children | items, name, id, parent, parentId, type
    '\n--- .\n',
    Object.is(toRaw(_useNode.node), toRaw(nodeFound)),                              // true
    Object.is(toRaw(_useNode.node), toRaw(nfNodes.findNode(_useNodeId))),           // false
    Object.is(toRaw(_useNode.node), toRaw(unref(_useNodesData))),                   // false
    Object.is(toRaw(_useNode.node), toRaw(props.data.parent)),                      // false
    '\n--- .data\n',
    Object.is(toRaw(_useNode.node.data), toRaw(nodeFound.data)),                    // true
    Object.is(toRaw(_useNode.node.data), toRaw(nfNodes.findNode(_useNodeId).data)), // true
    Object.is(toRaw(_useNode.node.data), toRaw(unref(_useNodesData).data)),         // true
    Object.is(toRaw(_useNode.node.data), toRaw(props.data.parent.self_data)),       // false
    '\n--- .data.items\n',
    Object.is(toRaw(_useNode.node.data.items), toRaw(props.data.parent.self_data.items)), // true
  )
}

// 依赖注入的东西
import { NFNode } from '../../utils/NFNode';
const nfNode = NFNode.useGetNFNode();
import { NFNodes } from '../../utils/NFNodes';
const nfNodes = NFNodes.useGetNFNodes();
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
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
