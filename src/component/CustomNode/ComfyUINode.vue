<!-- ComfyUI专用的节点 -->

<template>
  <div class="comfyui-node">
    <div class="comfyui-node-title">
      {{ data.label }}
    </div>
    <div class="comfyui-node-content">
      <div class="comfyui-node-handle-name">
        <div class="left">
          <div v-for="(item,index) in data.inputs" class="item">{{ item.name }}</div>
        </div>
        <div class="right">
          <div v-for="(item,index) in data.outputs" class="item">{{ item.name }}</div>
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
      :id="'source-'+index"
      :indexAttr="index"
      type="source"
      :position="Position.Left" />
    <Handle
      v-for="(item,index) in props.data.outputs"
      :key="index"
      :id="'target-'+index"
      :indexAttr="index"
      type="target"
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

<style scoped>
/**
 * 结构
 *
 * .vue-flow__node.vue-flow__node-comfyui // 不在scrop选择范围
 *   div.comfyui-node
 *     div.comfyui-node-title   h:30
 *     div.comfyui-node-content
 *       .comfyui-node-handle-name
 *       .comfyui-node-self-attr
 *     div.vue-flow__handle
 *   ...
 */

.comfyui-node {
  height: auto;
  min-height: 200px;
  width: auto;
  min-width: 400px;
  max-width: 450px;
  border-radius:8px;
  box-shadow: 3px 3px 10px 2px #111;
}

.comfyui-node .comfyui-node-title {
  height: 30px;
  padding: 0 12px;
  line-height: 30px;

  border-radius: 8px 8px 0 0;
  color: #999999;
  background-color: #2e4656;
}

.comfyui-node .comfyui-node-content {
  height: 100%;
  min-height: calc(200px - 30px);
  padding: 0 24px;
  padding-bottom: 16px;

  border-radius: 0 0 8px 8px;
  color: #aaaaaa;
  background-color: #353535;
}

.comfyui-node .comfyui-node-content .item {
  height: 30px;
  line-height: 30px;
}
.comfyui-node .comfyui-node-content .item-c {
  height: 32px;
  padding: 1px 34px;
  margin-bottom: 4px;
  background-color: #222222;
  border-radius: 16px;
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
  width: 10px;
  height: 10px;
}
.vue-flow__handle.source { left: 12px }
.vue-flow__handle.target { right: 12px }
.vue-flow__handle[indexAttr="0"] { top:calc(46px + 0 * 30px) }
.vue-flow__handle[indexAttr="1"] { top:calc(46px + 1 * 30px) }
.vue-flow__handle[indexAttr="2"] { top:calc(46px + 2 * 30px) }
.vue-flow__handle[indexAttr="3"] { top:calc(46px + 3 * 30px) }
.vue-flow__handle[indexAttr="4"] { top:calc(46px + 4 * 30px) }
.vue-flow__handle[indexAttr="5"] { top:calc(46px + 5 * 30px) }
.vue-flow__handle[indexAttr="6"] { top:calc(46px + 6 * 30px) }
.vue-flow__handle[indexAttr="7"] { top:calc(46px + 7 * 30px) }

vue-flow__edges {
  stroke-width: 80;
}
</style>
