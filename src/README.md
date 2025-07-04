# 多平台编译说明

## 目录结构

先看目录结构：

- src/
  - NodeFlow/         | 通用部分
  - NodeFlowApp/      | App版本
  - NodeFlowObsidian/ | Obsidian版本
  - NodeFlowVuepress/ | Vuepress版本

编译方法：

- 通过外层 `tsconfig.json` 中的 `excluede` 选项，
  可以排除掉不需要部分，避免读取不必要的文件，导致编译出错
- 然后根据大家的 package.json 分别启动和编译。具体的编译方法在非通用的三个文件夹内的 `README.md` 文件有更深入的说明

共用部分：

其中整个NodeFlow文件夹是共用的，没有任何差异。该文件夹外的部分是不公用的

- obsidian
  - 入口：使用共用模块里的factoryVueDom
- vuepress
  - 入口：直接使用一个vue组件作为入口
- app
  - 入口：直接使用一个vue组件作为入口

```bash
pnpm install

pnpm run ob:build
pnpm run app:dev
```
