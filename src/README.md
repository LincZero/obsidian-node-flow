# README

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

## Obsidian使用方式

1. 代码块，类型为 `nodeflow-xxx`
2. 文件后缀，类型为 `workflow_json` (对应 `nodeflow-comfyui`)
3. 元数据，`tag`/`type` 为 `comfyui-json`
