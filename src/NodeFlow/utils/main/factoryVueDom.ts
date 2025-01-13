import { createApp, App as VueApp } from 'vue';
import NodeFlowContainerS from '../../component/container/NodeFlowContainerS.vue';

import { factoryFlowData } from '../jsonTool/factoryFlowData'

// 非obsidian环境没有，需要注释掉引用该[文件(index.ts)]的相关代码。需要提供一个HTMLElement对象，允许异步
import { fn_newView } from '../../../NodeFlowView'
import { MarkdownView } from 'obsidian';

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
      result.data = {
        "nodes": [
          {
            "id": "ERROR",
            "position": {"x": 0, "y": 0},
            "type": "common", // TODO 这样的话错误信息无法复制，后续应该改用listitem类型的节点，那个可以复制
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
      jsonType: jsonType,
      jsonData: result.data,
      fn_newView: async ()=>{ // 闭包
        const targetEl: HTMLElement = await fn_newView()
        mountVue(targetEl, false)
      },
      fn_save: fn_save,
      isMini: _isMini
    });
    _app.mount(targetEl);
  }
}
