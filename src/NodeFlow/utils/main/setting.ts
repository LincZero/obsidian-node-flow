/// 全局变量，以及部分适配器操作

// import type { App, Workspace, MarkdownPostProcessorContext } from "obsidian"
// import MarkdownIt from "markdown-it";

export let nfSetting: any = {
  app: null,  // App,
  ctx: null,  // MarkdownPostProcessorContext,
  cahce_workspace: null,
  isDebug: false,
  md: null,   // MarkdownIt
}

// @env [环境] (二选一) md渲染, obsidian版本
import { MarkdownRenderChild, MarkdownRenderer } from 'obsidian'
export const renderMarkdown = ((markdown: string, el: HTMLElement, ctx?: any): void => {
  el.classList.add("markdown-rendered")
  const mdrc: MarkdownRenderChild = new MarkdownRenderChild(el);
  if (ctx) ctx.addChild(mdrc);
  else if (nfSetting.ctx) nfSetting.ctx.addChild(mdrc);
  // @ts-ignore 新接口，但旧接口似乎不支持
  MarkdownRenderer.render(nfSetting.app, markdown, el, nfSetting.app.workspace.activeLeaf?.view?.file?.path??"", mdrc)
})
// @env [环境] (二选一) md渲染, mdit版本
// import MarkdownIt from "markdown-it";
// const md = MarkdownIt()
// export const renderMarkdown = ((markdown: string, el: HTMLElement, ctx?: any): void => {
//   el.classList.add("markdown-rendered")

//   const result: string = (md as MarkdownIt).render(markdown)
//   const el_child = document.createElement("div"); el.appendChild(el_child); el_child.innerHTML = result;

//   // 好像没办法获取到vuepress的md对象……
//   // if (!nfSetting.md) {
//   //   console.warn("无法渲染markdown", nfSetting)
//   //   el.innerHTML = markdown
//   // }
//   // else {}
// })

// @env [环境] (二选一) http接口，obsidian版本 (obsidian有自己的http接口)
import { requestUrl } from 'obsidian'
export const request = async (
  url: string,
  method: string | undefined,
  headers: Record<string, string> | undefined,
  body: string | ArrayBuffer | undefined 
) => {
  const responseData  = await requestUrl({ url, method, headers, body });
  return responseData
}

// @env [环境] (二选一) http接口，其他环境版本。需要注意ob requestUrl和fetch的返回值不一样，前者还有一层status和json
// export const request = async (
//   url: string,
//   method: string | undefined,
//   headers: Record<string, string> | undefined,
//   body: string | ArrayBuffer | undefined 
// ) => {
//   const responseData = await fetch(url, {method, headers, body});
//   return responseData
// }
