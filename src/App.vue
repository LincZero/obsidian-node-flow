<template>
    <h2>Hello,Developer!</h2>
    <Hi :hi="hi"></Hi>
</template>

<script setup lang="tsx">
import Hi from "./Hi.vue";
import { ref } from "vue";
let hi = ref("");
</script>

<style scoped>
h2 {
    color: lightcoral;
}
</style>