import { createApp, App as VueApp } from 'vue';
import NodeFlowContainerS from './component/container/NodeFlowContainerS.vue';

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
      result.data = {
        "nodes": [
          {
            "id": "ERROR",
            "position": {"x": 0, "y": 0},
            "type": "common",
            "data": {
              "label": "ERROR",
              "inputs": [],
              "outputs": [],
              "values": [
                { "id": "0", "name": "", "value": result.msg }
              ],
            }
          },
        ],
        "edges": []
      }
    }

    // 根据新json生成节点流
    const _app = createApp(NodeFlowContainerS, {
      rawData: mdStr,
      mdData: `\`\`\`${jsonType}\n${mdStr}\n\`\`\`\n`,
      jsonData: result.data,
      fn_newView: async ()=>{ // 闭包
        const targetEl: HTMLElement = await fn_newView()
        mountVue(targetEl, false)
      },
      isMini: _isMini
    });
    _app.mount(targetEl);
  }
}
