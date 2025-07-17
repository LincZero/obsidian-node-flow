import { createApp, App as VueApp } from 'vue';
import NodeFlowContainerS from '../../component/container/NodeFlowContainerS.vue';

import { factoryFlowData, failedFlowData } from '../jsonTool/factoryFlowData'

import { nfSetting } from '../../utils/main/setting'
import { NFNodes } from '../../component/utils/NFNodes';

/// 在div内创建指定的 Vue UI
export function factoryVueDom(
  jsonType: string = "nodeflow-item",
  div: HTMLElement,
  mdStr: string = "",
  isMini: boolean = true,
  fn_save: (str: string) => void = ()=>{ console.warn("The save hook is not set") }
):void {
  // 代码块，替换为节点流画布
  const targetEl = div
  mountVue(targetEl, isMini)

  /// 将targetVue挂载到targetEl上
  function mountVue (targetEl:HTMLElement, _isMini:boolean) {
    const nfNodes = NFNodes.useFactoryNFNodes()
    nfNodes.nfType.value = jsonType
    nfNodes.jsonStr.value = mdStr

    // 根据新json生成节点流
    const _app = createApp(NodeFlowContainerS, { // `<NodeFlowContainerS>` (检索型注释)
      nfNodes: nfNodes,
      fn_newView: async ()=>{ // 闭包
        const targetEl: HTMLElement = await nfSetting.fn_newView()
        mountVue(targetEl, false)
      },
      fn_save: fn_save,
      isMini: _isMini
    });
    _app.mount(targetEl);
  }
}
