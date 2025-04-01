<!-- 单独编辑某个节点 -->
<!-- TODO BUG 话说在非VueFlow作用域下，似乎没办法使用 useVueFlow (感觉是因为VueFlow inject的原因) -->

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ItemNode2 from '../../../NodeFlow/component/node/ItemNode2.vue'
import { serializeFlowData } from '../../../NodeFlow/utils/serializeTool/serializeFlowData'

// 全局存储部分
import { useGlobalState } from '../../../NodeFlow/stores/stores.js'
const { selected, selected2, _useVueFlow } = useGlobalState()
watch(selected, ()=>{
  refreshCurrentNode()
},
{ deep: true }) // string数组，用deep watch比较合适

// 事件 - 选中值改动
const currentNode = ref<null|any>(null)
const currentContent = ref<string>('(未选中，请在画布中选中节点)')
function refreshCurrentNode() {
  if (_useVueFlow.value == undefined) return
  const { getSelectedNodes, findNode } = _useVueFlow.value
  // if (nodes.length != 1) { currentNode.value=null; return }
  // currentNode.value = {
  //   id: nodes.value[0].id,
  //   data: nodes.value[0].data
  // }
  if (selected.value.length < 1) {
    currentNode.value = null
    currentContent.value = '(未选中，请在画布中选中节点)'
    return
  }
  currentNode.value = {
    id: findNode(selected.value[0]).id,
    data: findNode(selected.value[0]).data,
  }
  // TODO 这里的类型不一定是nodeflow-listitem
  const result = serializeFlowData('nodeflow-listitem', {nodes: [currentNode.value], edges: []})
  if (result.code == 0) {
    let list = result.data.split('\n')
    list = list.slice(1, -2).map(line => { return line.slice(2) }) // 有尾换行
    currentContent.value = list.join('\n')+'\n'
  }
  else currentContent.value = '[error] '+result.msg
}

</script>

<template>
  <div class="node-editor">
    <div v-if="currentNode!=null" style="margin: 0 0 12px; padding: 0;">
      <ItemNode2 :id="currentNode.id" :data="currentNode.data"></ItemNode2>
    </div>
    <textarea spellcheck="false" class="item" v-model="currentContent"></textarea>
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
