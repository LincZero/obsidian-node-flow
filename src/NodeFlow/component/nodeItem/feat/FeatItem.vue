<!--
功能项

基本上是对所有节点数据进行特殊的筛选和处理
-->

<template>
  <div :class="'feat-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div class="node-item-value">
      <div><span>---All--------</span></div>
      <div><button @click="findStartNode">Get_StartNodes</button></div>
      <div><button @click="findRunList">Get_RunList</button></div>
      <div><button @click="startRunList">Start_RunList</button></div>
      <div><button @click="clearAllNodesState">Clear_State</button></div>
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
if (!props.data.value) props.data.value = '';

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
// 而 useVueFlow() 出来的函数通常则不需要。如findNode等
import { useVueFlow } from '@vue-flow/core'
const { updateNodeData, findNode, nodes, edges } = useVueFlow()

/// 功能 - 寻找起始节点
function findStartNode() {
  const startList: Set<string> = new Set() // 用Set来确保不会重复添加、允许删除不存在
  for (const node of nodes.value) {
    startList.add(node.id)
  }
  for (const edge of edges.value) {
    startList.delete(edge.target)
  }
  console.log("startList:", startList)
  return startList
}

/// 功能 - 寻找运行队列
/// 其实就是在 `findStartNode` 的基础上，把有 `流程节点项` 的节点顺序往后排序
function findRunList() {
  const oldList = findStartNode()
  const firstList = []
  const secondList = []

  // 分开两种节点
  for (const nodeId of oldList) {
    let isHasFlowItem = false
    for (const item of findNode(nodeId).data.items) {
      if ((item.valueType as string).startsWith('item-flow')) { isHasFlowItem = true; break }
    }
    if (isHasFlowItem) {
      secondList.push(nodeId)
    } else {
      firstList.push(nodeId)
    }
  }
  // 按优先级排序
  for (const nodeId of secondList) firstList.push(nodeId)

  return firstList
}

/// 功能 - 开始运行队列
/// 在 `findRunList` 的基础上，进行运行
async function startRunList() {
  const runList = findRunList()
  for (const node of nodes.value) { node.data.runState = 'none'; } // fn_clearAllNodesState
  for (const nodeId of runList) {
    const data = findNode(nodeId).data
    data.runState = 'running'; updateNodeData(nodeId, data);
    await new Promise(resolve => setTimeout(resolve, 500)); // delay
  }
}

/// 功能 - 清除所有节点的状态 (往往运行前需要这个)
function clearAllNodesState() {
  for (const node of nodes.value) { node.data.runState = 'none'; } // fn_clearAllNodesState
}
</script>

<style scoped>
.feat-item {
  /* layout (20+2+2)+4 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.feat-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.feat-item .node-item-value {
  /* height: 24px; */
  /* padding: 2px 14px; */
  line-height: calc(24px - 4px);
  border-radius: 12px;
  border: solid 1px currentColor;
}

.feat-item .node-item-value>* {
  padding: 2px 14px;

  box-sizing: border-box;
  height: 24px;
  line-height: calc(24px - 4px);
  margin: 0;
}
.feat-item .node-item-value>* * {
  box-sizing: border-box;
  height: calc(24px - 4px);
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
