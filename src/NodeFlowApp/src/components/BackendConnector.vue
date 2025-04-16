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
      <button @click="nodedata_put">存储当前json</button>
      <button @click="nodedata_get">获取当前json</button>
    </div>
    <div>后端值:</div>
    <div><pre>{{ nodedata_content }}</pre></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

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
const nodedata_timer = ref<NodeJS.Timeout | null>(null) // 定时器
const nodedata_content = ref<string>('')
// 改
async function nodedata_put () {
  try {
    const response = await fetch('http://localhost:24052/nodedata', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({"test_key": "test_value"})
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
async function nodedata_get () {
  try {
    const response = await fetch('http://localhost:24052/nodedata', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
// 启动定时器
onMounted(() => {
  nodedata_timer.value = setInterval(nodedata_get, 1000) // 每N秒检测一次
  nodedata_get()
})
// 清除定时器
onUnmounted(() => {
  if (nodedata_timer.value) clearInterval(nodedata_timer.value)
})
// #endregion
</script>

<style lang="scss">
.backend-connector {
  padding: 10px;
  >div {
    line-height: 24px;
  }
}
</style>
