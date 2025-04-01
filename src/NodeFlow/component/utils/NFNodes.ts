/**
 * NFNodes 类独占文件
 */
import type { Node, Edge } from '@vue-flow/core' 
import { ComputedRef, computed, ref, unref, toRaw, watch, type Ref, provide } from 'vue';
import { factoryFlowData, failedFlowData } from '../../utils/jsonTool/factoryFlowData'
import NodeFlowContainerS from '../../component/container/NodeFlowContainerS.vue';
import { serializeFlowData } from '../../utils/serializeTool/serializeFlowData'

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
 * - 去除底层依赖，减少vueflow依赖
 */
export class NFNodes {
  public type: Ref<string> = ref('')
  public nfStr: Ref<string> = ref('')
  public nfData: Ref<any> = ref({nodes:[], edges:[]})
  public componentKey: Ref<number> = ref(0) // 用于强制刷新

  // vueflow有关部分
  nodes = ref<Node[]>([])
  edges = ref<Edge[]>([])

  constructor() {
    provide('nfNodes', this)
    
    // 自动更新部分 // TODO 由于触发源是文本框，这里可以加上节流防抖的逻辑
    watch(this.nfStr, (newVal) => {
      let result = factoryFlowData(this.type.value, this.nfStr.value)
      if (result.code != 0) {
        result = failedFlowData(result.msg)
      }
      this.nfData.value = result.data
      this.componentKey.value += 1
      console.log("[auto update] string -> data")
    }, { immediate: true })

    // 注意点：光标离开输入框后才能更新
    watch(this.nfData, (newVal)=>{
    //   const result = serializeFlowData(this.type.value, this.nfData.value)
    //   if (result.code != 0) {
    //     result.data = "无法保存修改:"+result.msg
    //   }
    //   this.nfStr.value = result.data
    //   // TODO 可选: 可写环境的持久化保存、手动保存
    //   console.log("[auto update] data -> string")

      // this.update_nodesAndEdges()
    }, {deep: true})

    this.update_nodesAndEdges()
  }

  public get_mdData(): string {
    return `\`\`\`${this.type.value}\n${this.nfStr.value}\n\`\`\`\n`
  }

  // TODO 分自动存储和手动存储、是否持久化存储
  public save() {
  }

  // TODO 检查响应是否正常
  public update_nodesAndEdges() {
    try {
      this.nodes.value = this.nfData.value.nodes
      this.edges.value = this.nfData.value.edges
    } catch (error) {
      console.error('Failed to parse json:', error, "rawJson:", JSON.stringify(this.nfStr));
    }
  }
}
