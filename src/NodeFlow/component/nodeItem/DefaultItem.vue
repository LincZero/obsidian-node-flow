<!-- 默认项 -->

<template>
  <div>
    {{ props.data.value }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
</script>
