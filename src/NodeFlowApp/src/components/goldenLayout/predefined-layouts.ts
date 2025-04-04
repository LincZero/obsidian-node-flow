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
				title: "文字编辑器",
				header: { show: "top", popout: false },
				// isClosable: false,
				componentType: "JsonEditor",
				componentState: undefined,
				width: 20
			} as ComponentItemConfig,
			{
				type: "component",
				title: "画布",
				header: { show: "top", popout: false },
				componentType: "NodeFlow",
				width: 65
			} as ComponentItemConfig,
			{
				type: "component",
				title: "节点编辑器",
				header: { show: "top", popout: false },
				componentType: "NodeEditor",
				width: 15
			} as ComponentItemConfig
		]
	}
};

export const prefinedLayouts = {
	miniRow: miniRowConfig,
}
