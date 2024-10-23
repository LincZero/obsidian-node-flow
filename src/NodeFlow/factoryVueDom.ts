import { createApp, App as VueApp } from 'vue';
import VueTest from './component/VueTest.vue';
import NodeFlowContainerS from './component/NodeFlowContainerS.vue';
import NodeFlowContainerL from './component/NodeFlowContainerL.vue';

import { factoryFlowData } from './factoryFlowData'

// 非obsidian环境没有。需要提供一个HTMLElement对象，允许异步
import { fn_newView } from '../NodeFlowView'

/// 在div内创建指定的 Vue UI
export function factoryVueDom(jsonType:string = "test", div:HTMLElement, mdStr:string = ""):void {
  // 代码块，替换为节点流画布
  const targetEl = div
  const targetVue = NodeFlowContainerS
  mountVue(targetEl, targetVue)

  /// 将targetVue挂载到targetEl上
  function mountVue (targetEl:HTMLElement, targetVue:any) {
    // 解析并转化json
    let result: {code: number, msg: string, data: object}
    result = factoryFlowData(jsonType, mdStr)
    if (result.code != 0) {
      const _app = createApp(VueTest, {
        data: result.msg
      });
      _app.mount(targetEl);
      return
    }

    // 根据新json生成节点流
    const _app = createApp(targetVue, {
      jsonData: result.data,
      fn_newView: async ()=>{
        const targetEl: HTMLElement = await fn_newView()
        const targetVue = NodeFlowContainerL
        mountVue(targetEl, targetVue)
      }
    });
    _app.mount(targetEl);
  }
}
