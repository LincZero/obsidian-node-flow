// 全局状态存储器 (仅部分环境需要，部分环境不需要这部分)

import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export const useGlobalState = createGlobalState(
  () => {
    // TODO 选择对象可以简化去掉冗余，应该封装到 nfNodes 里
    const selected = ref(null)  // 自行维护的已选列表
    const selected2 = ref(null) // vueflow维护的已选列表 (之前有bug, 后来莫名其妙修好了)
    const _useVueFlow = ref(null)
    return { 
      selected,
      selected2,
      _useVueFlow
    }
  }
)
