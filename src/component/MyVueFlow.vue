<template>
  <!-- <Background pattern-color="#404040" :gap="16" /> 似乎溢出-->
  <VueFlow class="nf-node-flow" :nodes="nodes" :edges="edges">
  </VueFlow>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core' 
import { VueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'


const props = defineProps<{
  jsonData?: string
}>()

// 解析JSON数据 (按理说在外面已经校验过一次了，这里大概率不会有问题)
let nodes = ref<Node[]>([]);
let edges = ref<Edge[]>([]);
{
  let defaultFlag:boolean = true;
  if (props.jsonData) {
    try {
      const parsedData = JSON.parse(props.jsonData);
      nodes = ref(parsedData.nodes);
      edges = ref(parsedData.edges);
      defaultFlag = false
    } catch (error) {
      console.error('Failed to parse json:', error, "rawJson:", props, props.jsonData);
    }
  }
  // 前面失败就换默认的
  if (defaultFlag) {
    nodes = ref<Node[]>([
      {
        id: '1',
        type: 'input',
        position: { x: 250, y: 5 },
        data: { label: 'Node Default1' },
      },
      {
        id: '2',
        position: { x: 100, y: 100 },
        data: { label: 'Node Default2' },
      },
      {
        id: '3',
        type: 'output',
        position: { x: 400, y: 200 },
        data: { label: 'Node Default3' },
      },
      {
        id: '4',
        type: 'special',
        position: { x: 600, y: 100 },
        data: {
          label: 'Node Default4',
          hello: 'world',
        },
      },
    ])
    edges = ref<Edge[]>([
      {
        id: 'e1->2',
        source: '1',
        target: '2',
      },
      {
        id: 'e2->3',
        source: '2',
        target: '3',
        animated: true,
      },
      {
        id: 'e3->4',
        type: 'special',
        source: '3',
        target: '4',
        data: {
          hello: 'world',
        }
      },
    ])
  }
}

// 自动顺序模块
import { nextTick } from 'vue'
import { useVueFlow, Position } from '@vue-flow/core'
import { useLayout } from './useLayout'
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
</script>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

.nf-node-flow {
  min-height: 100px;
  height: 100%;
}
</style>
