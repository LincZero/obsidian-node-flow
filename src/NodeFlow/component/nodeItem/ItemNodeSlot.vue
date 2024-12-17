<template>
  <slot :name="props.data.valueType" :id="props.data.id" :data="props.data"></slot>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})
</script>
