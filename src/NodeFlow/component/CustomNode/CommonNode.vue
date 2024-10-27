<!-- 通用的节点 -->

<template>
  <div class="common-id">
    <div>
      #{{ id }}
    </div>
  </div>
  <!-- <NodeToolbar :is-visible="true" :position="Position.Top" class="common-id">
    <div>
      #{{ id }}
    </div>
  </NodeToolbar> -->
  <div class="common-node" :aria-label="data.label">
    <div class="node-title">
      <span style="display: inline-block; height: 10px; width: 10px; border-radius: 5px; background-color: #666666;"></span>
      <span style="display: inline-block; margin-left: 10px;">{{ data.label }}</span>
    </div>
    <div class="node-content">
      <div class="node-content-handle">
        <div class="left">
          <div v-for="(item,index) in data.inputs" class="line">
            <span class="item-sub item-name">{{ item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type }}</span>
            <span class="item-sub item-value" v-if="item.value">
              <div class="item-sub-sub">
                <span class="left">{{ item.value }}</span>
              </div>
            </span>
          </div>
        </div>
        <div class="right">
          <div v-for="(item,index) in data.outputs" class="line">
            <span class="item-sub item-name">{{ item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type }}</span>
            <span class="item-sub item-value" v-if="item.value">
              <div>{{ item.value }}</div>
            </span>
          </div>
        </div>
      </div>
      <div class="node-content-self">
        <div v-for="(item,index) in data.values" class="line">
          <div class="item-sub">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Handle - 根据数据自动生成 -->
    <Handle
      v-for="(item,index) in data.inputs"
      :key="index"
      :id="item.hasOwnProperty('id')?item['id']:'target-'+index"
      class="custom"
      :indexAttr="index"
      :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
      :nameMapAttr='(item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type).toLowerCase().charCodeAt(0)%10'
      type="target"
      :position="Position.Left" />
    <Handle
      v-for="(item,index) in data.outputs"
      :key="index"
      :id="item.hasOwnProperty('id')?item['id']:'source-'+index"
      class="custom"
      :indexAttr="index"
      :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
      :nameMapAttr='(item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type).toLowerCase().charCodeAt(0)%10'
      type="source"
      :position="Position.Right" />
    <!-- Handle - 默认隐藏 -->
    <Handle v-show="!hasCustomHandle"
      id="l" class="default" type="target" :position="Position.Left" />
    <Handle v-show="!hasCustomHandle"
      id="t" class="default" :position="Position.Top" />
    <Handle v-show="!hasCustomHandle"
      id="r" class="default" type="source" :position="Position.Right" />
    <Handle v-show="!hasCustomHandle"
      id="b" class="default" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue';
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

const hasCustomHandle = ref(false)
hasCustomHandle.value = props.data?.inputs?.length!=0 || props.data?.outputs?.length!=0
</script>

<style>
.vue-flow__node-common.selected .common-node{
  box-shadow: 0 0 8px 3px #ec4899;
}

.vue-flow__edge .vue-flow__edge-path{
  stroke-width: 2;
}
.vue-flow__edge.selected .vue-flow__edge-path{
  stroke: #ec4899 !important; /* 应该改成流动样式 */
  stroke-width: 4;
}
</style>
