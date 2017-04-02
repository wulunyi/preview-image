import './index.scss';
import PreviewImage from '../src/preview-image';

let rootDom = document.getElementsByClassName('app')[0];
rootDom.style.width = document.body.clientWidth + 'px';
rootDom.style.height = document.body.clientHeight + 'px';

let previewImage = new PreviewImage(
  rootDom,
  'https://si.geilicdn.com/bj-IM-208863409-1490178957617-1610333132.jpg?w=750&h=750', // 图片地址
  {
    // rotatable: false, // 是否开启旋转
    // doubleZoom: 3, // 双击缩放
    // maxZoom: 4, // 最大缩放
    // minZoom: 1, // 最小缩放
    // longPressDownload: true, // 是否长按下载图片
    // angled: 0, // 初始旋转角度
    // softX: false // 边界是否开启过渡动画
  });

previewImage.show();

window.previewImage = previewImage;