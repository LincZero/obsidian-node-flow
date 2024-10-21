<!-- 主画布 -->

<template>
  <!-- <Background pattern-color="#404040" :gap="16" /> 似乎溢出-->
  <VueFlow class="nf-node-flow" :nodes="nodes" :edges="edges">
    <template #node-color-selector="props">
      <ColorSelectorNode :id="props.id" :data="props.data" />
    </template>
    <template #node-color-output>
      <ColorOutputNode />
    </template>
    <template #node-obcanvas="props">
      <ObcanvasNode :id="props.id" :data="props.data"/>
    </template>
    <InteractionControls />
  </VueFlow>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  jsonData?: object
}>()

// 组件 - VueFlow，并准备节点数据 (解析JSON数据，在外面已经校验过一次了，这里大概率不会有问题)
import { VueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core' 
let nodes = ref<Node[]>([]);
let edges = ref<Edge[]>([]);
{
  let defaultFlag:boolean = true;
  if (props.jsonData) {
    try {
      nodes = ref(props.jsonData.nodes);
      edges = ref(props.jsonData.edges);
      defaultFlag = false
    } catch (error) {
      console.error('Failed to parse json:', error, "rawJson:", JSON.stringify(props.jsonData));
    }
  }
}

// 自动顺序模块
import { nextTick } from 'vue'
import { useVueFlow, Position } from '@vue-flow/core'
import { useLayout } from './utils/useLayout'
if (nodes.value.length>1 &&
  nodes.value[0].position.x == 0 && nodes.value[0].position.y == 0 &&
  nodes.value[1].position.x == 0 && nodes.value[1].position.y == 0
) {
  const { layout } = useLayout()
  const { fitView } = useVueFlow()
  async function layoutGraph(direction: Position) {
    nodes.value = layout(nodes.value, edges.value, direction)
    nextTick(() => {
      fitView()
    })
  }
  layoutGraph(Position.Right)
}

// 模拟运行流程树
/*import { useRunProcess } from './useRunProcess'
const { run, stop, reset, isRunning } = useRunProcess({ graph })
async function ...() {
  await stop()
  reset(nodes.value)
}*/

// 组件 - 自定义节点
import ColorSelectorNode from './CustomNode/ColorSelectorNode.vue'  // 颜色输入
import ColorOutputNode from './CustomNode/ColorOutputNode.vue'      // 颜色输出
import ObcanvasNode from './CustomNode/ObcanvasNode.vue'            // ob canvas 节点

// 组件 - 其他
import InteractionControls from './utils/InteractionControls.vue'   // 控制画布控制的操作开关
import { Background } from '@vue-flow/background'                   // 背景控制
</script>

<style>
@import '@vue-flow/core/dist/style.css'; /* 导入Vue Flow工作所需的样式 */
@import '@vue-flow/core/dist/theme-default.css'; /* 导入默认主题，这是可选的，但通常推荐 */

.nf-node-flow {
  min-height: 100px;
  height: 100%;
}
</style>
