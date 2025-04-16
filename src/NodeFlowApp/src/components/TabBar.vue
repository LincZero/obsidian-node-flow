<template>
  <div class="main-bar menus-1">
    <!-- TODO 这里应该用flex分成左中右三个部分，就像vuepress那样 -->
    <div class="menu-1" style="padding: 0 16px;; font-weight:bold; font-size: 16px; color: #11b981;">NodeFlow App</div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuFile'?'':'menuFile'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuFile'">
      文件(F)
      <div class="menus-2" v-show="clickedMenu==='menuFile'">
        <div class="menu-2" @click="triggerFileInput">打开配置
          <input type="file" accept=".json" text="打开配置" ref="fileInputEl"/>
        </div>
        <div class="menu-2">保存配置</div>
      </div>
    </div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuEdit'?'':'menuEdit'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuEdit'">
      编辑(E)
      <div class="menus-2" v-show="clickedMenu==='menuEdit'">
        <div class="menu-2">新增流</div>
        <div class="menu-2" disabled>编辑流</div>
      </div>
    </div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuView'?'':'menuView'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuView'">
      视图(V)
      <div class="menus-2" v-show="clickedMenu==='menuView'">
        <div class="menu-2" @click="onClickSaveLayout">保存布局</div>
        <div class="menu-2" @click="onClickLoadLayout">加载布局</div>
        <div class="menu-2" @click="onClickInitLayoutMinRow">重置布局</div>
        <hr class="menu-2">
        <div class="menu-2" @click="onClickAddGlComponent('NodeFlow', '画布')">画布</div>
        <div class="menu-2" @click="onClickAddGlComponent('AutoEditor', '智能编辑器')">智能编辑器</div>
        <div class="menu-2" @click="onClickAddGlComponent('NodeEditor', '节点编辑器')">节点编辑器</div>
        <div class="menu-2" @click="onClickAddGlComponent('JsonEditor', 'Json编辑器')">Json编辑器</div>
        <div class="menu-2" @click="onClickAddGlComponent('BackendConnector', '后端连接器')">后端连接器</div>
        <div></div>
      </div>
    </div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuTool'?'':'menuTool'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuTool'">
      工具(T)
      <div class="menus-2" v-show="clickedMenu==='menuTool'">
      </div>
    </div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuHelp'?'':'menuHelp'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuHelp'">
      帮助(H)
      <div class="menus-2" v-show="clickedMenu==='menuHelp'">
        <div class="menu-2">
          <a target="_blank" href="https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/">文档</a>
        </div>
        <div class="menu-2" @click="console.log('暂无版本号')">版本信息</div>
      </div>
    </div>

    <!-- <div class="file-title"><p>{{fileTitle}}</p></div> -->

    <!-- Right -->
    <div class="menu-1" style="padding: 0 28px 0 16px; font-weight:bold; font-size: 16px; float: right;">
      <a href="https://github.com/LincZero/obsidian-node-flow/">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon github-icon" viewBox="0 0 1024 1024" fill="currentColor" aria-label="github icon" name="github" style="width:1.25rem;height:1.25rem;vertical-align:middle;"><path d="M511.957 21.333C241.024 21.333 21.333 240.981 21.333 512c0 216.832 140.544 400.725 335.574 465.664 24.49 4.395 32.256-10.07 32.256-23.083 0-11.69.256-44.245 0-85.205-136.448 29.61-164.736-64.64-164.736-64.64-22.315-56.704-54.4-71.765-54.4-71.765-44.587-30.464 3.285-29.824 3.285-29.824 49.195 3.413 75.179 50.517 75.179 50.517 43.776 75.008 114.816 53.333 142.762 40.79 4.523-31.66 17.152-53.377 31.19-65.537-108.971-12.458-223.488-54.485-223.488-242.602 0-53.547 19.114-97.323 50.517-131.67-5.035-12.33-21.93-62.293 4.779-129.834 0 0 41.258-13.184 134.912 50.346a469.803 469.803 0 0 1 122.88-16.554c41.642.213 83.626 5.632 122.88 16.554 93.653-63.488 134.784-50.346 134.784-50.346 26.752 67.541 9.898 117.504 4.864 129.834 31.402 34.347 50.474 78.123 50.474 131.67 0 188.586-114.73 230.016-224.042 242.09 17.578 15.232 33.578 44.672 33.578 90.454v135.85c0 13.142 7.936 27.606 32.854 22.87C862.25 912.597 1002.667 728.747 1002.667 512c0-271.019-219.648-490.667-490.71-490.667z"></path></svg>
      </a>
    </div>
    <div class="menu-1" style="padding: 0 16px; font-weight:bold; font-size: 16px; float: right;">
      <a href="https://linczero.github.io/obsidian-node-flow/">在线交互</a>
    </div>
    <div class="menu-1" style="padding: 0 16px; font-weight:bold; font-size: 16px; float: right;">
      <a href="https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/README.show.html">在线展示</a>
    </div>
    <div class="menu-1" style="padding: 0 16px; font-weight:bold; font-size: 16px; float: right;">
      <a href="https://linczero.github.io/MdNote_Public/ProductDoc/Plugin/NodeFlow/docs/zh/">在线文档</a>
    </div>
    <div class="menu-1" style="padding: 0 16px; font-weight:bold; font-size: 16px; float: right"
      @click.stop="clickedMenu=clickedMenu==='serialLinks'?'':'serialLinks'"
      @mouseover="clickedMenu=clickedMenu===''?'':'serialLinks'">
      其他在线
      <div class="menus-2" v-show="clickedMenu==='serialLinks'">
        <div class="menu-2"><a href="https://any-block.github.io/obsidian-any-block/">AnyBlock</a></div>
        <div class="menu-2"><a href="https://linczero.github.io/obsidian-node-flow/">NodeFlow</a></div>
        <div class="menu-2"><a href="https://linczero.github.io/obsidian-chat-view-qq/">ChatView</a></div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from "@kyvg/vue3-notification";
const { notify }  = useNotification()

let GLayoutRootRef = inject<Ref<null|typeof GoldenLayout>>("LAYOUT"); // 布局数据
let clickedMenu = ref(''); // 目前展开的菜单
let fileTitle = ref('未保存*'); // 文件标题名

// 打开配置
const triggerFileInput = ()=>{ if (fileInputEl.value) {fileInputEl.value.click();} };
const fileInputEl = ref<HTMLInputElement|null>(null); // 打开文件的dom

// #region 点击外面关闭菜单栏展开
const globalClickHandler = (event:any)=>{
  const insideMenu1 = event.target.closest('.menus-1');
  if (!insideMenu1) {
    clickedMenu.value = "";
  }
}
onMounted(()=>{
  document.addEventListener("click", globalClickHandler);
})
onBeforeUnmount(()=>{
  document.removeEventListener("click", globalClickHandler);
})
// #endregion

// #region 菜单Action
// 视图、布局 Golden-Layout
const onClickAddGlComponent = (s1:string, s2:string) => { // 往布局添加元素
    if (!GLayoutRootRef?.value) return;
    GLayoutRootRef.value.addGlComponent(s1, s2);
};
const onClickInitLayoutMinRow = () => { // 重置布局
    if (!GLayoutRootRef?.value) return;
    GLayoutRootRef.value.loadGLLayout(prefinedLayouts.miniRow);
    notify({ title: "重置布局成功" }); // , text: "重置布局成功"
};
const onClickSaveLayout = () => { // 保存布局 (通过浏览器缓存)
		if (!GLayoutRootRef?.value) return;
		const config = GLayoutRootRef.value.getLayoutConfig();
		localStorage.setItem("gl_config", JSON.stringify(config));
    notify({ title: "保存布局成功" });
};
const onClickLoadLayout = () => { // 加载布局 (通过浏览器缓存)
		const str = localStorage.getItem("gl_config");
		if (!str) return;
		if (!GLayoutRootRef?.value) return;
		const config = JSON.parse(str as string);
		GLayoutRootRef.value.loadGLLayout(config);
    notify({ title: "加载布局成功" });
};
// 加载时加载一次布局。可行，但会导致一条错误打印：Uncaught (in promise) TypeError: component is undefined
// onMounted(()=>{
//   nextTick(()=>{
//     onClickLoadLayout();
//   })
// })
// #endregion
</script>

<script lang="ts">
import { inject, nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import GoldenLayout from './goldenLayout/GoldenLayout.vue'
// import { httpData, type responseInter } from '@/utils/http'
// import { FLOWKEY } from '@/utils/interface'
// import { defaultFlow, type FlowTypeSpec } from '@/utils/interface'
import { prefinedLayouts } from "./goldenLayout/predefined-layouts"
</script>

<style scoped lang="scss">
.main-bar.menus-1 {
  --bg-normal: #1f1f1f;   // 一块一块的块填充
  --bg-deep: #181818;     // 块的背景
  --bg-light: #414141;    // 通常用来做描边，同 bg-line/bg-bd
  --text-normal: #aeafad; // 正文
  --text-deep: #b4ba6e;   // 高亮
  --text-light: #6e6858;  // 忽视

  --bg1-normal: #585858;
  --bg1-deep: #9cdcfe;
  --bg1-light: #1f1f1f; // rgba(34, 130, 52, 0.5);
  --text1-normal: #ffffff;

  --bg2-normal: #26ca28;
  // --bg2-deep: #238636;c
  --bg2-light: #ddd; // rgba(24, 118, 230, 0.5);
  --text2-normal: #ffffff;

  --bgControl-normal: #181818;
  --textControl-normal: #cccccc;

  box-sizing: border-box;
  height: 28px;
  width: 100%;
  margin: 0;
  border-bottom: solid 1px var(--bg-light);
  background-color: var(--bgControl-normal);

  div, p {
    color: var(--text-normal);
  }

  a {
    color: #eee;
    text-decoration: none;
    font-weight: normal;
  }

  .menu-1:hover, .menu-2:hover{
    background-color: var(--bg-light);
  }
  .menu-1 {
    position: relative;
    display: inline;
    float: left;
    // width: 60px;
    height: 100%;
    line-height: 26px;
    padding: 0 9px;

    font-size: 13px;
    text-align: center;
    // border-right: solid 1px var(--bg-light);

    &:hover {
      cursor: pointer;
    }

    .menus-2 {
      min-width: 220px;
      position: absolute;
      left: 0;
      top: 27px;
      // width: 230px;
      z-index: 2;
      background-color: var(--bg-normal);
      border: 1px solid var(--bg-light);
      border-radius: 8px; 

      .menu-2 {
        padding: 0 24px;
        white-space: pre;
        text-align: left;
      }
      hr.menu-2 {
        margin: 4.5px 0;
        border: none;
        border-bottom: solid 1px var(--bg-light);
      }
    }
  }

  // 标题
  .file-title {
    float: left;
    width: calc(100% - 320px);
    p{
      width: 100%;
      line-height: 26px;
      text-align: center;
      padding-right: 300px;
    }
  }

  // 表单元素
  button, input {
    padding: 0 8px;
    // border: solid 1px var(--bg-light);
    background-color: none;
  }
  button {
    margin: 0 10px;
    line-height: 28px;
  }
  input {
    margin: 0;
    line-height: 26px;

    &[type="file"] {
      // 这是一个隐身无大小的状态，不会直接点击而是通过方法模拟点击
      opacity: 0;
      width: 0px;
      height: 0px;
      margin: 0;
      padding: 0;
      border: 0;
    }
  }
}
</style>
