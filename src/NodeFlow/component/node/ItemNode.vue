<!--
Item类型的节点

结构：
- common-id
- common-node
  - node-title          标题
  - node-content
    - handle (可选)
    - slot (节点项，可自定义)

特点：
- 节点也应该是节点项，但有一些不同
- 作为节点项的节点没有位置的大小属性，也不在根data的nodes下，不归vueflow管。只是长得像节点但其实不是节点
-->

<template>
  <div class="item-node" :class="{'item-item': isItem}">
    <!-- id项 -->
    <div v-show="id != ''" class="node-id">
      <div>#{{ id }}</div>
    </div>
    <div class="common-node node-main" :class="data.runState" :aria-label="data.label">
      <!-- 标题项 -->
      <div class="node-title">
        <span class="node-state" :title="'runState: '+data.runState"></span>
        <span style="display: inline-block; margin-left: 10px;">{{ data.hasOwnProperty('label')?data.label:data.hasOwnProperty('name')?data.name:data.id }}</span>
      </div>
      <!-- 项集 -->
      <div class="node-content">
        <div v-for="(item,index) in data.items" :class="'line node-item '+item.refType">
          <ItemNodeSlot :index="index" :item="item">
            <template #item-item="props"><ItemNode :id="props.data.id" :data="props.data" :is-item="true"></ItemNode></template> <!-- 特殊节点项，节点也是节点项 -->
            <template #item-string="props"><StringItem :data="props.data"></StringItem></template>
            <template #item-enum="props"><EnumItem :data="props.data"></EnumItem></template>
            <template #item-color="props"><ColorItem :data="props.data"></ColorItem></template>
            <template #item-markdown="props"><MarkdownItem :data="props.data"></MarkdownItem></template>
            <template #item-debug="props"><DebugItem :data="props.data"></DebugItem></template>
            <template #item-feat="props"><FeatItem :data="props.data"></FeatItem></template>
            <template #item-flowstart="props"><FlowStartItem :data="props.data"></FlowStartItem></template>
            <template #item-flow="props"><FlowItem :data="props.data"></FlowItem></template>
            <template #item-flowdelay="props"><FlowDelayItem :data="props.data"></FlowDelayItem></template>
            <template #item-flowreq="props"><FlowReqItem :data="props.data"></FlowReqItem></template>
            <template #item-floweval="props"><FlowEvalItem :data="props.data"></FlowEvalItem></template>
          </ItemNodeSlot>
        </div>
      </div>
      <!-- Handle - 默认隐藏 -->
      <div v-show="!hasCustomHandle">
        <Handle id="l" class="default" type="target" :position="Position.Left" />
        <Handle id="t" class="default" type="target" :position="Position.Top" />
        <Handle id="r" class="default" type="source" :position="Position.Right" />
        <Handle id="b" class="default" type="source" :position="Position.Bottom" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed, ref } from 'vue';
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

// ItemNode                                                     // 自包含节点项
import ItemNodeSlot from "../nodeItem/ItemNodeSlot.vue"
import StringItem from "../nodeItem/base/StringItem.vue"        // 字符串项/默认项
import EnumItem from "../nodeItem/base/EnumItem.vue"            // 枚举项/下拉项
import ColorItem from "../nodeItem/color/ColorItem.vue"         // 颜色项
import MarkdownItem from "../nodeItem/view/MarkdownItem.vue"    // Markdown项
import DebugItem from "../nodeItem/feat/DebugItem.vue"          // 调试项
import FeatItem from "../nodeItem/feat/FeatItem.vue"            // 功能项
import FlowItem from "../nodeItem/flow/FlowItem.vue"            // 流程控制项 - 空，不作为
import FlowStartItem from "../nodeItem/flow/FlowStartItem.vue"  // 流程控制项 - 开始，有开始按钮
import FlowDelayItem from "../nodeItem/flow/FlowDelayItem.vue"  // 流程控制项 - 延迟
import FlowReqItem from "../nodeItem/flow/FlowReqItem.vue"      // 流程控制项 - 网络请求
import FlowEvalItem from "../nodeItem/flow/FlowEvalItem.vue"    // 流程控制项 - 执行任意代码

// 是否有自定义socket，如果没有可能会添加默认的自定义socket
const hasCustomHandle = ref(false)
hasCustomHandle.value = props.data?.items?.length!=0
</script>

<style scoped>
</style>
