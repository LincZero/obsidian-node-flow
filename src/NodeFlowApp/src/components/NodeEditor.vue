<!-- 单独编辑某个节点 -->
<!-- TODO BUG 话说在非VueFlow作用域下，似乎没办法使用 useVueFlow (感觉是因为VueFlow inject的原因) -->

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import ItemNode2 from '../../../NodeFlow/component/node/ItemNode2.vue'
import { serializeFlowData } from '../../../NodeFlow/utils/serializeTool/serializeFlowData'

// 全局存储部分
import { useGlobalState } from '../../../NodeFlow/stores/stores.js'
const { selected, selected2 } = useGlobalState()

import { inject } from 'vue';
import { type NFNodes } from '../../../NodeFlow/component/utils/NFNodes'
const nfNodes:NFNodes|undefined = inject('nfNodes', undefined);

// #region 自动更新 - 避免双向同步无限循环
// 更新链：nfStr -> nfData -> nodes/edges，若向上传递，则需要设置syncFlag避免无限循环同步
let flag_str2data = false;
let flag_data2str = false;
// #endregion

// #region 自动更新 - string -> data
import { factoryFlowData } from '../../../NodeFlow/utils/jsonTool/factoryFlowData';
const currentNode = ref<null|any>(null)
const _currentContent = ref<string>('(未选中，请在画布中选中节点)')
const currentContent = computed({
  get: () => { return _currentContent.value },
  set: (newValue: string): void => {
    _currentContent.value = newValue
    if (!currentNode.value) return

    if (flag_data2str) { flag_data2str = false; return }
    flag_str2data = true
    nextTick(() => { flag_str2data = false; });
    console.log(`[auto update] [${currentNode.value.id}] string -> data`)

    // 更新到vueflow库
    if (!nfNodes) { console.error(`nfNodes 数据丢失`); return }
    if (!nfNodes._useVueFlow.value) { console.error(`nfNodes._useVueFlow 数据丢失`); return }
    const { findNode, updateNodeData } = nfNodes._useVueFlow.value
    // 如果修改头尾和前置空格会导致内换行头部缺失字符
    // let list = newValue.split('\n')
    // list = list.map(line => { return '  '+line })
    // const nodeStr = `- nodes\n${list.join('\n')}\n- edges\n` // TODO fix 不一定是这种形式，如有可能是json
    const nodeStr = newValue
    let result = factoryFlowData(nfNodes.nfType.value, nodeStr)
    if (result.code == 0 && result.data.nodes.length == 1) {
      const node = nfNodes.findNode(currentNode.value.id)
      // 注意点：
      // 不能直接赋值 (地址复制)，要使用 Object.assign 来复制对象，以触发响应式更新
      // 同理，vueflow的updateNodeData()方法也不能用
      Object.assign(node.data, result.data.nodes[0].data)
    } else {
      console.error(`输入了错误节点.
错误原因: ${result.code == 0} && ${result.data.nodes.length == 1}
错误内容: ${nodeStr}`)
    }

    // 更新到currentNode
    currentNode.value = {
      id: findNode(selected.value[0]).id,
      data: findNode(selected.value[0]).data,
    }
  }
})
// #endregion

// #region 自动更新 - data -> string
watch(currentNode, (newValue)=>{
  if (!currentNode.value) return

  if (flag_str2data) { flag_str2data = false; return }
  flag_data2str = true;
  nextTick(() => { flag_data2str = false; });
  console.log(`[auto update] [${currentNode.value.id}] data -> string`)

  const result = serializeFlowData(nfNodes.nfType.value, {nodes: [currentNode.value], edges: []})
  if (result.code == 0) {
    currentContent.value = result.data
    // 如果修改头尾和前置空格会导致内换行头部缺失字符
    // let list = result.data.split('\n')
    // list = list.slice(1, -2).map(line => { return line.slice(2) }) // 有尾换行
    // currentContent.value = list.join('\n')
  }
  else {
    currentNode.value = null
    currentContent.value = `- error,, [error] +${result.msg}`
  }
}, {deep: true})
// #endregion

// #region 自动更新 - selected change -> data
// on selected change
// 修改当前选中节点的内容
watch(selected, ()=>{
  if (!nfNodes._useVueFlow.value) return
  const { getSelectedNodes, findNode } = nfNodes._useVueFlow.value
  // console.log('selected改动---------', selected.value.length,
  //   " - ", selected2.value.value.length,
  //   " - ", getSelectedNodes.length)
  if (selected.value.length < 1) {
    currentNode.value = null
    currentContent.value = '(未选中，请在画布中选中节点)'
    return
  }
  currentNode.value = {
    id: findNode(selected.value[0]).id,
    data: findNode(selected.value[0]).data,
  } 
},
{ deep: true }) // string数组，用deep watch比较合适
// #endregion
</script>

<!-- TODO 信息源改用nfNode代替，脱离对vueflow底层依赖 -->
<!-- TODO 根据是否有选中对象，来看显示局部json还是全局json -->
<template>
  <div class="node-editor">
    <div v-if="currentNode!=null" style="margin: 0 0 12px; padding: 0;">
      <ItemNode2 :id="currentNode.id" :data="currentNode.data"></ItemNode2>
    </div>
    <textarea spellcheck="false" class="item" v-model="currentContent"></textarea>
  </div>
</template>

<style lang="scss" scoped>
.node-editor {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  padding: 10px;
  >.item {
    width: 100%;
    line-height: 24px;
    margin: 0 0 4px 0;
  }
  >textarea.item {
    min-height: 500px;
    line-height: 18px;
    font-size: 14px;
    // height: calc(100% - 150px);
    flex: 1; // 占据剩余空间
    padding-top: 4px;
    padding-bottom: 4px;
    white-space: pre;
    overflow-x: auto;
    overflow-y: auto;
    resize: none;
  }

  input, textarea, pre, div {
    background: #222222;
    color: #c9c9c9;
    padding: 0 10px;
    width: 100%;
    box-sizing: border-box;
  }
  input, textarea, pre {
    border: solid 1px #616161;
    border-radius: 10px;
  }
}
</style>
