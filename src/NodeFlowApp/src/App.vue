<script lang="ts" setup>
import { ref, computed, watch, provide } from 'vue'

import { factoryFlowData } from '../../NodeFlow/utils/jsonTool/factoryFlowData'
import NodeFlowContainerS from '../../NodeFlow/component/container/NodeFlowContainerS.vue';

// 1.1 节点流数据 - 预设
import { testData_listitem, testData_listitem2 } from '../../NodeFlow/utils/jsonTool/factoryFlowData_listitem'
import { testData_obcanvas } from '../../NodeFlow/utils/jsonTool/factoryFlowData_obcanvas'
import { testData_vueflow, testData_vueflow_withoutPos, testData_vueflow_customNode } from '../../NodeFlow/utils/jsonTool/factoryFlowData_vueflow'
import { testData_list } from '../../NodeFlow/utils/jsonTool/factoryFlowData_list'
import { testData_itemData } from '../../NodeFlow/utils/jsonTool/factoryFlowData_item'
const nfData_enum = computed(() => {
  return [
    { 'name': 'nodeflow-listitem-demo1', 'type': 'nodeflow-listitem', 'content': testData_listitem },
    { 'name': 'nodeflow-listitem-demo2', 'type': 'nodeflow-listitem', 'content': testData_listitem2 },
    { 'name': 'nodeflow-obcanvas-demo', 'type': 'nodeflow-obcanvas', 'content': JSON.stringify(testData_obcanvas, null, 2) },
    { 'name': 'nodeflow-vueflow-demo1', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow, null, 2) },
    { 'name': 'nodeflow-vueflow-demo2', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow_withoutPos, null, 2) },
    { 'name': 'nodeflow-vueflow-demo3', 'type': 'nodeflow-vueflow', 'content':  JSON.stringify(testData_vueflow_customNode, null, 2) },
    { 'name': 'nodeflow-list-demo', 'type': 'nodeflow-list', 'content': testData_list },
    { 'name': 'nodeflow-item-demo', 'type': 'nodeflow-item', 'content': JSON.stringify(testData_itemData, null, 2) },
  ]
})
function onSelect(event: any) {
  const index = event.target.value
  nfData_type.value = nfData_enum.value[index].type
  nfData_rawContent.value = nfData_enum.value[index].content
}

// 1.2 节点流数据 - 类型
const nfData_type = ref<string>("nodeflow-listitem")

// 1.3 节点流数据 - 内容
const componentKey = ref(0) // 用于强制刷新
const nfData_rawContent = ref<string>(testData_listitem2) // demo
const nfData_resultContent_ = computed(() => {
  return factoryFlowData(nfData_type.value, nfData_rawContent.value)
})
const nfData_resultContent = ref(nfData_resultContent_.value.data)
watch(nfData_resultContent_, (newResult) => {
  console.log("[debug] update")
  nfData_resultContent.value = newResult.data
  componentKey.value += 1
}, { immediate: true })

import TabBar from './components/TabBar.vue';
import GoldenLayout from './components/goldenLayout/GoldenLayout.vue'
import { prefinedLayouts } from './components/goldenLayout/predefined-layouts'
const GLayoutRootRef = ref(null); // Golden-Layout
provide("LAYOUT", GLayoutRootRef);
</script>

<template>
  <TabBar class="main-nav"></TabBar>

  <golden-layout
    class="golden-layout main-golden"
    ref="GLayoutRootRef"
    :config="prefinedLayouts.miniRow"
  >
    <template #JsonEditor>
      <div class="json-editor">
        <div class="item">预设：</div>
        <select class="item" @change="onSelect" value="1">
          <option v-for="(item, index) in nfData_enum" :value="index">{{ item.name }}</option>
        </select>
        <input class="item" v-model="nfData_type"></input>
        <textarea spellcheck="false" class="item" v-model="nfData_rawContent"></textarea>
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
    
    <template #NodeFlow>
      <!-- 用key进行强制刷新 -->
      <NodeFlowContainerS
        :key="componentKey"
        :rawData="nfData_rawContent"
        :mdData="`\`\`\`${nfData_type}\n${nfData_rawContent}\n\`\`\`\n`"
        :jsonType="nfData_type"
        :jsonData="nfData_resultContent"
        :fn_newView="async ()=>{}"
        :fn_save="()=>{}"
        :isMini="false"
      ></NodeFlowContainerS>
    </template>
  </golden-layout>
</template>

<!--goldenlayout必须样式-->
<style src="golden-layout/dist/css/goldenlayout-base.css"></style>
<style src="golden-layout/dist/css/themes/goldenlayout-dark-theme.css"></style>

<style>
@import "../../NodeFlow/style/vue_custom.css";

html, body, #app {
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  background-color: #313131;
}
</style>

<style lang="scss" scoped>
.main-nav {
  height: 28px;
}
.main-golden {
  height: calc(100% - 28px);
  width: 100%;
}

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

<!-- <script setup>
import { ref } from 'vue'
const message = ref('Hello World!')
</script>
<template>
  <h1>{{ message }}</h1>
</template> -->
