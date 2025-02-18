<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  nfData: any
}>();

// 1.1 节点流数据 - 预设
import { testData_listitem, testData_listitem2 } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_listitem'
import { testData_obcanvas } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_obcanvas'
import { testData_vueflow, testData_vueflow_withoutPos, testData_vueflow_customNode } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_vueflow'
import { testData_list } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_list'
import { testData_itemData } from '../../../NodeFlow/utils/jsonTool/factoryFlowData_item'
const nfData_enum = [
  { 'name': 'nodeflow-listitem-demo1', 'type': 'nodeflow-listitem', 'content': testData_listitem },
  { 'name': 'nodeflow-listitem-demo2', 'type': 'nodeflow-listitem', 'content': testData_listitem2 },
  { 'name': 'nodeflow-obcanvas-demo', 'type': 'nodeflow-obcanvas', 'content': JSON.stringify(testData_obcanvas, null, 2) },
  { 'name': 'nodeflow-vueflow-demo1', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow, null, 2) },
  { 'name': 'nodeflow-vueflow-demo2', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow_withoutPos, null, 2) },
  { 'name': 'nodeflow-vueflow-demo3', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow_customNode, null, 2) },
  { 'name': 'nodeflow-list-demo', 'type': 'nodeflow-list', 'content': testData_list },
  { 'name': 'nodeflow-item-demo', 'type': 'nodeflow-item', 'content': JSON.stringify(testData_itemData, null, 2) },
]
function onSelect(event: any) {
  const index = event.target.value
  props.nfData.type = nfData_enum[index].type
  props.nfData.rawContent = nfData_enum[index].content
}

// 1.2 节点流数据 - 类型
props.nfData.type = ref<string>("nodeflow-listitem")

// 1.3 节点流数据 - 内容
props.nfData.rawContent = ref<string>(testData_listitem2) // demo
</script>

<template>
  <div class="json-editor">
    <div class="item">预设：</div>
    <select class="item" @change="onSelect" value="1">
      <option v-for="(item, index) in nfData_enum" :value="index">{{ item.name }}</option>
    </select>
    <input class="item" v-model="nfData.type"></input>
    <textarea spellcheck="false" class="item" v-model="nfData.rawContent"></textarea>
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
