# README

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
