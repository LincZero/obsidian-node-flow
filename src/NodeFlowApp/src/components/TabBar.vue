<template>
  <div class="main-bar menus-1">
    <div class="menu-1" style="width: 150px; font-weight:bold; font-size: 16px; color: #7280e4;">NodeFlowApp</div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuFile'?'':'menuFile'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuFile'">
      文件
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
      编辑
      <div class="menus-2" v-show="clickedMenu==='menuEdit'">
        <div class="menu-2">新增流</div>
        <div class="menu-2" disabled>编辑流</div>
      </div>
    </div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuView'?'':'menuView'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuView'">
      视图
      <div class="menus-2" v-show="clickedMenu==='menuView'">
        <div class="menu-2" @click="onClickSaveLayout">保存布局</div>
        <div class="menu-2" @click="onClickLoadLayout">加载布局</div>
        <div class="menu-2" @click="onClickInitLayoutMinRow">重置布局</div>
        <hr>
        <div class="menu-2" @click="onClickAddGlComponent('GoldenFlowEdit', '可视化编辑器')">可视化编辑器</div>
        <div class="menu-2" @click="onClickAddGlComponent('GoldenJsonEdit', 'Json编辑器')">json编辑器</div>
        <div class="menu-2" @click="onClickAddGlComponent('GoldenConsole', '控制台')">控制台</div>
        <div class="menu-2" @click="onClickAddGlComponent('GoldenChart', '统计图表')">统计图表</div>
        <div class="menu-2" @click="onClickAddGlComponent('GoldenDocs', '软件文档')">文档页</div>
        <div class="menu-2" @click="onClickAddGlComponent('GoldenNull', '无内容')">空白窗格</div>
        <div></div>
      </div>
    </div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuTool'?'':'menuTool'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuTool'">
      工具
      <div class="menus-2" v-show="clickedMenu==='menuTool'">
      </div>
    </div>
    <div class="menu-1"
      @click.stop="clickedMenu=clickedMenu==='menuHelp'?'':'menuHelp'"
      @mouseover="clickedMenu=clickedMenu===''?'':'menuHelp'">
      帮助
      <div class="menus-2" v-show="clickedMenu==='menuHelp'">
        <div class="menu-2" @click="onClickAddGlComponent('GoldenDocs', '软件文档')">文档</div>
        <div class="menu-2" @click="console.log('暂无版本号')">版本信息</div>
      </div>
    </div>
    <div class="file-title"><p>{{fileTitle}}</p></div>
  </div>
</template>

<script setup lang="ts">
let GLayoutRootRef = inject<Ref<null|typeof GoldenLayout>>("LAYOUT"); // 布局数据
let clickedMenu = ref(''); // 目前展开的菜单
const fileInputEl = ref<HTMLInputElement|null>(null); // 打开文件的dom
let fileTitle = ref('未保存*'); // 文件标题名

const triggerFileInput = ()=>{if(fileInputEl.value){fileInputEl.value.click();}};

// 点击外面关闭菜单栏展开
const globalClickHandler = (event:any)=>{
  const insideMenu1 = event.target.closest('.menus-1');
  if (!insideMenu1) {
    clickedMenu.value = "";
  }
}
onMounted(()=>{
  document.addEventListener("click", globalClickHandler);
  // onClickLoadLayout(); // 加载时加载一次布局（但似乎失败）
})
onBeforeUnmount(()=>{
  document.removeEventListener("click", globalClickHandler);
})

// BEGIN 菜单Action
// 视图、布局 Golden-Layout
const onClickInitLayoutMinRow = () => { // 重置布局
    if (!GLayoutRootRef?.value) return;
    GLayoutRootRef.value.loadGLLayout(prefinedLayouts.miniRow);
};
const onClickAddGlComponent = (s1:string, s2:string) => { // 往布局添加元素
    if (!GLayoutRootRef?.value) return;
    GLayoutRootRef.value.addGlComponent(s1, s2);
};
const onClickSaveLayout = () => { // 保存布局 (通过浏览器缓存)
		if (!GLayoutRootRef?.value) return;
		const config = GLayoutRootRef.value.getLayoutConfig();
		localStorage.setItem("gl_config", JSON.stringify(config));
};
const onClickLoadLayout = () => { // 加载布局 (通过浏览器缓存)
		const str = localStorage.getItem("gl_config");
		if (!str) return;
		if (!GLayoutRootRef?.value) return;
		const config = JSON.parse(str as string);
		GLayoutRootRef.value.loadGLLayout(config);
};
// END 菜单Action
</script>

<script lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, type Ref } from 'vue'
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
  --bg-light: #414141;    // 通常用来做描边
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
  border-bottom: solid 1px var(--bg-light);
  width: 100%;
  background-color: var(--bgControl-normal);
  margin: 0;

  div, p {
    color: var(--text-normal);
  }

  .menu-1, .menu-2{
    &:hover{
      background-color: var(--bg-light);
    }
  }
  .menu-1{
    display: inline;
    float: left;
    width: 60px;
    height: 100%;
    border-right: solid 1px var(--bg-light);
    text-align: center;
    line-height: 26px;

    &:hover{
      cursor: pointer;
    }

    .menus-2{
      position: relative;
      z-index: 2;
      width: 230px;
      background-color: var(--bgControl-normal);
      border: 2px solid var(--bg-light);

      .menu-2{
        text-align: left;
        padding-left: 30px;
        &:first-child{
          border-top: none;
        }
        // border-top: 1px solid var(--bg-light);
      }
    }
  }

  // 标题
  .file-title{
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

    &[type="file"]{
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
