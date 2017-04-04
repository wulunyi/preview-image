import './index.scss';
import PreviewImage from '../src/preview-image';

let rootDom = document.getElementsByClassName('app')[0];
rootDom.style.width = document.body.clientWidth + 'px';
rootDom.style.height = document.body.clientHeight + 'px';

let previewImage = new PreviewImage(
  rootDom,
  'https://si.geilicdn.com/bj-IM-160326222-1490153471447-1652798769.jpg?w=750&h=750', // 图片地址
  {
    doubleZoom: 2, // 双击
    maxZoom: 4, // 最大缩放
    minZoom: 1, // 最小缩放
    longPressDownload: true, // 长按下载
    angled: 0, // 绘制旋转角度
    softX: true, //  遇到边界是否开启过渡动画
    softY: true,
    tap: function(){
      // alert('Tap');
    },
    load: function(){
      // alert('图片加载成功');
    },
    err: function(){
      // alert('图片加载失败');
    }
  });

previewImage.show();

window.previewImage = previewImage;