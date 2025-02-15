export function factoryFlowData_vueflow(parsedData:any|string): {code: number, msg: string, data: object} {
  // 使用demo数据
  if (typeof parsedData === "string") {
    if (parsedData == "demo") { parsedData = JSON.parse(JSON.stringify(testData_vueflow)) }
    else if (parsedData == "demo2") { parsedData = JSON.parse(JSON.stringify(testData_vueflow_withoutPos)) }
    else if (parsedData == "demo3") { parsedData = JSON.parse(JSON.stringify(testData_vueflow_customNode)) }
    else { return {code: -1, msg: "error demo: "+parsedData, data: {}}  }
  }

  return {code: 0, msg: "", data: parsedData}
}

const testData_vueflow = {
  "nodes": [
    {"id": "1", "type": "input", "position": {"x": 250, "y": 5}, "data": {"label": "Node 11"}},
    {"id": "2", "position": {"x": 100, "y": 100}, "data": {"label": "Node 12"}},
    {"id": "3", "type": "output", "position": {"x": 400, "y": 200}, "data": {"label": "Node 13"}},
    {"id": "4", "type": "special", "position": {"x": 600, "y": 100}, "data": {"label": "Node 14", "hello": "world"}}
  ],
  "edges": [
    {"id": "e1->2", "source": "1", "target": "2"},
    {"id": "e2->3", "source": "2", "target": "3", "animated": true},
    {"id": "e3->4", "type": "special", "source": "3", "target": "4", "data": {"hello": "world"}}
  ]
}

export const testData_vueflow_withoutPos = {
  nodes: [
    {
      id: '1',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '2',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '2a',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '2b',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '2c',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '2d',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '3',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '4',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '5',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '6',
      position: { x: 0, y: 0 },
      type: 'process',
    },
    {
      id: '7',
      position: { x: 0, y: 0 },
      type: 'process',
    },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2', type: 'animation', animated: true },
    { id: 'e1-3', source: '1', target: '3', type: 'animation', animated: true },
    { id: 'e2-2a', source: '2', target: '2a', type: 'animation', animated: true },
    { id: 'e2-2b', source: '2', target: '2b', type: 'animation', animated: true },
    { id: 'e2-2c', source: '2', target: '2c', type: 'animation', animated: true },
    { id: 'e2c-2d', source: '2c', target: '2d', type: 'animation', animated: true },
    { id: 'e3-7', source: '3', target: '4', type: 'animation', animated: true },
    { id: 'e4-5', source: '4', target: '5', type: 'animation', animated: true },
    { id: 'e5-6', source: '5', target: '6', type: 'animation', animated: true },
    { id: 'e5-7', source: '5', target: '7', type: 'animation', animated: true },
  ]
}

export const testData_vueflow_customNode = {
  nodes: [
    {
      id: '1',
      type: 'color-selector',
      data: { color: '#6F3381' },
      position: { x: 0, y: 50 },
    },
    {
      id: '2',
      type: 'color-output',
      position: { x: 350, y: 114 },
      targetPosition: 'left',
    },
  ],
  edges: [
    {
      id: 'e1a-2',
      source: '1',
      sourceHandle: 'a',
      target: '2',
      animated: true,
      style: {
        stroke: '#6F3381',
      },
    },
  ]
}
