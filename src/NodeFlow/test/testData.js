/**
 * 仅用于：开发测试、demo示例、单元测试
 * 
 * TODO: Schema校验
 */

export const testData_vueflow = {
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

export const testData_obcanvas = {
  "nodes":[
    {"id":"d1acdb5136ffb1f1","x":25,"y":70,"width":250,"height":60,"type":"text","text":"Test1\n"},
    {"id":"f7dc36d69da1bb36","x":330,"y":70,"width":250,"height":60,"type":"text","text":"Test2\n"}
  ],
  "edges":[
    {"id":"fc3f1bc43902aac9","fromNode":"d1acdb5136ffb1f1","fromSide":"right","toNode":"f7dc36d69da1bb36","toSide":"left"}
  ]
}

export const testData_comfyUI = {
  "last_node_id": 9,
  "last_link_id": 9,
  "nodes": [
    {
      "id": 6,
      "type": "CLIPTextEncode",
      "pos": {"0": 373,"1": 47},
      "size": {"0": 422.84503173828125,"1": 164.31304931640625},
      "flags": {},
      "order": 2,
      "mode": 0,
      "inputs": [
        {
          "name": "clip",
          "type": "CLIP",
          "link": 3
        }
      ],
      "outputs": [
        {
          "name": "CONDITIONING",
          "type": "CONDITIONING",
          "links": [4],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "CLIPTextEncode"
      },
      "widgets_values": [
        "beautiful scenery nature glass bottle landscape, , purple galaxy bottle,"
      ]
    },
    {
      "id": 7,
      "type": "CLIPTextEncode",
      "pos": {"0": 408,"1": 569},
      "size": {"0": 425.27801513671875,"1": 180.6060791015625},
      "flags": {},
      "order": 3,
      "mode": 0,
      "inputs": [
        {
          "name": "clip",
          "type": "CLIP",
          "link": 5
        }
      ],
      "outputs": [
        {
          "name": "CONDITIONING",
          "type": "CONDITIONING",
          "links": [6],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "CLIPTextEncode"
      },
      "widgets_values": [
        "text, watermark"
      ]
    },
    {
      "id": 5,
      "type": "EmptyLatentImage",
      "pos": {"0": 489,"1": 809},
      "size": {"0": 315,"1": 106},
      "flags": {},
      "order": 0,
      "mode": 0,
      "inputs": [],
      "outputs": [
        {
          "name": "LATENT",
          "type": "LATENT",
          "links": [2],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "EmptyLatentImage"
      },
      "widgets_values": [512,512,1]
    },
    {
      "id": 8,
      "type": "VAEDecode",
      "pos": {"0": 1325,"1": 336},
      "size": {"0": 210,"1": 46},
      "flags": {},
      "order": 5,
      "mode": 0,
      "inputs": [
        {
          "name": "samples",
          "type": "LATENT",
          "link": 7
        },
        {
          "name": "vae",
          "type": "VAE",
          "link": 8
        }
      ],
      "outputs": [
        {
          "name": "IMAGE",
          "type": "IMAGE",
          "links": [9],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "VAEDecode"
      },
      "widgets_values": []
    },
    {
      "id": 9,
      "type": "SaveImage",
      "pos": {"0": 1577,"1": 335},
      "size": [210,270],
      "flags": {},
      "order": 6,
      "mode": 0,
      "inputs": [
        {
          "name": "images",
          "type": "IMAGE",
          "link": 9
        }
      ],
      "outputs": [],
      "properties": {},
      "widgets_values": [
        "ComfyUI"
      ]
    },
    {
      "id": 3,
      "type": "KSampler",
      "pos": {"0": 941,"1": 377},
      "size": {"0": 315,"1": 262},
      "flags": {},
      "order": 4,
      "mode": 0,
      "inputs": [
        {
          "name": "model",
          "type": "MODEL",
          "link": 1
        },
        {
          "name": "positive",
          "type": "CONDITIONING",
          "link": 4
        },
        {
          "name": "negative",
          "type": "CONDITIONING",
          "link": 6
        },
        {
          "name": "latent_image",
          "type": "LATENT",
          "link": 2
        }
      ],
      "outputs": [
        {
          "name": "LATENT",
          "type": "LATENT",
          "links": [7],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "KSampler"
      },
      "widgets_values": [
        984943483018319,
        "randomize",
        20,
        8,
        "euler",
        "normal",
        1
      ]
    },
    {
      "id": 4,
      "type": "CheckpointLoaderSimple",
      "pos": {"0": 19, "1": 438},
      "size": {"0": 315,"1": 98},
      "flags": {},
      "order": 1,
      "mode": 0,
      "inputs": [],
      "outputs": [
        {
          "name": "MODEL",
          "type": "MODEL",
          "links": [1],
          "slot_index": 0
        },
        {
          "name": "CLIP",
          "type": "CLIP",
          "links": [3,5],
          "slot_index": 1
        },
        {
          "name": "VAE",
          "type": "VAE",
          "links": [8],
          "slot_index": 2
        }
      ],
      "properties": {
        "Node name for S&R": "CheckpointLoaderSimple"
      },
      "widgets_values": [
        "abyssorangemix2SFW_abyssorangemix2Sfw.safetensors"
      ]
    }
  ],
  "links": [
    [1,4,0,3,0,"MODEL"],
    [2,5,0,3,3,"LATENT"],
    [3,4,1,6,0,"CLIP"],
    [4,6,0,3,1,"CONDITIONING"],
    [5,4,1,7,0,"CLIP"],
    [6,7,0,3,2,"CONDITIONING"],
    [7,3,0,8,0,"LATENT"],
    [8,4,2,8,1,"VAE"],
    [9,8,0,9,0,"IMAGE"]
  ],
  "groups": [],
  "config": {},
  "extra": {
    "ds": {
      "scale": 1.1000000000000003,
      "offset": [105.73286361205797,93.22187298366379]
    }
  },
  "version": 0.4
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

export const testData_list = `
- nodes
  - node1:KSample
    - Latent, o
    - model, i
    - positive, i
    - negative, i
    - Latent, i
    - seed,
    - control_after_generate,, randomize
    - steps,, 20
    - CFG,, 8.0
    - sampler_name,, euler
    - scheduler,, normal
    - denoise,, 1.00
    - io defaultTest, i , test
    - io defaultTest, o, test
    - t1:noValueTest,
    - t2:,, noKeyTest
      mul lines test
  - node2:KSample
    - 潜空间, o
    - 模型, i
    - 正面条件, i
    - 负面条件, i
    - 潜空间, i
    - 种子,
    - 运行后操作,
    - 步数,
    - CFG,
    - 采样器/采样方法,
    - 调度器,
    - 降噪,
  - translate
- edges
  - node1,Latent, translate,l
  - translate,r, node2, 潜空间
`

export const testData_list2 = `
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
    - only name, 
    - v5:, , only value
      v5-1
      v5-2
- edges
`
