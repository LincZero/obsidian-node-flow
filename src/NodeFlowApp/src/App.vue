<script lang="ts" setup>
import { ref, computed, watch, provide } from 'vue'

import { factoryFlowData } from '../../NodeFlow/utils/jsonTool/factoryFlowData'
import { testData_listitem2 } from '../../NodeFlow/utils/jsonTool/factoryFlowData_listitem'
import NodeFlowContainerS from '../../NodeFlow/component/container/NodeFlowContainerS.vue';

const jsonType = ref<string>("nodeflow-listitem")
const mdStr = ref<string>(testData_listitem2) // demo

const componentKey = ref(0)
const result = computed(() => {
  return factoryFlowData(jsonType.value, mdStr.value)
})
const ref_result = ref(result.value.data)
watch(result, (newResult) => {
  console.log("[debug] update")
  ref_result.value = newResult.data
  componentKey.value += 1
}, { immediate: true })

const enum_data = computed(() => {
  return {
    "nodeflow-listitem-demo1": "nodeflow-listitem-demo1",
    "nodeflow-listitem-demo2": "nodeflow-listitem-demo2",
  }
})

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
        <select class="item">
          <option v-for="item in enum_data" :value="item">{{ item }}</option>
        </select>
        <input class="item" v-model="jsonType"></input>
        <textarea spellcheck="false" class="item" v-model="mdStr"></textarea>
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
        :rawData="mdStr"
        :mdData="`\`\`\`${jsonType}\n${mdStr}\n\`\`\`\n`"
        :jsonType="jsonType"
        :jsonData="ref_result"
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
