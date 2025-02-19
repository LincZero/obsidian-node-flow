import { nfSetting } from "../main/setting"

/**
 * self-children-object
 * 
 * 特点: 该结构不应依赖于底层(即不依赖于vueflow)! 好处：存在更换底层库的变化、以及复用该描述语法
 * 功能、职责：除解析self-children外，负责解析一些内联语法，例如id、name、value等，**避免把这一步留到下步进行**
 * 
 * 字段内容
 * - 其中 self、children 特征：通用结构、有效信息量、**嵌套 nest**结构
 * - 其中 self_data 特征：冗余的 (去除不减少信息量的)、可用于缓存、便于下一步进行嵌套转**扁平 flat**化的
 */
export type type_selfChildren = type_selfChildren_node|type_selfChildren_socket|type_selfChildren_edge
type type_selfChildren_base = {
  self: string,
  children: type_selfChildren[],
}
interface type_selfChildren_node extends type_selfChildren_base {
  self_data: {                                  // node
    type: "n"|"node"|"g"|"group",               // 项类型
    id: string,                                 // 节点id (会显示)
    name: string,                               // 节点名 (会显示)
    parentId: string,                           // 父节点id，根节点没有，为 ""
    parent: type_selfChildren|null,
    items: any,                                 // 缓存节点内部数据，不再分开类型 (旧inputs+outputs+values)
  }
}
interface type_selfChildren_socket extends type_selfChildren_base {
  self_data: {                                  // socket，在nodes-edges-array中将会被废弃掉
    type: "s"|"socket",
    refType: "i"|"input"|"o"|"output"|"v"|"value"|"io",
    valueType: string,
    id: string,                                 // socketId
    name: string,                               // socket名 (会显示)
    parentId: string,                           // 父节点id，根节点没有，为 ""
    parent: type_selfChildren|null,
    value: string,                              // value类型的socket使用 (会显示，可多行)
    // TODO 增加refValue (valueType对应value, refType对应refValue。这个量是缓存型的，非序列化的。仅用于缓存上一个节点给该节点的socket)
    items: any,
  }
}
interface type_selfChildren_edge extends type_selfChildren_base {
  self_data: {                                  // edge
    type: "e"|"edge",
    id: string,                                 // 线Id, 暂时没啥用, 会自动填充的
    name: string,                               // 线名, 暂时没啥用，可能后续用来填label (不过应该用value来填会好一些吧)
    parentId: "",                               // 父节点id，暂时没啥用，暂时不存在局部声明线的情况
    parent: type_selfChildren|null,
    // value: string,                           // 线值，暂时没嗄用，可能后续可以填label
    from_node: string,
    from_socket: string,
    to_node: string,
    to_socket: string,
  }
}

/**
 * 将md list文本转化为对应json
 * 
 * 为了通用性我分成两步：
 * 1. md list 转 self-children json (每个object有且只有self和children两个属性)
 * 2. self&child json 再转 nodes&edges json
 * 
 * 命名说明：
 * - cache_前缀表示缓存前几次遍历的东西，current_前缀标签当前循环的东西
 * - mCache_(mapCache) 前缀表示基于level等级/其他index下标的缓存 (非全缓存)，是列表，其下标与内容是相对应的
 *   通常简化为 `map_` 前缀
 * - lCache_ (lastCache) 前缀表示仅缓存上一次便利的东西
 *   通常简化为 `last_` 前缀
 * - aCache_(allCache) 前缀表示缓存所有遍历过的东西 (其实map也可能是这种)
 *   通常简化为 `result_` 前缀
 */
export function factoryFlowData_listitem(md:string): {code: number, msg: string, data: object} {
  // 使用demo数据
  if (md.startsWith("demo")) {
    if (md == "demo") { md = testData_listitem }
    else if (md == "demo2") { md = testData_listitem2 }
    else if (md == "demoST") { md = testData_listitemST }
    else if (md == "demoHttp") { md = testData_listitemHttp }
    else { return {code: -1, msg: "error demo: "+md, data: {}}  }
  }

  // step1
  let result_items: type_selfChildren[]
  const result_resp = factoryFlowData_list2nest(md)
  if (result_resp.code != 0) return result_resp
  result_items = result_resp.data

  // step2. self-children-object 再转 nodes-edges-array
  // TODO 先假设不支持节点组，先假设不支持隐藏nodes和edges根节点
  {
    if (result_items.length != 2) return {code: -1, msg: "error: without rootNode: nodes and edges", data: {}}

    // 遍历 - 节点
    let nodes_new:object[] = []
    {
      recursion_node(result_items[0].children)
      function recursion_node(items: type_selfChildren[]) {
        for (let item of items) {
          if (item.self_data.type != "n" && item.self_data.type != "node" && item.self_data.type != "g" && item.self_data.type != "group") continue
          const current_node:any = {
            id: item.self_data.id,
            data: {
              type: item.self_data.type,
              label: item.self_data.name,
              items: item.self_data.items,
              // inputs: item.self_data.children.inputs.map((i:type_selfChildren_socket)=>{return {id:i.self_data.id, name:i.self_data.name, value: i.self_data.value}}),
              // outputs: item.self_data.children.outputs.map((i:type_selfChildren_socket)=>{return {id:i.self_data.id, name:i.self_data.name, value: i.self_data.value}}),
              // values: item.self_data.children.values.map((i:type_selfChildren_socket)=>{return {id:i.self_data.id, name:i.self_data.name, value: i.self_data.value}}),
            },
            position: { x: 0, y: 0 },
            ...(item.self_data.parentId==""||item.self_data.parentId=="nodes")?{}:{parentNode: item.self_data.parentId},
            type: "item",
          }
          nodes_new.push(current_node)
          recursion_node(item.children)
        }
      }
    }

    // 遍历 - 线
    let edges_new:object[] = []
    {
      // const colors = ["white", "red", "orange", "yellow", "green", "cyan", "blue", "purple", "gold", "silver"]
      const colors = [
        "#ff0000", "#ff4d00", "#ff9900", "#ffe600", "#ccff00",
        "#80ff00", "#33ff00", "#00ff1a", "#00ff66", "#00ffb3",
        "#00ffff", "#00b3ff", "#0066ff", "#001aff", "#3300ff",
        "#8000ff", "#cc00ff", "#ff00e6", "#ff0099", "#ff004c"
      ]
      recursion_edge(result_items[1].children)
      function recursion_edge(items: type_selfChildren[]) {
        for (let item of items) {
          if (item.self_data.type != "e" && item.self_data.type != "edge") continue
          const nameMapAttr = item.self_data.from_socket.toLowerCase().charCodeAt(0)%20; // 注意这里实际用的socket id而不是name做映射
          edges_new.push({
            id: item.self_data.id,
            style: {
              stroke: colors[nameMapAttr]
            },
            source: item.self_data.from_node,
            sourceHandle: item.self_data.from_socket,
            target: item.self_data.to_node,
            targetHandle: item.self_data.to_socket,
          })
          recursion_edge(item.children)
        }
      }
    }

    // 处理完成
    return { code: 0, msg: "", data: {nodes: nodes_new, edges: edges_new}}
  }
}

function factoryFlowData_list2nest(md: string): {code: number, msg: string, data: type_selfChildren[]} {
  // step1. 先转 self-children-object，完成所有语法解析操作
  let edge_id = 0;                                // 自动线id的计数
  let result_items:type_selfChildren[] = []       // 最终构建成果
  try {
    let map_indent: number[] = []                 // 缓存当前每个缩进等级对应的空格数 (注意一致性v) (其中下标0对应level0对应0缩进/0空格)
    let map_item: type_selfChildren[] = []        // 缓存当前每个缩进等级对应的最新项 (注意一致性^)
    // let last_indent;                           // 上一行的缩进空格，等同 map_indent[map_indent.length-1]
    // let last_item;                             // 上一行的解析结果，等同 map_item[map_item.length-1]
    let current_index:number = 0                  // 当前行的行数
    let current_line:string                       // 当前行的内容
    let current_exp:RegExpMatchArray              // 当前行的正则对象 (将current_line拆成indent和content)
    let current_content:string                    // 当前行的正文内容 (去除前缀的`空格-`)
    let current_indent:number                     // 当前行的缩进空格 (从0开始)
    let current_level:number                      // 当前行的级别。level表示位于第几层中嵌套中 (最外层是0)
    let current_item:type_selfChildren            // 当前行的解析结果
    let next_line:string|null = null              // 下一行的内容 (仅用于提升性能)
    let next_exp:RegExpMatchArray|null = null     // 下一行的正则对象 (仅用于提升性能)

    // 按行遍历
    const lines = md.split("\n")
    for (current_index = 0; current_index<lines.length; current_index++) {
      current_line = next_line ?? lines[current_index]
      current_exp = next_exp ?? current_line.match(/(^\s*)(- )?(.*)/);
      if (!current_exp) continue
      if (!current_exp[2]) continue // 追加项
      current_content = current_exp[3]

      /**
       * no change current, 仅处理追加项
       * 
       * 有几策略
       * 1. (旧选用) 先解析，发现非项再追加到项的value部分
       *    优点：一次遍历
       *    缺点：耦合较高，与self_data格式没解耦开
       * 2. 先遍历一便，将换行转项，再解析项
       *    优点：实现简单
       *    缺点：是读项次数会x2，后期需要再遍历一遍。第一遍处理换行项，第二遍内联分析
       * 3. (选用) 提前跳行
       *    优点：实现简单，逻辑简单。此时追加行不视为一个行，连同被追加项才是一个完整的行
       *    缺点：增加 next 项
       */
      while (true) {
        if (current_index >= lines.length-1) break
        next_line = lines[current_index+1]
        next_exp = next_line.match(/(^\s*)(- )?(.*)/)
        if (!next_exp) {
          current_index++;
          continue
        }
        if (!next_exp[2]) { // 追加项
          current_line += "\n" + next_exp[3]
          current_content += "\n" + next_exp[3]
          current_index++
          continue
        }
        break
      }

      // change1: current_indent，缩进数
      current_indent = current_exp[1].length

      // change2: current_level & map_indent，缩进等级 (小心一致性v)
      {
        current_level = -1
        for (let i=0; i<map_indent.length; i++) {
          if (map_indent[i] >= current_indent) { // eg. [0, 2, 4] & indent 1/2 -> [0, 2] & level 1
            map_indent = map_indent.slice(0, i+1)
            current_level = i
            break;
          }
        }
        if (current_level == -1) { // eg. [0, 2, 4] & indent 6 -> [0, 2, 4, 6] & level 3
          map_indent.push(current_indent)
          current_level = map_indent.length-1
        }
      }

      // change3: current_item & map_item，当前内容 & 父子关系缓存表
      current_item = {
        self: current_content,
        children: [],
        self_data: null
      }
      // 内联解析。根据value字符串解析成json，进行self_data填充
      function inline_parse(): boolean {
        /**
         * 先解析
         * 
         * 解析规则
         *   解析 `k(:v)?` 串，可以构成一个二维数组。相较于一维数组，可以对语法进行精简
         *   单行value不支持内容有逗号和冒号，多行才支持
         * self格式
         *   节点 `id(:name)?`
         *   接口 `id(:name), (i|o|v|""), (value)=""`
         *   线条 `from, from socket, to, to socket, (name)?`
         *   特殊(节点项为节点的递归包含) `id(:name)`, 但缩进更大
         */
        let ll_content:string[][] = []
        const content = current_content
        const l_content = content.split(",")
        for (let item of l_content) {
          ll_content.push(item.trim().split(":"))
        }
        // 线
        if (ll_content[3]) {
          current_item.self_data = {
            type: 'edge',
            id: ''+edge_id++,
            parentId: '', parent: null,
            from_node: ll_content[0][0],
            from_socket: ll_content[1][0],
            to_node: ll_content[2][0],
            to_socket: ll_content[3][0],
            name: ll_content[4]?ll_content[4][0]:'', // TODO 思考后续要不要为了语法统一性放最前面
          }
        }
        // socket
        else if (ll_content[1]) {
          current_item.self_data = {
            type: 'socket',
            // @ts-ignore type类型不对
            refType: (ll_content[1]&&['i','input','o','output','v','value','io'].includes(ll_content[1][0]))?ll_content[1][0]:'value',
            valueType: (ll_content[1]&&ll_content[1][1])?ll_content[1][1]:'item-default',
            id: ll_content[0][0],
            name: ll_content[0][1]??ll_content[0][0],
            parentId: '', parent: null,
            value: l_content[2] ? l_content[2].trim() : '', // 这里不要被 `:` 切分，有可能是url来的
            items: []
          }
        }
        // node-item (special)。node类型且不是根节点时，会转换为 (itemType为socket, valueType为item-item) 的节点项
        else if (ll_content[0] && ll_content[0][0] != '' && current_level > 1) {
          current_item.self_data = {
            type: 'socket',
            // @ts-ignore type类型不对
            refType: 'v',
            valueType: 'item-item',
            id: ll_content[0][0],
            name: ll_content[0][1]??ll_content[0][0],
            parentId: '', parent: null,
            value: '',
            items: []
          }
        }
        // node
        else if (ll_content[0] && ll_content[0][0] != '') {
          current_item.self_data = {
            type: 'node',
            id: ll_content[0][0],
            name: ll_content[0][1]??ll_content[0][0],
            parentId: '', parent: null,
            items: []
          }
        }
        // 不合法，可能在编辑中
        else {
          return false
        }
        map_item = map_item.slice(0, map_indent.length)
        map_item[current_level] = current_item
        return true
      }
      const ret = inline_parse()
      if (!ret) return {code: -1, msg: "error: inline parse fail", data: []}

      // change4: result_items & (parent's item)，结果 & (父容器的item项)
      {
        // 根项
        if (current_level == 0) {
          result_items.push(current_item)
          // current_item.self_data.parentId = "" // default
          // current_item.self_data.parent = null // default
        }
        // 非根项，更新与父亲有关数据
        else {
          const parent_item = map_item[current_level-1]
          // 允许socket内嵌套其他东西，不再限制
          if (parent_item.self_data.type!= "n" && parent_item.self_data.type!= "node"
            && parent_item.self_data.type!= "g" && parent_item.self_data.type!= "group"
            && parent_item.self_data.type!= "s" && parent_item.self_data.type!= "socket"
          ) continue
          current_item.self_data.parentId = parent_item.self_data.id; current_item.self_data.parent = parent_item;
          if (current_item.self_data.type == "socket" || current_item.self_data.type == "s"
            || current_item.self_data.type == "node" || current_item.self_data.type == "n"
          ) { 
            parent_item.self_data.items.push((current_item as type_selfChildren_socket).self_data)
          }
          parent_item.children.push(current_item)
        }
      }
    }
  } catch (error) {
    return {code: -1, msg: "error: list parse fail: " + error, data: []}
  }
  return {code: 0, msg:"", data: result_items}
}

export const testData_listitem = `\
- nodes
  - NodeTitle
    - only name, i
    - i2, i, *i2
    - i3, i, mul line
      i3-2
      i3-3
    - i4, i, *i4
    - only name, o
    - o2, o, *o2
    - o3, o, *o3
    - o4, o, mul line
      o4-2
      o4-3
    - v2, v, *v2
    - v4, , mul line
      v4-2
      v4-3
    - v3, , *v3
    - v5:color, :item-color, #008888
    - v6:, :item-markdown, only value
      **v6-1**
      *v6-2*
    - v7, :item-dropdown, option1|option2|option3
    - v8 only name, 
    - v9, :item-item, l
      - only name2, i
      - i22, i, *i2
      - v91, :item-item, l
        - v911, 
      - v92, :item-item, l
        - v921, 
    - v10,,over
- edges
`

export const testData_listitem2 = `\
- nodes
  - 运行一
    - Flow:空流程, io:item-flow, 
    - 空节点i, i, 
    - 空节点o, o, 
    - color, value:item-color, #0ff
  - 运行二
    - FlowDelay:延时, io:item-flowdelay, 2000
    - 空节点i, i, 
    - 空节点o, o, 
  - 运行三
    - FlowReq:Http请求, io:item-flowreq, 
    - 空节点i, i, 
    - 空节点o, o, 
  - 运行四
    - FlowEval:执行任意代码, io:item-floweval, console.log('debug output')
    - 空节点i, i, 
    - 空节点o, o, 
    - debug, value:item-debug, 
  - 运行三2:运行三
    - FlowReq:Http请求, io:item-flowreq, http://127.0.0.1:9863/test
    - 空节点i, i, 
    - 空节点o, o, 
- edges
  - 运行三, FlowReq, 运行四, FlowEval
  - 运行一, Flow, 运行二, FlowDelay
  - 运行二, FlowDelay, 运行三, FlowReq
  - 运行一, 空节点o, 运行二, 空节点i
`

// 隐藏，仅自用。用于某个应用软件
export const testData_listitemST = `\
- nodes
  - ST模拟
    - 流程模板,, 开始
    - flow2:开始, o:item-flowstart
  - 本地机器
    - 机器, o
    - 地址,, 0.0.0.0
    - 端口,, 0
  - 远程机器
    - 机器, o
    - 地址,, 127.0.0.1
    - 端口,, 8811
  - 0001:TCP连接
    - 流程模板,, 客户端
    - flow1:触发, i:item-flow
    - flow2:连接成功, o:item-flow
    - 机器(本地), i
    - 机器(对端), i
    - 通道, o, 0001
    - 通道类型,, tcp
    - 版本,, 自动
    - 读取大小,, -1
    - 读写方式,, bufferWirte/bufferRead
    - 通知驱动,, 中心回调(libevent)
    - 驱动重复,, 1
  - 0002:注册包
    - 流程模板,, 网络包
    - flow1:触发, i:item-flow
    - flow2:成功, o:item-flow
    - flow3:失败, o:item-flow
    - 通道, i, 0001
    - 次数,, 1
    - 写入内容,, {null4}{len4}{null16}\\
  {timestamp8}{str(register)76}
    - 读取检查,, {any4}{len4}
  - 0003:心跳包
    - 流程模板,, 网络包
    - flow1:触发, i:item-flow
    - flow2:完成, o:item-flow
    - flow3:失败, o:item-flow
    - 通道, i, 0001
    - 次数,, -1
    - 写入内容,, {null4}{len4}{null16}
    - 读取检查,, {any4}{len4}{any32}\\
  {str(heartbeat)}
  - 0004:UDP连接
    - 流程模板,, 客户端
    - flow1:触发, i:item-flow
    - flow2:连接成功, o:item-flow
    - 机器(本地), i
    - 机器(对端), i
    - 通道, o, 0004
    - 通道类型,, tcp
    - 版本,, 自动
    - 读写方式,, sendto/recvfrom
    - 通知驱动,, 轮询
    - 驱动重复,, 1
  - 0005:数据包
    - 流程模板,, 网络包
    - flow1:触发, i:item-flow
    - flow2:成功, o:item-flow
    - flow3:失败, o:item-flow
    - 通道, i, 0004
    - 次数,, -1
    - 间隔(ms),, -1
    - 速率(Mbps),, 2
    - 写入内容,, {statis0}{null4}
    - 读取检查,, _
    - 发包驱动,, 独立线程
    - 驱动重复,, 1
- edges
  - 本地机器, 机器, 0001, 机器(本地)
  - 远程机器, 机器, 0001, 机器(对端)
  - 本地机器, 机器, 0004, 机器(本地)
  - 远程机器, 机器, 0004, 机器(对端)
  - 0001, 通道, 0002, 通道
  - 0001, 通道, 0003, 通道
  - 0004, 通道, 0005, 通道
  - ST模拟, flow2, 0001, flow1
  - 0001, flow2, 0002, flow1
  - 0002, flow2, 0003, flow1
  - 0003, flow2, 0004, flow1
  - 0004, flow2, 0005, flow1
`

// 隐藏，仅自用
export const testData_listitemHttp = `\
- nodes
  - 运行一
    - Flow:空流程, o:item-flowstart
    - 空节点i, i
    - 空节点o, o
    - color, value:item-color, #0ff
  - 运行二
    - FlowDelay:延时, io:item-flowdelay, 2000
    - 空节点i, i
    - 空节点o, o
  - 运行三
    - FlowReq:Http请求, io:item-flowreq, 
    - 空节点i, i
    - 空节点o, o
  - 运行三2:运行三
    - flow1:Http请求, i:item-flow
    - flow2:成功, o:item-flow
    - flow3:失败, o:item-flow
    - str:web, i, http://127.0.0.1:9863/test
    - json1:请求, i, {}
    - json:结果, o
  - 信息体
    - json, o
    - 1, , 这里可以是一个可视化的json编辑器
  - 运行四
    - FlowEval:执行任意代码, io:item-floweval, console.log('debug output')
    - 空节点i, i
    - 空节点o, o
    - debug, value:item-debug, 
  - Json显示
    - json, i
    - text:, , {}TODO这个部分的内容不应该被保存
- edges
  - 信息体, json, 运行三2, json1
  - 运行一, Flow, 运行二, FlowDelay
  - 运行一, 空节点o, 运行二, 空节点i
  - 运行二, FlowDelay, 运行三, FlowReq
  - 运行三, FlowReq, 运行三2, flow1
  - 运行三2, flow2, 运行四, FlowEval
  - 运行三2, json, Json显示, json
`
