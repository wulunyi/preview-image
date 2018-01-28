import './index.scss';
import PreviewImage from '../src/preview-image';
import Preview from '../preview/preview.ts';

let rootDom = document.getElementsByClassName('app')[0];
const url = 'https://si.geilicdn.com/bj-IM-320410048-1490880784838-857319750_194_201.jpg?w=194&h=194';
const pre = new Preview(rootDom, url);
window.tp = pre;

pre.show();
// rootDom.style.width = document.body.clientWidth + 'px';
// rootDom.style.height = document.body.clientHeight + 'px';

// let previewImage = new PreviewImage(
//   rootDom,
//   'https://si.geilicdn.com/bj-IM-320410048-1490880784838-857319750_194_201.jpg?w=194&h=194', // 图片地址
//   {
//     doubleZoom: 2, // 双击
//     maxZoom: 4, // 最大缩放
//     minZoom: 1, // 最小缩放
//     longPressDownload: true, // 长按下载
//     angled: 0, // 绘制旋转角度
//     softX: true, //  遇到边界是否开启过渡动画
//     softY: true,
//     tap: function(){
//       // alert('Tap');
//     },
//     load: function(){
//       // alert('图片加载成功');
//     },
//     err: function(){
//       // alert('图片加载失败');
//     }
//   });

// previewImage.show();

// window.previewImage = previewImage;