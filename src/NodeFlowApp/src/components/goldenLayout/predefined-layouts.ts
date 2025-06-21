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
				type: "component",
				title: "智能编辑器",
				header: { show: "top", popout: false },
				// isClosable: false,
				componentType: "AutoEditor",
				componentState: undefined,
				width: 26
			} as ComponentItemConfig,
			{
				type: "component",
				title: "画布",
				header: { show: "top", popout: false },
				componentType: "NodeFlow",
				width: 74
			} as ComponentItemConfig,
			{
				type: "component",
				title: "后端连接器",
				header: { show: "top", popout: false },
				componentType: "BackendConnector",
				width: 20
			} as ComponentItemConfig,
		]
	}
};

export const prefinedLayouts = {
	miniRow: miniRowConfig,
}
