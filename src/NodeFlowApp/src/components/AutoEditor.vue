<!-- 自动选择 NodeEditor 和 JsonEditor -->

<script setup lang="ts">
import JsonEditor from './JsonEditor.vue'
import NodeEditor from './NodeEditor.vue'

// 全局存储部分
import { useGlobalState } from '../../../NodeFlow/stores/stores'
const { selected, selected2 } = useGlobalState()

// #region 自动更新 - selected change -> selected_lenght
import { ref, watch } from 'vue'
const selected_lenght = ref(0)
watch(selected, ()=>{
  if (!selected.value) {
    selected_lenght.value = 0
    return
  }
  selected_lenght.value = selected.value.length
},
{ deep: true }) // string数组，用deep watch比较合适
// #endregion
</script>

<template>
  <div class="auto-editor">
    <JsonEditor v-show="selected_lenght < 1"></JsonEditor>
    <NodeEditor v-show="selected_lenght >= 1"></NodeEditor>
    <div class="selected-counter">当前选中 {{ selected_lenght }} 项</div>
  </div>
</template>

<style lang="scss" scoped>
.auto-editor {
  height: calc(100% - 14px);
  >.selected-counter {
    font-size: 12px;
    line-height: 14px;
    padding: 0 6px;
  }
}
</style>
