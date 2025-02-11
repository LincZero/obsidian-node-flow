# README

## Obsidian与VuePress插件共用部分

整个NodeFlow文件夹是共用的，没有任何差异。该文件夹外的部分是不公用的

- obsidian
  - 入口：使用共用模块里的factoryVueDom
- vuepress
  - 入口：直接使用一个vue组件作为入口
- app
  - 入口：直接使用一个vue组件作为入口

## Obsidian安装插件

(留空)

## VuePress安装插件 (源码版)

和一般的VuePress插件使用方法一样：

1. 复制NodeFlowPlugin文件夹到上述目录
2. 和使用普通插件一样，配置插件，在config.ts 中添加/修改 plugins 字段
    `import vueflowPlugin from "./plugin/VueFlowPlugin"` 并在plugins列表添加 `vueflowPlugin`
    (准确路径：src/.vuepress/plugin/VueFlowPlugin/，路径可以自己改)
3. 和使用普通mdit插件一样，使用里面的 `index_mdit.ts`

## VuePress支持直接识别工作流 `.json` 文件的方法

在config.ts中添加以下内容：

```ts
// @file /src/.vuepress/config.ts
export default defineUserConfig({
  pagePatterns: ["**/*.md", "**/*.json", "!**/*.snippet.md", "!.vuepress", "!node_modules"], // "**/*.pdf"

  // ------------------ 扩展类 ------------------
  theme,
  alias,
  extendsMarkdown,
  plugins,

  // ------------------ 扩展类 - 钩子 ------------
  async onInitialized(app) {
    /**
     * 对.json后缀进行处理 (需要先设置pagePatterns允许解析json，否则这里遍历不到json文件)
     * 这里编辑对应的page信息，视情况甚至可以createPage替换、新增、去除
     */
    for (const page of app.pages) {
      if (!page.path.endsWith(".json")) continue
      {
        page.path = page.path+"/"
        page.frontmatter.layout = 'Layout'
        page.content = "```nodeflow-comfyui\n" + page.content + "\n```"
        if(page.sfcBlocks.template?.contentStripped) page.sfcBlocks.template.contentStripped = // HTML内容以这个为准
          app.markdown.render(page.content) // 重新渲染该页
      }
    }
  },
});
```

### 依赖问题

你在安装的过程中，可能相关依赖未集成到插件中，需要手动安装

```bash
npm install @vue-flow/core
npm install @vue-flow/background
npm install @dagrejs/dagre
```

(备注： `--registry www.mirrornpm.com`)

### 开发人员补充

如果你想创建自己的插件，和前面的 `VuePress使用` 步骤相似，只不过复制Vue组件到对应的目录 (例如 `./plugin/VueFlowPlugin/NodeFlow`)

然后并添加一些插件声明的东西。在 `./plugin/VueFlowPlugin` 文件夹下创建 `index.ts` 和 `clientConfig.ts` 文件，并添加内容：

index.ts 负责声明插件的id

```ts
import { getDirname, path } from "@vuepress/utils"

export default (options, ctx) => {
    return {
    name: 'vuepress-plugin-vue-flow',
    clientConfigFile: path.resolve(__dirname, 'clientConfig.ts'),
    }
}
```

config_plugins.ts 负责描述插件的行为，这里描述为该插件用于声明一个全局的vue组件变量

```ts
import { defineClientConfig } from 'vuepress/client';

import MyVueFlow from "./MyVueFlow.vue";

export default defineClientConfig({
    enhance: ({ app, router, siteData }) => {
    app.component("VueFlow", MyVueFlow);
    },
})
```
