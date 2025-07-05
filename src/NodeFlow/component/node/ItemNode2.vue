<!--
Item类型的节点
(非画布版本，原版本的基础上，去除了无法在非vueflow环境下直接显示的东西)
-->

<style scoped>
.item-node {
  max-width: 100%;
  /* height: 100% !important; */
  padding: 0 !important;
}
</style>

<template>
  <!-- .item-node.comfyui-style 和 .item-node.oo-style 两种风格 -->
  <div class="item-node oo-style" :class="{'item-item': isItem}">
    <!-- id项 -->
    <div v-show="id != ''" class="node-id">
      <div>#{{ id }}</div>
    </div>
    <div class="common-node node-main" :run-state="data.runState" :aria-label="data.label">
      <!-- 标题项 -->
      <div class="node-title">
        <span class="node-state" :title="'runState: '+data.runState"></span>
        <span style="display: inline-block; margin-left: 10px;">{{ data.hasOwnProperty('label')?data.label:data.hasOwnProperty('name')?data.name:data.id }}</span>
      </div>
      <!-- 项集 -->
      <div class="node-content">
        <div v-for="(item,index) in data.items" :class="'line node-item '+item.refType">
          <ItemNodeSlot :index="index" :item="item">
            <template #item-item="props">
              <!-- <div>(此处不支持编辑嵌套ItemNode)</div> -->
              <ItemNode2 :id="props.data.id" :data="props.data" :is-item="true"></ItemNode2>
            </template>  <!-- 特殊节点项，节点也是节点项 -->
            <template #item-string="props"><StringItem :data="props.data"></StringItem></template>
            <template #item-enum="props"><EnumItem :data="props.data"></EnumItem></template>
            <template #item-color="props"><ColorItem :data="props.data"></ColorItem></template>
            <template #item-markdown="props"><MarkdownItem :data="props.data"></MarkdownItem></template>
            <template #item-debug="props">
              <div>(此处不支持编辑DebugItem)</div>
              <!-- <DebugItem :data="props.data"></DebugItem> -->
            </template>
            <template #item-feat="props"><FeatItem :data="props.data"></FeatItem></template>
            <template #item-start="props"><StartItem :data="props.data"></StartItem></template>
            <template #item-flow="props"><FlowItem :data="props.data"></FlowItem></template>
            <template #item-flowdelay="props"><FlowDelayItem :data="props.data"></FlowDelayItem></template>
            <template #item-flowreq="props"><FlowReqItem :data="props.data"></FlowReqItem></template>
            <template #item-floweval="props"><FlowEvalItem :data="props.data"></FlowEvalItem></template>
          </ItemNodeSlot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, useNodeId } from '@vue-flow/core'
import { computed, provide, ref } from 'vue';
const props = withDefaults(defineProps<{
  id: string,
  data: any,
  isItem?: boolean
}>(), {
  isItem: false
})
// 计算属性 (如果需要让输入输出socket同行显示，则需要用到。但会增加一些复杂度)
const inputItems = computed(() => props.data.items.filter((item:any) => item.refType === 'input'));
const outputItems = computed(() => props.data.items.filter((item:any) => item.refType === 'output'));
const valueItems = computed(() => props.data.items.filter((item:any) => item.refType === 'value'));

// 是否在正确的作用域下
const id = useNodeId()
const isFlowEnv:boolean = (id != '')

// ItemNode                                                     // 自包含节点项
import ItemNodeSlot from "../nodeItem/ItemNodeSlot.vue"
import StringItem from "../nodeItem/base/StringItem.vue"        // 字符串项/默认项
import EnumItem from "../nodeItem/base/EnumItem.vue"            // 枚举项/下拉项
import ColorItem from "../nodeItem/color/ColorItem.vue"         // 颜色项
import MarkdownItem from "../nodeItem/view/MarkdownItem.vue"    // Markdown项
// import DebugItem from "../nodeItem/feat/DebugItem.vue"       // 功能项 - 调试
import FeatItem from "../nodeItem/feat/FeatItem.vue"            // 功能项 - 流程功能
import StartItem from "../nodeItem/feat/StartItem.vue"          // 功能项 - 开始，有开始按钮
import FlowItem from "../nodeItem/flow/FlowItem.vue"            // 流程控制项 - 空，不作为
import FlowDelayItem from "../nodeItem/flow/FlowDelayItem.vue"  // 流程控制项 - 延迟
import FlowReqItem from "../nodeItem/flow/FlowReqItem.vue"      // 流程控制项 - 网络请求
import FlowEvalItem from "../nodeItem/flow/FlowEvalItem.vue"    // 流程控制项 - 执行任意代码

// 是否有自定义socket，如果没有可能会添加默认的自定义socket
const hasCustomHandle = ref(false)
hasCustomHandle.value = props.data?.items?.length!=0

// 流程控制 (如果是纯视觉，则无需这个部分)
import { NFNode } from '../utils/NFNode'
// isFlowEnv: 表示useNodeId失效，当前不在vueflow组件作用域下。即节点不在画布中显示的情况
// isItem: 表示自内嵌的情况。NFNode是严格的容器内元素，子项不定义
if (!props.isItem && isFlowEnv) {
  const nfNode:NFNode = NFNode.useFactoryNFNode(id, props.data)
}
</script>
