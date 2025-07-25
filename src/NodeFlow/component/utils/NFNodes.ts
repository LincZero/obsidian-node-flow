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
import { NFNode } from './NFNode';

/** 节点集
 * 
 * 一个画布中的数据集，包括多个节点的相关数据
 * 
 * ## 生命周期
 * 
 * - 顺序: nfNodes -> vueflow数据 -> nfNode
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
  public jsonType: Ref<string> = ref('') // 节点图类型
  public jsonStr: Ref<string> = ref('')
  public jsonData: Ref<{nodes:Node[], edges:Edge[]}> = ref({nodes:[], edges:[]}) // 特点: 大json引用、可转json。通过 VueFlow api 变更时能检测到
  public nfNodes: Record<string, NFNode> = {} // 特点: 对象数据
  // public componentKey: Ref<number> = ref(0) // 用于强制刷新
  // private calcLayout:any // 记录自动布局 const { calcLayout } = useLayout(); this.calcLayout = calcLayout

  // #region 特殊函数

  private constructor() {}

  public static useGetNFNodes(): NFNodes|null {
    // 容器一，多个 NFNodes 时适用
    let result = inject('nfNodes', null);
    if (result != null) {
      return result
    }

    // 容器二，单 NFNodes 时适用，不要求后代中获取 (App的其他控件窗口适用)
    // 这种方式的类型私有有问题，useGlobalState 存对象有问题
    const { nfNodes } = useGlobalState()
    // 这里主要是往外传递类型判断会舍弃私有部分，但再传回来由于在类中又要求判断私有部分，所以要 as any
    const nfNodes_: NFNodes|null = nfNodes.value as any
    if (nfNodes == null) console.error('nfNodes in useGlobalState is null')
    return nfNodes_
  }

  public static useFactoryNFNodes() {
    const nfNodes_: NFNodes = new NFNodes()

    // 容器处理，必须先处理容器再处理其他
    // 容器一
    provide('nfNodes', nfNodes_)
    // 容器二
    const { nfNodes } = useGlobalState()
    nfNodes.value = nfNodes_

    nfNodes_.init_auto_update()

    return nfNodes_
  }

  /** 初始化自动更新相关的工作 */
  private init_auto_update() {
    // #region 自动更新 - 避免双向同步无限循环
    // 更新链：nfStr -> nfData -> nodes/edges，若向上传递，则需要设置syncFlag避免无限循环同步
    let flag_str2data = false;
    let flag_data2str = false;
    // #endregion

    // #region 自动更新 - string -> data
    // TODO 由于触发源是文本框，这里可以加上节流防抖的逻辑
    watch(this.jsonStr, (newVal) => {
      if (flag_data2str) { flag_data2str = false; return }
      flag_str2data = true
      nextTick(() => { flag_str2data = false; });
      console.log("[auto update] [all] string -> data")

      // 新数据
      let result = factoryFlowData(this.jsonType.value, this.jsonStr.value)
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
          for (const node_old of this.jsonData.value.nodes) {
            if (node_old.id == node_new.id) {
              node_new.position = node_old.position
              node_new.data.runState = node_old.data.runState
              break
            }
          }
        }
      }
      // 更新数据
      Object.assign(this.jsonData.value, result.data)
    }) // , { immediate: true }
    // #endregion

    // #region 自动更新 - data -> string
    watch(this.jsonData, (newVal)=>{
      if (flag_str2data) { flag_str2data = false; return }
      flag_data2str = true;
      nextTick(() => { flag_data2str = false; });
      console.log("[auto update] [all] data -> string")

      const result = serializeFlowData(this.jsonType.value, this.jsonData.value)
      if (result.code != 0) {
        result.data = "无法保存修改:"+result.msg
        return
      }
      this.jsonStr.value = result.data;
      
      // TODO 可选: 可写环境的持久化保存、手动保存      
      // this.update_nodesAndEdges()
    }, {deep: true})
    // #endregion
  }

  // #endregion

  /** 生成一个新的不冲突的节点id
   * @param baseId 如果有baseId，生成的新id的前缀为baseId。如果baseId本身不重复，返回baseId
   */
  public create_newId(baseId?: string): string {
    let count = 1

    if (baseId) { // [baseId, baseId-2, ...]
      while(true) {
        if (count > 1000) { // 避免死循环
          throw new Error("create_newId: too many nodes: " + count);
        }
        const newId = baseId + (count==1?'':'-'+count)
        if (!this.findNode(newId)) return newId
        // console.warn("continue find", count);
        count++
      }
    } else { // [1, 2, ...]
      baseId = ''
      while(true) {
        if (count > 1000) { // 避免死循环
          throw new Error("create_newId: too many nodes: " + count);
        }
        const newId = baseId + count
        if (!this.findNode(newId)) return newId
        // console.warn("continue find", count);
        count++
      }
    }
  }

  /** 自动布局
   * @param calcLayout 通过该方式获取: `import { useLayout } from '../../utils/layout/useLayout'; const { calcLayout } = useLayout();`
   * @param isAble 如果为true, 则节点位置(0,0)时才进行自动布局
   */
  public autoSet_layout(direction:string='LR', amend:string='center', isAble?: boolean): void {

    if (isAble) {
      if (!(this.jsonData.value.nodes.length>1 &&
        this.jsonData.value.nodes[0].position.x == 0 && this.jsonData.value.nodes[0].position.y == 0 &&
        this.jsonData.value.nodes[1].position.x == 0 && this.jsonData.value.nodes[1].position.y == 0
      )) {
        console.log('Needn\'t auto set layout', this.jsonData.value.nodes.length>1,
          this.jsonData.value.nodes[0].position.x == 0 && this.jsonData.value.nodes[0].position.y,
          this.jsonData.value.nodes[1].position.x == 0 && this.jsonData.value.nodes[1].position.y == 0
        )
        return
      }
    }

    const { calcLayout } = this._calcLayout
    this.jsonData.value.nodes = calcLayout(this.jsonData.value.nodes, this.jsonData.value.edges, direction, amend)
    const { fitView } = this._useVueFlow
    nextTick(() => { fitView() })
  }

  public get_mdData(): string {
    return `\`\`\`${this.jsonType.value}\n${this.jsonStr.value}\n\`\`\`\n`
  }

  public findNode(id: string): null|Node {
    return this.jsonData.value.nodes.find((node:any) => node.id === id) || null;
  }

  // TODO 分自动存储和手动存储、是否持久化存储
  public save() {
  }

  /** 功能 - 展示json数据 */
  public fn_printData(type:"mdData"|"rawData"|"jsonData") {
    let data: any
    if (type == "mdData") data = "\n" + this.get_mdData()
    else if (type == "rawData") data = "\n" + this.jsonStr.value
    else data = this.jsonData.value
    console.log("Debug json:", data)
  }

  /** 功能 - 拷贝到黏贴版 */
  public fn_copyData (type:"mdData"|"rawData"|"jsonData") {
    let data: string
    if (type == "mdData") data = this.get_mdData()
    else if (type == "rawData") data = this.jsonStr.value
    else {
      const _rawData = computed(() => JSON.stringify(removeParentField(this.jsonData.value), null, 2));
      data = _rawData.value
    }

    navigator.clipboard.writeText(data).then(() => {
      console.log('Info: copy success');
    }, () => {
      console.error('Error: copy fail');
    });

    /** 去除json递归 (去除parent字段) */
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

  // ---------------------- 与VueFlow有关接口, use变量缓存 ------------------

  // 一些全局存储
  public _useVueFlow: any|null = null
  public _calcLayout: any|null = null
}
