// 全局状态存储器 (仅部分环境需要，部分环境不需要这部分)

import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export const useGlobalState = createGlobalState(
  () => {
    const count = ref(0)
    const selected = ref(null)
    const selected2 = ref(null)
    const _useVueFlow = ref(null)
    return { 
      count,
      selected,
      selected2,
      _useVueFlow
    }
  }
)
