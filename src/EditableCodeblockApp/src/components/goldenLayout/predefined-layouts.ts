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
				title: "White",
				header: { show: "left", popout: false },
				componentType: "White",
				width: 0
			} as ComponentItemConfig,
			{
				type: "component",
				title: "MdEditor",
				header: { show: "top", popout: false },
				componentType: "MdEditor",
				width: 50
			} as ComponentItemConfig,
			{
				type: "component",
				title: "MdViewer",
				header: { show: "top", popout: false },
				componentType: "MdViewer",
				width: 50
			} as ComponentItemConfig,
			{
				type: "component",
				title: "White",
				header: { show: "right", popout: false },
				componentType: "White",
				width: 0
			} as ComponentItemConfig,
		]
	}
};

export const prefinedLayouts = {
	miniRow: miniRowConfig,
}
