<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

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
</script>

<template>
  <div id="app-main">
    <div class="left">
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
      <select>
        <option v-for="item in enum_data" :value="item">{{ item }}</option>
      </select>
    </div>
    <div class="right">
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
    </div>
  </div>
</template>

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
#app-main {
  height: 100%;
  .left {
    height: 100%;
    width: 300px;
    float: left;
    padding: 10px;
    box-sizing: border-box;
    >.item {
      width: 100%;
      line-height: 24px;
      margin: 0 0 4px 0;
    }
    >textarea.item {
      line-height: 18px;
      font-size: 14px;
      height: calc(100% - 90px);

      padding-top: 4px;
      padding-bottom: 4px;
      white-space: pre;
      overflow-x: auto;
      overflow-y: auto;
    }
  }
  .right {
    height: 100%;
    width: calc(100% - 300px);
    float: left;
  }

  input, textarea, pre {
    background: #222222;
    color: #c9c9c9;
    border: solid 1px #616161;
    border-radius: 10px;
    padding: 0 10px;
    width: 100%;
    box-sizing: border-box;
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
