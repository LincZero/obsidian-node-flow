/**
 * comfyui数据转通用节点流数据
 * 
 * TODO 需要注意，普通节点和群组，节点id和标题都是不在宽高尺寸里面的！当前是高度+30，y-30，的方式临时解决
 */
export function factoryFlowData_comfyui(parsedData: any|string): {code: number, msg: string, data: object} {
  // 使用demo数据
  if (typeof parsedData === "string") {
    if (parsedData == "demo") { parsedData = JSON.parse(JSON.stringify(testData_comfyUI)) }
    else if (parsedData == "demo2") { parsedData = JSON.parse(JSON.stringify(testData_comfyUI2)) }
    else { return {code: -1, msg: "error demo: "+parsedData, data: {}}  }
  }

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

const testData_comfyUI:object = {
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

const testData_comfyUI2:object = {
  "last_node_id": 103,
  "last_link_id": 127,
  "nodes": [
    {
      "id": 52,
      "type": "ADE_StandardUniformContextOptions",
      "pos": [
        1689,
        830
      ],
      "size": {
        "0": 327.6000061035156,
        "1": 222
      },
      "flags": {},
      "order": 0,
      "mode": 0,
      "inputs": [
        {
          "link": null,
          "name": "prev_context",
          "type": "CONTEXT_OPTIONS",
          "label": "前上下文"
        },
        {
          "link": null,
          "name": "view_opts",
          "type": "VIEW_OPTS",
          "label": "视图设置"
        }
      ],
      "outputs": [
        {
          "links": [
            40
          ],
          "name": "CONTEXT_OPTS",
          "shape": 3,
          "type": "CONTEXT_OPTIONS",
          "label": "上下文设置"
        }
      ],
      "properties": {
        "Node name for S&R": "ADE_StandardUniformContextOptions"
      },
      "widgets_values": [
        16,
        1,
        4,
        "pyramid",
        false,
        0,
        1
      ]
    },
    {
      "id": 49,
      "type": "ADE_ApplyAnimateDiffModelSimple",
      "pos": [
        1703,
        675
      ],
      "size": {
        "0": 304.79998779296875,
        "1": 106
      },
      "flags": {},
      "order": 11,
      "mode": 0,
      "inputs": [
        {
          "link": 37,
          "name": "motion_model",
          "type": "MOTION_MODEL_ADE",
          "label": "动态模型"
        },
        {
          "link": null,
          "name": "motion_lora",
          "slot_index": 1,
          "type": "MOTION_LORA",
          "label": "动态LoRA"
        },
        {
          "link": null,
          "name": "scale_multival",
          "type": "MULTIVAL",
          "label": "缩放多值"
        },
        {
          "link": null,
          "name": "effect_multival",
          "type": "MULTIVAL",
          "label": "效果多值"
        },
        {
          "link": null,
          "name": "ad_keyframes",
          "type": "AD_KEYFRAMES",
          "label": "AD关键帧"
        }
      ],
      "outputs": [
        {
          "links": [
            38
          ],
          "name": "M_MODELS",
          "shape": 3,
          "slot_index": 0,
          "type": "M_MODELS",
          "label": "动态模型组"
        }
      ],
      "properties": {
        "Node name for S&R": "ADE_ApplyAnimateDiffModelSimple"
      }
    },
    {
      "id": 47,
      "type": "ADE_LoadAnimateDiffModel",
      "pos": [
        1190,
        600
      ],
      "size": {
        "0": 340,
        "1": 60
      },
      "flags": {},
      "order": 1,
      "mode": 0,
      "inputs": [
        {
          "link": null,
          "name": "ad_settings",
          "type": "AD_SETTINGS",
          "label": "AD设置"
        }
      ],
      "outputs": [
        {
          "links": [
            37
          ],
          "name": "MOTION_MODEL",
          "shape": 3,
          "slot_index": 0,
          "type": "MOTION_MODEL_ADE",
          "label": "动态模型"
        }
      ],
      "properties": {
        "Node name for S&R": "ADE_LoadAnimateDiffModel"
      },
      "widgets_values": [
        "AnimateLCM\\sd15_t2v_beta.ckpt"
      ]
    },
    {
      "id": 70,
      "type": "ControlNetLoaderAdvanced",
      "pos": [
        900,
        1390
      ],
      "size": {
        "0": 367.79998779296875,
        "1": 58
      },
      "flags": {},
      "order": 2,
      "mode": 0,
      "inputs": [
        {
          "name": "timestep_keyframe",
          "type": "TIMESTEP_KEYFRAME",
          "link": null,
          "label": "帧间隔"
        }
      ],
      "outputs": [
        {
          "name": "CONTROL_NET",
          "type": "CONTROL_NET",
          "links": [
            75
          ],
          "shape": 3,
          "label": "ControlNet"
        }
      ],
      "properties": {
        "Node name for S&R": "ControlNetLoaderAdvanced"
      },
      "widgets_values": [
        "1.5\\control_v11p_sd15_openpose.pth"
      ]
    },
    {
      "id": 69,
      "type": "ACN_AdvancedControlNetApply",
      "pos": [
        1680,
        1110
      ],
      "size": {
        "0": 355.20001220703125,
        "1": 266
      },
      "flags": {},
      "order": 20,
      "mode": 0,
      "inputs": [
        {
          "name": "positive",
          "type": "CONDITIONING",
          "link": 71,
          "label": "正面条件"
        },
        {
          "name": "negative",
          "type": "CONDITIONING",
          "link": 72,
          "label": "负面条件"
        },
        {
          "name": "control_net",
          "type": "CONTROL_NET",
          "link": 75,
          "label": "ControlNet",
          "slot_index": 2
        },
        {
          "name": "image",
          "type": "IMAGE",
          "link": 119,
          "label": "图像",
          "slot_index": 3
        },
        {
          "name": "mask_optional",
          "type": "MASK",
          "link": null,
          "label": "遮罩"
        },
        {
          "name": "timestep_kf",
          "type": "TIMESTEP_KEYFRAME",
          "link": null,
          "label": "帧间隔",
          "slot_index": 5
        },
        {
          "name": "latent_kf_override",
          "type": "LATENT_KEYFRAME",
          "link": null,
          "label": "Latent关键帧"
        },
        {
          "name": "weights_override",
          "type": "CONTROL_NET_WEIGHTS",
          "link": null,
          "label": "ControlNet权重"
        },
        {
          "name": "model_optional",
          "type": "MODEL",
          "link": null,
          "slot_index": 8
        }
      ],
      "outputs": [
        {
          "name": "positive",
          "type": "CONDITIONING",
          "links": [
            73
          ],
          "shape": 3,
          "label": "正面条件",
          "slot_index": 0
        },
        {
          "name": "negative",
          "type": "CONDITIONING",
          "links": [
            74
          ],
          "shape": 3,
          "label": "负面条件",
          "slot_index": 1
        },
        {
          "name": "model_opt",
          "type": "MODEL",
          "links": null,
          "shape": 3,
          "slot_index": 2
        }
      ],
      "properties": {
        "Node name for S&R": "ACN_AdvancedControlNetApply"
      },
      "widgets_values": [
        1,
        0,
        1
      ]
    },
    {
      "id": 60,
      "type": "LCMScheduler",
      "pos": [
        2150,
        1500
      ],
      "size": {
        "0": 315,
        "1": 82
      },
      "flags": {},
      "order": 18,
      "mode": 0,
      "inputs": [
        {
          "link": 66,
          "name": "model",
          "slot_index": 0,
          "type": "MODEL",
          "label": "model"
        }
      ],
      "outputs": [
        {
          "links": [
            55
          ],
          "name": "SIGMAS",
          "shape": 3,
          "type": "SIGMAS",
          "label": "SIGMAS"
        }
      ],
      "properties": {
        "Node name for S&R": "LCMScheduler"
      },
      "widgets_values": [
        10,
        1
      ]
    },
    {
      "id": 59,
      "type": "SamplerLCMCycle",
      "pos": [
        2170,
        1300
      ],
      "size": {
        "0": 315,
        "1": 130
      },
      "flags": {},
      "order": 3,
      "mode": 0,
      "outputs": [
        {
          "links": [
            54
          ],
          "name": "SAMPLER",
          "shape": 3,
          "type": "SAMPLER",
          "label": "SAMPLER"
        }
      ],
      "properties": {
        "Node name for S&R": "SamplerLCMCycle"
      },
      "widgets_values": [
        2,
        2,
        false,
        0
      ]
    },
    {
      "id": 63,
      "type": "BNK_CLIPTextEncodeAdvanced",
      "pos": [
        920,
        1140
      ],
      "size": {
        "0": 400,
        "1": 200
      },
      "flags": {},
      "order": 16,
      "mode": 0,
      "inputs": [
        {
          "link": 65,
          "name": "clip",
          "type": "CLIP",
          "label": "CLIP"
        }
      ],
      "outputs": [
        {
          "links": [
            72
          ],
          "name": "CONDITIONING",
          "shape": 3,
          "type": "CONDITIONING",
          "label": "条件",
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "BNK_CLIPTextEncodeAdvanced"
      },
      "widgets_values": [
        "(worst quality:1.3), unfinished sketch, blurry, normal, mundane, boring, everyday, safe, ordinary, monochrome, greyscale, text, watermark",
        "mean",
        "A1111"
      ]
    },
    {
      "id": 62,
      "type": "BNK_CLIPTextEncodeAdvanced",
      "pos": [
        920,
        860
      ],
      "size": {
        "0": 400,
        "1": 200
      },
      "flags": {},
      "order": 15,
      "mode": 0,
      "inputs": [
        {
          "link": 64,
          "name": "clip",
          "slot_index": 0,
          "type": "CLIP",
          "label": "CLIP"
        }
      ],
      "outputs": [
        {
          "links": [
            71
          ],
          "name": "CONDITIONING",
          "shape": 3,
          "type": "CONDITIONING",
          "label": "条件",
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "BNK_CLIPTextEncodeAdvanced"
      },
      "widgets_values": [
        "(best quality, masterpiece), 1boy, mechano punk plaza, blue eyes, dancing",
        "mean",
        "A1111"
      ]
    },
    {
      "id": 92,
      "type": "IPAdapterApply",
      "pos": [
        2672.018828230932,
        342.46597762958794
      ],
      "size": {
        "0": 315,
        "1": 258
      },
      "flags": {},
      "order": 19,
      "mode": 0,
      "inputs": [
        {
          "name": "ipadapter",
          "type": "IPADAPTER",
          "link": 103,
          "label": "IP适配"
        },
        {
          "name": "clip_vision",
          "type": "CLIP_VISION",
          "link": 104,
          "label": "CLIP视觉",
          "slot_index": 1
        },
        {
          "name": "image",
          "type": "IMAGE",
          "link": 105,
          "label": "图像"
        },
        {
          "name": "model",
          "type": "MODEL",
          "link": 106,
          "label": "模型"
        },
        {
          "name": "attn_mask",
          "type": "MASK",
          "link": null,
          "label": "关注层遮罩"
        }
      ],
      "outputs": [
        {
          "name": "MODEL",
          "type": "MODEL",
          "links": [
            107
          ],
          "shape": 3,
          "label": "模型",
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "IPAdapterApply"
      },
      "widgets_values": [
        1,
        0,
        "original",
        0,
        1,
        false
      ]
    },
    {
      "id": 94,
      "type": "CheckpointLoader|pysssss",
      "pos": [
        1050,
        390
      ],
      "size": {
        "0": 410,
        "1": 122
      },
      "flags": {},
      "order": 4,
      "mode": 0,
      "outputs": [
        {
          "name": "MODEL",
          "type": "MODEL",
          "links": [
            112
          ],
          "shape": 3,
          "label": "模型",
          "slot_index": 0
        },
        {
          "name": "CLIP",
          "type": "CLIP",
          "links": [
            113
          ],
          "shape": 3,
          "label": "CLIP",
          "slot_index": 1
        },
        {
          "name": "VAE",
          "type": "VAE",
          "links": null,
          "shape": 3,
          "label": "VAE"
        }
      ],
      "properties": {
        "Node name for S&R": "CheckpointLoader|pysssss"
      },
      "widgets_values": [
        {
          "content": "sd1.5\\动漫\\darkSushiMixMix_225D.safetensors",
          "image": "checkpoints/sd1.5\\动漫\\darkSushiMixMix_225D.jpg"
        },
        "[none]"
      ]
    },
    {
      "id": 50,
      "type": "ADE_UseEvolvedSampling",
      "pos": [
        2130,
        870
      ],
      "size": {
        "0": 315,
        "1": 118
      },
      "flags": {},
      "order": 14,
      "mode": 0,
      "inputs": [
        {
          "link": 62,
          "name": "model",
          "slot_index": 0,
          "type": "MODEL",
          "label": "模型"
        },
        {
          "link": 38,
          "name": "m_models",
          "slot_index": 1,
          "type": "M_MODELS",
          "label": "动态模型组"
        },
        {
          "link": 40,
          "name": "context_options",
          "slot_index": 2,
          "type": "CONTEXT_OPTIONS",
          "label": "上下文设置"
        },
        {
          "link": null,
          "name": "sample_settings",
          "type": "SAMPLE_SETTINGS",
          "label": "采样设置"
        }
      ],
      "outputs": [
        {
          "links": [
            66,
            106
          ],
          "name": "MODEL",
          "shape": 3,
          "slot_index": 0,
          "type": "MODEL",
          "label": "模型"
        }
      ],
      "properties": {
        "Node name for S&R": "ADE_UseEvolvedSampling"
      },
      "widgets_values": [
        "lcm[100_ots]"
      ]
    },
    {
      "id": 93,
      "type": "CLIPVisionLoader",
      "pos": [
        2160,
        400
      ],
      "size": {
        "0": 315,
        "1": 58
      },
      "flags": {},
      "order": 5,
      "mode": 0,
      "outputs": [
        {
          "name": "CLIP_VISION",
          "type": "CLIP_VISION",
          "links": [
            104
          ],
          "shape": 3,
          "label": "CLIP视觉"
        }
      ],
      "properties": {
        "Node name for S&R": "CLIPVisionLoader"
      },
      "widgets_values": [
        "clip_h.pth"
      ]
    },
    {
      "id": 64,
      "type": "LoraLoader",
      "pos": [
        1620,
        450
      ],
      "size": {
        "0": 460,
        "1": 150
      },
      "flags": {},
      "order": 12,
      "mode": 0,
      "inputs": [
        {
          "link": 112,
          "name": "model",
          "type": "MODEL",
          "label": "模型"
        },
        {
          "link": 113,
          "name": "clip",
          "slot_index": 1,
          "type": "CLIP",
          "label": "CLIP"
        }
      ],
      "outputs": [
        {
          "links": [
            62
          ],
          "name": "MODEL",
          "shape": 3,
          "slot_index": 0,
          "type": "MODEL",
          "label": "模型"
        },
        {
          "links": [
            64,
            65
          ],
          "name": "CLIP",
          "shape": 3,
          "slot_index": 1,
          "type": "CLIP",
          "label": "CLIP"
        }
      ],
      "properties": {
        "Node name for S&R": "LoraLoader"
      },
      "widgets_values": [
        "AnimateLCM\\sd15_lora_t2v_beta.safetensors",
        1,
        1
      ]
    },
    {
      "id": 91,
      "type": "IPAdapterModelLoader",
      "pos": [
        1650,
        330
      ],
      "size": {
        "0": 450,
        "1": 60
      },
      "flags": {},
      "order": 6,
      "mode": 0,
      "outputs": [
        {
          "name": "IPADAPTER",
          "type": "IPADAPTER",
          "links": [
            103
          ],
          "shape": 3,
          "label": "IP适配",
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "IPAdapterModelLoader"
      },
      "widgets_values": [
        "IP\\1.5\\H\\ip-adapter-plus_sd15.bin"
      ]
    },
    {
      "id": 58,
      "type": "SamplerCustom",
      "pos": [
        2550,
        910
      ],
      "size": {
        "0": 355.20001220703125,
        "1": 230
      },
      "flags": {},
      "order": 21,
      "mode": 0,
      "inputs": [
        {
          "link": 107,
          "name": "model",
          "type": "MODEL",
          "label": "模型"
        },
        {
          "link": 73,
          "name": "positive",
          "slot_index": 1,
          "type": "CONDITIONING",
          "label": "正面条件"
        },
        {
          "link": 74,
          "name": "negative",
          "slot_index": 2,
          "type": "CONDITIONING",
          "label": "负面条件"
        },
        {
          "link": 54,
          "name": "sampler",
          "slot_index": 3,
          "type": "SAMPLER",
          "label": "采样器"
        },
        {
          "link": 55,
          "name": "sigmas",
          "slot_index": 4,
          "type": "SIGMAS",
          "label": "Sigmas"
        },
        {
          "link": 102,
          "name": "latent_image",
          "slot_index": 5,
          "type": "LATENT",
          "label": "Latent"
        }
      ],
      "outputs": [
        {
          "links": [],
          "name": "output",
          "shape": 3,
          "slot_index": 0,
          "type": "LATENT",
          "label": "输出"
        },
        {
          "links": [
            53
          ],
          "name": "denoised_output",
          "shape": 3,
          "slot_index": 1,
          "type": "LATENT",
          "label": "降噪输出"
        }
      ],
      "properties": {
        "Node name for S&R": "SamplerCustom"
      },
      "widgets_values": [
        true,
        0,
        "fixed",
        1.8
      ]
    },
    {
      "id": 67,
      "type": "VAELoader",
      "pos": [
        2580,
        1200
      ],
      "size": {
        "0": 315,
        "1": 58
      },
      "flags": {},
      "order": 7,
      "mode": 0,
      "outputs": [
        {
          "links": [
            69
          ],
          "name": "VAE",
          "shape": 3,
          "type": "VAE"
        }
      ],
      "properties": {
        "Node name for S&R": "VAELoader"
      },
      "widgets_values": [
        "kl-f8-anime2.ckpt"
      ]
    },
    {
      "id": 80,
      "type": "EmptyLatentImage",
      "pos": [
        1700,
        1540
      ],
      "size": {
        "0": 320,
        "1": 110
      },
      "flags": {},
      "order": 17,
      "mode": 0,
      "inputs": [
        {
          "name": "width",
          "type": "INT",
          "link": 86,
          "widget": {
            "name": "width"
          },
          "label": "宽度"
        },
        {
          "name": "height",
          "type": "INT",
          "link": 87,
          "widget": {
            "name": "height"
          },
          "label": "高度"
        },
        {
          "name": "batch_size",
          "type": "INT",
          "link": 88,
          "widget": {
            "name": "batch_size"
          },
          "label": "批次大小"
        }
      ],
      "outputs": [
        {
          "name": "LATENT",
          "type": "LATENT",
          "links": [
            102
          ],
          "shape": 3,
          "label": "Latent",
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "EmptyLatentImage"
      },
      "widgets_values": [
        512,
        512,
        1
      ]
    },
    {
      "id": 81,
      "type": "ImageSizeAndBatchSize",
      "pos": [
        1270,
        1630
      ],
      "size": {
        "0": 210,
        "1": 66
      },
      "flags": {},
      "order": 13,
      "mode": 0,
      "inputs": [
        {
          "name": "image",
          "type": "IMAGE",
          "link": 120,
          "label": "图像",
          "slot_index": 0
        }
      ],
      "outputs": [
        {
          "name": "width",
          "type": "INT",
          "links": [
            86
          ],
          "shape": 3,
          "label": "宽度",
          "slot_index": 0
        },
        {
          "name": "height",
          "type": "INT",
          "links": [
            87
          ],
          "shape": 3,
          "label": "高度",
          "slot_index": 1
        },
        {
          "name": "batch_size",
          "type": "INT",
          "links": [
            88
          ],
          "shape": 3,
          "label": "批次大小",
          "slot_index": 2
        }
      ],
      "properties": {
        "Node name for S&R": "ImageSizeAndBatchSize"
      }
    },
    {
      "id": 97,
      "type": "VHS_LoadVideo",
      "pos": [
        910,
        1540
      ],
      "size": [
        210,
        360
      ],
      "flags": {},
      "order": 8,
      "mode": 0,
      "inputs": [
        {
          "name": "batch_manager",
          "type": "VHS_BatchManager",
          "link": null
        }
      ],
      "outputs": [
        {
          "name": "IMAGE",
          "type": "IMAGE",
          "links": [
            119,
            120
          ],
          "shape": 3,
          "label": "图像",
          "slot_index": 0
        },
        {
          "name": "frame_count",
          "type": "INT",
          "links": null,
          "shape": 3,
          "label": "帧计数"
        },
        {
          "name": "audio",
          "type": "VHS_AUDIO",
          "links": null,
          "shape": 3
        }
      ],
      "properties": {
        "Node name for S&R": "VHS_LoadVideo"
      },
      "widgets_values": {
        "video": "cxk_00003_.gif",
        "force_rate": 0,
        "force_size": "Disabled",
        "custom_width": 512,
        "custom_height": 512,
        "frame_load_cap": 160,
        "skip_first_frames": 50,
        "select_every_nth": 1,
        "choose video to upload": "image",
        "videopreview": {
          "hidden": false,
          "paused": false,
          "params": {
            "frame_load_cap": 160,
            "skip_first_frames": 50,
            "force_rate": 0,
            "filename": "cxk_00003_.gif",
            "type": "input",
            "format": "image/gif",
            "select_every_nth": 1
          }
        }
      }
    },
    {
      "id": 86,
      "type": "LoadImage",
      "pos": [
        2190,
        510
      ],
      "size": {
        "0": 250,
        "1": 310
      },
      "flags": {},
      "order": 9,
      "mode": 0,
      "outputs": [
        {
          "name": "IMAGE",
          "type": "IMAGE",
          "links": [
            105
          ],
          "shape": 3,
          "label": "图像",
          "slot_index": 0
        },
        {
          "name": "MASK",
          "type": "MASK",
          "links": null,
          "shape": 3,
          "label": "遮罩"
        }
      ],
      "properties": {
        "Node name for S&R": "LoadImage"
      },
      "widgets_values": [
        "00581-420388937-((masterpiece)), (((best quality))), ((ultra-detailed)), (adult_2), ((illustration)), (cute detailed face_1.25),1girl, robotic u.png",
        "image"
      ]
    },
    {
      "id": 102,
      "type": "VHS_LoadAudio",
      "pos": [
        3320,
        1130
      ],
      "size": {
        "0": 315,
        "1": 82
      },
      "flags": {},
      "order": 10,
      "mode": 0,
      "outputs": [
        {
          "name": "audio",
          "type": "VHS_AUDIO",
          "links": [
            126
          ],
          "shape": 3,
          "label": "音频",
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "VHS_LoadAudio"
      },
      "widgets_values": {
        "audio_file": "C:\\ComfyUI_windows_portable\\ComfyUI\\input\\audio.mp3",
        "seek_seconds": 0
      }
    },
    {
      "id": 56,
      "type": "VAEDecode",
      "pos": [
        3000,
        1030
      ],
      "size": {
        "0": 210,
        "1": 46
      },
      "flags": {},
      "order": 22,
      "mode": 0,
      "inputs": [
        {
          "link": 53,
          "name": "samples",
          "type": "LATENT",
          "label": "Latent"
        },
        {
          "link": 69,
          "name": "vae",
          "slot_index": 1,
          "type": "VAE",
          "label": "VAE"
        }
      ],
      "outputs": [
        {
          "links": [
            121,
            127
          ],
          "name": "IMAGE",
          "shape": 3,
          "slot_index": 0,
          "type": "IMAGE",
          "label": "图像"
        }
      ],
      "properties": {
        "Node name for S&R": "VAEDecode"
      }
    },
    {
      "id": 103,
      "type": "SaveImage",
      "pos": [
        3372.826571377841,
        1362.901866566051
      ],
      "size": {
        "0": 315,
        "1": 58
      },
      "flags": {},
      "order": 24,
      "mode": 0,
      "inputs": [
        {
          "name": "images",
          "type": "IMAGE",
          "link": 127,
          "label": "图像"
        }
      ],
      "properties": {},
      "widgets_values": [
        "111"
      ]
    },
    {
      "id": 96,
      "type": "VHS_VideoCombine",
      "pos": [
        3790,
        1000
      ],
      "size": [
        320,
        290
      ],
      "flags": {},
      "order": 23,
      "mode": 0,
      "inputs": [
        {
          "name": "images",
          "type": "IMAGE",
          "link": 121,
          "label": "图像"
        },
        {
          "name": "audio",
          "type": "VHS_AUDIO",
          "link": 126,
          "label": "音频",
          "slot_index": 1
        },
        {
          "name": "batch_manager",
          "type": "VHS_BatchManager",
          "link": null,
          "label": "批次管理"
        }
      ],
      "outputs": [
        {
          "name": "Filenames",
          "type": "VHS_FILENAMES",
          "links": null,
          "shape": 3,
          "label": "文件名"
        }
      ],
      "properties": {
        "Node name for S&R": "VHS_VideoCombine"
      },
      "widgets_values": {
        "frame_rate": 10,
        "loop_count": 0,
        "filename_prefix": "AnimateDiff/comfy",
        "format": "video/h265-mp4",
        "pix_fmt": "yuv420p",
        "crf": 22,
        "save_metadata": true,
        "pingpong": true,
        "save_output": true,
        "videopreview": {
          "hidden": false,
          "paused": false,
          "params": {
            "filename": "comfy_00011-audio.mp4",
            "subfolder": "AnimateDiff",
            "type": "output",
            "format": "video/h265-mp4"
          }
        }
      }
    }
  ],
  "links": [
    [
      37,
      47,
      0,
      49,
      0,
      "MOTION_MODEL_ADE"
    ],
    [
      38,
      49,
      0,
      50,
      1,
      "M_MODELS"
    ],
    [
      40,
      52,
      0,
      50,
      2,
      "CONTEXT_OPTIONS"
    ],
    [
      53,
      58,
      1,
      56,
      0,
      "LATENT"
    ],
    [
      54,
      59,
      0,
      58,
      3,
      "SAMPLER"
    ],
    [
      55,
      60,
      0,
      58,
      4,
      "SIGMAS"
    ],
    [
      62,
      64,
      0,
      50,
      0,
      "MODEL"
    ],
    [
      64,
      64,
      1,
      62,
      0,
      "CLIP"
    ],
    [
      65,
      64,
      1,
      63,
      0,
      "CLIP"
    ],
    [
      66,
      50,
      0,
      60,
      0,
      "MODEL"
    ],
    [
      69,
      67,
      0,
      56,
      1,
      "VAE"
    ],
    [
      71,
      62,
      0,
      69,
      0,
      "CONDITIONING"
    ],
    [
      72,
      63,
      0,
      69,
      1,
      "CONDITIONING"
    ],
    [
      73,
      69,
      0,
      58,
      1,
      "CONDITIONING"
    ],
    [
      74,
      69,
      1,
      58,
      2,
      "CONDITIONING"
    ],
    [
      75,
      70,
      0,
      69,
      2,
      "CONTROL_NET"
    ],
    [
      86,
      81,
      0,
      80,
      0,
      "INT"
    ],
    [
      87,
      81,
      1,
      80,
      1,
      "INT"
    ],
    [
      88,
      81,
      2,
      80,
      2,
      "INT"
    ],
    [
      102,
      80,
      0,
      58,
      5,
      "LATENT"
    ],
    [
      103,
      91,
      0,
      92,
      0,
      "IPADAPTER"
    ],
    [
      104,
      93,
      0,
      92,
      1,
      "CLIP_VISION"
    ],
    [
      105,
      86,
      0,
      92,
      2,
      "IMAGE"
    ],
    [
      106,
      50,
      0,
      92,
      3,
      "MODEL"
    ],
    [
      107,
      92,
      0,
      58,
      0,
      "MODEL"
    ],
    [
      112,
      94,
      0,
      64,
      0,
      "MODEL"
    ],
    [
      113,
      94,
      1,
      64,
      1,
      "CLIP"
    ],
    [
      119,
      97,
      0,
      69,
      3,
      "IMAGE"
    ],
    [
      120,
      97,
      0,
      81,
      0,
      "IMAGE"
    ],
    [
      121,
      56,
      0,
      96,
      0,
      "IMAGE"
    ],
    [
      126,
      102,
      0,
      96,
      1,
      "VHS_AUDIO"
    ],
    [
      127,
      56,
      0,
      103,
      0,
      "IMAGE"
    ]
  ],
  "groups": [],
  "config": {},
  "extra": {},
  "version": 0.4
}
