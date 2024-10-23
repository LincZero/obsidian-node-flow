<!-- ComfyUI专用的节点 -->

<template>
  <div class="comfyui-id">
    <div>
      #{{ id }}
    </div>
  </div>
  <div class="comfyui-node">
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
    <Handle
      v-for="(item,index) in data.inputs"
      :key="index"
      :id="'target-'+index"
      :indexAttr="index"
      type="target"
      :position="Position.Left" />
    <Handle
      v-for="(item,index) in props.data.outputs"
      :key="index"
      :id="'source-'+index"
      :indexAttr="index"
      type="source"
      :position="Position.Right" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, useVueFlow } from '@vue-flow/core'
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

</script>

<style>
.vue-flow__node-comfyui.selected .comfyui-node{
  box-shadow: 0 0 8px 3px #ec4899;
}

.vue-flow__edge .vue-flow__edge-path{
  stroke-width: 2;
}
.vue-flow__edge.selected .vue-flow__edge-path{
  stroke: #ec4899 !important;
}
</style>

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
  height: 22px;
  padding: 0 4px 2px 4px;
  line-height: 20px;
  font-size: 12px;
  width: auto;
}
.comfyui-id>div {
  height: 20px;
  line-height: 20px;
  float: right;
  padding: 0 6px;
  background-color: #0f1f0f;
  border-radius: 6px;
}

.comfyui-node {
  height: auto;
  min-height: 90px;
  width: auto;
  min-width: 350px;
  max-width: 450px;
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
  background-color: #2e4656;
}

.comfyui-node .comfyui-node-content {
  height: 100%;
  min-height: calc(90px - 30px);
  padding: 0 24px;
  padding-bottom: 16px;

  border-radius: 0 0 8px 8px;
  color: #aaaaaa;
  background-color: #353535;
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

  padding: 1px 28px;
  border: solid 1px #616161;
  background-color: #222222;
  border-radius: 13px;
}
.comfyui-node .comfyui-node-content .item-c .item {
  line-height: 20px;
  min-height: 20px;
  height: auto;
  font-size: 12px;
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

.vue-flow__handle {
  background-color: #a598dd;
  border: none;
  box-sizing: border-box;
  width: 10px;
  height: 10px;
}
.vue-flow__handle.target {
  left: 12px;
}
.vue-flow__handle.source {
  right: 12px;
  border: solid 2px #211820;
}
.vue-flow__handle[indexAttr="0"] { top:calc(22px + 30px + 0.5 * 24px) }
.vue-flow__handle[indexAttr="1"] { top:calc(22px + 30px + 1.5 * 24px) }
.vue-flow__handle[indexAttr="2"] { top:calc(22px + 30px + 2.5 * 24px) }
.vue-flow__handle[indexAttr="3"] { top:calc(22px + 30px + 3.5 * 24px) }
.vue-flow__handle[indexAttr="4"] { top:calc(22px + 30px + 4.5 * 24px) }
.vue-flow__handle[indexAttr="5"] { top:calc(22px + 30px + 5.5 * 24px) }
.vue-flow__handle[indexAttr="6"] { top:calc(22px + 30px + 6.5 * 24px) }
.vue-flow__handle[indexAttr="7"] { top:calc(22px + 30px + 7.5 * 24px) }
</style>
