// 相较于文档版，这里能放的内容更多

export const preset_map = {
//
'Normal markdown': `\
EditableBlock 开发阶段快速测试平台 + 试用Demo

## 插件介绍

目的: 主要解决 Markdown 容器的嵌套体验

> 使用说明
> 
> 这里注意会有四个标签页，你可以互相切换或者重新排布，以进行对比：
> - MdEditor:    纯文本
> - MdViewer:    渲染，使用markdown-it引擎 + EditableBlock 插件，不可编辑
> - CodeMirror2: 渲染，使用CodeMirror引擎，可编辑
> - CodeMirror:  渲染，使用CodeMirror引擎 + EditableBlock 插件，可编辑

> 比较
> - CodeMirror2
>   - 逻辑比较像 **Obsidian** 实时模式的编辑体验。
>   - 特点：没有 "块" 和 "容器" 的概念，解析结果为多个字符组的数组
>   - 缺点：在引用块/列表嵌套其他内容的场景时，编辑困难、渲染难看
>     (例如obsidian的引用块去嵌套代码块时、代码块完全无法被渲染)
> - CodeMirror
>   - 逻辑更像 **Typora** 的编辑体验
>   - 特点：有 "块" 和 "容器" 的概念，在一个块内，存在一个单独的编辑空间。
>     这使得在块内的用户编辑体验不会下降! 即便是块再去嵌套其他块

> 目前仍位于开发测试阶段，bug多多。
> 特别是引用块
> TODO：
> - 支持onInput和onChange的saveMode切换
> - 更多的快捷键支撑起块级编辑的体验
> - 嵌套后，第二层的控件无法进行编辑保存

## 插件Demo

from: https://www.w3schools.com/js/js_examples.asp

\`\`\`js
<!DOCTYPE html>
<html>
<body>

<h2>What Can JavaScript Do?</h2>

<p id="demo">JavaScript can change HTML content.</p>

<button
  type="button"
  onclick='document.getElementById("demo").innerHTML = "Hello JavaScript!"'
>Click Me!</button>

</body>
</html>
\`\`\`

## 基本md语法

标题略

内联: **bord** *i* ~~delete~~ ==highlight== \`inline code\` $\\frac 12$

列表

- 1
- 2
  - 3
  - 4
    - 5

引用块

> [!note]
> This is a note block.

代码块

\`\`\`js
<!DOCTYPE html>
<html>
<body>

<h2>What Can JavaScript Do?</h2>

<p id="demo">JavaScript can change HTML content.</p>

<button
  type="button"
  onclick='document.getElementById("demo").innerHTML = "Hello JavaScript!"'
>Click Me!</button>

</body>
</html>
\`\`\`

公式块

$$
\\frac 12
$$

mermaid块

(略)

表格

| 1 | 2 |
|---|---|
| 3 | 4 |

## 嵌套测试

引用块包含简单Markdown

> 引用块开头
> 
> 内联: **bord** *i* ~~delete~~ ==highlight== \`inline code\` $\\frac 12$
> 
> - 列表项
> 
> 引用块结尾

引用块包含代码块

> 引用块开头
> 
> \`\`\`js
> <!DOCTYPE html>
> <html>
> <body>
> 
> <h2>What Can JavaScript Do?</h2>
> 
> <p id="demo">JavaScript can change HTML content.</p>
> 
> <button
>   type="button"
>   onclick='document.getElementById("demo").innerHTML = "Hello JavaScript!"'
> > Click Me!</button>
> 
> </body>
> </html>
> \`\`\`
> 
> 引用块结尾

引用块包含引用块

> 引用块开头
> 
> > 引用块嵌套开头
> > 引用块嵌套内容
> > 引用块嵌套结尾
> 
> 引用块结尾
`,
}
