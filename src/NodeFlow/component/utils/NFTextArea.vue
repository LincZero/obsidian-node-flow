<!-- 
一个文本编辑块

特性：

- 自适应： 高宽、换行、无需手动尺寸
- 样式： 黑暗主题、代码高亮 (TODO)、取消拼写检查
- TODO 多行拼接： 使用 `\` 结尾再换行，可以优化显示
-->

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  data: any,
  isHideBorder?: boolean
  codeType?: string
}>(), {
  isHideBorder: false,
  codeType: ''
})

// 可写属性
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

// 代码高亮
import Prism from "prismjs" // 导入代码高亮插件的core（里面提供了其他官方插件及代码高亮样式主题，你只需要引入即可）
import 'prismjs/components/prism-javascript'; // 高亮类型
import "prismjs/themes/prism-okaidia.min.css" // 主题, okaidia和tomorrow都是不错黑夜主题
// console.log('Prism', typeof Prism) // Prism哪怕用不上也要调用一下，不然会被优化掉 (很奇怪)
function handleInput2(e:any) {
  Prism.highlightElement(e.target); // 但这样会重置光标
}
function handleInput3(e:any) {}
// function highlightCode() {
//   Prism.highlightElement(this.$refs.codeBlock);
// }
// console.log(`!!${writable_value.value}!!`)
</script>

<template>
  <!-- 这里加一个空pre就出现一堆警告……很奇怪 -->
  <pre
    v-if="codeType!=''"
    class="nf-textarea"
    :class="{'without-border' : isHideBorder}"
    contenteditable="true"
    @input="handleInput3"
  >
    <code :class="'language-'+codeType" v-html="writable_value"></code>
  </pre>
  <textarea
    v-if="codeType==''"
    class="nf-textarea"
    :class="{'without-border' : isHideBorder}"
    v-model="writable_value"
    :rows="writable_value.split('\n').length"
    cols="10"
    spellcheck="false"
    @input="handleInput"
    ref="TextArea3"
    :title="'cacheValue: '+data.cacheValue"
  ></textarea>
</template>

<style scoped>
.nf-textarea {
  max-width: 500px;
  max-height: 900px;
  /* height: calc(24px - 4px); 可以被撑高*/
  line-height: calc(24px - 4px);
  margin: 0;
  padding: 0 12px;
  
  white-space: pre;
  overflow: auto;
  resize: none; /* 禁止用户手动调整大小 */
  border-radius: 12px;
  
  border: solid 1px #616161;
}
.nf-textarea:hover {
  cursor: text;
}
.nf-textarea.without-border {
  border: none;
  background: none;
}

textarea.nf-textarea {
  background: #222222;
  color: currentColor;
}
</style>
