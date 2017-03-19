/**
 * @description 图片预览组件
 */

import * as util from './util';
import AlloyFinger from 'alloyfinger';

// 基础配置选项
const OPTIONS_DEFAULT = {
  imageSrc: '', // 图片地址
  rotated: false, // 是否开启旋转
  doubleZoom: 2, // 双击
  maxZoom: 4, // 最大缩放
  minZoom: 1, // 最小缩放
  longPressDownload: false, // 长按下载
  angled: 0, // 绘制旋转角度
  soft: false, //  遇到边界是否开启过渡动画
};

// 长按保存图片，图片显示样式
const LONG_PRESS_IMG_STYLE = {
  position: 'absolute',
  left: '0',
  top: '0',
  zIndex: 9999,
  opacity: 0,
  filter: 'alpha(0)',
  width: '100%',
  height: '100%'
}

export default class ImagePreview {
  constructor(element, options) {
    if (util.isDom(element)) {
      this.options = options || {};
      this.root = element;

      // 设置 position 变于子元素定位
      util.setStyle(this.root, {
        position: 'relative'
      });

      util.pullImage(this.options.imageSrc).after((err, imgObj) => {
        if (err) {
          return console.warn(err);
        }

        this.imgDom = imgObj;
      });
    } else {
      console.warn('The element isRequierd');
    }
  }

  get options() {
    return this._options;
  }

  set options(options) {
    this._options = Object.assign(OPTIONS_DEFAULT, options);
  }

  get imgDom() {
    return this._imgDom;
  }

  set imgDom(imgDom) {
    this._imgDom = imgDom;

    // 创建透明图片供长按下载
    if (this.options.longPressDownload) {
      // 设置样式
      util.setStyle(this.imgDom, LONG_PRESS_IMG_STYLE);

      // 插入节点
      this.root.appendChild(this.imgDom);
    }
  }

  start() {

  }

  bind() {

  }

  unbind() {

  }
}