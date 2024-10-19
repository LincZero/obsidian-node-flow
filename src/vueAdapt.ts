import { createApp, App as VueApp } from 'vue';
import VueTest from './component/VueTest.vue';
import MyVueFlow from './component/MyVueFlow.vue';

// 在div内创建指定的 Vue UI
export function factoryVueDom(div:HTMLElement, vueUI:string = "test"):void {
  if (vueUI == "vueflow") {
    const _app = createApp(MyVueFlow, {});
    _app.mount(div);
  } else if (vueUI == "comfyui") {
    const _app = createApp(MyVueFlow, {});
    _app.mount(div);
  }
  else {
    const _app = createApp(VueTest, {});
    _app.mount(div);
  }
}
