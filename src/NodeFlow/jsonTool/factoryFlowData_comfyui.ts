import {
  testData_comfyUI,
} from "../test/testData"
import {
  testData2
} from "../test/testData2"

/**
 * comfyui数据转通用节点流数据
 * 
 * TODO 需要注意，普通节点和群组，节点id和标题都是不在宽高尺寸里面的！当前是高度+30，y-30，的方式临时解决
 */
export function factoryFlowData_comfyui(parsedData:any): {code: number, msg: string, data: object} {
  // 使用demo数据
  if (parsedData == "demo") { parsedData = JSON.parse(JSON.stringify(testData_comfyUI)) }
  else if (parsedData == "demo2") { parsedData = JSON.parse(JSON.stringify(testData2)) }
  else { console.error("error demo") }

  try {
    let nodes_new: object[] = []
    const nodes = parsedData.nodes;
    nodes.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: ""+item.id,
        position: { x: item.pos["0"], y: item.pos["1"]-30 },
        data: {
          label: item.hasOwnProperty("title")?item.title:item.type,
          type: item.type,
          inputs: item.inputs,
          outputs: item.outputs,
          widgets_values: item.widgets_values,
        },
        ...(item.hasOwnProperty("size") ?  // 使用 `扩展运算符` 灵活简化
          { width: item.size["0"]+"px", height: item.size["1"]+30+"px" }
          : {}
        ),
        // 数据舍弃：
        // item.size
        // item.properties["Node name for S&R"]
        // item.widgets_values
        type: "comfyui",    // 数据新增
      });
    })

    /**
     * comfyui的edges规则比较特殊
     * 
     * 以 testData_comfyUI 数据为例： (注意id是从3~9共7个节点)
     * - nodes
     *   该部分存储了一部分和线有关的数据，我之前写nodeeditor也有过经验，是为了方便数据传递减少调用次数的优化
     *   按信息量来说是冗余信息
     *   
     *   node_id| inputs_link| outputs_link
     *   3      | 1,4,6,2    | [7]
     *   4      |            | [1][3,5][8]
     *   5      |            | [2]
     *   6      | 3          | [4]
     *   7      | 5          | [6]
     *   8      | 7,8        | [9]
     *   9      | 9          | 
     * 
     * - links
     *   信息应该是：[线的id, fromNode, fromIndex, toNode, toIndex, 线段类型]
     *   "links": [
     *     [1,4,0,3,0,"MODEL"],
     *     [2,5,0,3,3,"LATENT"],
     *     [3,4,1,6,0,"CLIP"],
     *     [4,6,0,3,1,"CONDITIONING"],
     *     [5,4,1,7,0,"CLIP"],
     *     [6,7,0,3,2,"CONDITIONING"],
     *     [7,3,0,8,0,"LATENT"],
     *     [8,4,2,8,1,"VAE"],
     *     [9,8,0,9,0,"IMAGE"]
     *   ],
     * 
     * 然后特别需要注意：handle的from/to或source/target的标注是相对于线而言的，不是相对于节点而言的!
     */
    let edges_new: object[] = []
    const edges = parsedData.links;
    // const colors = ["white", "red", "orange", "yellow", "green", "cyan", "blue", "purple", "gold", "silver"]
    const colors = [
      "#ff0000", "#ff4d00", "#ff9900", "#ffe600", "#ccff00",
      "#80ff00", "#33ff00", "#00ff1a", "#00ff66", "#00ffb3",
      "#00ffff", "#00b3ff", "#0066ff", "#001aff", "#3300ff",
      "#8000ff", "#cc00ff", "#ff00e6", "#ff0099", "#ff004c"
    ]
    edges.forEach((item:any) => {
      const nameMapAttr = item[5].toLowerCase().charCodeAt(0)%20;
      edges_new.push({
        // 数据转移：
        id: ""+item[0],
        style: {
          stroke: colors[nameMapAttr]
        },
        source: ""+item[1],
        sourceHandle: "source-"+item[2],
        target: ""+item[3],
        targetHandle: "target-"+item[4],
        // 数据舍弃：
        // 线类型
        // 数据新增：
        // type: "default",
      });
    })

    const groups = parsedData.groups;
    let index:number = 0
    groups.forEach((item:any) => {
      nodes_new.push({
        // 数据转移：
        id: "group-"+index++,
        position: { x: item.bounding[0], y: item.bounding[1] },
        width: item.bounding[2]+"px",
        height: item.bounding[3]+30+"px",
        data: { label: item.title },
        ...(item.hasOwnProperty("color") ?
          { style: {
            backgroundColor: item.color+"44", // 1/4透明
            zIndex: -1,
          }} :
          {}
        ),
        type: "comfyui-group", // 数据新增
      });
    })
    return { code: 0, msg: "", data: {nodes: nodes_new, edges: edges_new}}
  } catch (error) {
    return {code: -1, msg: "error: comfyui json parse fail: "+error, data: {}}
  }
}
