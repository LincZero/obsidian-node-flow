import { createApp, App as VueApp } from 'vue';
import NodeFlowContainerS from '../../component/container/NodeFlowContainerS.vue';

import { factoryFlowData, failedFlowData } from '../jsonTool/factoryFlowData'

import { nfSetting } from '../../utils/main/setting'

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
    // 解析并转化json
    let result: {code: number, msg: string, data: object}
    result = factoryFlowData(jsonType, mdStr)
    if (result.code != 0) {
      result = failedFlowData(result.msg)
    }

    // 根据新json生成节点流
    const _app = createApp(NodeFlowContainerS, {
      rawData: mdStr,
      mdData: `\`\`\`${jsonType}\n${mdStr}\n\`\`\`\n`,
      jsonType: jsonType,
      jsonData: result.data,
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
