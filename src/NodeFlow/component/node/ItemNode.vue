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
  <div class="item-node">
    <!-- id项 -->
    <div :v-show="id != ''" class="node-id">
      <div>#{{ id }}</div>
    </div>
    <div class="common-node node-main" :aria-label="data.label">
      <!-- 标题项 -->
      <div class="node-title">
        <span style="display: inline-block; height: 10px; width: 10px; border-radius: 5px; background-color: #666666;"></span>
        <span style="display: inline-block; margin-left: 10px;">{{ data.hasOwnProperty('label')?data.label:data.hasOwnProperty('name')?data.name:data.id }}</span>
      </div>
      <!-- 项集 -->
      <div class="node-content">
        <div v-for="(item,index) in data.items" :class="'line node-item '+item.refType">
          <ItemNodeSlot :index="index" :item="item">
            <template #item-default="props"><DefaultItem :data="props.data"></DefaultItem></template>
            <template #item-markdown="props"><MarkdownItem :data="props.data"></MarkdownItem></template>
            <template #item-color="props"><ColorItem :data="props.data"></ColorItem></template>
            <template #item-dropdown="props"><DropdownItem :data="props.data"></DropdownItem></template>
            <template #item-item="props"><ItemNode :id="''" :data="props.data"></ItemNode></template> <!-- 特殊节点项，节点也是节点项 -->
          </ItemNodeSlot>
        </div>
      </div>
      <!-- Handle - 默认隐藏 -->
      <div v-show="!hasCustomHandle">
        <Handle id="l" class="default" type="target" :position="Position.Left" />
        <Handle id="t" class="default" :position="Position.Top" />
        <Handle id="r" class="default" type="source" :position="Position.Right" />
        <Handle id="b" class="default" :position="Position.Bottom" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed, ref } from 'vue';
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
})
// 计算属性 (如果需要让输入输出socket同行显示，则需要用到。但会增加一些复杂度)
const inputItems = computed(() => props.data.items.filter((item:any) => item.refType === 'input'));
const outputItems = computed(() => props.data.items.filter((item:any) => item.refType === 'output'));
const valueItems = computed(() => props.data.items.filter((item:any) => item.refType === 'value'));

import ItemNodeSlot from "../nodeItem/ItemNodeSlot.vue"
import DefaultItem from "../nodeItem/DefaultItem.vue"           // 默认项
import MarkdownItem from "../nodeItem/MarkdownItem.vue"         // Markdown项
import ColorItem from "../nodeItem/ColorItem.vue"               // 颜色项
import DropdownItem from "../nodeItem/DropdownItem.vue"         // 下拉项

// 是否有自定义socket，如果没有可能会添加默认的自定义socket
const hasCustomHandle = ref(false)
hasCustomHandle.value = props.data?.items?.length!=0
</script>
