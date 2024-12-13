import type { Ref } from "vue";

/**
 * 将div放大到全屏，并自动处理退出全屏事件
 * 
 * 需要特别注意闭包问题。
 * 我们可以通过闭包，构建多个函数实体，每个函数有不同的isMini实体! 当切换关闭全屏状态时能准确通知关闭全屏的div组件
 * （后来优化了一下，好像不需要，普通传参给监听器就行）
 * 
 * @param div HTMLElement 需要在normal-size和full-size两个类之间切换，请自行 `:class="isMini?'normal-size':'full-size'"`
 */
export function switchFullScreen(div: any, isMini: Ref<boolean>): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!div) { return }
    // 如果是正常大小，切换到全尺寸
    if (isMini.value) {
      isMini.value = false;
      // document.body.style.overflow = 'hidden'; // 禁用滚动
      if (div.requestFullscreen) {
          div.requestFullscreen();
      } else if (div.webkitRequestFullScreen) {
          div.webkitRequestFullScreen();
      } else if (div.mozRequestFullScreen) {
          div.mozRequestFullScreen();
      } else if (div.msRequestFullscreen) {
          div.msRequestFullscreen(); // IE11
      }
      initListener(isMini)
    }
    // 如果已经是全尺寸，切换回正常大小
    else {
      isMini.value = true;
      // document.body.style.overflow = ''; // 恢复滚动
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (div.webkitCancelFullScreen) {
        div.webkitCancelFullScreen();
      } else if (div.mozCancelFullScreen) {
        div.mozCancelFullScreen();
      } else if (div.msExitFullscreen) {
        div.msExitFullscreen();
      }
    }
  })
}

/**
 * 添加临时监听器，监听由F11或Esc等方式退出全屏状态的事件，监听成功后取消监听
 */
function initListener (isMini: Ref<boolean>) {
  document.addEventListener('fullscreenchange', handleFullScreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
  document.addEventListener('mozfullscreenchange', handleFullScreenChange);
  document.addEventListener('MSFullscreenChange', handleFullScreenChange);
  function handleFullScreenChange() {
    if (document.fullscreenElement) return
    // 成功退出全屏状态
    isMini.value = true;
    document.removeEventListener('fullscreenchange',  handleFullScreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
  }
}
