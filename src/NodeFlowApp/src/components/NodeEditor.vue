<!-- 单独编辑某个节点 -->
<!-- TODO BUG 话说在非VueFlow作用域下，似乎没办法使用 useVueFlow (感觉是因为VueFlow inject的原因) -->

<!-- TODO 信息源改用nfNode代替，脱离对vueflow底层依赖 -->
<!-- TODO 根据是否有选中对象，来看显示局部json还是全局json -->
<template>
  <div class="node-editor">
    <div v-if="nfNode_current != null" style="margin: 0 0 12px; padding: 0;">
      <ItemNode2 :id="nfNode_current.nodeId" :data="nfNode_current.jsonData"></ItemNode2>
    </div>
    <textarea v-if="nfNode_current" spellcheck="false" class="item" v-model="nfNode_current.jsonStr"></textarea>
    <textarea v-else class="item" disabled>(未选中，请在画布中选中节点)</textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import ItemNode2 from '../../../NodeFlow/component/node/ItemNode2.vue'
import { serializeFlowData } from '../../../NodeFlow/utils/serializeTool/serializeFlowData'

// 全局存储部分
import { useGlobalState } from '../../../NodeFlow/stores/stores'
const { selected, selected2 } = useGlobalState()

import { NFNodes } from '../../../NodeFlow/component/utils/NFNodes'
const nfNodes = NFNodes.useGetNFNodes();
import { NFNode } from '../../../NodeFlow/component/utils/NFNode'
let nfNode_current = ref<NFNode|null>(null)

// #region 自动更新 - selected change -> data
// on selected change
watch(selected, ()=>{
  update_nfNode()
},
{ deep: true }) // string数组，用deep watch比较合适

update_nfNode()

function update_nfNode() {
  if (!nfNodes._useVueFlow) return
  // console.log('selected改动---------', selected.value.length,
  //   " - ", selected2.value.value.length,
  //   " - ", getSelectedNodes.length)
  if (selected.value.length < 1) {
    nfNode_current.value = null
  } else {
    nfNode_current.value = NFNode.getNFNode(selected.value[0], nfNodes);
  }
}
// #endregion
</script>

<style lang="scss" scoped>
.node-editor {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  padding: 10px;
  >.item {
    width: 100%;
    line-height: 24px;
    margin: 0 0 4px 0;
  }
  >textarea.item {
    min-height: 500px;
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
