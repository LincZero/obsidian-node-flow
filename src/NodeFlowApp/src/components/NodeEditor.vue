<!-- 单独编辑某个节点 -->
<!-- TODO BUG 话说在非VueFlow作用域下，似乎没办法使用 useVueFlow (感觉是因为VueFlow inject的原因) -->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNodesData, useVueFlow } from '@vue-flow/core'

// 事件 - 选中值改动
const { getSelectedNodes, findNode } = useVueFlow()
const nodes2 = getSelectedNodes
let currentNode = ref<null|any>(null)
function refreshCurrentNode() {
  const nodes = getSelectedNodes
  console.log('selected变动', nodes, nodes2, nodes.value, nodes2.value, getSelectedNodes.value, findNode(selected.value[0]))
  if (nodes.value.length != 1) { currentNode.value=null; return }
  currentNode.value = {
    id: nodes.value[0].id,
    data: nodes.value[0].data
  }
}
import { useGlobalState } from '../../../NodeFlow/stores/stores.js'
const { selected } = useGlobalState()
watch(selected, ()=>{
  refreshCurrentNode()
},
{ deep: true }) // string数组，用deep watch比较合适

const props = defineProps<{
  nfData: any
}>();
</script>

<template>
  <div class="node-editor">
    <div><button @click="console.log(getSelectedNodes)">SelectedNodes</button></div>
    <ItemNode v-if="currentNode!=null" :id="currentNode.id" :data="currentNode.data"></ItemNode>
    <textarea spellcheck="false" class="item" v-model="nfData.rawContent"></textarea>
  </div>
</template>

<style lang="scss" scoped>
.node-editor {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  padding: 10px;
  >.item {
    width: 100%;
    line-height: 24px;
    margin: 0 0 4px 0;
  }
  >textarea.item {
    line-height: 18px;
    font-size: 14px;
    // height: calc(100% - 150px);
    flex: 1; // 占据剩余空间
    padding-top: 4px;
    padding-bottom: 4px;
    white-space: pre;
    overflow-x: auto;
    overflow-y: auto;
    resize: none;
  }

  input, textarea, pre, div {
    background: #222222;
    color: #c9c9c9;
    padding: 0 10px;
    width: 100%;
    box-sizing: border-box;
  }
  input, textarea, pre {
    border: solid 1px #616161;
    border-radius: 10px;
  }
}
</style>
