<!--
负责与后端沟通的模块

有心跳、SSE等机制

TODO：应该有两个模块：一个是完全独立的后端连接器，可以创建多份。一个是记录当前连接了哪些后端。后者未做
-->

<template>
  <div class="backend-connector">
    <div>
      <span>当前同步服务器</span>
      <input v-model="ref_url" type="text" placeholder="http://localhost:24042/" />
    </div>

    <div><h4>心跳状态</h4></div>
    <div>连接状态: {{ connect_status }}</div>
    <div>后端值:</div>
    <div><pre>{{ connect_content }}</pre></div>

    <div><h4>通用存储</h4></div>
    <div>
      <span>同步策略</span>
      <select v-model="nodedata_syncType">
        <option value="no">不自动同步</option>
        <option value="from3">仅初始化时从后端同步</option> <!--default-->
        <option value="from">自动从后端同步</option>
        <option value="from2">自动从后端同步 但不更新</option> <!--debug-->
        <option value="to">自动同步到后端</option>
      </select>
    </div>
    <br>
    <div>
      <span>手动同步按钮</span>
      <button @click="nodedata_put()">存储当前json</button>
      <button @click="nodedata_get()">获取当前json</button>
    </div>
    <div><span>同步值:</span></div>
    <div><pre>{{ nodedata_content }}</pre></div>

    <div><h4>后端日志</h4></div>
    <div><pre>(需后端支持日志传送功能，当前未支持)</pre></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'

import { NFNodes } from '../../../NodeFlow/component/utils/NFNodes'
const nfNodes = NFNodes.useGetNFNodes()

const ref_url = ref<string>('http://localhost:24042/')

// #region 心跳检测
const connect_status = ref<boolean>(false) // 是否处于连接状态中
const connect_timer = ref<number | null>(null) // 定时器
const connect_content = ref<string>('') // 后端返回的心跳内容
async function checkHeartbeat () {
  try {
    const response = await fetch(ref_url.value+'heartbeat', {
      // credentials: 'include' // 支持 cookie 存写
    })
    if (response.ok) {
      connect_status.value = true
      response.json().then((val) => {
        connect_content.value = JSON.stringify(val, null, 2)
      })
    } else {
      connect_status.value = false
      connect_content.value = ''
    }
  } catch (error) {
    connect_status.value = false
    connect_content.value = `[ERROR]
${(new Date()).toString()}
${error}

可能的情况:
- 无后端模式 (合法，但网页刷新可能导致数据丢失，且只能使用前端的节点模块)
- 与后端的连接问题存在问题，自行检查，或请尝试修改正确的同步服务或
- 如果你没有适用的服务端，可自行部署。如参考 https://github.com/NestNode/ API`
    console.error('Connection error:' + error)
  }
}
// 启动定时器
onMounted(() => {
  // TODO 区分成功频率维护频率和失败重试频率
  connect_timer.value = window.setInterval(checkHeartbeat, 1000) // 每N秒检测一次
  checkHeartbeat()
})
// 清除定时器
onUnmounted(() => {
  if (connect_timer.value) window.clearInterval(connect_timer.value)
})
// #endregion

// #region 节点流资源的REST API
const nodedata_content = ref<string>('')
// 改
async function nodedata_put() {
  try {
    const response = await fetch(ref_url.value + 'rest/' + 'nodedata', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "data": nfNodes.jsonStr.value
      })
    })
    if (response.ok) {
      response.json().then((val) => {
        nodedata_content.value = val['data'] // JSON.stringify(val, null, 2)
      })
    } else {
      nodedata_content.value = ''
    }
  } catch (error) {
    nodedata_content.value = '[error] ' + error
    console.error('Connection error:' + error)
  }
}
// 查
async function nodedata_get(isUpdate = true) {
  try {
    const response = await fetch(ref_url.value + 'rest/' + 'nodedata', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      response.json().then((val) => {
        nodedata_content.value = val['data'] // JSON.stringify(val, null, 2)
        if (isUpdate) nfNodes.jsonStr.value = val['data']
      })
    } else {
      nodedata_content.value = ''
      // nfNodes.nfStr.value = // 失败则不变更
    }
  } catch (error) {
    nodedata_content.value = '[error] ' + error
    console.error('Connection error:' + error)
  }
}
// #endregion

// #region 节点流资源的REST API - 自动
const nodedata_syncType = ref<string>('from3')
const nodedata_timer = ref<number | null>(null) // 定时器
// TODO 需要记得检查from/to切换时，是否会有bug
function nodedata_syncInit() {
  if (nodedata_syncType.value == 'no') {
    if (nodedata_timer.value !== null) { window.clearInterval(nodedata_timer.value); nodedata_timer.value = null; }
    nodedata_content.value = ''
    return
  }
  else if (nodedata_syncType.value == 'from') {
    if (nodedata_timer.value !== null) { window.clearInterval(nodedata_timer.value); nodedata_timer.value = null; }
    nodedata_timer.value = window.setInterval(() => {
      nodedata_get()
    }, 1000)
    return
  }
  else if (nodedata_syncType.value == 'from2') {
    if (nodedata_timer.value !== null) { window.clearInterval(nodedata_timer.value); nodedata_timer.value = null; }
    nodedata_timer.value = window.setInterval(() => {
      nodedata_get(false)
    }, 1000)
    return
  }
  else if (nodedata_syncType.value == 'from3') {
    if (nodedata_timer.value !== null) { window.clearInterval(nodedata_timer.value); nodedata_timer.value = null; }
    nodedata_get()
    return
  }
  else if (nodedata_syncType.value == 'to') {
    if (nodedata_timer.value !== null) { window.clearInterval(nodedata_timer.value); nodedata_timer.value = null; }
    nodedata_timer.value = window.setInterval(() => {
      nodedata_put()
    }, 1000)
    return
  }
  else { console.error('nodedata_syncType 不可能为其他值') }
}
watch(nodedata_syncType, nodedata_syncInit)
onMounted(() => {
  nodedata_syncInit()
})
onUnmounted(() => {
  nodedata_syncType.value = 'no'
  // 注意项：
  // 在 JavaScript/TypeScript 中，定时器（setInterval/setTimeout）不会自动析构，这是由其底层设计机制决定的
  // clearInterval保证立即而非闲时停止定时器 (并且此时也只是标识符覆盖，而非对象销毁)
  if (nodedata_timer.value !== null) { window.clearInterval(nodedata_timer.value); nodedata_timer.value = null; }
})
// #endregion
</script>

<style lang="scss" scoped>
.backend-connector {
  box-sizing: border-box;
  height: 100%;
  
  padding: 10px 10px 20px;
  overflow-y: auto;

  >div {
    line-height: 24px;
    span {
      margin-right: 5px;
    }
  }
}
input {
  // border: #616161 solid 1px;
  border-radius: 6px;
  padding: 0 4px;
  // background: none;
  // color: currentColor;
}
pre {
  overflow: auto;
  box-sizing: border-box;
  max-height: 500px;
  min-height: 24px;

  border: #616161 solid 1px;
  border-radius: 10px;
  padding: 2px 8px 10px;
}
</style>
