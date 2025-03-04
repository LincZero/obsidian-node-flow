# 节点

## 命名

均以 `Node` 结尾

## ItemNode

### 节点项类型与节点类型

- 旧做法：定义了不同的节点类型
- 新做法：不定义不同的的节点类型，而是定义不同的节点项，不同的节点类型其本质上是使用了不同的节点项
  - 优点：能实现更灵活的组合
  - 优点：**节点本身也属于节点项**，这能够实现节点包含节点的功能

## 多格式解析的做法

有两种

- 一是格式直接解析、解码
  不同的数据先转化成合适的json数据（部分统一化），然后使用不同的节点结构
  部分统一化的标准是：以下字段的齐全
  ```json
  nodes
    id
    data
    position
    type
  edges
    id
    data
    position
    type
  ```
- 二是格式转化成统一的格式再解析
  不同的数据都要转化成相同的json结构（完全统一化），然后使用同一种节点类型
  完全统一化的标准是：包含nodes.data和edges.data内部字段的统一

这个设计在任意软件中都是一样的，例如图片格式、视频格式等。

例如我可以有mp4和avi解码器（效率性能更高、可实时进行），也可以全部转成mp4再一起读（效率更差但程序更简单）。

而我这里的json互转中，性能不太重要，通用性和代码架构更重要。我一开始是方案一，后面追加了方案二。现在是两种方案都能用
