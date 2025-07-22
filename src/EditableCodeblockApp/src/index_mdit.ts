// 1. markdown-it
import MarkdownIt from "markdown-it"

// // 2. markdown-it-container
// import MarkdownItConstructor from "markdown-it-container";

// 3. editable-codeblock
import { EditableCodeblock, loadPrism2 } from "../../General/EditableBlock/EditableCodeblock"
import Prism from "prismjs" // 导入代码高亮插件的core（里面提供了其他官方插件及代码高亮样式主题，你只需要引入即可）
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import "prismjs/themes/prism-okaidia.min.css" // 主题, okaidia和tomorrow都是不错黑夜主题
loadPrism2.fn = () => {
  return Prism
}

interface Options {
  multiline: boolean;
  rowspan: boolean;
  headerless: boolean;
  multibody: boolean;
  autolabel: boolean;
}

/**
 * 渲染 - codeBlock/fence 规则
 */
function render_fence(md: MarkdownIt, options?: Partial<Options>): void {
  const oldFence = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    // 黑白名单机制：白名单为空标注允许所有规则，黑名单会减少白名单的规则
    const mdit_whitelist: string[] = ["js"]
    const mdit_blacklist: string[] = []

    // 查看是否匹配
    const token = tokens[idx]
    const type = token.info.toLowerCase()
    if (mdit_whitelist.length && !mdit_whitelist.includes(type)) { // 检查白名单
      return oldFence(tokens, idx, options, env, self)
    }
    if (mdit_blacklist.length && mdit_blacklist.includes(type)) {  // 检查黑名单
      return oldFence(tokens, idx, options, env, self)
    }
    const content = (token.content.endsWith('\n')) ? token.content.slice(0, -1) : token.content // 默认总是会有一个尾换行

    const div = document.createElement("div"); div.classList.add("editable-codeblock-ready");
    div.setAttribute("data-type", type); div.setAttribute("data-content", content); // TODO 可能要编码
    let ret = div.outerHTML
    return ret
  }
}

// Markdown-it 有一个规则系统，您可以在渲染后添加一个规则
function on_finish(md: MarkdownIt, options?: Partial<Options>): void {
  md.core.ruler.push('process-fence-blocks', (state: any) => {
    // 在整个文档渲染完成后执行
    window.requestAnimationFrame(() => {
      document.querySelectorAll(".editable-codeblock-ready").forEach(el => {
        const type = el.getAttribute("data-type") || "js"
        const content = el.getAttribute("data-content") || ""

        el.classList.remove("editable-codeblock-ready"); el.classList.add("editable-codeblock-over", "editable-codeblock-p")
        el.removeAttribute("data-type")
        el.removeAttribute("data-content")

        const editableCodeblock = new EditableCodeblock(type, content, el as HTMLElement)
        editableCodeblock.settings.renderEngine = "prismjs"
        editableCodeblock.settings.saveMode = 'oninput'
        editableCodeblock.settings.renderMode = 'textarea' // 'editablePre' 可选
        // editableCodeblock.settings.renderMode = 'editablePre'
        editableCodeblock.render()
      })
    });
    return true;
  });
}

export default function ab_mdit(md: MarkdownIt, options?: Partial<Options>): void {
  // // 定义默认渲染行为
  // ABConvertManager.getInstance().redefine_renderMarkdown((markdown: string, el: HTMLElement): void => {
  //   el.classList.add("markdown-rendered")
    
  //   const result: string = md.render(markdown)
  //   const el_child = document.createElement("div"); el.appendChild(el_child); el_child.innerHTML = result;
  // })

  // // 定义环境条件
  // ABCSetting.env = "app"

  // md.use(abSelector_squareInline)
  // md.use(abSelector_container)
  md.use(render_fence)
  md.use(on_finish)
}
