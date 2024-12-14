<!-- 默认项 -->

<template>
  <div>
    DEFAULT! {{ props.data }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: string
}>()
</script>
