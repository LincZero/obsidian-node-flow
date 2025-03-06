<!-- 颜色项 -->

<template>
  <div :class="'color-item  node-item-slot ' + props.data.refType + (props.data.value?' has-value':'')">
    <span v-if="props.data.name" class="node-item-name">{{ props.data.name }}</span>
    <div class="node-item-value"
      :style="'background:'+props.data.value+'; color:'+getHighContrastTextColor(props.data.value)">
      <NFTextArea :data="data" codeType="" :isHideBorder="true"></NFTextArea>
    </div>
    <div style="height:0; clear: both;"></div>
  </div>
</template>

<script setup lang="ts">
import NFTextArea from '../../utils/NFTextArea.vue'
const props = defineProps<{
  data: any
}>();
if (!props.data.value) props.data.value = '#fff';

/// 文字颜色计算
function getHighContrastTextColor(hexColor: string) {
    // 去掉可能存在的`#`号
    hexColor = hexColor.replace(/^#/, '');
    // 如果是3位简写的hex颜色，则扩展成6位
    if (hexColor.length === 3) {
        hexColor = hexColor.split('').map(char => char + char).join('');
    }
    // 将十六进制颜色转为RGB值
    var r = parseInt(hexColor.substr(0, 2), 16);
    var g = parseInt(hexColor.substr(2, 2), 16);
    var b = parseInt(hexColor.substr(4, 2), 16);

    // 转换为灰度（简单的平均方法）
    var gray = (r + g + b) / 3;
    // 根据灰度值选择对比度高的文本颜色
    return gray > 128 ? 'black' : 'white';
}
</script>

<style scoped>
.color-item {
  /* layout 20+2+2 */
  box-sizing: border-box;
  height: auto;
  min-height: 24px;
  padding: 0px 0px;
}
.color-item .node-item-name {
  height: 24px;

  padding: 2px 0px;
  line-height: calc(24px - 4px);
}
.color-item .node-item-value {
  height: 24px;

  padding: 0;
  line-height: calc(24px - 4px);
  border-radius: 12px;
  cursor: pointer;
  margin-left: 4px;
}
</style>
