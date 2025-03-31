/**
 * NFNodes 类独占文件
 */
import { ComputedRef, computed, ref, unref, toRaw, watch, type Ref } from 'vue';
import { factoryFlowData, failedFlowData } from '../../utils/jsonTool/factoryFlowData'
import NodeFlowContainerS from '../../component/container/NodeFlowContainerS.vue';

/**
 * 一个画布中的数据集
 * 
 * 包括多个节点的相关数据
 * 
 * 注意项
 * - use类: **必须**在setup作用域下构造 (使用了inject的use组合函数)，完成闭包
 * 
 * 功能项
 * - Nodes的数组容器
 * - 自动管理普通对象(json)和响应式对象(refJson)的桥梁和适配
 */
export class NFNodes {
  public type: Ref<string> = ref('')
  public rawContent: Ref<string> = ref('')
  public ref_nfData_resultContent = ref(null)
  public componentKey: Ref<number> = ref(0) // 用于强制刷新

  constructor() {
    // 节点流数据 - 解析
    const nfData_resultContent_ = computed(() => { // type、rawContent
      let result = factoryFlowData(this.type.value, this.rawContent.value)
      if (result.code != 0) {
        result = failedFlowData(result.msg)
      }
      return result
    })
    this.ref_nfData_resultContent = ref(nfData_resultContent_.value.data)
    watch(nfData_resultContent_, (newResult) => {
      console.log("[debug] json string changed, update view")
      this.ref_nfData_resultContent.value = newResult.data
      this.componentKey.value += 1
    }, { immediate: true })
  }
}
