

import { createApp } from 'vue';

import App from './App.vue';
createApp(App).mount('#app');

// import App from '../../NodeFlow/component/container/NodeFlowContainerS.vue';
// import { factoryFlowData } from '../../NodeFlow/utils/jsonTool/factoryFlowData'

// const jsonType = "nodeflow-itemlist"
// const mdStr = "demo"
// const result = factoryFlowData(jsonType, mdStr)

// createApp(App, {
//   rawData: mdStr,
//   mdData: `\`\`\`${jsonType}\n${mdStr}\n\`\`\`\n`,
//   jsonType: jsonType,
//   jsonData: result.data,
//   fn_newView: async ()=>{},
//   fn_save: ()=>{},
//   isMini: true
// }).mount('#app');
