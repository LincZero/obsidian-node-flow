import {
  EditorView,
  Decoration,         // 装饰
  type DecorationSet, // 装饰集
  WidgetType,         // 装饰器部件

  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { EditorState, Range, RangeSet, StateField } from '@codemirror/state';

// 3. editable-codeblock
import { EditableCodeblock, loadPrism2 } from '../../../NodeFlow/component/general/EditableCodeblock';
import Prism from "prismjs" // 导入代码高亮插件的core（里面提供了其他官方插件及代码高亮样式主题，你只需要引入即可）
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import "prismjs/themes/prism-okaidia.min.css" // 主题, okaidia和tomorrow都是不错黑夜主题
loadPrism2.fn = () => {
  return Prism
}
class EditableCodeblockInCm extends EditableCodeblock {
  emit_save(isUpdateLanguage: boolean, isUpdateSource: boolean): Promise<void> {
    return new Promise((resolve) => {
      
      resolve();
    })
  }
}

/// 自定义CM的装饰器部件
class CodeblockWidget extends WidgetType {
  constructor(
    readonly content: string,
    readonly lang: string,
    readonly from: number,
    readonly to: number,
    readonly updateCallback: (newContent: string) => void
  ) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement('div');
    container.className = 'editable-codeblock-container';
    
    // 创建您的 EditableCodeblock 组件
    const editableCodeblock = new EditableCodeblock(
      this.lang, 
      this.content, 
      container
    );
    
    // 配置 EditableCodeblock
    editableCodeblock.settings.renderEngine = "prismjs";
    editableCodeblock.settings.saveMode = 'oninput';
    editableCodeblock.settings.renderMode = 'textarea';
    
    // 设置更新回调
    // editableCodeblock.onSave = (newContent: string) => {
    //   this.updateCallback(newContent);
    // };
    
    editableCodeblock.render();
    return container;
  }
}

/// 范围选择器 + 装饰集生成器
function create_decorations(view: EditorView, updateCallback: (from: number, to: number, newContent: string) => void): DecorationSet {
  const decorationRange: Range<Decoration>[] = []; // 装饰组，区分 type DecorationSet = RangeSet<Decoration>;
  const state = view.state;
  
  // 遍历文档语法树
  syntaxTree(state).iterate({
    enter(node) {
      // 识别Markdown代码块
      if (node.name === 'FencedCode') {
        const from = node.from;
        const to = node.to;
        const text = state.sliceDoc(from, to);
        
        // 提取代码块内容和语言
        const match = text.match(/^```(\w+)?\n([\s\S]*?)\n```$/);
        if (match) {
          const lang = match[1] || '';
          const content = match[2];

          console.log('test', from, to)
          
          // 创建自定义组件装饰器
          // // v1
          // const decoration = Decoration.mark({class: "cm-line-yellow"})
          // decorationRange.push(decoration.range(from, to));

          // // v2
          const decoration = Decoration.widget({
            widget: new CodeblockWidget(content, lang, from, to, (newContent) => {
              updateCallback(from, to, newContent);
            }),
            side: 1
          });
          decorationRange.push(decoration.range(from)); // 仅from没to，表示插入在from处，而非替换

          // 注意 replace+块 可能出现bug:
          // 原始文本被移除后，CodeMirror 内部依赖的 docView 结构会被破坏。当编辑器尝试执行布局测量（如 measureVisibleLineHeights）时，无法找到被替换区域对应的文档视图

          // v3
          // const decoration = Decoration.replace({
          //   widget: new CodeblockWidget(content, lang, from, to, (newContent) => {
          //     updateCallback(from, to, newContent);
          //   }),
          //   inclusive: true,
          //   block: true,
          // })
          // decorationRange.push(decoration.range(from, to));
        }
      }
    }
  });
  
  return Decoration.set(decorationRange);
}

/**
 * ViewPlugin
 * 
 * @deprecated 时机不对，会在 docView 未完成时就尝试替换装饰器，导致 block replace 行为无法正常进行
 * (如果是 mark 或 widget 则可以正常工作，那还是可以用这种方式的)
 */
export function editableCodeblocks(updateCallback: (from: number, to: number, newContent: string) => void) {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = create_decorations(view, updateCallback);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = create_decorations(update.view, updateCallback);
      }
    }
  }, {
    decorations: v => v.decorations
  });
}

/**
 * EditableCodeblock 的通用 CodeMirror 插件
 * 
 * 使用：一个页面对应一个
 */
export class EditableCodeblockCm {
  view: EditorView;
  mdStr: string;

  constructor(view: EditorView, mdStr: string, updateCallback: (newContent: string) => void) {
    this.view = view
    this.mdStr = mdStr

    this.init_stateField()
  }
  
  init_stateField() {
    /**
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
    // const codeBlockField = StateField.define<DecorationSet>({
    //   create: () => Decoration.none,
    //   update: (decorations, tr) => {
    //     return codeBlockDecorations(this.view, (from, to, newContent) => {

    //     })
    //     // return updateCodeBlockDecorations(decorations, tr, view, updateCallback)
    //   },
    //   provide: f => EditorView.decorations.from(f)
    // });
  }
}
