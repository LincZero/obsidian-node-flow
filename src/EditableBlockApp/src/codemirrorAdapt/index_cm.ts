/** EditableCodeblock 的通用 CodeMirror 插件
 * 
 * 逻辑:
 * 
 * - App -> 创建CM ->
 * - 使用EditableCodeblockCm CM插件 ->
 * - 创建CodeblockWidget部件 ->
 * - 创建EditableCodeblockInCm 组件
 * 
 * TODO fix 多个代码块时，编辑非首个代码块后，光标会跳到首个代码块
 */

import {
  EditorView,
  Decoration,         // 装饰
  type DecorationSet, // 装饰集
  WidgetType,         // 装饰器部件
} from '@codemirror/view';
import {
  EditorState,
  Range,
  StateEffect,
  StateField,
  Transaction,
} from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

import { CodeblockWidget, QuoteWidget, global_store } from './widget'

type RangeSpec_Codeblock = {
  type: 'codeblock';
  fromPos: number;
  toPos: number;
  text_content: string; // 代码块内容
  text_lang: string; // 代码块语言
}
type RangeSpec_Quote = {
  type: 'quote';
  fromPos: number;
  toPos: number;// 不包括尾换行符
  text_content: string; // 引用块内容，去除引用块前缀
  text_mark: string; // 引用块标志
}

/// 自定义CM的装饰器部件。可分发为具体不同类型的部件
function create_widget (
  state: EditorState, oldView: EditorView, rangeSpec: RangeSpec_Codeblock | RangeSpec_Quote,
  updateContent_all: (newContent: string) => void,
  focusLine: number|null = null,
): WidgetType {
  if (rangeSpec.type == 'codeblock') {
    return new CodeblockWidget(state, oldView, rangeSpec.text_content, rangeSpec.text_lang, rangeSpec.fromPos, rangeSpec.toPos, updateContent_all, focusLine)
  } else {
    return new QuoteWidget(state, oldView, rangeSpec.text_content, rangeSpec.text_mark, rangeSpec.fromPos, rangeSpec.toPos, updateContent_all, focusLine)
  }
}

let is_prev_cursor_in = false
/** 范围选择器 + 装饰集生成器
 * 
 * @details
 * 注意三种装饰器形式:
 * - mark
 * - widget
 * - replace
 * 中， replace+块 可能出现bug:
 * > 原始文本被移除后，CodeMirror 内部依赖的 docView 结构会被破坏。
 * > 当编辑器尝试执行布局测量（如 measureVisibleLineHeights）时，无法找到被替换区域对应的文档视图
 * > 解决方法: 确保进入该函数时，docView 已经完成了。即外部可以用 StateField 而非 ViewPlugin 来实现
 */
function create_decorations(
  state: EditorState, oldView: EditorView,
  updateContent_all: (newContent: string) => void,
  tr: Transaction, // TODO tr和decorationSet 可以改为可选，如果忽略，则完全重建
  decorationSet: DecorationSet = Decoration.none,
): DecorationSet {
  // #region 1. 得到旧装饰集v2 (范围映射 旧装饰集 得到)
  try {
    decorationSet = decorationSet.map(tr.changes)
  } catch (e) {
    // 如果将tr更新的新旧对象错误混用，会出现这种问题 (之前修复了光标位置延时问题后，触发了这个问题)
    console.warn('decorationSet map error, maybe paste ab at end', e)
  }
  // #endregion

  const list_rangeSpec: (RangeSpec_Codeblock|RangeSpec_Quote)[] = []

  // #region 2. 得到新范围集 (更新后)
  syntaxTree(state).iterate({ // 遍历文档语法树
    enter(node) {
      // 识别Markdown代码块 (自带的只会识别在根部的，不会识别被嵌套的)
      if (node.name === 'FencedCode') {
        const fromPos = node.from
        const toPos = node.to
        const text = state.sliceDoc(fromPos, toPos)
        
        // 提取代码块内容和语言
        const match = text.match(/^```(\w+)?\n([\s\S]*?)\n```$/)
        if (!match) return
        const lang = match[1] || ''
        const content = match[2]
        if (lang != 'js') return // TODO 临时，便于查看使用和不使用的区别
        
        list_rangeSpec.push({
          type: 'codeblock',
          fromPos,
          toPos,
          text_content: content,
          text_lang: lang
        })
      }
      // else if (node.name === 'QuoteMark') {
      //   console.log('QuoteMark', node.from, node.to, state.sliceDoc(node.from, node.to))
      // }
      else {
        // 注意: 原规则不是基于块的，而是基于字符的。
        // 并不能很好地选择整个块的范围 (如引用块)，需要自行解析
        // Document, ATXHeading1, HeaderMark, CodeInfo, CodeText
        // Paragraph, InlineCode, CodeMark, StrongEmphasis, EmphasisMark, Emphasis
        // BulletList, ListItem, ListMark, QuoteMark
        // console.log('node.name', node.name)
      }
    }
  })
  // #endregion

  // #region 2. 得到新范围集 (更新后) 2
  let current_quote: RangeSpec_Quote|null = null
  let posCount: number = 0 // 记录该行之前的累计字符数
  for (const line of state.doc.toString().split('\n')) {
    // 非引用块。只识别在根部的，不会识别被嵌套的
    if (!line.startsWith('> ')) {
      if (current_quote) {
        list_rangeSpec.push(current_quote)
        current_quote = null
      }
      posCount += line.length + 1; continue // +1 for \n
    }
    // 引用块
    if (!current_quote) {
      current_quote = ({
        type: 'quote',
        fromPos: posCount,
        toPos: posCount + line.length,
        text_content: line.slice(2),
        text_mark: '> '
      })
    } else {
      current_quote.toPos = posCount + line.length
      current_quote.text_content += '\n' + line.slice(2)
    }
    posCount += line.length + 1; continue // +1 for \n
  }
  // 循环尾检测
  if (current_quote) {
    list_rangeSpec.push(current_quote)
    current_quote = null
  }
  // #endregion

  // #region 3. 得到新装饰集、变化集  (范围集 --生成--> 装饰集)
  // 要判断复用，所以分开范围集和装饰集
  const cursorRange = tr?.state.selection.main // TODO 目前只支持单光标
  const cursorRange_last = oldView.state.selection.main
  let list_decoration_nochange:Range<Decoration>[] = [] // 装饰集 - 无光标变动部分 -> 不会导致刷新
  let list_decoration_change:Range<Decoration>[] = []   // 装饰集 - 有光标变动部分 -> 会导致刷新
  let is_current_cursor_in = false // 当前光标是否在装饰集内
  for (const rangeSpec of list_rangeSpec) {
    // (1) 判断光标与该范围项的关系
    let isCursorIn = false // 当前光标是否在装饰集内
    let isCursonIn_last = false // 旧光标是否在装饰集内
    if (cursorRange.from >= rangeSpec.fromPos && cursorRange.from <= rangeSpec.toPos
        || cursorRange.to >= rangeSpec.fromPos && cursorRange.to <= rangeSpec.toPos
    ) {
      isCursorIn = true
    }
    if (cursorRange_last.from >= rangeSpec.fromPos && cursorRange_last.from <= rangeSpec.toPos
      || cursorRange_last.to >= rangeSpec.fromPos && cursorRange_last.to <= rangeSpec.toPos
    ) {
      isCursonIn_last = true
    }

    // (2) 创建装饰项，并添加到装饰集
    // 光标在内 (一直在内或从外进入)
    if (isCursorIn) {
      is_current_cursor_in = true

      // 策略一：该段使用源码编辑 - 变化
      // const decoration = Decoration.mark({class: "cm-line-yellow"})
      // list_decoration_change.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))

      // 策略二: 光标移入 - 变化
      // 其实最佳方法是不变化，直接把光标移入widget内。但似乎cm无法从装饰项获取到widget对象
      // 只能重新生成
      let line = 0
      if (cursorRange.from == rangeSpec.toPos || cursorRange.to == rangeSpec.toPos) {
        line = -1
      }
      const decoration = Decoration.replace({
        widget: create_widget(state, oldView, rangeSpec, updateContent_all, line),
        // inclusive: true, block: true, // 区别: 光标上下移动会跳过 block，但这个也能自行监听且感觉更合适
      })
      list_decoration_change.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))
    }
    // 光标从内出来
    else if (isCursonIn_last) {
      const decoration = Decoration.replace({
        widget: create_widget(state, oldView, rangeSpec, updateContent_all),
        // inclusive: true, block: true, // 区别: 光标上下移动会跳过 block，但这个也能自行监听且感觉更合适
      })
      list_decoration_change.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))
    }
    // 光标一直在外 - 不变化
    else {
      const decoration = Decoration.replace({
        widget: create_widget(state, oldView, rangeSpec, updateContent_all),
        // inclusive: true, block: true, // 区别: 光标上下移动会跳过 block，但这个也能自行监听且感觉更合适
      })
      list_decoration_nochange.push(decoration.range(rangeSpec.fromPos, rangeSpec.toPos))
    }
  }
  // #endregion

  // #region 4. 检查变化集
  // 若没有变化项，可提前返回
  // 变化项包括: 装饰集变化, 光标进出范围集变化，编辑模式变化
  if (
    list_decoration_change.length == 0 &&
    is_current_cursor_in == is_prev_cursor_in &&
    (list_decoration_nochange.length > 0 && decorationSet != Decoration.none)
  ) {
    return decorationSet
  }
  is_prev_cursor_in = is_current_cursor_in
  // #endregion

  // #region 5. 用变化集 + 新装饰集 + 旧装饰集v2 --> 得到 旧装饰集v3
  let debug_count1 = 0, debug_count2 = 0, debug_count3 = 0, debug_count4 = 0
  // (1) 删除变化项
  decorationSet = decorationSet.update({
    filter(from, to, value) { // 全部删掉，和不变集相同的则保留
      for (let i = 0; i < list_decoration_nochange.length; i++) {
        const item = list_decoration_nochange[i]
        if (item.from == from && item.to == to) {
          debug_count1++
          list_decoration_nochange.splice(i, 1); return true;
        }
      }
      debug_count1++
      debug_count2++
      return false
    },
  })
  // (2) 新增变化项1
  // 测出了存在一个没有光标变化的新ab块 (在黏贴一段ab块文本会出现这种情况)
  for (const item of list_decoration_nochange) {
    debug_count3++
    decorationSet = decorationSet.update({
      add: [item],
    })
  }
  // (3) 新增变化项2
  for (const item of list_decoration_change) {
    debug_count4++
    decorationSet = decorationSet.update({
      add: [item],
    })
  }
  // console.log(`CodeMirror 装饰集变化: ${debug_count1} -${debug_count2}+${debug_count3}+${debug_count4}`)
  // #endregion

  return decorationSet
}

/**
 * EditableCodeblock 的通用 CodeMirror 插件
 * 
 * CodeMirror插件入口
 * 
 * 使用：一个页面对应一个
 */
export class EditableCodeblockCm {
  view: EditorView;
  state: EditorState;
  mdStr: string;
  isRoot: boolean = false; // 是否是根部的cm
  /** 强制更新全部内容
   * 除非不得已，尽量不要使用这里传入的 updateContent_all，因为这会导致全部更新、丢失光标位置。
   * 尽量使用 cm 的tr+dispatch方法进行局部更新
   */
  updateContent_all: (newContent: string) => void;

  constructor(view: EditorView, mdStr: string, updateContent_all: (newContent: string) => void, isRoot: boolean = false) {
    this.view = view
    this.state = view.state
    this.mdStr = mdStr
    this.updateContent_all = updateContent_all
    this.isRoot = isRoot
    if (this.isRoot) global_store.root_state = this.state

    this.init_stateField()
  }
  
  init_stateField() {
    /** StateField
     * @details
     * 装饰器插件有两个主要实现方式
     * - 一个是ViewPlugin或其他
     * - 一个是StateField
     * 这两都可以传作为 cm 的 extensions 参数，或在外部通过钩子进行使用
     * 
     * 一开始我使用前者。DecorationSet.mark 和 DecorationSet.widget 都可以正常工作。
     * 但在使用 DecorationSet.replace 时，会存在非报错bug。
     * 因为原文本 (docView) 未完成。想替换时无法确认要被替换的文本范围。
     * 
     * 而后者可以。因为其 create 阶段不进行渲染，在update阶段时，docView 已经完成了。
     * 此时可以正常 replace
     */
    const codeBlockField = StateField.define<DecorationSet>({
      create: (editorState:EditorState) => Decoration.none,
      update: (decorationSet:DecorationSet, tr:Transaction) => {
        if (this.isRoot) global_store.root_state = tr.state
        // 不要直接用 this.view.state，会延后，要用 tr.state
        this.state = tr.state;
        return create_decorations(tr.state, this.view, this.updateContent_all, tr, decorationSet)
      },
      provide: (f: StateField<DecorationSet>) => EditorView.decorations.from(f)
    });

    // 用 StateEffect 来添加 StateField
    let stateEffects: StateEffect<unknown>[] = []
    if (!this.state.field(codeBlockField, false)) {
      stateEffects.push(StateEffect.appendConfig.of(
        [codeBlockField] 
      ))
    }
    this.view.dispatch({effects: stateEffects}) // 派发StateField
  }
}

// /**
//  * ViewPlugin
//  * 
//  * @deprecated 时机不对，会在 docView 未完成时就尝试替换装饰器，导致 block replace 行为无法正常进行
//  * (如果是 mark 或 widget 则可以正常工作，那还是可以用这种方式的)
//  */
// export function create_viewPlugin(updateContent_all: (newContent: string) => void) {
//   return ViewPlugin.fromClass(class {
//     decorations: DecorationSet;

//     constructor(view: EditorView) {
//       this.decorations = create_decorations(view.state, updateContent_all);
//     }

//     update(update: ViewUpdate) {
//       if (update.docChanged || update.viewportChanged) {
//         this.decorations = create_decorations(update.view.state, updateContent_all);
//       }
//     }
//   }, {
//     decorations: v => v.decorations
//   });
// }
