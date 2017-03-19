/**
 * @description 图片预览组件
 */

import * as util from './util';
import AlloyFinger from 'alloyfinger';

// 基础配置选项
const OPTIONS_DEFAULT = {
    imageSrc: '',  // 图片地址
    rotated: false, // 是否开启旋转
    doubleZoom: 2, // 双击
    maxZoom: 4, // 最大缩放
    minZoom: 1, // 最小缩放
    longPressDownload: false,// 长按下载
    angled: 0, // 绘制旋转角度
    soft: false, //  遇到边界是否开启过渡动画
};

export default class ImagePreview{
  constructor(element, options){
    if(util.isDom(element)){
      this.options = options || {};
      this.root = element;

      if(this.options.longPressDownload){
        // 创建透明图片供长按下载
      }
    }else{
      console.warn('The element isRequierd');
    }
  }

  get options(){
    return this._options;
  }

  set options(options){
    this._options = Object.assign(OPTIONS_DEFAULT, options);
  }

  start(){

  }

  bind(){

  }

  unbind(){

  }
}