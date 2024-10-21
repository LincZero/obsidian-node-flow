<!-- 主画布 -->

<template>
  <VueFlow class="nf-node-flow" :nodes="nodes" :edges="edges">
    <Background pattern-color="#404040" :gap="16" />
    <template #node-color-selector="props">
      <ColorSelectorNode :id="props.id" :data="props.data" />
    </template>
    <template #node-color-output>
      <ColorOutputNode />
    </template>
    <template #node-obcanvas="props">
      <ObcanvasNode :id="props.id" :data="props.data"/>
    </template>
    <InteractionControls v-if="!props.isMini"/>
  </VueFlow>
</template>

<script setup lang="ts">
// 自身属性、通用导入
const props = defineProps<{
  jsonData?: object,
  isMini: boolean, // true为局部渲染，尽可能简化；false为在更大的独立视图中渲染，可以显示更多东西
}>()
import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'

// 组件 - 自定义节点
import ColorSelectorNode from './CustomNode/ColorSelectorNode.vue'  // 颜色输入
import ColorOutputNode from './CustomNode/ColorOutputNode.vue'      // 颜色输出
import ObcanvasNode from './CustomNode/ObcanvasNode.vue'            // ob canvas 节点

// 组件 - 其他
import InteractionControls from './utils/InteractionControls.vue'   // 控制画布控制的操作开关
import { Background } from '@vue-flow/background'                   // 背景控制

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
if (props.isMini) {
  const {
    zoomOnScroll,
    zoomOnDoubleClick,
  } = useVueFlow();
  zoomOnScroll.value = false;
  zoomOnDoubleClick.value = false;
}

// 功能 - 自动顺序模块
import { nextTick } from 'vue'
import { useLayout } from './utils/useLayout'
/// 自动调整节点顺序
async function layoutGraph(direction: string) {
  const { layout } = useLayout()
  const { fitView } = useVueFlow()
  nodes.value = layout(nodes.value, edges.value, direction)
  nextTick(() => {
    fitView()
  })
}
if (nodes.value.length>1 && // 个别情况自动调用
  nodes.value[0].position.x == 0 && nodes.value[0].position.y == 0 &&
  nodes.value[1].position.x == 0 && nodes.value[1].position.y == 0
) {
  layoutGraph('LR')
}
defineExpose({
  layoutGraph
})

// 功能 - 模拟运行流程树
/*import { useRunProcess } from './useRunProcess'
const { run, stop, reset, isRunning } = useRunProcess({ graph })
async function ...() {
  await stop()
  reset(nodes.value)
}*/
</script>

<style>
@import '@vue-flow/core/dist/style.css';          /* 导入Vue Flow工作所需的样式 */
@import '@vue-flow/core/dist/theme-default.css';  /* 导入默认主题，这是可选的，但通常推荐 */

.nf-node-flow {
  min-height: 200px;
  height: 100%;
}
</style>
