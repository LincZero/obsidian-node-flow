/**
 * NFNodes 类独占文件
 */
import type { Node, Edge } from '@vue-flow/core' 
import { ComputedRef, computed, ref, unref, toRaw, watch, type Ref, provide, nextTick } from 'vue';
import { factoryFlowData, failedFlowData } from '../../utils/jsonTool/factoryFlowData'
import NodeFlowContainerS from '../../component/container/NodeFlowContainerS.vue';
import { serializeFlowData } from '../../utils/serializeTool/serializeFlowData'
import { useLayout } from '../../utils/layout/useLayout'
import { useGlobalState } from '../../stores/stores'

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
  public nfData: Ref<{nodes:Node[], edges:Edge[]}> = ref({nodes:[], edges:[]})
  public componentKey: Ref<number> = ref(0) // 用于强制刷新
  private calcLayout:any

  constructor() {
    provide('nfNodes', this)

    const { calcLayout } = useLayout()
    this.calcLayout = calcLayout
    const { updateViewFlag } = useGlobalState()

    // #region 自动更新 - 避免双向同步无限循环
    // 更新链：nfStr -> nfData -> nodes/edges，若向上传递，则需要设置syncFlag避免无限循环同步
    let flag_str2data = false;
    let flag_data2str = false;
    // #endregion

    // #region 自动更新 - string -> data
    // TODO 由于触发源是文本框，这里可以加上节流防抖的逻辑
    watch(this.nfStr, (newVal) => {
      if (flag_data2str) { flag_data2str = false; return }
      flag_str2data = true
      nextTick(() => { flag_str2data = false; });
      console.log("[auto update] [all] string -> data")
      
      let result = factoryFlowData(this.type.value, this.nfStr.value)
      if (result.code != 0) {
        result = failedFlowData(result.msg)
      }
      // this.nfData.value = result.data
      Object.assign(this.nfData.value, result.data) // 注意：不要更新位置和状态信息
      
      // 修正位置和自动布局问题
      // TODO BUG
      // 这里如果不update_nodesAndEdges，则无法更新
      // 如果加了，会误触发一次错误的自动布局
      // 然后可以再调用一次calcLayout修正，但这会导致无法维持原来的位置。position
      // this.update_nodesAndEdges()
      updateViewFlag.value = true
    }) // , { immediate: true }
    // #endregion

    // #region 自动更新 - data -> string
    watch(this.nfData, (newVal)=>{
      if (flag_str2data) { flag_str2data = false; return }
      flag_data2str = true;
      nextTick(() => { flag_data2str = false; });
      console.log("[auto update] [all] data -> string")

      const result = serializeFlowData(this.type.value, this.nfData.value)
      if (result.code != 0) {
        result.data = "无法保存修改:"+result.msg
        return
      }
      this.nfStr.value = result.data;
      
      // TODO 可选: 可写环境的持久化保存、手动保存      
      // this.update_nodesAndEdges()
    }, {deep: true})
    // #endregion
  }

  public get_mdData(): string {
    return `\`\`\`${this.type.value}\n${this.nfStr.value}\n\`\`\`\n`
  }

  // TODO 分自动存储和手动存储、是否持久化存储
  public save() {
  }

  // 功能 - 展示json数据
  public fn_printData(type:"mdData"|"rawData"|"jsonData") {
    let data: any
    if (type == "mdData") data = "\n" + this.get_mdData()
    else if (type == "rawData") data = "\n" + this.nfStr.value
    else data = this.nfData.value
    console.log("Debug json:", data)
  }

  // 功能 - 拷贝到黏贴版
  public fn_copyData (type:"mdData"|"rawData"|"jsonData") {
    let data: string
    if (type == "mdData") data = this.get_mdData()
    else if (type == "rawData") data = this.nfStr.value
    else {
      const _rawData = computed(() => JSON.stringify(removeParentField(this.nfData.value), null, 2));
      data = _rawData.value
    }

    navigator.clipboard.writeText(data).then(() => {
      console.log('Info: copy success');
    }, () => {
      console.error('Error: copy fail');
    });

    // 去除json递归 (去除parent字段)
    function removeParentField(oldJson: any): any {
      if (Array.isArray(oldJson)) {
        return oldJson.map(item => removeParentField(item));
      } else if (typeof oldJson === 'object' && oldJson !== null) {
        const newJson: any = {};
        for (const key in oldJson) {
          if (key !== 'parent') {
            newJson[key] = removeParentField(oldJson[key]);
          }
        }
        return newJson;
      } else {
        return oldJson;
      }
    }
  }

  public findNode(id: string): null|any {
    return this.nfData.value.nodes.find((node:any) => node.id === id) || null;
  }

  // ---------------------- 与VueFlow有关接口 ----------------------
}
