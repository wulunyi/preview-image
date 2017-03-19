/**
 * @description 工具库
 */

/**
 * @description 是否是dom元素
 * @param o {object}
 * @returns {boolean}
 */
function isDom(o){
  if(typeof HTMLElement === 'object'){
    return o instanceof HTMLElement;
  }

  return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
}

export {isDom};