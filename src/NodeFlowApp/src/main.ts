import { createApp } from 'vue';
import App from './App.vue';
// import './main.css'

// 适配器
import { nfSetting } from "../../NodeFlow/index"
// @env [环境] md渲染, mdit版本
import MarkdownIt from "markdown-it";
const md = new MarkdownIt({
  html: true, // 启用 HTML 标签解析
  breaks: true // 将换行符转换为 <br> 标签
})
nfSetting.fn_renderMarkdown = ((markdown: string, el: HTMLElement, ctx?: any): void => {
  el.classList.add("markdown-rendered")

  const result: string = (md as MarkdownIt).render(markdown)
  const el_child = document.createElement("div"); el.appendChild(el_child); el_child.innerHTML = result;

  // 好像在Client端没办法获取到vuepress的md对象……
  // if (!nfSetting.md) {
  //   console.warn("无法渲染markdown", nfSetting)
  //   el.innerHTML = markdown
  // }
  // else {}
})
// @env [环境] http接口，其他环境版本。需要注意ob requestUrl和fetch的返回值不一样，前者还有一层status和json
nfSetting.fn_request = async (
  url: string,
  method: string | undefined = 'GET',
  headers: Record<string, string> | undefined = undefined,
  body: string | ArrayBuffer | undefined = undefined 
) => {
  const responseData = await fetch(url, {method, headers, body});
  return responseData
}

const app = createApp(App)
app.mount('#app')

import { createApp } from 'vue'
import Notifications from '@kyvg/vue3-notification'
app.use(Notifications)
