<!--
主画布

使用前需要通过具名插槽的方式注册自定义的节点、以及节点项
-->

<template>
  <VueFlow
    class="nf-node-flow" 
    :nodes="nodes" :edges="edges"
    :prevent-scrolling="true"
    fit-view-on-init
    @nodes-change="onNodeChange"
    @edges-change="onEdgeChange"
    @nodes-initialized="isNodeInitialized=true">
    <!-- :pan-on-drag="[0,2]" -->
    <Background style="background-color: #222222;" pattern-color="#191919" variant="lines" :gap="16" />
    <!-- 话说这里的设计很神奇。VueFlow先通过数据构造有自定义标签的插槽位置，然后再用具名插槽v-slot(简写#)把插槽内容进行插入/替换 -->
    <template #node-obcanvas="props"><ObcanvasNode :id="props.id" :data="props.data"/></template>
    <template #node-comfyui="props"><ComfyUINode :id="props.id" :data="props.data"/></template>
    <template #node-comfyui-group="props"><ComfyUINodeGroup :id="props.id" :data="props.data"/></template>
    <template #node-common="props"><CommonNode :id="props.id" :data="props.data"/></template>
    <template #node-item="props">
      <ItemNode :id="props.id" :data="props.data"></ItemNode>
    </template>
    <InteractionControls v-if="!props.isMini || props.isShowControls"/>
  </VueFlow>
</template>

<script setup lang="ts">
// 1. 自身组件
// 属性、通用导入
const props = withDefaults(defineProps<{
  jsonData?: any,
  isShowControls?: boolean, // 强制显示控制面板
  isMini: boolean, // true为局部渲染，尽可能简化；false为在更大的独立视图中渲染，可以显示更多东西
}>(), {
  jsonData: {nodes:[], edges:[]},
  isShowControls: false
})
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useNodesData, useVueFlow } from '@vue-flow/core'

// 2. 子组件

//   组件 - 自定义节点
import ObcanvasNode from '../node/ObcanvasNode.vue'            // ob canvas 节点
import ComfyUINode from '../node/ComfyUINode.vue'              // comfyui 节点
import ComfyUINodeGroup from '../node/ComfyUINodeGroup.vue'    // 节点组
import CommonNode from '../node/CommonNode.vue'                // 通用节点
import ItemNode from '../node/ItemNode.vue'                    // 项节点

//   组件 - 其他
import InteractionControls from '../utils/InteractionControls.vue'  // 控制画布控制的操作开关
import { Background } from '@vue-flow/background'                   // 背景控制

//   组件 - VueFlow，并准备节点数据 (解析JSON数据，在外面已经校验过一次了，这里大概率不会有问题)
import { VueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core' 
let nodes = ref<Node[]>([]);
let edges = ref<Edge[]>([]);
try {
  nodes = ref(props.jsonData.nodes);
  edges = ref(props.jsonData.edges);
} catch (error) {
  console.error('Failed to parse json:', error, "rawJson:", JSON.stringify(props.jsonData));
}

// 3. 全局设置
{
  if (props.isMini) {
    const {
      zoomOnScroll,       // default true
      zoomOnDoubleClick,  // default true
      nodesConnectable,   // default true
      onConnect,
      addEdges,
    } = useVueFlow();
    zoomOnScroll.value = false;
    zoomOnDoubleClick.value = false;
    nodesConnectable.value = true;
    onConnect((params) => addEdges(params))
  }
}

// 4. 功能

//   功能 - 自动布局模块
import { nextTick } from 'vue'
import { useLayout } from '../../utils/layout/useLayout'
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

//   功能 - copy and paste
function pasteSelected(array: any) {
  for (let id of array.value) {
    const data = findNode(id)
    let count = 2
    while(true) {
      if (!findNode(id + count)) break
      // console.warn("continue find", count);
      count++
    }
    const newData = {
      id: data.id + count,
      data: data.data,
      position: {
        x: data.position.x+100,
        y: data.position.y+100,
      },
      type: data.type
    }
    addNodes(newData);
  }
}
let cache_selected = ref<string[]>([]);
let cache_copyed = ref<string[]>([]);
const ctrl_d = (event: any) => {
  // 注意：TODO 这里暂时使用内部剪切版，无法跨画布传输
  // 注意：要打开编辑模式 (显示控制面板) 才允许快捷键，避免冲突
  if (!props.isShowControls) return;
  if (event.ctrlKey && event.key === 'd') {
    event.preventDefault();
    pasteSelected(cache_selected);
  }
  else if (event.ctrlKey && event.key === 'c') {
    event.preventDefault();
    cache_copyed.value = cache_selected.value
  }
  else if (event.ctrlKey && event.key === 'v') {
    event.preventDefault();
    pasteSelected(cache_copyed);
  }
}
onMounted(() => {
  document.addEventListener('keydown', ctrl_d)
})
onUnmounted(() => {
  document.removeEventListener('keydown', ctrl_d)
})

// 5. 事件

// 增删改查管理器 (仅动态环境需要，静态部署则不需要这部分) --------------------------

/**
 * 事件 - 线状态变动
 * 
 * on emit by <VueFlow @edge-change="onEdgeChange">
 * 
 * 选择的线变为流动样式
 * 需要特别注意的是，最好修改props.jsonData而不是nodes和edges，特别是后者不能直接赋值
 * 
 * 注意区分：
 * - @edges-change      点击触发
 * - @edge-update       (不确定，一般不触发)
 * - @edge-mouse-enter  鼠标悬浮触发
 * - @edge-mouse-leave  鼠标离开悬浮触发
 * - @edge-mouse-move   鼠标悬浮移动时一直触发
 * - @edges-change      包括selectionChange、removeChange、addChange
 */
import type { EdgeChange, NodeChange, EdgeSelectionChange } from '@vue-flow/core'
const {
  findEdge, updateEdgeData, addEdges, removeEdges,
  findNode, updateNodeData, addNodes, removeNodes,
} = useVueFlow()
function onEdgeChange(changes: EdgeChange[]) {
  for (const change of changes) {
    // 改
    if (change.type == "select" && change.hasOwnProperty("selected")) {
      const edge = findEdge((change as EdgeSelectionChange).id)
      edge.animated = (change as EdgeSelectionChange).selected
    }
    // 增
    else if (change.type == "add" && change.hasOwnProperty("item")) {
      const colors = [
        "#ff0000", "#ff4d00", "#ff9900", "#ffe600", "#ccff00",
        "#80ff00", "#33ff00", "#00ff1a", "#00ff66", "#00ffb3",
        "#00ffff", "#00b3ff", "#0066ff", "#001aff", "#3300ff",
        "#8000ff", "#cc00ff", "#ff00e6", "#ff0099", "#ff004c"
      ]
      const nameMapAttr = change.item.targetHandle.toLowerCase().charCodeAt(0)%20;
      props.jsonData.edges.push({
        id: change.item.id,
        style: {
          stroke: colors[nameMapAttr]
        },
        target: change.item.target,
        targetHandle: change.item.targetHandle,
        source: change.item.source,
        sourceHandle: change.item.sourceHandle,
      })
    }
    // 删
    else if (change.type == "remove") {
      props.jsonData.edges = props.jsonData.edges.filter((edge:any) => edge.id != change.id)
    }
    // console.log('onEdgeChange', change, edges.value, props.jsonData)
  }
}

/**
 * 事件 - 节点状态变动
 * 
 * on emit by <VueFlow @nodes-change="onNodeChange">
 */
function onNodeChange(changes: NodeChange[]) {
  for (const change of changes) {
    // 改
    if (change.type == "select" && change.hasOwnProperty("selected")) {
      const data = findNode(change.id)
      if (change.selected) {
        cache_selected.value.push(change.id)
      } else {
        cache_selected.value = cache_selected.value.filter(item => item !== change.id);
      }
    }
    // 增
    else if (change.type == "add" && change.hasOwnProperty("item")) {
      const data = findNode(change.item.id)
      props.jsonData.nodes.push({
        id: data.id,
        data: data.data,
        position: data.position,
        type: data.type
      })
    }
    // 删
    else if (change.type == "remove") {
      props.jsonData.nodes = props.jsonData.nodes.filter((node:any) => node.id != change.id)
    }
  }
}

/**
 * 事件 - 其他，废弃
 */
// onConnect((edge) => { // 仅 {s s t t} 数据
//   console.log('nodeItem onConnect', edge)
//   const nameMapAttr = edge.sourceHandle.toLowerCase().charCodeAt(0)%20;
// })
// onConnectEnd((edge) => { //
//   console.log('nodeItem onConnectEnd', edge)
// })
</script>

<style>
@import '@vue-flow/core/dist/style.css';          /* 导入Vue Flow工作所需的样式 */
@import '@vue-flow/core/dist/theme-default.css';  /* 导入默认主题，这是可选的，但通常推荐 */

.nf-node-flow {
  min-height: 200px;
  height: 100%;
}
</style>
