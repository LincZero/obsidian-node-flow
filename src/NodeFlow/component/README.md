# 组件.README

这里模拟一下继承/实现树

组件包含树

- NodeFlowContainerS      | 区域容器, 通用按钮
  - NodeFlow              | 画布, 节点有关的按钮
    - ItemNode            | 节点
      - NodeItems         | 节点项

继承树

- ItemNodeSlot.vue  | 节点项的抽象基类
  - ……              | 节点项
