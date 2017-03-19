import './index.scss';
import PreviewImage from '../src/preview-image';

let rootDom = document.getElementsByClassName('app')[0];

let previewImage = new PreviewImage(rootDom, {
    imageSrc: 'https://si.geilicdn.com/bj-IM-320410048-1487556526801-784197092.jpg?w=750&h=750', // 图片地址
    rotatable: false, // 是否开启旋转
    doubleZoom: 2, // 双击缩放
    maxZoom: 4, // 最大缩放
    minZoom: 1, // 最小缩放
    longPressDownload: true, // 是否长按下载图片
    angled: 0, // 初始旋转角度
    soft: true // 边界是否开启过渡动画
  });