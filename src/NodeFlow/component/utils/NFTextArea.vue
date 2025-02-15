<!-- 
一个文本编辑块

特性：

- 自适应： 高宽、换行、无需手动尺寸
- 样式： 黑暗主题、代码高亮 (TODO)、取消拼写检查
-->

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  data: any,
  isHideBorder?: boolean
}>(), {
  isHideBorder: false
})

// 可写属性
import { useNode, useVueFlow } from '@vue-flow/core'
const { updateNodeData } = useVueFlow()
if (!props.data.value) props.data.value = ''
const writable_value = computed({
  get: () => props.data.value,
  set: (value) => { props.data.value = value }, // 不触发数据驱动则无需 return updateNodeData(props.id, props.data)
})

// 自动调整高度。当大于初始的(rows、cols值)时，才会(出现overflow然后)撑开
// 注意：必须在nextTick里执行，否则存在问题：变大正常，变小则总多一行
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
const TextArea3 = ref(null)
onMounted(()=>{
  nextTick(() => {
    autoSize(TextArea3.value)
  })
})
function handleInput(e:any) {
  nextTick(() => {
    autoSize(e.target)
  })
}
</script>

<template>
  <textarea
    class="nf-textarea"
    :class="{'without-border' : isHideBorder}"
    v-model="writable_value"
    :rows="writable_value.split('\n').length"
    cols="10"
    spellcheck="false"
    @input="handleInput"
    ref="TextArea3"
  ></textarea>
</template>


<style scoped>
textarea.nf-textarea {
  max-width: 600px;
  max-height: 900px;
  overflow: auto;
  /* height: calc(24px - 4px); 可以被撑高*/
  line-height: calc(24px - 4px);
  margin: 0;
  padding: 0 12px;
  
  white-space: pre;
  resize: none; /* 禁止用户手动调整大小 */
  border-radius: 12px;
  
  background: #222222;
  color: currentColor;
  border: solid 1px #616161;
}
textarea.nf-textarea.without-border {
  border: none;
  background: none;
}
</style>
