import { createApp, App as VueApp } from 'vue';
import VueTest from './component/VueTest.vue';
import NodeFlowContainerS from './component/NodeFlowContainerS.vue';

import { factoryFlowData } from './factoryFlowData'

// 非obsidian环境没有。需要提供一个HTMLElement对象，允许异步
import { fn_newView } from '../NodeFlowView'

/// 在div内创建指定的 Vue UI
export function factoryVueDom(jsonType:string = "test", div:HTMLElement, mdStr:string = "", isMini:boolean = true):void {
  // 代码块，替换为节点流画布
  const targetEl = div
  mountVue(targetEl, isMini)

  /// 将targetVue挂载到targetEl上
  function mountVue (targetEl:HTMLElement, _isMini:boolean) {
    // 解析并转化json
    let result: {code: number, msg: string, data: object}
    result = factoryFlowData(jsonType, mdStr)
    if (result.code != 0) {
      const _app = createApp(VueTest, {
        data: result.msg,
        isMini: _isMini,
      });
      _app.mount(targetEl);
      return
    }

    // 根据新json生成节点流
    const _app = createApp(NodeFlowContainerS, {
      jsonData: result.data,
      rawData: mdStr,
      fn_newView: async ()=>{ // 闭包
        const targetEl: HTMLElement = await fn_newView()
        mountVue(targetEl, false)
      },
      isMini: _isMini
    });
    _app.mount(targetEl);
  }
}
