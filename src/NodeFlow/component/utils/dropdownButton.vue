<template>
  <div class="dd-button">
    <!-- 主按钮 -->
    <button class="dd-button-main">{{ currentLabel }}</button>
    <!-- 唤出菜单 -->
    <button class="dd-button-dropdown" @click="toggleDropdown">^</button>
    <!-- 菜单 -->
    <transition name="fade"> <!-- 淡入淡出 -->
      <ul class="dd-button-menu" ref="dropdownMenu" v-if="isOpen">
        <slot></slot>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isOpen = ref(false);
const currentLabel = ref('1'); // 默认值
const dropdownRef = ref<HTMLElement | null>(null);

// 定义方法
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const selectItem = (label: string) => {
  currentLabel.value = label;
  isOpen.value = false; // 关闭下拉菜单
};

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
