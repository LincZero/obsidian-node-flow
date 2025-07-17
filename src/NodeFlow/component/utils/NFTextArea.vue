<!-- 
文本编辑块 (低依赖的高通用模块)

特性 - 通用

- Adapt        | 自适应： 高宽、换行、无需手动尺寸。自动判断单行/多行模式，使用不同样式，优化
- Style        | 样式： 黑暗主题、普通文本/代码高亮模式、取消拼写检查
  - Hightlight | 代码高亮
  - [ ] auto color | 文本反色功能 (用于颜色框)
- Input        | 输入法： 支持中文输入法
- Shortcut key | 按键: Tab、Shift Tab、Ctrl + z
- Options      | 渲染方式、保存方式、代码高亮引擎、缩进风格等

特性 - 节点流版本

- nodrag class | 保证聚焦编辑时不会被节点快捷键影响 (ctrl/shift/拖拽等)
- Cache        | 缓存显示： **不要直接用props.data**。会根据情况选择显示cacheValue还是defaultValue

不支持特性 (TODO)

- 撤回：textare支持撤回，但pre-code不支持，缩进等操作也暂不支持撤回
- 最末尾的空白行异常、中文输入异常
- Multi cursors| 多光标
- Extend sytax | 扩展语法。如多行拼接： 使用 `\` 结尾再换行，可以优化显示
-->

<template>
  <div class="nf-textarea-p nodrag nowhell"
    :is-single-line="showValue.split('\n').length < 2"
    :is-cache-value="nfNode?._useNodesData.value.data.runState != 'none' && props.data.cacheValue?.length > 0"
  >
    <div class="scroll-able" ref="ref_el">
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  data: any,
  isHideBorder?: boolean
  codeType?: string
}>(), {
  isHideBorder: false,
  codeType: 'json'
})

// #region EditableCodeblock

// sync0, avoid circular updates
let i2o_flag: boolean = false
let o2i_flag: boolean = false

import { EditableCodeblock, loadPrism2 } from '../general/EditableCodeblock';
import Prism from "prismjs" // 导入代码高亮插件的core（里面提供了其他官方插件及代码高亮样式主题，你只需要引入即可）
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import "prismjs/themes/prism-okaidia.min.css" // 主题, okaidia和tomorrow都是不错黑夜主题

loadPrism2.fn = () => {
  return Prism
}

class EditableCodeblockInVue extends EditableCodeblock {
  constructor(codeType: string, data: any, container: HTMLElement) {
    super(codeType, data, container)
    this.settings.renderEngine = 'prismjs'
    this.settings.saveMode = 'oninput'
    this.settings.renderMode = 'textarea' // 'editablePre' 可选
    // this.settings.renderMode = 'editablePre'
  }

  // sync1, inner -> outer (vue data)
  override emit_save(isUpdateLanguage: boolean, isUpdateSource: boolean): Promise<void> {
    if (o2i_flag) { o2i_flag = false; return new Promise<void>((resolve, reject) => {}) }
    return new Promise<void>((resolve, reject) => {
      i2o_flag = true
      props.data.value = this.outerInfo.source ?? this.innerInfo.source_old
    })
  }
}

const ref_el = ref<HTMLElement|null>(null)
let editableCodeblock: EditableCodeblockInVue|null = null
onMounted(() => {
  if (!ref_el.value) return
  editableCodeblock = new EditableCodeblockInVue(props.codeType??'', props.data.value, ref_el.value)
  editableCodeblock.render()
})

// sync2, outer (vue data) -> inner
import { watch } from 'vue';
import { NFNode } from './NFNode';
const nfNode: NFNode|null = NFNode.useGetNFNode(props.data.parentId)
const showValue = computed(() => { // value or cacheValue
  if (nfNode?._useNodesData.value.data.runState != 'none' && props.data.cacheValue) {
    return props.data.cacheValue
  } else {
    return props.data.value
  }
})
watch(showValue, (showValue) => {
  if (!ref_el.value) return
  if (!editableCodeblock) return
  if (i2o_flag) { i2o_flag = false; return }
  o2i_flag = true
  editableCodeblock.outerInfo.source = showValue
  editableCodeblock.emit_render(ref_el.value.querySelector('.editable-codeblock'))
})

// const showValue = ref<string>(props.data.value)
// showValue分两个更新来源，以便查看i2o_flag和o2i_flag，避免循环更新
// watch([
//   () => nfNode?._useNodesData.value.data.runState,
//   () => props.data.cacheValue
// ], ([runState, cacheValue]) => {
//   if (!ref_el.value) return
//   if (!editableCodeblock) return
//   if (i2o_flag) { i2o_flag = false; return }
//   o2i_flag = true
//   editableCodeblock.outerInfo.source = showValue
//   editableCodeblock.emit_render(ref_el.value.querySelector('.editable-codeblock'))
// })
// #endregion
</script>

<style>
/* 
- .nf-textarea-p lock标志层
- .scroll-able 滚动容器
  - .editable-codeblock 可溢出部分
 */
.nf-textarea-p {
  max-height: 700px;
  width: 100%;
}
.nf-textarea-p textarea {
  /* resize: vertical !important; */
}

.nf-textarea-p[is-single-line='false'] .scroll-able {
  resize: vertical !important;
  overflow-y: auto;
  width: 100%;
}

/* 单行 */
.nf-textarea-p[is-single-line='true'] pre,
.nf-textarea-p[is-single-line='true'] textarea {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  background: none !important;
  outline: none !important;
}

.nf-textarea-p:has(textarea:focus),
.nf-textarea-p:has(pre:focus),
.nf-textarea-p:has(pre>code:focus) {
  outline: 1px double #0060DF;
}

/* 锁，标注显示为cacheValue而非cache的情况 */
.nf-textarea-p {
  position: relative;
}
.nf-textarea-p[is-cache-value='true']::before {
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  line-height: 16px;
  position: absolute;
  top: -6px;
  right: -6px;

  background: rgba(31, 139, 139, 0.8);
  border-radius: 50%;
  opacity: 0.8;
  /* content: "L"; */
  color: white;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='-1 -3 26 26' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='11' x='3' y='11' rx='2' ry='2'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E");
  text-align: center;
  /* cursor: pointer; */
  z-index: 2;
}
</style>

<!-- old -->
<style scoped>
.nf-textarea {
  /* max-width: 500px; */
  max-height: 700px;
  /* height: calc(24px - 4px); 可以被撑高*/
  box-sizing: border-box;
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

.nf-textarea.mulline-value {
  width: 100%;
}
.nf-textarea:not(.mulline-value) {
  height: 24px !important; /* (20+0+2)+4 单行模式下覆盖js的计算值 */
  padding-top: 1px;
  padding-bottom: 1px;
}

/* 锁，标注显示为cacheValue而非cache的情况 */
.nf-textarea:disabled, .nf-textarea:read-only, .nf-textarea[is-cache-value='true'] {
  /* color: gray !important; */
}
.nf-textarea:disabled::before, .nf-textarea:read-only::before, .nf-textarea[is-cache-value='true']::before {
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  line-height: 16px;
  position: absolute;
  top: -6px;
  right: -6px;

  background: rgba(31, 139, 139, 0.8);
  border-radius: 50%;
  opacity: 0.8;
  /* content: "L"; */
  color: white;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='-1 -3 26 26' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='11' x='3' y='11' rx='2' ry='2'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E");
  text-align: center;
  /* cursor: pointer; */
}
</style>
