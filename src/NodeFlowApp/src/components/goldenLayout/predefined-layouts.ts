import {
	ComponentItemConfig,
	ItemType,
	LayoutConfig,
} from "golden-layout";

const miniRowConfig: LayoutConfig = {
	root: {
		type: ItemType.row,
		content: [
			{
				type: ItemType.component,
				title: "智能编辑器",
				header: { show: "top", popout: false },
				// isClosable: false,
				componentType: "AutoEditor",
				componentState: undefined,
				width: 26,
			} as ComponentItemConfig,
			{
				type: ItemType.component,
				title: "画布",
				header: { show: "top", popout: false },
				componentType: "NodeFlow",
				width: 74,
			} as ComponentItemConfig,
			{
				type: ItemType.stack,
				header: { show: "right", popout: false },
				width: 20,
				content: [
					{
						type: ItemType.component,
						title: "后端连接器",
						// icon: "fa fa-plug",
						componentType: "BackendConnector",
					} as ComponentItemConfig,
					{
						type: ItemType.component,
						title: "节点模板",
						componentType: "NodeList",
					} as ComponentItemConfig,
				]
			},
		]
	}
};

export const prefinedLayouts = {
	miniRow: miniRowConfig,
}
