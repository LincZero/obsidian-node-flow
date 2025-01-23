<!--
调试项

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
    <div v-if="props.data.value" class="node-item-value">
      <div><span>---TheNode-----</span></div>
      <div><span>useNodeId: {{ _useNodeId }}</span></div>
      <div><button @click="console.log(_useNode)">Node</button></div>
      <div><button @click="console.log(_useNodesData)">NodesData</button></div>
      <div><button @click="console.log(_useNodesData.data.items)">listItem type use</button></div>
      <div><span>---TheHandle---</span></div>
      <div><button @click="console.log(data)">componentData</button></div>
      <div><span>---TheOutter---</span></div>
      <div><button @click="console.log(_useSourceConnections)">SourceConnections</button></div>
      <div><button @click="console.log(_useTargetConnections)">TargetConnections</button></div>
      <div><button @click="console.log(_useSourceNodesData)">SourceNodesData</button></div>
      <div><button @click="console.log(_useTargetNodesData)">TargetNodesData</button></div>
      <div><span>---TheFlow-----</span></div>
      <div><button @click="debugConsole()">DebugConsole</button></div>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>
  
<script setup lang="ts">
import { ComputedRef, computed, ref, watch } from 'vue';
const props = defineProps<{
  // parent: any, // 父节点
  data: any,
}>();

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
const _useSourceConnections: ComputedRef<any> = useNodeConnections({ handleType: 'target' })
const _useTargetConnections: ComputedRef<any> = useNodeConnections({ handleType: 'source' })
// TODO 这里会重复的
const _useSourceNodesData: ComputedRef<any> = useNodesData(() => _useSourceConnections.value.map((connection:any) => connection.source))
const _useTargetNodesData: ComputedRef<any> = useNodesData(() => _useTargetConnections.value.map((connection:any) => connection.target))
const _useTargetNode: object = useNode(_useTargetConnections.value[0]?.target)

// 流程控制 - 执行主要操作、触发下一节点
const debugConsole = async () => {
  // 该节点的操作
  // ... 其他操作
  props.data.isRunning = false;

  // 然后尝试运行下一个节点的debugConsole
  if (_useTargetNodesData.value.length > 0) {
    _useTargetNodesData.value[0].data.isRunning = true;
    updateNodeData(_useTargetNodesData.value[0].id, _useTargetNodesData.value[0].data);
  } else {
    console.log(`debugConsole, end`);
  } 
};

// 流程控制 - 钩子 (注意修改和监听的都是父节点的数据，而不是本handle的数据)
props.data['isRunning'] = false
// let ref_isRunning = ref<boolean>(props.data['isRunning'])
watch(_useNodesData, (newVal, oldVal) => { // watch: props.data.isRunning
  if (newVal.data.isRunning == true) {
    debugConsole();
  }
});

/**
 * 非通用，根据节点数据格式而定
 * @deprecated 旧版，官方弃用useHandleConnections
 * 而且还有bug，watch useNodesData()得不对，没拿到正确数据，要修。不watch则行
 */
/*const _useHandleConnections: any = computed(()=>{
  const _useHandleConnections_tmp: any[] = []
  for (let item of ref_useNodesData.value.data.items) {
    let type: 'source'|'target'
    if (item['refType']=='o' || item['refType']=='output') { type = 'source' }
    else if (item['refType']=='i' || item['refType']=='input') { type = 'target' }
    else { continue } // 不连线的

    console.log('useHandleConnections', item['id'], type, useHandleConnections({
      nodeId: _useNodeId,
      id: item['id'],
      type: type
    }))
    _useHandleConnections_tmp.push(useHandleConnections({
      nodeId: _useNodeId,
      id: item['id'],
      type: type
    }))
  }
  return _useHandleConnections_tmp
})*/

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
