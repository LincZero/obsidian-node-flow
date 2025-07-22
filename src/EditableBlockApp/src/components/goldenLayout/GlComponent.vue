<template>
	<div ref="GlComponent" style="position: absolute; overflow: hidden">
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const GlComponent = ref<null | HTMLElement>(null);

const numberToPixels = (value: number): string => {
	return value.toString(10) + "px";
};

const setPosAndSize = (
	left: number,
	top: number,
	width: number,
	height: number
): void => {
	if (GlComponent.value) {
		const el = GlComponent.value as HTMLElement;
		el.style.left = numberToPixels(left);
		el.style.top = numberToPixels(top);
		el.style.width = numberToPixels(width);
		el.style.height = numberToPixels(height);
	}
};

const setVisibility = (visible: boolean): void => {
	if (GlComponent.value) {
		const el = GlComponent.value as HTMLElement;
		if (visible) {
			el.style.display = "";
		} else {
			el.style.display = "none";
		}
	}
};

const setZIndex = (value: string): void => {
	if (GlComponent.value) {
		const el = GlComponent.value as HTMLElement;
		el.style.zIndex = value;
	}
};

defineExpose({
	setPosAndSize,
	setVisibility,
	setZIndex,
});
</script>
