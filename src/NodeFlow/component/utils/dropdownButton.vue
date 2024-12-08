<!--
带下拉框的按钮

使用时，可以设置一下对应的cscc局部变量：--dd-button-height

使用示例：

<DropdownButton #default="{ selectItem }" 这里是子组件向父组件传递了一个方法，这一行是固定的
  :label='"test 1"' :fn="() => console.log('执行test 1 btn的功能')">
  <button @click="selectItem('test 1', ()=>console.log('执行test 1 btn的功能'))">test 1</button>
  <button @click="selectItem('test 2', ()=>console.log('执行test 2 btn的功能'))">test 2</button>
  <button @click="selectItem('test 3', ()=>console.log('执行test 3 btn的功能'))">test 3</button>
</DropdownButton>
-->

<template>
  <div class="dd-button" ref="ddButtonRef">
    <!-- 主按钮 -->
    <button class="dd-button-main" @click="onClickMainBtn">{{ currentLabel }}</button>
    <!-- 唤出菜单 -->
    <button class="dd-button-dropdown" @click="toggleDropdown">^</button>
    <!-- 菜单 -->
    <transition name="fade"> <!-- 淡入淡出 -->
      <ul class="dd-button-menu" v-if="isOpen">
        <slot :selectItem="selectItem"></slot>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
const props = defineProps<{
  label: string,  // 当前按钮选项名
  fn: () => void, // 当前按钮选项方法
}>()
const currentLabel = ref<string>(props.label);
const currentFn = ref<(() => void) | null>(props.fn);

// 按钮 - 下拉框展开/收缩
function toggleDropdown() {
  isOpen.value = !isOpen.value;
};
const isOpen = ref(false); // 是否展开下拉框

// 按钮 - 下拉框内的按钮 (要求按钮的@click方法中执行一下)
// 需要声明该按钮的名字和执行的方法
function selectItem(label: string, fn: () => void) {
  currentLabel.value = label;
  currentFn.value = fn;
  if (currentFn.value) { currentFn.value(); }
  isOpen.value = false;
};

// 按钮 - 点击主按钮
function onClickMainBtn() {
  if (currentFn.value) { currentFn.value(); }
}

// 事件 - 点击下拉框以外的区域时不展开下拉框
function handleClickOutside(event: MouseEvent) {
  if (ddButtonRef.value && !ddButtonRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};
const ddButtonRef = ref<HTMLElement | null>(null);
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
