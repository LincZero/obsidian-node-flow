<!--
节点列表

可分组。第一组通常是来源 (可以由不同来源提供不同的节点列表)，主要有：

- 前端有一个节点列表
- 后端连接器可以同时连接多个后端，并能从多个后端中分别获得节点列表

后面的分组则为比较自定义的类型分组等

最小单位问题：

- 节点图的最小单位是节点项
- 但是对用户来说，用户应当可以选择使用节点项还是节点作为单位。
  前者拥有更高的灵活性，而后者拥有更好的易用性，更低的使用成本。
- 兼容策略为:
  当选择节点类型为: `diy` / `custom` 时，则由节点列表进入 `节点项列表`
-->

<!-- TODO：修改为多层node-list-group，像文件树那样 -->
<template>
  <div class="node-list">
    <div v-for="(v, k) in nodeList_group" :key="k" class="node-list-group">
      <div class="node-list-groupname">{{ k }}</div>
      <div v-for="(v2, k2) in v" :key="k2" class="node-list-item">
        <div>
          <span class="node-list-name">{{ k2 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

// TODO 添加多个类型分组，如: 网络、常用脚本、等等
const nodeList_frontEnd: object = {
  "diy": "",

  "http": `- Http
- FlowReq:Http请求模板, :item-flowreq
- emit, i:item-flow
- url, i, https://httpbin.org/get
- success, o:item-flow
- fail, o:item-flow
- resp, o`,

  "eval": `- FlowEval:执行任意代码, io:item-floweval, var a = 2
let b = a
console.log('debug output', b, ctx)
- 空节点i, i
- 空节点o, o
- debug, :item-debug
- feat, :item-feat`
}
const nodeList_group: object = {
  "frontEnd": nodeList_frontEnd,
  "localhost:24042(debug)": []
}
</script>

<style lang="scss" scoped>
.node-list {
  box-sizing: border-box;
  height: 100%;

  padding: 10px 10px 20px;
  overflow-y: auto;

  .node-list-group {
    
  }
  .node-list-group>.node-list-groupname {
    box-sizing: border-box;
    height: 24px;
    
    border-bottom: 1px solid currentColor;
    line-height: 22px;
    padding: 0 8px;
    background-color: rgba(46, 70, 86, 0.75);
  }

  .node-list-group>.node-list-item {
    box-sizing: border-box;
    height: 24px;
    
    border-bottom: 1px solid currentColor;
    line-height: 22px;
    padding: 0 8px;
  }
}
</style>
