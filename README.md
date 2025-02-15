# NodeFlow

- en

  Render node streams like `ComfyUi`, `UE`, `Houdini`, `Blender`, etc., to make it easy to write relevant notes.

  The plugin allows diagrams to be described using lightweight syntax or Json, and is available in both Obsidian and VuePress blogs
- zh
  
  渲染节点流，像 `ComfyUi`, `UE`, `Houdini`, `Blender` 等，使其易于编写相关笔记。

  允许使用轻量语法或从上述软件导出的Json描述了图表，该插件在Obsidian与VuePress博客中均可使用

## Docs (教程, 文档)

Tutorials, online effects, use cases, and more (教程、在线效果、用例等)

- [Online effects (在线效果)、demo](https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/README.show.html), Vuepress Version
- [Online interaction (在线效果2、在线交互)](https://linczero.github.io/obsidian-node-flow/), App Version

## Effect display (Partial) (效果展示 - 部分)

![](./docs/image.png)

## Usage

### Method 1: Use code blocks (方式一: 使用代码块)

Supported code block types (支持的代码块类型)：

```json
["nodeflow-test", "nodeflow-vueflow", "nodeflow-obcanvas", "nodeflow-comfyui", "nodeflow-list", "nodeflow-listitem"]
```

- en
  These code blocks are of different types.
  1. `nodeflow-comfyui` prefix, using the workflow json exported by comfyui software as content
  2. `nodeflow-obcanvas` prefix, using the content of the obsidian canvas file (open with Notepad, you will find that it is a json format)
  3. `nodeflow-list` prefix, indicating that this is a reference mermaid/plantuml, using light text to describe the chart format.
    See [NodeFlow List Grammer](https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/docs/zh/NodeFlow%20List%20Grammer.html) for details
  4. `nodeflow-list` prefix, in beta testing. Similar to `nodeflow-list`, but can support multiple item types, such as color, markdown, etc.
  5. See the [documentation](https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/README.show.html) for specific uses of these types
- zh
  这些代码块的类型都不太一样
  1. `nodeflow-comfyui` 前缀的，使用comfyui软件导出的工作流json作为内容
  2. `nodeflow-obcanvas` 前缀的，使用obsidian canvas文件的内容 (用记事本打开，会发现里面是一个json格式)
  3. `nodeflow-list` 前缀的，表示这是一个对标mermaid/plantuml的，用轻文字描述图表的格式。
    具体语法参考 [NodeFlow List Grammer](https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/docs/zh/NodeFlow%20List%20Grammer.html)
  4. `nodeflow-listitem` 前缀的，beta测试中。与 `nodeflow-list` 相似，但能支持多种项类型，如颜色、markdown等
  5. 这些类型更具体的用法见[文档](https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/README.show.htm)

Example - List Grammer (举例 - 列表语法)：

````md
```nodeflow-list
- nodes
  - node1:KSample
    - Latent, o
    - model, i
    - positive, i
    - negative, i
    - Latent, i
    - seed,
    - control_after_generate,, randomize
    - steps,, 20
    - CFG,, 8.0
    - sampler_name,, euler
    - scheduler,, normal
    - denoise,, 1.00
    - io defaultTest, i , test
    - io defaultTest, o, test
    - t1:noValueTest,
    - t2:,, noKeyTest
      mul lines test
  - node2:KSample
    - 潜空间, o
    - 模型, i
    - 正面条件, i
    - 负面条件, i
    - 潜空间, i
    - 种子,
    - 运行后操作,
    - 步数,
    - CFG,
    - 采样器/采样方法,
    - 调度器,
    - 降噪,
  - translate
- edges
  - node1,Latent, translate,l
  - translate,r, node2, 潜空间
```
````

You can alse use the demo use case by filling in `demo`/`demo2`/`demo3` in the code block and checking that it works (你也可以在代码块内填写 `demo`/`demo2`/`demo3` 来使用demo用例，并检查其是否正常工作)

### Method 2: Independent file (方式二: 独立文件)

- en
  
  Directly put comfyui's exported `workflow.json` file in the library, will automatically identify the json suffix

  Directly modify the extension of comfyui's exported workflow.json file to `.workflow_json`, which can also be correctly identified
- zh
  
  直接将comfyui的导出 `workflow.json` 文件放在库里，会自动识别json后缀的
  
  直接将comfyui的导出workflow.json文件扩展名修改成`.workflow_json`，也能正确识别

## TODO

- feat
  - ~~支持socket的name-value显示~~ (241027)
  - ~~Obsidian版本的全屏优化~~
- enhance
  - [非全屏状态下的中间拖拽优化](https://github.com/bcakmakoglu/vue-flow/issues/1557)
  - [带节点组的情况下进行自动布局](https://github.com/bcakmakoglu/vue-flow/discussions/1658)
  - 代码优化
    - ~~整理一下，捋一下各种节点类型，以及对应的data数据，然后把socket与线色的关系再优化一下~~
- style
  - [scss代码优化问题](ttps://github.com/pipe01/esbuild-plugin-vue3/issues/30)
  - ~~更好看的工具栏与样式~~

## 更多用法

详见 [Online effects (在线效果)、demo](https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/README.show.html)，这里仅再列举部分：

复制以下内容到你的obsidian中：

````md
```nodeflow-comfyui
demo
```

```nodeflow-obcanvas
demo
```

```nodeflow-list
demo
```

```nodeflow-vueflow
demo
```

```nodeflow-item
demo
```

```nodeflow-listitem
demo
```
````
