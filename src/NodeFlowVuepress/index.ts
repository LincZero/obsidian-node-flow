import { getDirname, path } from "@vuepress/utils"

export default (options, ctx) => {
  return {
    name: 'vuepress-plugin-vue-flow',
    clientConfigFile: path.resolve(__dirname, 'clientConfig.ts'),
  }
}
