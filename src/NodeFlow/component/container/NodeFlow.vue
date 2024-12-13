<!-- 主画布 -->

<template>
  <VueFlow
    class="nf-node-flow" 
    :nodes="nodes" :edges="edges"
    :prevent-scrolling="true"
    @edges-change="edgeAnimated"
    @nodes-initialized="isNodeInitialized=true">
    <!-- :pan-on-drag="[0,2]" -->
    <Background style="background-color: #222222;" pattern-color="#191919" variant="lines" :gap="16" />
    <!-- 话说这里的设计很神奇。VueFlow先通过数据构造有自定义标签的插槽位置，然后再用具名插槽v-slot(简写#)把插槽内容进行插入/替换 -->
    <template #node-obcanvas="props"><ObcanvasNode :id="props.id" :data="props.data"/></template>
    <template #node-comfyui="props"><ComfyUINode :id="props.id" :data="props.data"/></template>
    <template #node-comfyui-group="props"><ComfyUINodeGroup :id="props.id" :data="props.data"/></template>
    <template #node-common="props"><CommonNode :id="props.id" :data="props.data"/></template>
    <template #node-item="props">
      <ItemNode :id="props.id" :data="props.data">
        <template #item-color="props"><ColorItem></ColorItem></template>
        <template #item-markdown="props"><MarkdownItem></MarkdownItem></template>
      </ItemNode>
    </template>
    <InteractionControls v-if="!props.isMini"/>
  </VueFlow>
</template>

<script setup lang="ts">
// 自身属性、通用导入
const props = defineProps<{
  jsonData?: any,
  isMini: boolean, // true为局部渲染，尽可能简化；false为在更大的独立视图中渲染，可以显示更多东西
}>()
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'

// 组件 - 自定义节点
import ObcanvasNode from '../node/ObcanvasNode.vue'            // ob canvas 节点
import ComfyUINode from '../node/ComfyUINode.vue'              // comfyui 节点
import ComfyUINodeGroup from '../node/ComfyUINodeGroup.vue'    // 节点组
import CommonNode from '../node/CommonNode.vue'                // 通用节点
import ItemNode from '../node/ItemNode.vue'                    // 项节点

import ColorItem from "../nodeItem/ColorItem.vue"               // 颜色项
import MarkdownItem from "../nodeItem/MarkdownItem.vue"         // Markdown项

// 组件 - 其他
import InteractionControls from '../utils/InteractionControls.vue'   // 控制画布控制的操作开关
import { Background } from '@vue-flow/background'                   // 背景控制

// 组件 - VueFlow，并准备节点数据 (解析JSON数据，在外面已经校验过一次了，这里大概率不会有问题)
import { VueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core' 
let nodes = ref<Node[]>([]);
let edges = ref<Edge[]>([]);
{
  let defaultFlag:boolean = true;
  if (props.jsonData) {
    try {
      nodes = ref(props.jsonData.nodes);
      edges = ref(props.jsonData.edges);
      defaultFlag = false
    } catch (error) {
      console.error('Failed to parse json:', error, "rawJson:", JSON.stringify(props.jsonData));
    }
  }
}

// 全局设置
{
  if (props.isMini) {
    const {
      zoomOnScroll,       // default true
      zoomOnDoubleClick,  // default true
    } = useVueFlow();
    zoomOnScroll.value = false;
    zoomOnDoubleClick.value = false;
  }
}

// 功能 - 自动布局模块
import { nextTick } from 'vue'
import { useLayout } from '../../jsonTool/useLayout'
const { layout } = useLayout()
/// 封装: 调整节点位置 + 刷新视图
/// 注意：首次调用必须在节点初始化以后，否则虽然能自动布局，但后续均无法获取节点大小
async function layoutGraph(direction: string) {
  nodes.value = layout(nodes.value, edges.value, direction)
  const { fitView } = useVueFlow()
  nextTick(() => { fitView() })
}
// 个别情况自动调用
const isNodeInitialized = ref(false)
watch(isNodeInitialized, (newValue, oldValue) => {
  if (oldValue==false && newValue==true) {
    if (nodes.value.length>1 &&
      nodes.value[0].position.x == 0 && nodes.value[0].position.y == 0 &&
      nodes.value[1].position.x == 0 && nodes.value[1].position.y == 0
    ) {
      layoutGraph('LR')
    }
  }
});
defineExpose({
  layoutGraph
})

// 功能 - 模拟运行流程树
/*import { useRunProcess } from './useRunProcess'
const { run, stop, reset, isRunning } = useRunProcess({ graph })
async function ...() {
  await stop()
  reset(nodes.value)
}*/

// 功能 - md渲染模块 (仅obsidian)
// import { MarkdownRenderChild, MarkdownRenderer } from 'obsidian'
// function md_render(markdown: string, el: HTMLElement) {
//   const mdrc: MarkdownRenderChild = new MarkdownRenderChild(el);
//   // if (ctx) ctx.addChild(mdrc);
//   // else if (ABCSetting.global_ctx) ABCSetting.global_ctx.addChild(mdrc);
//   /**
//    * Renders markdown string to an HTML element.
//    * @param app - A reference to the app object
//    * @param markdown - The markdown source code
//    * @param el - The element to append to
//    * @param sourcePath - The normalized path of this markdown file, used to resolve relative internal links
//    * @param component - A parent component to manage the lifecycle of the rendered child components.
//    * @public
//    */
//   // @ts-ignore 新接口，但旧接口似乎不支持
//   MarkdownRenderer.render(app, markdown, el, app.workspace.activeLeaf?.view?.file?.path??"", mdrc)
// }

/**
 * 事件 - 线变动
 * 
 * 选择的线变为流动样式
 * 
 * 注意区分：
 * - @edges-change      点击触发
 * - @edge-update       (不确定，一般不触发)
 * - @edge-mouse-enter  鼠标悬浮触发
 * - @edge-mouse-leave  鼠标离开悬浮触发
 * - @edge-mouse-move   鼠标悬浮移动时一直触发
 * - @edges-change      包括selectionChange、removeChange、addChange
 */
import type { EdgeChange, EdgeSelectionChange } from '@vue-flow/core'
const { findEdge } = useVueFlow()
function edgeAnimated(changes: EdgeChange[]) {
  for (const change of changes) {
    if (change.hasOwnProperty("selected")) { // EdgeSelectionChange 类型
      const edge = findEdge((change as EdgeSelectionChange).id)
      edge.animated = (change as EdgeSelectionChange).selected
    }
  }
}
</script>

<style>
@import '@vue-flow/core/dist/style.css';          /* 导入Vue Flow工作所需的样式 */
@import '@vue-flow/core/dist/theme-default.css';  /* 导入默认主题，这是可选的，但通常推荐 */

.nf-node-flow {
  min-height: 200px;
  height: 100%;
}
</style>
