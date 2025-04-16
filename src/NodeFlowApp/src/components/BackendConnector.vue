<!--
负责与后端沟通的模块

有心跳、SSE等机制
-->

<template>
  <div class="backend-connector">
    <div>------ 心跳状态 ------</div>
    <div>连接状态: {{ connect_status }}</div>
    <div>后端值:</div>
    <div><pre>{{ connect_content }}</pre></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// #region 心跳检测
const connect_status = ref<boolean>(false) // 是否处于连接状态中
const connect_timer = ref<NodeJS.Timeout | null>(null) // 定时器
const connect_content = ref<string>('') // 后端返回的心跳内容
const checkHeartbeat = async () => {
  try {
    const response = await fetch('http://localhost:24052/heartbeat')
    if (response.ok) {
      connect_status.value = true
    } else {
      connect_status.value = false
    }
    response.json().then((val) => {
      connect_content.value = JSON.stringify(val, null, 2)
    })
  } catch (error) {
    connect_status.value = false
    console.error('Connection error:', error)
  }
}
// 启动定时器
onMounted(() => {
  connect_timer.value = setInterval(checkHeartbeat, 1000) // 每N秒检测一次
  checkHeartbeat()
})
// 清除定时器
onUnmounted(() => {
  if (connect_timer.value) clearInterval(connect_timer.value)
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
