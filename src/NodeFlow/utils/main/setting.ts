/// 全局变量，以及部分适配器操作
/// 需要注意适配操作极为关键。因为该项目会用于编译多个场景，不同场景使用不同的依赖组

export let nfSetting: any = {
  app: null,  // App,
  ctx: null,  // MarkdownPostProcessorContext,
  cahce_workspace: null,
  isDebug: false,
  md: null,   // MarkdownIt
  fn_renderMarkdown: ()=>{},  // ! Need to defined yourself. How to render markdown
  fn_request: ()=>{},         // ! Need to defined yourself. How to request http
  fn_newView: async ()=>{}    // ! Need to defined yourself. Only Obsidian version need
}
