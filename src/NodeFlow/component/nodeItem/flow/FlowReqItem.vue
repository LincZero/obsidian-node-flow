<!--
流程控制项 - http请求
-->

<template>
  <div :class="'flowreq-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{
  data: any,
}>();

import { useNodeId } from '@vue-flow/core'
const _useNodeId: string = useNodeId()

import { nfSetting } from '../../../utils/main/setting'

// 流程控制 - 操作
import { inject } from 'vue';
import { type NFNode } from '../../utils/NFNode';
const nfNode: NFNode = inject('nfNode');
nfNode.fn = async (ctx) => {
  try {
    ctx.check(ctx, ['emit', 'url'], ['success', 'fail', 'resp'])
    const resp = await nfSetting.fn_request( // TODO: 这里有两种方式：分开和总json。自动检测有无url，无则使用后者
      ctx.sourceValues['url'].cacheValue,
      ctx.sourceValues['method']?.cacheValue,
      ctx.sourceValues['headers']?.cacheValue ? JSON.parse(ctx.sourceValues['headers']?.cacheValue) : undefined,
      ctx.sourceValues['body']?.cacheValue,
    )

    console.log(`debugConsole, nodeId:${_useNodeId} handleId:${props.data.id}`);

    // 检查是否正常响应
    if (resp.status != 200) { // resp.ok // TODO，fetch版本应该用ok，ob版本有空再调试
      console.warn('nf resp status error:', resp)
      ctx.targetValues['resp'].cacheValue = "warning: ok/status:" + resp.status.toString()
      ctx.targetValues['fail'].cacheValue = true; return false
    }

    // TODO 应该封装一下requestUrl和fetch的区别到统一的函数中，不要在这里处理区别

    // 优先尝试解析JSON
    try {
      if (typeof resp.json == 'object') {          // @env obsidian版本 (requestUrl)
        ctx.targetValues['resp'].cacheValue = JSON.stringify(resp.json, null, 2)
        ctx.targetValues['success'].cacheValue = true; return true
      } else if (typeof resp.json == 'function') { // @env 其他环境版本 (fetch)
        const resp_json = await resp.json();
        ctx.targetValues['resp'].cacheValue = JSON.stringify(resp_json, null, 2)
        ctx.targetValues['success'].cacheValue = true; return true
      } else {
        console.warn('without json parse merthod:', resp)
        ctx.targetValues['resp'].cacheValue = '[error] without json parse merthod'
        ctx.targetValues['fail'].cacheValue = true; return false
      }
    } catch (e) {}

    // 非JSON的情况
    try {
      if (typeof resp.text === 'function') {      // @env Fetch环境
        const textData = await resp.text()
        ctx.targetValues['resp'].cacheValue = textData
        ctx.targetValues['success'].cacheValue = true; return true
      } else if (resp.body) {                     // @env Obsidian环境
        const textData = typeof resp.body === 'string' ? resp.body : JSON.stringify(resp.body)
        ctx.targetValues['resp'].cacheValue = textData
        ctx.targetValues['success'].cacheValue = true; return true
      } else {
        console.warn('without text parse merthod:', resp)
        ctx.targetValues['resp'].cacheValue = '[error] without text parse merthod'
        ctx.targetValues['fail'].cacheValue = true; return false
      }
    } catch (e) {
      ctx.targetValues['resp'].cacheValue = '[error] resp parse error'
      ctx.targetValues['fail'].cacheValue = true; return false
    }
  } catch (e) {
    console.error('error request:', e)
    ctx.targetValues['resp'].cacheValue = '[error] see console for detail'
    ctx.targetValues['fail'].cacheValue = true; return false
  }
}
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
