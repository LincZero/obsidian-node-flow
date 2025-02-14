import MarkdownIt from "markdown-it";

function nfRender_fence(md: MarkdownIt, options?: any): void {
  const oldFence = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    // 查看是否匹配
    let token = tokens[idx]
    if (!token.info.toLowerCase().startsWith("nodeflow-")) { return oldFence(tokens, idx, options, env, self) }    

    // 渲染
    // type vueflow, comfyui. v1.1.0不再需要对type进行.slice(9)
    return `<VueFlow type="${token.info}" data='${(token.content as string).replace(/'/g, "&#39;")}' />`
  }
}

export default function nodeflow_mdit(md: MarkdownIt, options?: any): void {
  md.use(nfRender_fence)
}
