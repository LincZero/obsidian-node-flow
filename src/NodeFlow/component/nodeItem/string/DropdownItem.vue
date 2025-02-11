<!-- 下拉项 -->

<template>
  <div :class="'dropdown-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div v-if="props.data.value" class="node-item-value" :style="'background:'+props.data.value">
      <select v-model="enum_current">
        <option v-for="item in enum_data" :value="item">{{ item }}</option>
      </select>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  data: any
}>()

/**
 * 下拉框语法解析
 * 
 * 要求：由于是在 key:string-value:string 模型中，需要用字符串方式表示
 * 
 * 这里我用 `|` 间隔
 */
const enum_data = computed(() => {
  return (props.data.value as string).split("|")
})
if (enum_data.value.length == 0) {
  props.data.value = [""]
}
const enum_current = ref<string>(enum_data.value[0])
</script>

<style scoped>
.dropdown-item {
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;

  padding: 0px 0px;
}
.dropdown-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.dropdown-item .node-item-value {
  height: 24px;
  padding: 0px 0px;
  
  margin: 0;
  border: none;
  box-shadow: none;
  background: none;
}
.dropdown-item .node-item-value select {
  height: 100%;
  margin: 0;
  padding: 2px 4px 2px 10px;
  line-height: calc(24px - 4px);

  border-radius: 12px;
  border: none;
  box-shadow: none;
  color: currentColor;
  background: #222222;
  border: solid 1px #616161;
  appearance: revert; /* 下拉框箭头样式 */
}
</style>
