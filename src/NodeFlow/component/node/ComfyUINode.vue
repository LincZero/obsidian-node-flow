<!-- ComfyUI专用的节点 -->

<template>
  <div class="comfyui-id">
    <div>
      #{{ id }}
    </div>
  </div>
  <!-- <NodeToolbar :is-visible="true" :position="Position.Top" class="comfyui-id">
    <div>
      #{{ id }}
    </div>
  </NodeToolbar> -->
  <div class="comfyui-node" :aria-label="data.label">
    <div class="comfyui-node-title">
      <span style="display: inline-block; height: 10px; width: 10px; border-radius: 5px; background-color: #666666;"></span>
      <span style="display: inline-block; margin-left: 10px;">{{ data.label }}</span>
    </div>
    <div class="comfyui-node-content">
      <div class="comfyui-node-handle-name">
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
      <div class="comfyui-node-self-attr">
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
      class="custom"
      :indexAttr="index"
      :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
      :nameMapAttr='(item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type).toLowerCase().charCodeAt(0)%20'
      type="target"
      :position="Position.Left" />
    <Handle
      v-for="(item,index) in data.outputs"
      :key="index"
      :id="item.hasOwnProperty('id')?item['id']:'source-'+index"
      class="custom"
      :indexAttr="index"
      :nameAttr='item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type'
      :nameMapAttr='(item.hasOwnProperty("label")?item.label:item.hasOwnProperty("name")?item.name:item.type).toLowerCase().charCodeAt(0)%20'
      type="source"
      :position="Position.Right" />
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
/**
 * 结构一：scoped外的部分
 *
 * .vue-flow.nf-node-flow
 *   .vue-flow__viewport vue-flow__container
 *     .vue-flow__pane vue-flow__container draggable
 *       .vue-flow__transformationpane.vue-flow__container
 *         svg
 *         svg
 *         .vue-flow__edge-labels               线所在区域
 *         .vue-flow__nodes.vue-flow__container 节点所在区域
 * 
 * 结构二：scoped内的部分
 *
 * .vue-flow__nodes vue-flow__container
 *   .vue-flow__node.vue-flow__node-comfyui 
 *     div.comfyui-node                         // 从这里开始进入scrop选择范围
 *       div.comfyui-node-id
 *       div.comfyui-node-title   h:30
 *       div.comfyui-node-content
 *         .comfyui-node-handle-name
 *         .comfyui-node-self-attr
 *       div.vue-flow__handle
 *     ...
 */

.comfyui-id {
  position: absolute;
  height: 0;
  line-height: 20px;
  font-size: 12px;
  width: 100%;
}
.comfyui-id>div {
  position: relative;
  bottom: 22px;
  right: 4px;
  height: 20px;
  line-height: 20px;
  float: right;
  padding: 0 6px;
  background-color: #0f1f0f;
  border-radius: 6px;
}

.comfyui-node {
  height: 100%;
  width: 100%;
  border-radius:8px;
  box-shadow: 3px 3px 10px 2px #111;
}

.comfyui-node .comfyui-node-title {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  padding: 0 12px;

  border-radius: 8px 8px 0 0;
  color: #999999;
  background-color: #2e4656f0;
}

.comfyui-node .comfyui-node-content {
  height: calc(100% - 30px);
  padding: 0 24px;
  padding-bottom: 16px;

  border-radius: 0 0 8px 8px;
  color: #aaaaaa;
  background-color: #353535f0;
}

.comfyui-node .comfyui-node-content .item {
  line-height: 24px;
  min-height: 24px;
  height: auto;
  font-size: 12px;
}
.comfyui-node .comfyui-node-content .item-c {
  box-sizing: border-box;
  min-height: 24px;
  height: auto;
  margin-bottom: 4px;

  padding: 1px 12px;
  border: solid 1px #616161;
  background-color: #222222;
  border-radius: 13px;
}
.comfyui-node .comfyui-node-content .item-c .item {
  line-height: 20px;
  min-height: 20px;
  height: auto;
  font-size: 12px;

  white-space: break-spaces;
  overflow-wrap: break-word;
}

.comfyui-node .comfyui-node-content .comfyui-node-handle-name {
  display: flex;
  justify-content: space-between;
}
.comfyui-node .comfyui-node-content .comfyui-node-handle-name>.left {
  text-align: left;
}
.comfyui-node .comfyui-node-content .comfyui-node-handle-name>.right {
  text-align: right;
}
</style>
