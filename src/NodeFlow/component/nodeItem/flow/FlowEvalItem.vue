<!--
流程控制项 - Eval

TODO
- 用 $id 来表示节点的值 !!!
- 然后这里i/o类型好像是可以部分写错的，只影响：
  1. 显示方便
  2. 动画流向
  3. 自动布局 (好像也不影响)
  4. 激发下层节点
- 本质上所有节flow类别的节点都能用eval来完成
- FIX：val的内容要允许有逗号
-->

<template>
  <div :class="'floweval-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div style="height:0; clear: both;"></div>
    <div class="node-item-value2">
      <NFTextArea :data="data" codeType="js"></NFTextArea>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>
  
<script setup lang="ts">
import NFTextArea from '../../utils/NFTextArea.vue'
const props = defineProps<{
  data: any,
}>();
if (!props.data.value) props.data.value = "console.log('debug output')"; // [!code]

// 需要注意：use组合函数里如果用了inject等，必须要在setup作用域下工作，所以我们要缓存一次变量
import {
  useNodeId, useNodesData,          // TheNode
} from '@vue-flow/core'
const _useNodeId: string = useNodeId()

// 流程控制 - 操作 (如果是纯视觉，则无需这个部分)
import { NFNode } from '../../utils/NFNode';
const nfNode = NFNode.useGetNFNode()
if (nfNode) {
  nfNode.run_node = async (ctx: any)=>{
    try {
      const func = new Function('ctx', props.data.value); // 优先用 new Function 而非 eval
      func(ctx);
      // 上下文对象 数据取出 (插入取出处理，主要是封装和简化操作)
      // TODO
      console.log(`debugConsole, #${_useNodeId}.${props.data.id}`);
      return true
    } catch (error) {
      console.log(`debugConsole, #${_useNodeId}.${props.data.id} error:`, error);
      return false
    }
  }
}
</script>

<style scoped>
.floweval-item {
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.floweval-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.floweval-item .node-item-value { /** 一般应该是没内容的，就是个圆点。24=(18)+6 */
  height: 8px;
  width: 8px;
  margin: 8px 0 8px 9px;

  border-radius: 12px;
  cursor: pointer;
}
</style>
