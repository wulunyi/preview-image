import { 
  isEqual,
  isObject,
  forEach
} from 'lodash';

/**
 * 判断是否是 DOM 元素
 * @param el 
 */
export function isHTMLElement(el: any): boolean {
  if (typeof HTMLElement === 'function') {
    return el instanceof HTMLElement;
  }

  return (
    el && 
    typeof el === 'object' && 
    el.nodeType === 1 && 
    typeof el.nodeName === 'string'
  );
}

/**
 * 是否是图片 DOM 元素
 * @param el 
 */
export function isImgElement(el: any): boolean {
  if (!isHTMLElement(el)) {
    return false;
  }

  if (isEqual(el.tagName.toLocaleUpperCase(), 'IMG')) {
    return true;
  }

  return false;
}

/**
 * 获取图片元素的 src
 * @param el 
 */
export function getImgElSrc(el: HTMLImageElement): string {
  if (isImgElement(el)) {
    return el.src;
  }

  return '';
}

/**
 * 获取设备 dpr
 */
export function getDeviceDpr():number {
  return window.devicePixelRatio || 1;
}

/**
 * 获取元素宽高
 * @param el 
 */
export function getHTMLElementSize(el) {
  const {width: w, height: h} = el.getBoundingClientRect();

  return {
    w,
    h
  }
}

export function getHTMLElementStyle(el){
  if (window.getComputedStyle) {
    return window.getComputedStyle(el, '');
  }

  return el.currentStyle;
}

/**
 * 设置元素样式
 * @param {HTMLElement} element 
 * @param {object} style 
 */
export function setStyle(el: HTMLElement, styles: Object) {
  if (!isObject(styles)) {
    return;
  }

  forEach(styles, (value, key) => {
    el.style[key] = value;
  });
}