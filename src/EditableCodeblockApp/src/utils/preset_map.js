// 相较于文档版，这里能放的内容更多

export const preset_map = {
//
'Normal markdown': `\
\`^\` 点击编辑区域上面的预设下拉框，可以切换其他demo

Editable Codeblock

## Editable Codeblock

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
\frac 12
$$

mermaid块

(略)

表格

| 1 | 2 |
|---|---|
| 3 | 4 |

## 嵌套测试

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
