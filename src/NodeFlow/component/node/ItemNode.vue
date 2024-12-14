<!--
Item类型的节点

结构1：
- common-id
- common-node
  - node-title          标题
  - node-content
    - node-content-lr
      - left            输入项
      - right           输出项
    - node-content-self 值项

结构2:
- 项(输入/输出/值)
  - 任意布局class
    - item-handle
    - item-name
    - item-value
-->

<template>
  <!-- id项 -->
  <div class="common-id">
    <div>
      #{{ id }}
    </div>
  </div>
  <div class="common-node item-node" :aria-label="data.label">
    <!-- 标题项 -->
    <div class="node-title">
      <span style="display: inline-block; height: 10px; width: 10px; border-radius: 5px; background-color: #666666;"></span>
      <span style="display: inline-block; margin-left: 10px;">{{ data.label }}</span>
    </div>
    <!-- 项集 -->
    <div class="node-content">
      <div class="node-content-lr">
        <div class="node-content-l">
          <!-- 输入项 -->
          <div v-for="(item,index) in inputItems" class="line">
            <Handle
              class="item-handle"
              :id="item.hasOwnProperty('id')?item['id']:'target-'+index"
              :indexAttr="index"
              :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
              :nameMapAttr="(item.hasOwnProperty('id')?item['id']:'target-'+index).toLowerCase().charCodeAt(0)%20"
              type="target"
              :position="Position.Left" />
            <span class="item-sub item-name">{{ item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type }}</span>
            <span class="item-sub item-value" v-if="item.value">
              <div class="item-sub-sub">
                <span class="left">{{ item.value }}</span>
              </div>
            </span>
          </div>
        </div>
        <div class="node-content-r">
          <!-- 输出项 -->
          <div v-for="(item,index) in outputItems" class="line">
            <Handle
              class="item-handle"
              :id="item.hasOwnProperty('id')?item['id']:'source-'+index"
              :indexAttr="index"
              :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
              :nameMapAttr="(item.hasOwnProperty('id')?item['id']:'target-'+index).toLowerCase().charCodeAt(0)%20"
              type="source"
              :position="Position.Right" />
            <span class="item-sub item-name">{{ item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type }}</span>
            <span class="item-sub item-value" v-if="item.value">
              <div>{{ item.value }}</div>
            </span>
          </div>
        </div>
      </div>
      <div class="node-content-self">
        <!-- 值项 -->
        <div v-for="(item,index) in valueItems" class="line">
          <div class="item-sub">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-value">{{ item.value }}</span>
            <slot :name="item.valueType" :data="item.value"></slot>
            <div style="height:0; clear: both;"></div>
          </div>
        </div>
      </div>
    </div>
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
// 计算属性
const inputItems = computed(() => 
  props.data.items.filter((item:any) => item.refType === 'input')
);
const outputItems = computed(() => 
  props.data.items.filter((item:any) => item.refType === 'output')
);
const valueItems = computed(() => 
  props.data.items.filter((item:any) => item.refType === 'value')
);

// 根据json创建具名插槽


// 是否有自定义socket，如果没有可能会添加默认的自定义socket
const hasCustomHandle = ref(false)
hasCustomHandle.value = props.data?.inputs?.length!=0 || props.data?.outputs?.length!=0
</script>
