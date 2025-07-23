# 可编辑块

## 介绍

使指定html元素成为一个高级的可编辑块，并支持许多有用特性。

许多特性是普通的 `contenteditable=true` 元素做不到的

### 功能

包括但不限于: (一些在TODO中)

- 基本编辑功能
  - Input           | 输入法： 支持中文输入法、输入组合
  - Options         | 渲染方式、保存方式、代码高亮引擎、缩进风格等
  - Style           | 黑暗模式、取消拼写检查
  - Adapt           | 自适应： 高宽、换行、无需手动尺寸。自动判断单行/多行模式，使用不同样式，优化
  - [] Shortcut     | 快捷键/按键: Tab、Shift Tab、Ctrl + z、方向键切换编辑区
    textare支持撤回，但pre-code不支持，缩进等操作也暂不支持撤回
- 代码内容
  - Hightlight      | 代码高亮与编辑，支持Shiki和Prismjs引擎
- Markdwon内容
  - Hightlight      | Markdown高亮与编辑，支持CodeMirror引擎
- 其他内容
  - [] auto color   | 文本反色功能 (用于颜色框)
- 高级、嵌套
  - Nest            | 嵌套: 可编辑器包含编辑器
  - Multi Block     | 多个编辑器之间光标跳转、选区跨越
  - Save            | 可作为内嵌编辑器，且将修改内容传输到上游
  - Extends         | 支持扩展
  - [] Multi cursors| 多光标
  - [] Extend sytax | 扩展语法。如多行拼接： 使用 `\` 结尾再换行，可以优化显示

### 应用

可编辑代码块、可编辑Markdown块 (codemirror)

或尽一步地作为Markdwon编辑区域中的可编辑引用块、可编辑列表等

## 使用


如需开启XX功能，pnpm isntall ?
















## 可编辑代码块 - 设置

### 渲染引擎

Shiki, PrismJS，CodeMirror

- Shiki: 一个强大的代码高亮引擎。
  - 功能更加强大，更多主题和插件
  - 插件: meta标注、注释型标注。行高亮、单词高亮、差异化标注、警告/错误标注
  - 主题：近80种配色方案：你可以在 https://textmate-grammars-themes.netlify.app 中可视化选择
  - *min版不包含该库，无法选用该引擎*
- PrismJS: Obsidian默认在阅读模式中使用的渲染引擎。
  - 当选择这个的时候，你也可以选用min版本的本插件，拥有更小的插件体积和更快的加载速度
  - 可以与使用obsidian主题的代码配色，可以与一些其他的obsidian风格化插件配合
- CodeMirror: Obsidian默认在实时模式中使用的渲染引擎。当前插件不支持
  - 适合实时渲染，性能尚可
  - 但代码分析比较粗糙，高亮层数少，效果较差

### 渲染方式

- textarea (默认)
  - 优点:
    允许实时编辑，typora般的所见即所得的体验
    支持编辑注释型高亮
    同为块内编辑的obsidian新版本md表格，采用的是这种方式 (但ob表格编辑时不触发重渲染)
  - 缺点:
    原理上是将textarea和pre完美重叠在一起，但容易受主题和样式影响导致不完全重叠
    textarea的横向滚动无法与pre的同步 (修复: inline-block包括 inline-block + 100%width 的pre和textarea)
- editable pre
  - 优点:
    允许实时编辑，typora般的所见即所得的体验
    原理上是 `code[contenteditable='true']`
  - 缺点:
    程序上需要手动处理光标位置
    *不支持实时编辑注释型高亮*
- pre
  - 缺点:
    不允许实时编辑
- codemirror
  - 缺点:
    V0.5.0及之前唯一支持的方式，不允许实时编辑

> [!warning]
> 
> 如果选用了可实时编辑的方案，最好能在仓库定期备份的情况下使用，避免意外

### 自动保存方式

- onchange
  - 优点:
    更好的性能
    程序实现简单更简单，无需手动管理光标位置
  - 缺点:
    延时保存，特殊场景可能不会保存修改: 程序突然崩溃。当光标在代码块中时，直接切换到阅读模式，或关闭当前窗口/标签页
- oninput
  - 优点:
    实时保存，数据更安全
    同为块内编辑的obsidian新版本md表格，采用的是这种方式
  - 缺点:
    性能略差? 每次修改都要重新创建代码块
    程序需要手动管理光标位置，手动防抖。
    需要注意输入法问题，输入候选阶段也会触发 `oninput`

### Shiki扩展语法

详见: https://shiki.style/packages/transformers (可切换至中文)

这是个简单的语法总结:

- notaion 注释型标注
  - diff:            `// [!code ++]` `// [!code --]` 差异化
  - highlight:       `// [!code hl]` `// [!code highlight]` 高亮
  - word highlight:  `// [!code word:<Word>:<number>]` `// [!code word:Hello:1]` 单词高亮
  - focus:           `// [!code focus]` 聚焦
  - error level:     `// [!code error]` `// [!code warning]` 警告/错误
  - (mul line):      `// [!code highlight:3]` (多行)
- meta 元数据型标注
  - highlight:       `{1,3-4}`
  - word highlight   `/<Word>/` `/Hello/`

示例: see [../README.md](../README.md) or [Shiki document](https://shiki.style/packages/transformers)

---

## 一些开发杂项（不用翻译，仅自己看）

### 调研同类产品避免撞车

- CodeMirror
  - 官网: https://codemirror.net/
  - github: cm5开源，cm6不开
- Monaco Editor (VSCode同款)
  - 官网/试用: https://microsoft.github.io/monaco-editor/
  - github: https://github.com/microsoft/monaco-editor ⭐43.3k
- Tiptap（富文本方向）
  - 适用于混合内容（文本+代码块）

| 项目            | 核心优势                 | 适用场景                                |
| ------------- | -------------------- | ----------------------------------- |
| CodeMirror    | 高度模块化、可定制性强、性能优异     | 需要深度整合和定制的代码编辑功能，作为应用的核心组件。         |
| Monaco Editor | 功能强大、开箱即用、IDE级体验     | 需要一个完整的、功能丰富的代码编辑器，对体积不敏感。          |
| Tiptap        | 无头框架、UI完全自定义、富文本体验优秀 | 文档/笔记类应用，需要将代码块作为内容的一部分，对整体编辑体验要求高。 |
