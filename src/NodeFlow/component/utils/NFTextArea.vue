<!-- 
一个文本编辑块

特性：

- 自适应： 高宽、换行、无需手动尺寸
- 样式： 黑暗主题、代码高亮 (TODO)、取消拼写检查
- TODO 多行拼接： 使用 `\` 结尾再换行，可以优化显示
- TODO Tab键
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

// --------------------- textarea ----------------------------------

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
const ref_textArea = ref(null)
onMounted(()=>{
  nextTick(() => {
    autoSize(ref_textArea.value)
  })
})
function handleInput(e:any) {
  nextTick(() => {
    autoSize(e.target)
  })
}

// --------------------- pre code ----------------------------------

// 代码高亮
import Prism from "prismjs" // 导入代码高亮插件的core（里面提供了其他官方插件及代码高亮样式主题，你只需要引入即可）
import 'prismjs/components/prism-javascript'; // 高亮类型
import "prismjs/themes/prism-okaidia.min.css" // 主题, okaidia和tomorrow都是不错黑夜主题
// console.log('Prism', typeof Prism) // Prism哪怕用不上也要调用一下，不然会被优化掉 (很奇怪)
// 使用方法:
// await nextTick(); // 需要保证dom内容是正确的
// Prism.highlightElement(ref_code.value) // 本质是修改ref_code.value.innerHTML (二选一)
// ref_code.value.innerHTML = Prism.highlight(rawText, Prism.languages.javascript, 'javascript'); // 本质是修改ref_code.value.innerHTML (二选一)  
const ref_pre = ref<HTMLElement|null>(null)
const ref_code = ref<HTMLElement|null>(null)
onMounted(async ()=>{
  await nextTick()
  if (!ref_code.value) return
  Prism.highlightElement(ref_code.value)
})
async function handlePreInput(e: Event) { // 这里不用e，假设必为ref_pre、ref_code，简化流程
  if (!ref_pre.value) return
  if (!ref_code.value) return

  // 光标1 - 保存
  const savedPos = handlePreInput_saveCursorPosition(ref_pre.value)

  // 文本 - 更新内容
  const rawText = ref_code.value.textContent || ''
  writable_value.value = rawText // or const emit = defineEmits(['update:writable']); emit('update:writable', rawText)

  await nextTick(); // 等待dom里的内容改变

  // 文本 - 代码高亮
  Prism.highlightElement(ref_code.value)

  // 光标2 - 恢复
  if (savedPos) { handlePreInput_restoreCursorPosition(ref_pre.value, savedPos.start, savedPos.end) }
}
// 代码高亮 - 保存光标位置
function handlePreInput_saveCursorPosition(container: Node) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null
  
  const range = selection.getRangeAt(0)
  const preRange = document.createRange()
  preRange.selectNodeContents(container)
  preRange.setEnd(range.startContainer, range.startOffset)
  const start = preRange.toString().length
  
  return {
    start,
    end: start + range.toString().length
  }
}
// 代码高亮 - 恢复光标位置
function handlePreInput_restoreCursorPosition(container: Node, start: number, end: number) {
  const selection = window.getSelection()
  const range = document.createRange()
  
  let charIndex = 0
  let foundStart = false
  let foundEnd = false

  function traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nextIndex = charIndex + (node.nodeValue?.length || 0)
      
      if (!foundStart && start >= charIndex && start <= nextIndex) {
        range.setStart(node, start - charIndex)
        foundStart = true
      }
      if (foundStart && !foundEnd && end >= charIndex && end <= nextIndex) {
        range.setEnd(node, end - charIndex)
        foundEnd = true
      }
      charIndex = nextIndex
    } 
    else {
      for (const child of node.childNodes) {
        traverse(child)
        if (foundEnd) break
      }
    }
  }

  traverse(container)
  selection?.removeAllRanges()
  selection?.addRange(range)
}
</script>

<template>
  <div>
    <pre
      ref="ref_pre"
      @input="handlePreInput"
      v-if="codeType!=''"
      class="nf-textarea"
      :class="{'without-border' : isHideBorder}"
      contenteditable="true"
      spellcheck="false"
      :title="'cacheValue: '+data.cacheValue"
    ><!-- 注意保证pre和code之间没有空格
      --><code
        ref="ref_code"
        :class="'language-'+codeType"
        v-html="writable_value"></code><!--
    --></pre>
    <textarea
      ref="ref_textArea"
      @input="handleInput"
      v-model="writable_value"
      v-if="codeType==''"
      class="nf-textarea"
      :class="{'without-border' : isHideBorder}"
      spellcheck="false"
      :title="'cacheValue: '+data.cacheValue"
      :rows="writable_value.split('\n').length"
      cols="10"
    ></textarea>
  </div>
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
  border-radius: 12px;
}
pre.nf-textarea {
  border-radius: 6px;
}
</style>
