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
				width: 25
			} as ComponentItemConfig,
			{
				type: "component",
				title: "NodeFLow",
				header: { show: "top", popout: false },
				componentType: "NodeFlow",
				width: 75
			} as ComponentItemConfig
		]
	}
};

export const prefinedLayouts = {
	miniRow: miniRowConfig,
}
