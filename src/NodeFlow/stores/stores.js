/**
 * 全局状态存储器 (仅部分环境需要，部分环境不需要这部分)
 * 
 * - 伪全局 (目前是这个，后面应该要修改成真全局)，一个nfNodes对应一个
 * - 真全局
 */

import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export const useGlobalState = createGlobalState(
  () => {
    // TODO 选择对象可以简化去掉冗余，应该封装到 nfNodes 里
    const selected = ref([])    // 自行维护的已选列表. type: ref<string[]>([])
    const selected2 = ref(null) // vueflow维护的已选列表 (之前有bug, 后来莫名其妙修好了)
    // const _useVueFlow = ref(null)
    // let updateViewFlag = ref(false)
    return {
      selected,
      selected2,
    }
  }
)
