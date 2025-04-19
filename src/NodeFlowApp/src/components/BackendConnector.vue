<!--
负责与后端沟通的模块

有心跳、SSE等机制
-->

<template>
  <div class="backend-connector">
    <div><h4>心跳状态</h4></div>
    <div>连接状态: {{ connect_status }}</div>
    <div>后端值:</div>
    <div><pre>{{ connect_content }}</pre></div>
    <div><h4>通用存储</h4></div>
    <div>
      自动同步策略
      <select v-model="nodedata_syncType">
        <option value="no">不自动同步</option>
        <option value="from">自动同步从后端</option>
        <option value="to">自动同步到后端</option>
      </select>
    </div>
    <br>
    <div>
      手动同步按钮
      <button @click="nodedata_put">存储当前json</button>
      <button @click="nodedata_get">获取当前json</button>
    </div>
    <div>同步值:</div>
    <div><pre>{{ nodedata_content }}</pre></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { useGlobalState } from '../../../NodeFlow/stores/stores'
const { nfNodes } = useGlobalState()

// #region 心跳检测
const connect_status = ref<boolean>(false) // 是否处于连接状态中
const connect_timer = ref<NodeJS.Timeout | null>(null) // 定时器
const connect_content = ref<string>('') // 后端返回的心跳内容
async function checkHeartbeat () {
  try {
    const response = await fetch('http://localhost:24052/heartbeat')
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
    connect_content.value = '[error] ' + error
    console.error('Connection error:', error)
  }
}
// 启动定时器
onMounted(() => {
  // TODO 区分成功频率维护频率和失败重试频率
  connect_timer.value = setInterval(checkHeartbeat, 1000) // 每N秒检测一次
  checkHeartbeat()
})
// 清除定时器
onUnmounted(() => {
  if (connect_timer.value) clearInterval(connect_timer.value)
})
// #endregion

// #region 节点流资源的REST API
const nodedata_content = ref<string>('')
// 改
async function nodedata_put() {
  try {
    const response = await fetch('http://localhost:24052/rest/' + 'nodedata', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "data": nfNodes.value.nfStr
      })
    })
    if (response.ok) {
      response.json().then((val) => {
        nodedata_content.value = JSON.stringify(val, null, 2)
      })
    } else {
      nodedata_content.value = ''
    }
  } catch (error) {
    nodedata_content.value = '[error] ' + error
    console.error('Connection error:', error)
  }
}
// 查
async function nodedata_get() {
  try {
    const response = await fetch('http://localhost:24052/rest/' + 'nodedata', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      response.json().then((val) => {
        nodedata_content.value = JSON.stringify(val, null, 2)
        nfNodes.value.nfStr = val['data']
      })
    } else {
      nodedata_content.value = ''
      // nfNodes.value.nfStr = // 失败则不变更
    }
  } catch (error) {
    nodedata_content.value = '[error] ' + error
    console.error('Connection error:', error)
  }
}
// #endregion

// #region 节点流资源的REST API - 自动
const nodedata_syncType = ref<'no'|'from'|'to'>('no')
const nodedata_timer = ref<NodeJS.Timeout | null>(null) // 定时器
// TODO 需要记得检查from/to切换时，是否会有bug
watch(nodedata_syncType, () => {
  if (nodedata_syncType.value == 'no') {
    clearInterval(nodedata_timer.value)
    nodedata_timer.value = null
    nodedata_content.value = ''
    return
  }
  else if (nodedata_syncType.value == 'from') {
    nodedata_timer.value = setInterval(() => {
      nodedata_get()
    }, 1000)
    return
  }
  else if (nodedata_syncType.value == 'to') {
    nodedata_timer.value = setInterval(() => {
      nodedata_put()
    }, 1000)
    return
  }
  else { console.error('nodedata_syncType 不可能为其他值') }
})
onUnmounted(() => { nodedata_syncType.value = 'no' })
// #endregion
</script>

<style lang="scss">
.backend-connector {
  padding: 10px;
  >div {
    line-height: 24px;
  }
}
pre {
  overflow: auto;
  max-height: 500px;
}
</style>
