# Obsidian NodeFlow

(in development) 

Render node streams like `ComfyUi`, `UE`, `Houdini`, `Blender`, etc., to make it easy to write relevant notes.

Json describes the chart, compared to screenshots, making it easier to modify later. The plugin is also compatible with blogs

## 创建模板

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
