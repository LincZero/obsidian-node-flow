<!--
流程控制项 - http请求
-->

<template>
  <div :class="'flowreq-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div style="height:0; clear: both;"></div>
    <div class="node-item-value2">
      <NFTextArea :data="data"></NFTextArea>
      <div style="height:0; clear: both;"></div>
      <NFTextArea v-if="resp_str.length > 0" :data="{'value': resp_str}" codeType="json" style="margin-top: 4px"></NFTextArea>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
import NFTextArea from '../../utils/NFTextArea.vue'
import { ref } from 'vue';
const props = defineProps<{
  data: any,
}>();
if (!props.data.value) props.data.value = 'https://httpbin.org/get'; // [!code]

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNodeId, useNodesData,            // TheNode
} from '@vue-flow/core'
const _useNodeId: string = useNodeId()

// 流程控制 - 操作
import { nfSetting } from '../../../utils/main/setting'
let resp_str = ref('')
import { useFlowControl } from './useFlowControl'
const nfNode = useFlowControl(async () => {
  try {
    const resp = await nfSetting.fn_request(props.data.value, 'GET', undefined, undefined)
    
    console.log(`debugConsole, nodeId:${_useNodeId} handleId:${props.data.id} resp:\n`, resp);

    // 检查是否正常响应
    if (resp.status != 200) { // resp.ok // TODO，fetch版本应该用ok，ob版本有空再调试
      resp_str.value = "warning: ok/status:" + resp.status.toString()
      return false
    }

    // 检查返回值是否json，并解析
    if (typeof resp.json == 'object') {          // @env obsidian版本 (requestUrl)
      resp_str.value = JSON.stringify(resp.json, null, 2)
      return true
    } else if (typeof resp.json == 'function') { // @env 其他环境版本 (fetch)
      const resp_json = await resp.json();
      resp_str.value = JSON.stringify(resp_json, null, 2)
      return true
    } else {
      resp_str.value = 'warning: without json'
      return false
    }
  } catch (e) {
    console.error('error request:', e)
    resp_str.value = '[error]'
    return false
  }
})
</script>

<style scoped>
.flowreq-item {
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.flowreq-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.flowreq-item .node-item-value { /** 一般应该是没内容的，就是个圆点。24=(18)+6 */
  height: 8px;
  width: 8px;
  margin: 8px 0 8px 9px;

  border-radius: 12px;
  cursor: pointer;
}
</style>
