<!-- ComfyUI专用的节点 -->

<template>
  <div class="comfyui-node">
    <div class="node-id">
      <div>
        #{{ id }}
      </div>
    </div>
    <!-- <NodeToolbar :is-visible="true" :position="Position.Top" class="comfyui-id">
      <div>
        #{{ id }}
      </div>
    </NodeToolbar> -->
    <div class="node-main" :aria-label="data.label">
      <div class="node-title">
        <span style="display: inline-block; height: 10px; width: 10px; border-radius: 5px; background-color: #666666;"></span>
        <span style="display: inline-block; margin-left: 10px;">{{ data.label }}</span>
      </div>
      <div class="node-content">
        <div class="node-handle-name">
          <div class="left">
            <div v-for="(item,index) in data.inputs" class="item">
              {{ item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type }}
            </div>
          </div>
          <div class="right">
            <div v-for="(item,index) in data.outputs" class="item">
              {{ item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type }}
            </div>
          </div>
        </div>
        <div class="node-self-attr">
          <div v-for="(item,index) in data.widgets_values" class="item-c">
            <div class="item">
            {{ item }}
            </div>
          </div>
          <!-- 注意data.widgets_values可能是列表也可能是json -->
        </div>
      </div>
      <!-- Handle - 根据数据自动生成 -->
      <Handle
        v-for="(item,index) in data.inputs"
        :key="index"
        :id="item.hasOwnProperty('id')?item['id']:'target-'+index"
        class="comfyui"
        :indexAttr="index"
        :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
        :nameMapAttr='(item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type).toLowerCase().charCodeAt(0)%20'
        type="target"
        :position="Position.Left" />
      <Handle
        v-for="(item,index) in data.outputs"
        :key="index"
        :id="item.hasOwnProperty('id')?item['id']:'source-'+index"
        class="comfyui"
        :indexAttr="index"
        :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
        :nameMapAttr='(item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type).toLowerCase().charCodeAt(0)%20'
        type="source"
        :position="Position.Right" />
    </div>
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

// 是否有自定义socket，如果没有可能会添加默认的自定义socket
const hasCustomHandle = ref(false)
hasCustomHandle.value = props.data?.inputs?.length!=0 || props.data?.outputs?.length!=0
</script>

<style scoped>
</style>
