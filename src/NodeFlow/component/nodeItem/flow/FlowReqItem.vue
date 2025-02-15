<!--
流程控制项 - http请求
-->

<template>
  <div :class="'flowreq-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div class="node-item-value"
      title="点击可以从此开启运行节点流程"
      @click="debugConsole_start()"
      :style="'background:' + (_useNodesData.data.isRunning?'green;':'red;')">
    </div>
    <div style="height:0; clear: both;"></div>
    <div class="node-item-value2">
      <NFTextArea :data="data"></NFTextArea>
      <div style="height:0; clear: both;"></div>
      <NFTextArea v-if="resp_str.length > 0" :data="{'value': resp_str}"></NFTextArea>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
import NFTextArea from '../../utils/NFTextArea.vue'
import { ComputedRef, computed, ref, watch } from 'vue';
const props = defineProps<{
  data: any,
}>();
if (!props.data.value) props.data.value = 'https://httpbin.org/get'; // [!code]

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNode, useNodeId, useNodesData, // TheNode
  useNodeConnections,               // Other。注意: useHandleConnections API弃用，用useNodeConnections替代
  useEdge, useVueFlow,
} from '@vue-flow/core'
const { updateNodeData, getConnectedEdges } = useVueFlow()
const _useNodeId: string = useNodeId()
const _useNode: object = useNode(useNodeId())
const _useNodesData: ComputedRef<any> = useNodesData(_useNodeId)
const _useTargetConnections: ComputedRef<any> = useNodeConnections({ handleType: 'source' })
// TODO 这里会重复的
const _useTargetNodesData: ComputedRef<any> = useNodesData(() => _useTargetConnections.value.map((connection:any) => connection.target))

// 流程控制 - 最开始
const debugConsole_start = async () => {
  _useNodesData.value.data.isRunning = true; updateNodeData(_useNodeId, _useNodesData.value.data);
}

import { request } from '../../../utils/main/setting'
let resp_str = ref('')
// 流程控制 - 执行主要操作、触发下一节点
const debugConsole = async () => {
  // 该节点的操作
  // ... 其他操作 // [!code]
  try {
    const resp = await request(props.data.value, 'GET', undefined, undefined)
    
    console.log(`debugConsole, nodeId:${_useNodeId} handleId:${props.data.id} resp:\n`, resp);

    // 检查是否正常响应
    if (resp.status != 200) { // resp.ok // TODO，fetch版本应该用ok，ob版本有空再调试
      resp_str.value = "warning: ok/status:" + resp.status.toString()
      _useNodesData.value.data.isRunning = false; updateNodeData(_useNodeId, _useNodesData.value.data);
      return false
    }

    // 检查返回值是否json，并解析
    if (typeof resp.json == 'object') {          // @env obsidian版本 (requestUrl)
      resp_str.value = JSON.stringify(resp.json, null, 2)
      _useNodesData.value.data.isRunning = false; updateNodeData(_useNodeId, _useNodesData.value.data);
    } else if (typeof resp.json == 'function') { // @env 其他环境版本 (fetch)
      const resp_json = await resp.json();
      resp_str.value = JSON.stringify(resp_json, null, 2)
      _useNodesData.value.data.isRunning = false; updateNodeData(_useNodeId, _useNodesData.value.data);
    } else {
      resp_str.value = 'warning: without json'
      _useNodesData.value.data.isRunning = false; updateNodeData(_useNodeId, _useNodesData.value.data);
      return false
    }
  } catch (e) {
    console.error('error request:', e)
    resp_str.value = '[error]'
    _useNodesData.value.data.isRunning = false; updateNodeData(_useNodeId, _useNodesData.value.data);
    return false
  }
  
  // 然后尝试运行下一个节点的debugConsole
  if (_useTargetNodesData.value.length > 0) {
    _useTargetNodesData.value[0].data.isRunning = true; updateNodeData(_useTargetNodesData.value[0].id, _useTargetNodesData.value[0].data);
  } else {
    console.log('debugConsole, end');
  } 
};

// 流程控制 - 钩子 (注意修改和监听的都是父节点的数据，而不是本handle的数据)
_useNodesData.value.data['isRunning'] = false
// let ref_isRunning = ref<boolean>(props.data['isRunning'])
watch(_useNodesData, (newVal, oldVal) => { // watch: props.data.isRunning
  if (newVal.data.isRunning == true) {
    debugConsole();
  }
});

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
  border: solid 1px currentColor;
  cursor: pointer;
}
</style>
