/**
 * NFNode 类独占文件
 */

import { useVueFlow } from '@vue-flow/core'
import {
  useNodeId, useNodesData,          // TheNode
  useNodeConnections,               // Other。注意: useHandleConnections API弃用，用useNodeConnections替代
} from '@vue-flow/core'
import { ComputedRef, watch, provide, inject, nextTick, ref } from 'vue';

import { factoryFlowData } from '../../../NodeFlow/utils/jsonTool/factoryFlowData';
import { serializeFlowData } from '../../utils/serializeTool/serializeFlowData'
import { NFNodes } from './NFNodes';

interface ctx_type {
  sourceValues: { [key:string]: any },
  targetValues: { [key:string]: any },
  // sourceFlowValues: { [key:string]: any },
  // targetFlowValues: { [key:string]: any },
  check: Function
}

/** 带控制的节点类
 * 
 * ## 数据
 * 
 * 可以将数据分类为以下几种
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
 * 
 * ## 功能 - 增删改查
 * 
 * (增删改查，自动管理容器 (约束元素必然在容器中)
 * 
 * > [!warning]
 * > 其中，**禁止直接使用 vue-flow 库提供的任何的增删改查相关功能**，节点的增删改查必须使用NFNodes 或 NFNode 来完成。
 * > 
 * > 包括但不限于: 
 * > 
 * > - 从 `@vue-flow` 中获取的:
 * >   - 查: useNode, useNodeId, useNodesData, useEdge, useEdgesData, ...
 * >   - 改: 一些难以检测的赋值/更改操作
 * > - 从 `useVueFlow` 中获取的:
 * >     - findNode, updateNodeData, addNodes, removeNodes, nodes
 * >     - findEdge, updateEdgeData, addEdges, removeEdges, edges
 * >     - getConnectedEdges, getSelectedNodes
 * >
 * > 应定时搜索折叠东西，避免使用，以提高代码稳定性
 * 
 * 不过话说目前直接用 VueFlow 的增删改查功能也没啥问题，不知道为什么能捕获到变化
 * 
 * ## 容器与元素
 * 
 * - 容器
 *   - provide/inject 方式
 *   - NFNodes中
 * 
 * 是否存在严格为容器元素？是。像NodeEditor这种有副本的怎么说？ItemNode自内嵌怎么说？
 * 
 * ## 功能 - 其他
 * 
 * 封装成类主要是为了：
 * 1. 方便在中间插入自定义行为
 * 2. 方便evalItem中用户脚本的调用
 * 
 * ## 功能 - 动态部分, 运行流程
 * 
 * 1. setup作用域创建实例，自动注册watch
 * 2. 手动启动 start()
 *     1. 清空上下文 | start_ctxInit   | 重初始化 ctx
 *     2. 处理上游节点 | start_dealLast | 填充 ctx.sourceValues
 *     3. 处理自身节点 | start_dealSelf | 填充 ctx.targetValues
 *     4. 处理下游节点 | start_dealLast
 * 
 * ## 注意项
 * 
 * ~~依赖: 可在无 vueflow 依赖的环境下使用 (如非画布上的显示)~~ 无 vueflow 环境下目前的策略是不使用这里
 * 
 * TODO
 * 
 * 
 * 
 * 
 * 一致性：仅开始运行时会自动同步一次数据，平时不确保一致性。或者调用update方法自动更新以保证一致性
 * 
 * - use类: **必须**在setup作用域下构造 (使用了inject的use组合函数)，完成闭包
 * - 控制附加、装饰类: 如果节点流像NodeFlow的V1.0版本那样是用于纯显示的，则可以去除对该类的依赖和使用
 * - 功能类、运行时类、RAII类: 仅控制流程，尽量不存储状态，避免需要维护一致性
 * 
 */
export class NFNode {
  // #region 静态的东西

  public readonly nodeId: string // 可 useNodeId()
  public nfData = ref<any>() // type 同 findNode(selected.value[0]).data
  public nfStr = ref<string>('')
  private nfNodes: NFNodes|null = null

  // #endregion

  // #region 特殊函数

  public static useGetNFNode(id?: string): NFNode|null {
    // 容器一
    if (!id) {
      let result = inject('nfNode', null);
      if (result != null) {
        return result
      }
    }

    // 容器二
    const nfNodes = NFNodes.useGetNFNodes()
    const nfNode =  nfNodes?.nfNodes[id] ?? null
    return nfNode
  }

  public static useFactoryNFNode(id: string, propData:any) {
    const nfNode = new NFNode(id, propData)

    // 容器处理，必须先处理容器再处理其他
    // 容器一
    provide('nfNode', nfNode)
    // 容器二
    nfNode.nfNodes = NFNodes.useGetNFNodes()
    if (!nfNode.nfNodes) {
      console.error('can\'t find nodes')
    }
    nfNode.nfNodes.nfNodes[nfNode.nodeId] = nfNode

    nfNode.data2str()

    nfNode.init_auto_update()

    return nfNode
  }

  private constructor(nodeId: string, propData: any) {
    this.nodeId = nodeId
    this.nfData.value = propData
    this._useNodesData = useNodesData(this.nodeId)
    this._useSourceConnections = useNodeConnections({ handleType: 'target' })
    this._useTargetConnections = useNodeConnections({ handleType: 'source' })
    const { updateNodeData, findNode } = useVueFlow()
    this.updateNodeData = updateNodeData
    this.findNode = findNode

    // 流程控制 - 钩子 (注意修改和监听的都是节点的数据，而不是handle的数据)
    this._useNodesData.value.data['runState'] = 'none'
    watch(this._useNodesData, (newVal, oldVal) => { // watch: props.data.runState
      if (newVal.data.runState == 'ready') {
        this.start();
      }
    });
    
    // console.log('>>> UseNFNode ' + this.nodeId)
  }

  private init_auto_update() {
    // #region 自动更新 - 避免双向同步无限循环
    // 更新链：nfStr -> nfData -> nodes/edges，若向上传递，则需要设置syncFlag避免无限循环同步
    let flag_str2data = false;
    let flag_data2str = false;
    // #endregion

    // #region 自动更新 - string -> data
    watch(this.nfStr, (newVal) => {
      if (flag_data2str) { flag_data2str = false; return }
      flag_str2data = true
      nextTick(() => { flag_str2data = false; });
      console.log(`[auto update] [${this.nodeId}] string -> data`)

      // 更新到vueflow库
      if (!this.nfNodes) { console.error(`nfNodes 数据丢失`); return }
      if (!this.nfNodes._useVueFlow) { console.error(`nfNodes._useVueFlow 数据丢失`); return }

      // 如果修改头尾和前置空格会导致内换行头部缺失字符
      // let list = newVal.split('\n')
      // list = list.map(line => { return '  '+line })
      // const nodeStr = `- nodes\n${list.join('\n')}\n- edges\n` // TODO fix 不一定是这种形式，如有可能是json
      const nodeStr = newVal
      let result = factoryFlowData(this.nfNodes.nfType.value, nodeStr)
      if (result.code == 0 && result.data.nodes.length == 1) {
        const node = this.nfNodes.findNode(this.nodeId)
        // 注意点：
        // 不能直接赋值 (地址复制)，要使用 Object.assign 来复制对象，以触发响应式更新
        // 同理，vueflow的updateNodeData()方法也不能用
        // 更新到vueflow库
        Object.assign(node.data, result.data.nodes[0].data)
        // 更新到data
        Object.assign(this.nfData.value, result.data.nodes[0].data)
      } else {
        console.error(`输入了错误节点.
错误原因: ${result.code == 0} && ${result.data.nodes.length == 1}
错误内容: ${nodeStr}`)
      }
    })
    // #endregion

    // #region 自动更新 - data -> string
    watch(this.nfData, (newVal)=>{
      if (flag_str2data) { flag_str2data = false; return }
      flag_data2str = true;
      nextTick(() => { flag_data2str = false; });
      console.log(`[auto update] [${this.nodeId}] data -> string`)

      this.data2str()
    }, {deep: true})
    // #endregion
  }

  private data2str() {
    // this.nfDate.value 未定义
    const result = serializeFlowData(this.nfNodes.nfType.value, {nodes: [{id: this.nodeId, data: this.nfData.value}], edges: []})
    if (result.code == 0) {
      this.nfStr.value = result.data
      // 如果修改头尾和前置空格会导致内换行头部缺失字符
      // let list = result.data.split('\n')
      // list = list.slice(1, -2).map(line => { return line.slice(2) }) // 有尾换行
      // currentContent.value = list.join('\n')
    }
    else {
      this.nfStr.value = `- error,, [error] +${result.msg}`
    }
  }

  // #endregion

  // #region 节点运行相关

  // 注意:
  // 运行时参数，仅运行时能保证一致性
  // 是将items转化为的更适合运行的版本: 
  // 1. 区分io (仅视觉使用时不区分target、source。仅当需要流程控制时才区分他们)
  // 2. 数组转对象，调用更快
  // 3. 不同的环境使用不同的上下文。js可以用vue proxy，python等可以用object，走http需要较精简
  // 4. 不与ctx2引用同一对象，避免干扰ctx2的数据驱动，或者方便http io时使用
  //    不然ctx会产生一个没有数据驱动的变化并同步到ctx2，然后ctx2的变化会视为没有变化 (本质是代理拦截操作)，不引起数据驱动
  // sourceValues全部就续 + targetFlowValues中至少一个就续，则激发自身
  
  public ctx: ctx_type
  /// Proxy类型，用于将ctx内容的修改同步回去
  private ctx2: {
    sourceValues: { [key:string]: any },
    targetValues: { [key:string]: any },
    // sourceFlowValues: { [key:string]: any },
    // targetFlowValues: { [key:string]: any },
  }

  public run_node: (ctx: ctx_type) => Promise<boolean> = async () => { return true }

  /** 语法糖，用于检查需要的变量是否存在
   * 
   * 判断ctx中是否都有这些变量，如有任意一个缺失，抛出错误
   * 
   * 使用示例: `ctx.check(ctx, ['emit', 'time'], ['success'])`
   */
  public static check_io(_ctx: any, source: [], target: []) {
    const missingSourceValues = source.filter(key => !(key in _ctx.sourceValues));
    if (missingSourceValues.length > 0) {
      throw new Error(`Missing source values: ${missingSourceValues.join(', ')}`);
    }
    const missingTargetValues = target.filter(key => !(key in _ctx.targetValues));
    if (missingTargetValues.length > 0) {
      throw new Error(`Missing target values: ${missingTargetValues.join(', ')}`);
    }
  }

  /// 被调用：主动触发或被动触发
  public async start() {
    let ret: boolean;

    // step0. 初始化，TODO 有多个上游节点时，这里不应该被重复调用
    await this.start_ctxInit()

    // step1. 处理上一节点
    ret = await this.start_dealLast()
    if (!ret) return
  
    // step2. 处理本节点
    ret = await this.start_dealSelf()
    if (!ret) return
  
    // step3. 处理、激发下一个节点
    await this.start_dealNext()
  }

  /// 清空、准备上下文对象
  private async start_ctxInit() {
    this.ctx = {
      targetValues: {},
      sourceValues: {},
      check: NFNode.check_io
    }
    this.ctx2 = {
      targetValues: {},
      sourceValues: {},
    }

    const thisItems = this._useNodesData.value.data.items
    for (const item of thisItems) {
      if (item.refType == 'o' || item.refType == 'output' || item.refType == 'io') {
        this.ctx2.targetValues[item.id] = item;
        this.ctx.targetValues[item.id] = {
          id: item.id,
          name: item.name,
          value: item.value,
          cacheValue: item.value, // 如果没有上游节点，就是自身默认值
        }
      }
      if (item.refType != 'o' && item.refType != 'output') {
        this.ctx2.sourceValues[item.id] = item;
        this.ctx.sourceValues[item.id] = {
          id: item.id,
          name: item.name,
          value: item.value,
          cacheValue: item.value, // 如果没有上游节点，就是自身默认值
        }
      }
    }
  }

  /// 处理上一节点
  /// 获取上一个节点的值，遍历所有连接线
  private async start_dealLast(): Promise<boolean> {
    for (const connection of this._useSourceConnections.value) {
      const sourceNode = this.findNode(connection.source)

      // 上游节点状态检查
      if (sourceNode.data.runState != 'over') { // 前面的节点没准备好，等待下一次被激活
        console.warn(`#${this.nodeId} 前面的 #${connection.source} 没准备好，等待再次被激发`)
        // TODO 有线程冲突风险，一个方法是加个定时器待会再检查一下
        // 好像不会变回none，好像updateNodeData重复赋值runState同一个值也会触发watch来着
        // thisData.data.runState = 'ready'; updateNodeData(this.id, thisData.data);
        // const thisData = findNode(this.id)
        return false
      }

      // 上游节点项的值获取
      const sourceItems = sourceNode.data.items
      for (const item of sourceItems) { // TODO socket值的获取很烦，不能直接获取，要绕个大弯。有非常大的优化空间。如item的寻找速度可以优化，用key-value
        if (item.id == connection.sourceHandle) {
          // 自身节点项的值
          const newValue = (item.cacheValue ?? item.value) + '';
          this.ctx2.sourceValues[connection.targetHandle].cacheValue = newValue; this.ctx.sourceValues[connection.targetHandle].cacheValue = newValue
          break
        }
      }
    }
    return true
  }

  /// 处理自身节点
  private async start_dealSelf(): Promise<boolean> {
    this.nfData.value.runState = 'running'; this.updateNodeData(this.nodeId, this.nfData);

    // 执行自定义代码
    const result = await this.run_node(this.ctx)
    if (!result) {
      this.nfData.value.runState = 'error'; this.updateNodeData(this.nodeId, this.nfData);
      // 不return，出错了也要同步结果回去 (会有错误信息)
    }

    // 将输出结果同步回去 (TODO 思考是否应该不要只遍历输出节点，万一想看一下呢？)
    for (const [key, item] of Object.entries(this.ctx.targetValues)) {
      const tmp = this.ctx2.targetValues[key]
      if (tmp) {
        tmp.id = item.id
        tmp.name = item.name
        tmp.value = item.value
        tmp.cacheValue = item.cacheValue ?? item.value
      }
    }

    if (this.nfData.value.runState == 'error') return false
    this.nfData.value.runState = 'over'; this.updateNodeData(this.nodeId, this.nfData);
    return true
  }

  /// 处理、激发下一个节点
  /// TODO 不要激发全部的下层节点
  /// - 可能有failed分支
  /// - 下个节点要等待所有上游节点才能触发
  private async start_dealNext() {
    if (this._useNodesData.value.data.runState != 'over') {
      console.warn(`#${this.nodeId} 状态 ${this._useNodesData.value.data.runState}，停止向后激发`)
      return
    }
    const targetNodesId: string[] = Array.from(new Set(this._useTargetConnections.value.map((connection:any) => connection.target))) // 避免重复
    for (const nodeId of targetNodesId) {
      const data = this.findNode(nodeId).data // TODO 这里最好能获取到 propsData，不然可能有bug
      data.runState = 'ready'; this.updateNodeData(nodeId, data); // 能监听到 ready->ready，watch newVal 允许用相等的值重复赋值
    }
    if (targetNodesId.length == 0) {
      console.log(`flowControl, end`);
    }
  }

  // #endregion

  // vueflow相关

  private _useNodesData: ComputedRef<any>
  private _useSourceConnections: ComputedRef<any>
  private _useTargetConnections: ComputedRef<any>
  private readonly updateNodeData
  private readonly findNode
}
