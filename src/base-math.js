/**
 * @description 基础代数方程
 */

/**
 * @description 判读形状
 * @param {Number} w 宽
 * @param {Number} h 高
 * @returns {Number} 1 为宽大于等于高 -1 为高大于等于宽
 */
function calcShape(w, h) {
  let r = w / h;

  return r >= 1 ? 1 : -1;
}

/**
 * @param {*} sw 
 * @param {*} sh 
 * @param {*} cw 
 * @param {*} ch 
 */
function calcJustSize(sw, sh, cw, ch) {
  let shape = calcShape(sw, sh);

  if (shape === 1) {
    return {
      w: cw,
      h: Math.floor((cw / sw) * sh)
    }
  }

  return {
    h: ch,
    w: Math.floor((ch / sh) * sw)
  }
}

/**
 * @description 计算实际坐标
 * @param {number} relativeCoord 相对坐标
 * @param {number} referenceCoord 参考坐标
 */
function calcRealCoord(relativeCoord, referenceCoord) {
  return relativeCoord + referenceCoord
}

/**
 * @description 计算相对坐标
 * @param {number} coord 坐标
 * @param {number} referenceCoord 参考点
 */
function calcRelativeCoord(coord, referenceCoord) {
  return coord - referenceCoord;
}

/**
 * @description 映射到实际的坐标系
 * @param {number} coord 参考坐标
 * @param {number} zoom 实际坐标与参考坐标的缩放比
 */
function covertRealCoord(coord, zoom) {
  return coord * zoom;
}

/**
 * @description 计算缩放后可移动坐标范围
 * @param {*} inSize 内部容器尺寸
 * @param {*} outSize 外部容器尺寸
 * @param {*} zoom 缩放比
 */
function calcRangeCoord(inSize, outSize, zoom) {
  let afterSize = inSize * zoom;

  if (afterSize <= outSize) {
    return {
      min: (outSize - afterSize) / 2,
      max: (outSize - afterSize) / 2
    }
  }

  return {
    min: outSize - afterSize,
    max: 0
  }
}

function ease(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
};

export {
  calcRealCoord,
  calcRelativeCoord,
  covertRealCoord,
  calcShape,
  calcJustSize,
  ease,
  calcRangeCoord
}