/**
 * @description 坐标计算公式
 */

/**
 * @description 根据相对差距计算坐标
 * @param {number} coord 坐标值
 * @param {number} distance 相对坐标的距离
 */
export function calcCoordWithDiff(coord, distance) {
  return coord + distance;
}

/**
 * @description 计算平均值
 * @param {number} a 
 * @param {number} b 
 */
export function calcAverage(a, b) {
  return (a + b) / 2;
}

/**
 * @description 计算相对坐标
 * @param {number} coord 坐标
 * @param {number} referenceCoord 参考点
 */
export function calcRelativeCoord(coord, referenceCoord) {
  return coord - referenceCoord;
}

/**
 * @description 计算实际坐标
 * @param {number} relativeCoord 相对坐标
 * @param {number} referenceCoord 参考坐标
 */
export function calcRealCoord(relativeCoord, referenceCoord) {
  return relativeCoord + referenceCoord
}

/**
 * @description 根据原点和缩放点计算缩放前相对于原点的相对坐标
 * @param {*} realCoord 
 * @param {*} realOriginCoord 
 * @param {*} scale 
 */
export function calcRelativeCoordBeforeScale(realCoord, realOriginCoord, zoom) {
  return calcRelativeCoord(realCoord, realOriginCoord) / zoom;
}

/**
 * @description 求相对于原点坐标缩放后的真实坐标
 * @param {number} relativeCoord 相对坐标
 * @param {*} realOriginCoord 相对原点
 * @param {*} zoom 缩放值
 */
export function calcRealCoordAfterScale(relativeCoord, realOriginCoord, zoom) {
  return calcRealCoord(relativeCoord * zoom, realOriginCoord);
}

/**
 * @description 计算缩放后可移动坐标范围
 * @param {*} inSize 内部容器尺寸
 * @param {*} outSize 外部容器尺寸
 * @param {*} zoom 缩放比
 */
export function calcRangeCoord(inSize, outSize, zoom) {
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

/**
 * @description 映射到实际的坐标系
 * @param {number} coord 参考坐标
 * @param {number} zoom 实际坐标与参考坐标的缩放比
 */
export function covertRealCoord(coord, zoom) {
  return coord * zoom;
}

/**
 * @description 过渡效果
 * @param {*} x 
 */
export function ease(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
};

/**
 * @description 判读形状
 * @param {Number} w 宽
 * @param {Number} h 高
 * @returns {Number} 1 为宽大于等于高 -1 为高大于等于宽
 */
// export function calcShape(w, h) {
//   let r = w / h;

//   return r >= 1 ? 1 : -1;
// }

/**
 * @description 适配算法
 * @param {*} sw 
 * @param {*} sh 
 * @param {*} cw 
 * @param {*} ch 
 */
export function calcJustSize(sw, sh, cw, ch) {
  // let shape = calcShape(sw, sh);
  let shape = 1;
  
  if(sw / sh < cw/ ch){
    shape = -1;
  }else{
    shape = 1;
  }

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