<!-- 默认项 -->

<template>
  <div ref="TextArea2" :class="'default-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <textarea
      v-if="props.data.value"
      class="node-item-value"
      :value="props.data.value"
      :rows="props.data.value.split('\n').length"
      cols="10"
      @input="handleInput"
      ref="TextArea3"
    ></textarea>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
import { nextTick, onMounted, ref } from 'vue';
const TextArea3 = ref(null) // 可能由于v-if而不存在
const TextArea2 = ref(null)

function handleInput(e:any) {
  autoSize(e.target)
}
/// 自动调整高度。当大于初始的(rows、cols值)时，才会(出现overflow然后)撑开
/// 存在问题：只能变大不能变小
function autoSize(el:HTMLElement) {
  if (!el) { return }
  el.style.height = 'auto';
  if (el.scrollHeight) {
    // 这里有个无理的东西，当只有一行时，值会偏大。预期20，实际25。在想是不是因为滚动条个上下两端的占位的原因
    el.style.height = (el.scrollHeight<30 ? "20px" : el.scrollHeight + 'px');
  }
  el.style.width = 'auto';
  if (el.scrollWidth) {
    // 12是横向padding右侧的值
    el.style.width = el.scrollWidth + 12 + 'px';
  }
  // document.getElementsByName('del' + el.name)
  //   .forEach(value => value.style.marginTop = el.scrollHeight + 'px');
}
onMounted(()=>{
  // console.error("奇怪的错误，初始找不到TextAreaRef", TextArea3.value, TextArea2.value);
  autoSize(TextArea3.value)
  nextTick(() => {
    autoSize(TextArea3.value)
  })
})
</script>

<style scoped>
.default-item {
  /* layout */
  box-sizing: border-box;
  min-height: 24px;
  height: auto;

  padding: 2px 0px;
}
.default-item.has-value {
  padding: 1px 0;
  border: solid 1px #616161;
  border-radius: 13px;
  background-color: #222222;
}
.default-item.has-value .node-item-name { padding: 0 12px; }
.default-item.has-value .node-item-value { padding: 0 12px; }

.node-item-name {
  /* height: calc(24px - 4px); 可以被撑高*/
  line-height: calc(24px - 4px);
}
.node-item-value {
  /* height: calc(24px - 4px); 可以被撑高*/
  line-height: calc(24px - 4px);
  
  background: none;
  border: none;
  margin: 0;
  margin-left: 4px;
}
textarea.node-item-value {
  /* overflow: auto; */
  overflow: hidden;
  white-space: pre;
  resize: none; /* 禁止用户手动调整大小 */
  border-radius: 12px;
  line-height: 20px;
}

/* 有i/o类型时 */
.default-item .node-item-value { /* default/input/i */
  text-align: right;
  margin-left: 8px;
  margin-right: 0;
}
.default-item.output .node-item-value, .default-item.o .node-item-value {
  text-align: left;
  margin-left: 0;
  margin-right: 8px;
}
</style>
