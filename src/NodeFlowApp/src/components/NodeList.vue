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

服务器问题：注意区分：

- 同步服务器：只能存在一个
- 节点服务器：可以存在多个
-->

<!-- TODO：修改为多层node-list-group，像文件树那样 -->
<template>
  <div class="node-list">
    <div v-for="(v, k) in nodeList_group" :key="k" class="node-list-group">
      <div class="node-list-groupname">{{ k }}</div>
      <div v-for="(v2, k2) in v" :key="k2" class="node-list-item">
        <div>
          <span class="node-list-name" @click="createNode(k2, v2)">{{ k2 }}</span>
        </div>
      </div>
    </div>
    <div class="node-list-backend">
      <span>服务器列表: (换行区分)</span>
      <textarea v-model="urls" spellcheck="false" placeholder="http://localhost:24042/"></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { NFNodes } from '../../../NodeFlow/component/utils/NFNodes'
import { NFNode } from '../../../NodeFlow/component/utils/NFNode'
const nfNodes = NFNodes.useGetNFNodes()

// #region factory nodeList_group

const nodeList_group = reactive<Record<string, Record<string, string>>>({})

// TODO 添加多个类型分组，如: 网络、常用脚本、等等
const nodeList_frontEnd: Record<string, string> = {
  "diy": "",

  "http": `\
- nodes
  - Http
    - FlowReq:Http请求模板, :item-flowreq
    - emit, i:item-flow
    - url, i, https://httpbin.org/get
    - success, o:item-flow
    - fail, o:item-flow
    - resp, o
- edges`,

  "eval": `\
- nodes
  - Run
    - FlowEval:执行任意代码, io:item-floweval, var a = 2
let b = a
console.log('debug output', b, ctx)
    - 空节点i, i
    - 空节点o, o
    - debug, :item-debug
    - feat, :item-feat
- edges`
}
nodeList_group["frontEnd"] = nodeList_frontEnd

const urls = ref<string>('http://localhost:24042/') // 换行区分多个url
update_backend_source()
watch(() => urls, () => {
  update_backend_source()
})
function update_backend_source() {
  for (let url of urls.value.split('\n')) {
    if (url.trim() === '') continue // 跳过空行
    nodeList_group[url] = {}
    ;(async () => {
      try {
        const response = await fetch(url + 'nodelist', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (response.ok) {
          response.json().then((val: string[]) => {
            const new_val: Record<string, string> = {}
            for (const item of val) {
              new_val[item] = ''
            }
            nodeList_group[url] = new_val
          })
        } else {
          nodeList_group[url] = {"(error: get error)": ""}
          console.error('Get nodelist error from:' + url)
        }
      } catch (error) {
        nodeList_group[url] = {"(error: connection error)": ""}
        console.error('Connection error:' + error)
      }
    })();
  }
}

// #endregion

// TODO 当前仅 listitem 模式可用。应该为不同的type提供不同的NodeList，或者不同的NodeList能归一化为同一类型
function createNode(k: string, v: string) {
  const isSuccess = NFNode.factoryNFNode('', v, nfNodes, 'nodeflow-listitem')
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
    .node-list-name {
      cursor: pointer;
    }
  }

  .node-list-backend {
    margin-top: 50px;
    textarea {
      box-sizing: border-box;
      width: 100%;
      margin-top: 5px;
      
      border: 1px solid #616161;
      padding: 4px 6px;
      border-radius: 8px;
      color: currentColor;
      background: none;
      resize: vertical;
    }
  }
}
</style>
