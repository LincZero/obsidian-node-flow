<!-- 当前画布的节点对应的json编辑器 -->

<script setup lang="ts">
import { NFNodes } from '../../../NodeFlow/component/utils/NFNodes'
const nfNodes: NFNodes|null = NFNodes.useGetNFNodes(); // 有可能没有画布

// 1.1 节点流数据 - 预设
import { testData_listitem, testData_listitem2, testData_listitemHttp } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_listitem'
import { testData_comfyUI, testData_comfyUI2 } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_comfyui'
import { testData_obcanvas } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_obcanvas'
import { testData_vueflow, testData_vueflow_withoutPos, testData_vueflow_customNode } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_vueflow'
import { testData_list } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_list'
import { testData_itemData } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_item'
import { nextTick } from 'vue';
const nfData_enum = [
  { 'name': 'listitem-nest', 'type': 'nodeflow-listitem', 'content': testData_listitem },
  { 'name': 'listitem-http-old', 'type': 'nodeflow-listitem', 'content': testData_listitem2 },
  { 'name': 'listitem-http-new', 'type': 'nodeflow-listitem', 'content': testData_listitemHttp },
  { 'name': 'comfyUI-1', 'type': 'nodeflow-comfyui', 'content': JSON.stringify(testData_comfyUI, null, 2) },
  { 'name': 'comfyUI-2', 'type': 'nodeflow-comfyui', 'content': JSON.stringify(testData_comfyUI2, null, 2) },
  { 'name': 'obcanvas', 'type': 'nodeflow-obcanvas', 'content': JSON.stringify(testData_obcanvas, null, 2) },
  { 'name': 'vueflow', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow, null, 2) },
  { 'name': 'vueflow-autoPos', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow_withoutPos, null, 2) },
  { 'name': 'vueflow-custom', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow_customNode, null, 2) },
  { 'name': 'list', 'type': 'nodeflow-list', 'content': testData_list },
  { 'name': 'item-moreType', 'type': 'nodeflow-item', 'content': JSON.stringify(testData_itemData, null, 2) },
]

function onSelect(event: any) {
  if (nfNodes == null) {
    console.error('find\'t nfNodes')
    return
  }
  
  const index = event.target.value

  // 更新节点集
  // 注意点: JsonEdtior更换模板时，两个不同的节点图可能存在同id节点位置不变，导致位置不为0，不触发自动布局。所以要先清空，并等下一帧
  nfNodes.jsonData.value = { nodes: [], edges: [] }
  nextTick(() => {
    nfNodes.jsonType.value = nfData_enum[index].type
    nfNodes.jsonStr.value = nfData_enum[index].content
  })
}

if (nfNodes == null) {
  console.error('find\'t nfNodes')
} else {
  // 1.2 节点流数据 - 类型
  nfNodes.jsonType.value = "nodeflow-listitem"

  // 1.3 节点流数据 - 内容
  nfNodes.jsonStr.value = testData_listitem2 // demo
}
</script>

<template>
  <div class="json-editor" v-if="nfNodes != null">
    <div class="item">预设：</div>
    <select class="item" @change="onSelect" value="1">
      <option v-for="(item, index) in nfData_enum" :value="index">{{ item.name }}</option>
    </select>
    <input class="item" v-model="nfNodes.jsonType.value"></input>
    <textarea spellcheck="false" class="item" v-model="nfNodes.jsonStr.value"></textarea>
    <!-- TODO: pre，shiki、prismjs、highlight.js -->
    <!-- <pre spellcheck="false" class="item">
      <code
        contenteditable="true"
        @input="(event)=>{mdStr = event.target.innerText;}"
        v-html="mdStr"
      ></code>
    </pre> -->
  </div>
</template>

<style lang="scss" scoped>
.json-editor {
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
