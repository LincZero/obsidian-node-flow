
<template>
  <div>
    <NodeFlowContainer v-if="result.code==0" :jsonData="jsonData" :jsonType="props.type" :isMini="true" :rawData="data"/>
  </div>
  <div v-if="result.code!=0">
    {{ result.msg }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  type?: string,
  data: string,
}>()

// json数据处理
import { factoryFlowData, failedFlowData } from "./NodeFlow/index"
let result = factoryFlowData(props.type, props.data.trim())
import { ref } from "vue";
let jsonData = ref({})
if (result.code != 0) {
  result = failedFlowData(result.msg)
}
jsonData.value = result.data

// 组件 - 节点流画布
import NodeFlowContainer from "./NodeFlow/component/container/NodeFlowContainerS.vue"
</script>

<style scoped lang="scss">
</style>
