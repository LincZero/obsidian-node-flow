/**
 * NFNodes 类独占文件
 */

import type { Node, Edge } from '@vue-flow/core' 
import { ComputedRef, computed, ref, unref, toRaw, watch, type Ref, provide, nextTick, inject } from 'vue';
import { factoryFlowData, failedFlowData } from '../../utils/jsonTool/factoryFlowData'
import NodeFlowContainerS from '../../component/container/NodeFlowContainerS.vue';
import { serializeFlowData } from '../../utils/serializeTool/serializeFlowData'
import { useLayout } from '../../utils/layout/useLayout'
import { useGlobalState } from '../../stores/stores'

/** 节点集
 * 
 * 一个画布中的数据集，包括多个节点的相关数据
 * 
 * ## 数据
 * 
 * 可以将数据分类为以下几种
 * - 
 * - 存储/io同步类：包括io流程信息。指示了工作流的因果逻辑关系。
 *   必须的
 * - 渲染类：包括位置和编辑状态等。
 *   如只需要表示逻辑，而不需要自定义位置，则无需用到该部分
 * - 运行类：包括运行状态。
 *   如无需运行，仅显示使用，则无需用到该部分
 * - 注意区分:
 *   - 非运行使用 & 运行使用
 *   - obj类 (节点集json) & 类使用 (包括obj中没有的额外信息/运行时信息)
 * 
 * ## 容器与元素
 * 
 * - 容器
 *   - provide/inject 方式
 *   - useGlobalState() `import { createGlobalState } from '@vueuse/core'`
 * - 元素
 *   - (见下)
 * 
 * 注意: NFNodes 和 NFNode 并不完全是容器和元素的关系，NFNodes 的直接元素是响应式对象。
 * 存储形式有响应式对象、str。但没有 NFNode
 * 
 * ## 功能
 * 
 * 功能项
 * 
 * - Nodes的数组容器
 * - 自动管理普通对象(json)和响应式对象(refJson)的桥梁和适配
 * - 去除底层依赖，减少vueflow依赖
 * 
 * 不具备的功能
 * 
 * - 节点的 '增删改查' 都封装在NFNode而非容器层中 (约束元素必然在容器中)
 * 
 * ## 注意项
 * 
 * - use类: **必须**在setup作用域下构造 (使用了inject的use组合函数)，完成闭包
 */
export class NFNodes {
  public nfType: Ref<string> = ref('') // 节点图类型
  public nfStr: Ref<string> = ref('')
  public nfData: Ref<{nodes:Node[], edges:Edge[]}> = ref({nodes:[], edges:[]}) // 通过 VueFlow api 变更时能检测到
  // public componentKey: Ref<number> = ref(0) // 用于强制刷新
  // private calcLayout:any // 记录自动布局 const { calcLayout } = useLayout(); this.calcLayout = calcLayout

  // #region 特殊函数

  private constructor() {}

  public static useGetNFNodes(): NFNodes|null {
    // 来源一，多个 NFNodes 时适用
    // return inject('nfNodes', null);

    // 来源二，单 NFNodes 时适用，不要求后代中获取
    const { nfNodes } = useGlobalState()
    // 这里主要是往外传递类型判断会舍弃私有部分，但再传回来由于在类中又要求判断私有部分，所以要 as any
    const nfNodes_: NFNodes|null = nfNodes.value as any
    return nfNodes_
  }

  public static useFactoryNFNodes() {
    const nfNodes_: NFNodes = new NFNodes()

    nfNodes_.init_auto_update()

    provide('nfNodes', nfNodes_)

    const { nfNodes } = useGlobalState()
    nfNodes.value = nfNodes_

    return nfNodes_
  }

  /// 初始化自动更新相关的工作
  private init_auto_update() {
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

      // 新数据
      let result = factoryFlowData(this.nfType.value, this.nfStr.value)
      if (result.code != 0) {
        result = failedFlowData(result.msg)
      }
      // 恢复部分数据 (位置和状态沿用旧数据)
      for (const node_new of result.data.nodes) {
        // 首选vueflow的数据
        if (this._useVueFlow) {
          const node_old = this._useVueFlow.findNode(node_new.id)
          if (!node_old) continue
          node_new.position = node_old.position
          node_new.data.runState = node_old.data.runState
          continue
        }
        // 次选nfData的数据 (nfData.nodes[n]中，.data都是对的，但.position等更新会不及时)
        else {
          for (const node_old of this.nfData.value.nodes) {
            if (node_old.id == node_new.id) {
              node_new.position = node_old.position
              node_new.data.runState = node_old.data.runState
              break
            }
          }
        }
      }
      // 更新数据
      Object.assign(this.nfData.value, result.data)
    }) // , { immediate: true }
    // #endregion

    // #region 自动更新 - data -> string
    watch(this.nfData, (newVal)=>{
      if (flag_str2data) { flag_str2data = false; return }
      flag_data2str = true;
      nextTick(() => { flag_data2str = false; });
      console.log("[auto update] [all] data -> string")

      const result = serializeFlowData(this.nfType.value, this.nfData.value)
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

  // #endregion

  public get_mdData(): string {
    return `\`\`\`${this.nfType.value}\n${this.nfStr.value}\n\`\`\`\n`
  }

  public findNode(id: string): null|any {
    return this.nfData.value.nodes.find((node:any) => node.id === id) || null;
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

  // ---------------------- 与VueFlow有关接口 ----------------------

  // 一些全局存储
  public _useVueFlow: any|null = null
}
