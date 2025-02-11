import { createApp } from 'vue';

// --- 仅demo版本
// import App from './App.vue';
// createApp(App).mount('#app');

// --- NodeFlow版本
import './main.css'
import App from '../../NodeFlow/component/container/NodeFlowContainerS.vue';
import { factoryFlowData } from '../../NodeFlow/utils/jsonTool/factoryFlowData'

const jsonType = "nodeflow-listitem"
const mdStr = "demo"
const result = factoryFlowData(jsonType, mdStr)

createApp(App, {
  rawData: mdStr,
  mdData: `\`\`\`${jsonType}\n${mdStr}\n\`\`\`\n`,
  jsonType: jsonType,
  jsonData: result.data,
  fn_newView: async ()=>{},
  fn_save: ()=>{},
  isMini: false,
}).mount('#app');
