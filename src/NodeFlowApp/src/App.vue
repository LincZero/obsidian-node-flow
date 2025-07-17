<script lang="ts" setup>
import { ref, provide, computed, watch } from 'vue'

import TabBar from './components/TabBar.vue';
import NodeFlowContainerS from '../../NodeFlow/component/container/NodeFlowContainerS.vue';

import GoldenLayout from './components/goldenLayout/GoldenLayout.vue'
import { prefinedLayouts } from './components/goldenLayout/predefined-layouts'
const GLayoutRootRef = ref(null); // Golden-Layout
provide("LAYOUT", GLayoutRootRef);

import JsonEditor from './components/JsonEditor.vue';
import NodeEditor from './components/NodeEditor.vue';
import AutoEditor from './components/AutoEditor.vue';
import BackendConnector from './components/BackendConnector.vue';
import NodeList from './components/NodeList.vue';

// 节点流数据 (必须，自动provide)
import { NFNodes } from '../../NodeFlow/component/utils/NFNodes';
const nfNodes = NFNodes.useFactoryNFNodes()

// 节点流数据 - 保存
function fn_save (str: string): void {
  nfNodes.jsonStr.value = str
}
</script>

<template>
  <notifications position="bottom right" :speed="350" />

  <TabBar class="main-nav"></TabBar>

  <golden-layout
    class="golden-layout main-golden"
    ref="GLayoutRootRef"
    :config="prefinedLayouts.miniRow"
  > 
    <template #NodeFlow>
      <!-- 用key进行强制刷新 -->
      <NodeFlowContainerS
        :nfNodes="nfNodes"
        :fn_newView="async ()=>{}"
        :fn_save="fn_save"
        :isMini="false"
      ></NodeFlowContainerS>
    </template>

    <template #JsonEditor>
      <JsonEditor></JsonEditor>
    </template>

    <template #NodeEditor>
      <NodeEditor></NodeEditor>
    </template>

    <template #AutoEditor>
      <AutoEditor></AutoEditor>
    </template>

    <template #BackendConnector>
      <BackendConnector></BackendConnector>
    </template>

    <template #NodeList>
      <NodeList></NodeList>
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
  color: #c9c9c9;
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
