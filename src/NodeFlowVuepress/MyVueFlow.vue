
<template>
  <div>
    <NodeFlowContainerS
      v-if="result.code==0"
      :nfNodes="nfNodes"
      :isMini="true"
      :rawData="data"/>
  </div>
  <div v-if="result.code!=0">
    {{ result.msg }}
  </div>
</template>

<script setup lang="ts">
// 节点流数据
const props = defineProps<{
  type?: string,
  data: string,
}>()
import { NFNodes } from '../NodeFlow/component/utils/NFNodes';
const nfNodes = NFNodes.useFactoryNFNodes()
nfNodes.nfType.value = props.type??""
nfNodes.nfStr.value = props.data

// 组件 - 节点流画布
import NodeFlowContainerS from "../NodeFlow/component/container/NodeFlowContainerS.vue"
</script>

<style scoped lang="scss">
</style>
