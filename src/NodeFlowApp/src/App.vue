<script lang="ts" setup>
import { ref, provide, computed, watch } from 'vue'

import TabBar from './components/TabBar.vue';

import GoldenLayout from './components/goldenLayout/GoldenLayout.vue'
import { prefinedLayouts } from './components/goldenLayout/predefined-layouts'
const GLayoutRootRef = ref(null); // Golden-Layout
provide("LAYOUT", GLayoutRootRef);

import JsonEditor from './components/JsonEditor.vue';

const nfData = ref<any>({
  type: "",
  rawContent: ""
})

// 节点流数据 - 解析
import { factoryFlowData } from '../../NodeFlow/utils/jsonTool/factoryFlowData'
import NodeFlowContainerS from '../../NodeFlow/component/container/NodeFlowContainerS.vue';
const componentKey = ref(0) // 用于强制刷新
const nfData_resultContent_ = computed(() => {
  return factoryFlowData(nfData.value.type, nfData.value.rawContent)
})
const nfData_resultContent = ref(nfData_resultContent_.value.data)
watch(nfData_resultContent_, (newResult) => {
  console.log("[debug] json string changed, update view")
  nfData_resultContent.value = newResult.data
  componentKey.value += 1
}, { immediate: true })

// 节点流数据 - 保存
function fn_save (str: string): void {
  nfData.value.rawContent = str
}
</script>

<template>
  <TabBar class="main-nav"></TabBar>

  <golden-layout
    class="golden-layout main-golden"
    ref="GLayoutRootRef"
    :config="prefinedLayouts.miniRow"
  >
    <template #JsonEditor>
      <JsonEditor
        :nfData="nfData"
      ></JsonEditor>
    </template>
    
    <template #NodeFlow>
      <!-- 用key进行强制刷新 -->
      <NodeFlowContainerS
        :key="componentKey"
        :rawData="nfData.rawContent"
        :mdData="`\`\`\`${nfData.type}\n${nfData.rawContent}\n\`\`\`\n`"
        :jsonType="nfData.type"
        :jsonData="nfData_resultContent"
        :fn_newView="async ()=>{}"
        :fn_save="fn_save"
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
</style>
