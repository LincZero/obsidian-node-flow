<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Node, Edge } from '@vue-flow/core' 
import { VueFlow, Panel } from '@vue-flow/core'

const nodes = ref<Node[]>([
  // an input node, specified by using `type: 'input'`
  {
    id: '1',
    type: 'input',
    position: { x: 250, y: 5 },
    data: { label: 'Node 1' },
  },

  {
    id: '2',
    position: { x: 100, y: 100 },
    data: { label: 'Node 2' },
  },

  {
    id: '3',
    type: 'output',
    position: { x: 400, y: 200 },
    data: { label: 'Node 3' },
  },

  {
    id: '4',
    type: 'special', // <-- this is the custom node type name
    position: { x: 600, y: 100 },
    data: {
      label: 'Node 4',
      hello: 'world',
    },
  },
])

const edges = ref<Edge[]>([
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
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges">
  </VueFlow>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow {
  height: 400px;
  border: 1px solid currentColor;
  border-radius: 8px;
}
</style>
