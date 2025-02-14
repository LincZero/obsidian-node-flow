import { defineClientConfig } from 'vuepress/client';

import MyVueFlow from "./MyVueFlow.vue";

export default defineClientConfig({
  enhance: ({ app, router, siteData }) => {
    app.component("VueFlow", MyVueFlow);
  },
})
