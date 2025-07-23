# EditableBlock

## Introduction

Make the specified HTML element into a sophisticated editable block and support many useful features.

Many features cannot be achieved by ordinary elements with `contenteditable=true` enabled.

### Feat

Including but not limited to: (一些在TODO中)

- 基本编辑功能
  - Input         | 输入法： 支持中文输入法、输入组合
  - Options       | 渲染方式、保存方式、代码高亮引擎、缩进风格等
  - Style         | 黑暗模式、取消拼写检查
  - Adapt         | 自适应： 高宽、换行、无需手动尺寸。自动判断单行/多行模式，使用不同样式，优化
  - [ ] Shortcut key | 按键: Tab、Shift Tab、Ctrl + z
    textare支持撤回，但pre-code不支持，缩进等操作也暂不支持撤回
- 代码内容
  - Hightlight    | 代码高亮与编辑，支持Shiki和Prismjs引擎
- Markdwon内容
  - Hightlight    | Markdown高亮与编辑，支持CodeMirror引擎
- 其他内容
  - [ ]auto color | 文本反色功能 (用于颜色框)
- 高级、嵌套
  - Nest          | 嵌套: 可编辑器包含编辑器
  - Save          | 可作为内嵌编辑器，且将修改内容传输到上游
  - Extends       | 支持扩展
  - [] Multi cursors| 多光标
  - [] Extend sytax | 扩展语法。如多行拼接： 使用 `\` 结尾再换行，可以优化显示

### Application scenarios

Editable code blocks, editable Markdown blocks (codemirror) 
Or, further, it can be used as editable reference blocks, editable lists, etc. in the Markdown editing area.

## 使用

## Editable codeblock - Setting

### Rendering engine

Shiki, PrismJS, CodeMirror

- Shiki: A powerful code highlighting engine.
  - More powerful functions, more themes and plugins
  - Plugins: meta annotations, annotated annotations. Line highlighting, word highlighting, differentiated annotation, warning/error annotation
  - Theme: Nearly 80 color schemes: You can visually select them at https://textmate-grammars-themes.netlify.app
  - *The min version does not include this library and the engine cannot be selected*
- PrismJS: The rendering engine that Obsidian uses by default in reading mode.
  - When choosing this one, you can also select the min version of this plugin, which has a smaller plugin size and a faster loading speed
  - It can be color-matched with code using obsidian themes and can be used in conjunction with some other obsidian stylization plugins
- CodeMirror: Obsidian is the default rendering engine used in real-time mode. The current plugin is not supported
  - It is suitable for real-time rendering and has acceptable performance
  - However, the code analysis is rather rough, with a small number of highlighting layers and a poor effect

### Rendering method

- textarea (default)
  - Advantage:
    Allows real-time editing and offers a Typora-like WYSIWYG experience
    Support editing annotation-type highlighting
    The new version of Obsidian's md table within block editing uses this approach. (However, the ob table editing does not trigger a re-rendering.)
  - Disadvantage:
    In principle, textarea and pre are perfectly overlapped together, but they are prone to incomplete overlap due to the influence of themes and styles
    The horizontal scrolling of the textarea cannot be synchronized with that of the pre. (fixed)
- editable pre
  - Advantage:
    Allows real-time editing and offers a Typora-like WYSIWYG experience
    In principle, it is `code[contenteditable='true']`
  - Disadvantage:
    The cursor position needs to be handled manually in the program
    *No support editing annotation-type highlighting*
- pre
  - Disadvantage:
    Real-time editing is not allowed. The rendering effect is more similar to the textarea method
- codemirror
  - Disadvantage:
    The only supported method for V0.5.0 and earlier versions, which does not allow real-time editing

> [!warning]
> 
> If a real-time editable solution is chosen, it is best to use it when the warehouse is regularly backed up to avoid unexpected situations

### AutoSave method

- onchange
  - Advantage:
    Great performance.
    There is no need to manage the cursor position manually
  - Disadvantage:
    Delay save, change will loss if: the program crashes suddenly. when cursor in codeblock, switch to readmode or close window/tab
- oninput
  - Advantage:
    Save immediately, data is more secure.
    The new version of Obsidian's md table within block editing uses this approach.
  - Disadvantage:
    Worse performance? The code block needs to be recreated every time it is modified
    The cursor position needs to be handled manually. Debounce manually.
    It is necessary to pay attention to the input method issue. The `oninput` will also be triggered during the input candidate stage

### Shiki Extend Sytax

see https://shiki.style/packages/transformers for detail

This is a simple summary of grammar:

- notaion
  - diff:            `// [!code ++]` `// [!code --]`
  - highlight:       `// [!code hl]` `// [!code highlight]`
  - word highlight:  `// [!code word:<Word>:<number>]` `// [!code word:Hello:1]`
  - focus:           `// [!code focus]`
  - error level:     `// [!code error]` `// [!code warning]`
  - (mul line):      `// [!code highlight:3]`
- meta
  - highlight:       `{1,3-4}`
  - word highlight   `/<Word>/` `/Hello/`

example: see [../README.md](../README.md) or [Shiki document](https://shiki.style/packages/transformers)
