# README

## Obsidian版本的安装

- 正常在社区商店下载
- 正常在Github的该仓库下下载Release，并手动安装
- 通过 BRAT 等方式安装

## Obsidian版本的使用方式

详见仓库README

## Obsidian版本的编译

```bash
pnpm install

pnpm run ob:build # 使用 esbuild + @the_tree/esbuild-plugin-vue3。可以处理vue，但无法处理vue中的scss。bug: https://github.com/pipe01/esbuild-plugin-vue3/issues/30

# 或

pnpm run ob:build2 # 使用 vite + @vitejs/plugin-vue + sass-embedded，可以处理vue，及vue里的scss
```

## 项目创建模板

1. generated

generated from [guopenghui/obsidian-vue-starter](https://github.com/guopenghui/obsidian-vue-starter)

但他这个依赖很旧，编译不稳定，我给改了下，见修改历史：22c2a9c2ad9eac8e0ce1abfb0b4484358eb0e28b

然后尝试安装依赖和构建，并在obsidian中查看是否能正常使用

2. vue file

见修改历史：22c2a9c2ad9eac8e0ce1abfb0b4484358eb0e28b 的下一次commit

vue file: VueTest.vue

```vue
<template>
  <h2>Hello,Developer!</h2>
</template>

<script setup lang="ts">
</script>

<style scoped>
h2 {
    color: lightcoral;
}
</style>
```

3. 在主程序中使用 Vue UI

main.ts

```ts
import type {MarkdownPostProcessorContext} from "obsidian"
import { factoryVueDom } from './vueAdapt'
...
this.registerMarkdownCodeBlockProcessor("vue-test",
  (
    src: string,                                // 代码块内容
    blockEl: HTMLElement,                       // 代码块渲染的元素
    ctx: MarkdownPostProcessorContext           // 上下文
  ) => {
    const root_div = document.createElement("div");  blockEl.appendChild(root_div); root_div.classList.add("vue-shell");
    factoryVueDom(root_div, "vue-test")
  }
)
```

vueAdapt.ts

```ts
import { createApp, App as VueApp } from 'vue';
import VueTest from './component/VueTest.vue';

// 在div内创建指定的 Vue UI
export function factoryVueDom(div:HTMLElement, vueUI:string = "vue-test"):void {
  const _app = createApp(VueTest, {});
  _app.mount(div);
}
```

4. ~~原模版不支持sass，需要额外安装点东西~~

- 这里我们使用的是esbuild (webpack或其他打包器的的做法有所不同，具体自己查)
  - esbuild-sass-plugin 是对的，esbuild-plugin-sass 是错的，注意区分。见 https://www.npmjs.com/package/esbuild-sass-plugin，里面有写具体用法
- `npm i sass sass-loader -D` 是对的，`sass` 换成 `node-sass` 是错的（旧版）
- 坑：我重新安装所有依赖发现的：
  ```bash
  peerDependencies WARNING esbuild-sass-plugin@^3.3.1 requires a peer of esbuild@>=0.20.1 but H:\Git\Private\Group_FrontEnd\obsidian-node-flow\node_modules\esbuild was installed at esbuild@0.14.54, packageDir: H:\Git\Private\Group_FrontEnd\obsidian-node-flow\node_modules\.store\esbuild-sass-plugin@3.3.1\node_modules\esbuild-sass-plugin
peerDependencies WARNING esbuild-sass-plugin@^3.3.1 requires a peer of sass-embedded@^1.71.1 but none was installed, packageDir: H:\Git\Private\Group_FrontEnd\obsidian-node-flow\node_modules\.store\esbuild-sass-plugin@3.3.1\node_modules\esbuild-sass-plugin
  ```
  升级一个包，然后安装一个包
- 最后我还是没有成功，似乎是esbuild-plugin-vue3的问题，见：https://github.com/pipe01/esbuild-plugin-vue3/issues/30
  最后我选择了使用VSCode插件进行编译，并且不在vue内使用scss

## 注意要项

注意：VueFlow官网的Examples中的Vue代码，都需要在script标签中标注 `lang="ts"`

否则报错：

```bash
X [ERROR] [plugin vue] Fail to resolve script type in H:\Git\Private\Group_FrontEnd\obsidian-node-flow\src\component\utils\InteractionControls.vue?type=script

    node_modules/.store/@the_tree+esbuild-plugin-vue3@0.3.1/node_modules/@the_tree/esbuild-plugin-vue3/dist/index.js:301:54:
      301 │                                                 throw new Error("Fail to resolve script type in ".concat(args.path));
```

意思是无法解析到vue文件里的script标签

或者修改tsconfig.json文件，中添加js支持应该也行，但我现在想强制整个项目都要使用ts，就没这样做
