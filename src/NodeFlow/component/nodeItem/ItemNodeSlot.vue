<!--
抽象节点项

不是具体的节点项，是用来注册、管理、替换为对应的节点项的

有点像面向对象里的抽象基类
-->

<template>
  <Handle
    v-if="(item.refType === 'input' || item.refType === 'i' || item.refType === 'io') && isFlowEnv"
    class="node-item-handle"
    :id="item.hasOwnProperty('id')?item['id']:'target-'+index"
    :title="item.hasOwnProperty('id')?item['id']:'target-'+index"
    :indexAttr="index"
    :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
    :nameMapAttr="(item.hasOwnProperty('id')?item['id']:'target-'+index).toLowerCase().charCodeAt(0)%20"
    :type-attr="(item.hasOwnProperty('valueType')?item['valueType']:'item-string')"
    :type-map-attr="(item.hasOwnProperty('valueType')?item['valueType']:'item-string').toLowerCase().charCodeAt(6)%20"
    type="target"
    :position="Position.Left" />
  <Handle
    v-if="(item.refType === 'output' || item.refType === 'o' || item.refType === 'io') && isFlowEnv"
    class="node-item-handle"
    :id="item.hasOwnProperty('id')?item['id']:'source-'+index"
    :title="item.hasOwnProperty('id')?item['id']:'source-'+index"
    :indexAttr="index"
    :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
    :nameMapAttr="(item.hasOwnProperty('id')?item['id']:'source-'+index).toLowerCase().charCodeAt(0)%20"
    :type-attr="(item.hasOwnProperty('valueType')?item['valueType']:'item-string')"
    :type-map-attr="(item.hasOwnProperty('valueType')?item['valueType']:'item-string').toLowerCase().charCodeAt(6)%20"
    type="source"
    :position="Position.Right" />
  <slot :name="props.item.valueType" :id="props.item.id" :data="props.item"></slot>
</template>

<script setup lang="ts">
const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  item: {
    type: Object,
    required: true,
  },
})
import { Handle, Position } from '@vue-flow/core'

// 是否在正确的作用域下
import { useNodeId } from '@vue-flow/core'
const id = useNodeId()
const isFlowEnv:boolean = (id != '')
</script>
