<template>
    <h2>{{ props.data }}</h2>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{
  data: string
}>()
</script>

<style scoped>
h2 {
    color: lightcoral;
}
</style>
