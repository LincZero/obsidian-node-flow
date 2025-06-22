/**
 * 全局状态存储器 (仅部分环境需要，部分环境不需要这部分)
 * 
 * 主要是golden-layout布局中，layout之间都是松耦合关系，无法通过props或inject等方式传参。都是使用的这个
 * 
 * 信息源使用优先级：props > inject > globalState
 * 
 * - 伪全局 (目前是这个，后面应该要修改成真全局)，一个nfNodes对应一个
 * - 真全局
 */

import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'
import { NFNodes } from '../component/utils/NFNodes'

export const useGlobalState = createGlobalState(
  () => {
    // TODO 选择对象可以简化去掉冗余，应该封装到 nfNodes 里
    const selected = ref<string[]>([])    // 自行维护的已选列表. type: ref<string[]>([])
    const selected2 = ref<unknown>(null) // vueflow维护的已选列表 (之前有bug, 后来莫名其妙修好了)
    const nfNodes = ref<NFNodes|null>(null)
    // const _useVueFlow = ref(null)
    // let updateViewFlag = ref(false)
    return {
      selected,
      selected2,
      nfNodes
    }
  }
)
