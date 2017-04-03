/**
 * @description 工具库
 */

/**
 * @description 是否是dom元素
 * @param o {object}
 * @returns {boolean}
 */
function isDom(o) {
  if (typeof HTMLElement === 'object') {
    return o instanceof HTMLElement;
  }

  return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
}

/**
 * @description 设置元素样式
 * @param {HTMLElement} element 
 * @param {object} style 
 */
function setStyle(element, style) {
  if (typeof style !== 'object') {
    return;
  }

  for (let key in style) {
    element.style[key] = style[key];
  }
}

/**
 * @description 拉取图片
 * @param {string} src 
 * @returns {object} pullImage
 */
function pullImage(src) {
  let imgDom = document.createElement('img');

  let sussFn = (err, imgDom) => {
    this.AFTER_HOOK && this.AFTER_HOOK(null, imgDom);
    this.AFTER_HOOK = null;
  }

  let errFn = () => {
    let err = new Error('图片加载失败');

    this.AFTER_HOOK && this.AFTER_HOOK(err, imgDom);
    this.AFTER_HOOK = null;
  }

  imgDom.addEventListener('load', (ev) => {
    sussFn(null, imgDom);
  });

  imgDom.addEventListener('error', (ev) => {
    errFn();
  });

  imgDom.src = src;

  // 从缓存中取图片的时候
  if (imgDom.complete) {
    sussFn(null, imgDom);
  }

  return this;
}

pullImage.prototype.after = function (fn) {
  this.AFTER_HOOK = fn;
}

function getSize(dom) {
  let wpx = dom.style.width;
  let hpx = dom.style.height;
  let boundData = dom.getBoundingClientRect();
  let w = boundData.width;
  let h = boundData.height;

  if (wpx) {
    w = wpx.slice(0, -2);
  }

  if (hpx) {
    h = hpx.slice(0, -2);
  }

  return {
    w: +w,
    h: +h
  }
}

/**
 * @description 创建元素
 * @param {*} tag 
 * @param {*} style 
 * @param {*} child 
 */
function createElement(tag, style, child) {
  let dom = document.createElement(tag);
  style && setStyle(dom, style);
  child && isDom(child) && dom.appendChild(child);

  return dom;
}

/**
 * @description 获取离屏canvas
 * @param params {Object} {img, sw, sh, cw, ch, rotate}
 * @return {Element}
 */
function getOffCanvas(params) {
  let {
    img,
    sw,
    sh,
    cw,
    ch,
    rotate
  } = params;
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  canvas.width = cw;
  canvas.height = ch;

  ctx.translate(cw / 2, ch / 2);
  ctx.rotate(rotate * Math.PI / 180);

  ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);

  return canvas;
}

function isPc() {
  var userAgentInfo = navigator.userAgent;
  var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

function toFixed(num) {
  return Math.floor(num * 100) / 100;
}

export {
  isDom,
  setStyle,
  pullImage,
  getSize,
  createElement,
  getOffCanvas,
  toFixed,
  isPc
};