/**
 * @description 图片预览组件
 */

import hammer from 'hammerjs';
import * as CoordMath from './coord-math';
import * as util from './util';
import './animation';

export default class ImagePreview {
  constructor(element, src, options) {
    // 容器 dom
    this.context = element;
    // 图片地址
    this.imgSrc = src;
    // 配置参数
    this.options = options;
    // dpr
    this.dpr = window.devicePixelRatio || 1;

    // 能否移动
    this.canMoveX = false;
    this.canMoveY = false;

    // 绘制参数
    this.angle = this.options.angled;
    // 初始化缩放比
    this.scale = this.options.minZoom;

    // 事件配置选项
    this.events = {
      'tap': this._tap.bind(this),
      'doubletap': this._doubleTap.bind(this),

      'pinchstart': this._pinchStart.bind(this),
      'pinchmove': this._pinchMove.bind(this),
      'pinchend': this._pinchEnd.bind(this),

      'panstart': this._panStart.bind(this),
      'panmove': this._panMove.bind(this),
      'panend': this._panEnd.bind(this)
    };

    // 初始化
    this._init();
  }

  /**
   * @description 图片绘制角度
   */
  get angle() {
    return this._angle || 0;
  }

  set angle(deg) {
    if (deg % 90 !== 0) {
      this._angle = 0
    } else {
      this._angle = deg % 360
    }
  }

  /**
   * @description 上下文 dom
   */
  get context() {
    return this._context;
  }

  set context(d) {
    if (util.isDom(d)) {
      this._context = d;
    }
  }

  /**
   * @description 缓存图片地址
   */
  get imgSrc() {
    return this._imgSrc;
  }

  set imgSrc(s) {
    if (typeof s === 'string') {
      this._imgSrc = s;
    }
  }

  /**
   * @description 配置选项
   */
  get options() {
    return this._options;
  }

  set options(options) {
    this._options = {
      doubleZoom: 2, // 双击
      maxZoom: 4, // 最大缩放
      minZoom: 1, // 最小缩放
      longPressDownload: false, // 长按下载
      angled: 0, // 绘制旋转角度
      softX: true, //  遇到边界是否开启过渡动画
      softY: true,
      tap: null, // 轻点回调
      load: null, // 图片加载完成回调
      err: null // 图片加载失败回调
    };

    for (let key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        this._options[key] = options[key];
      }
    }

    // 更新绘制角度
    this.angle = this.options.angled;
  }

  // 内层图片左上角相对于 ox, oy 的绘制坐标
  get inSx() {
    return CoordMath.calcCoordWithDiff(this.sx, (this.dw - this.sw) / 2);
  }

  get inSy() {
    return CoordMath.calcCoordWithDiff(this.sy, (this.dh - this.sh) / 2);
  }

  // 内层图片左上角的真实坐标
  get realInSx() {
    return CoordMath.calcRealCoordAfterScale(this.inSx, this.ox, this.scale);
  }

  get realInSy() {
    return CoordMath.calcRealCoordAfterScale(this.inSy, this.oy, this.scale);
  }

  // 外层图片左上角绘制真实坐标
  get realSx() {
    return CoordMath.calcRealCoordAfterScale(this.sx, this.ox, this.scale);
  }

  get realSy() {
    return CoordMath.calcRealCoordAfterScale(this.sy, this.oy, this.scale);
  }

  // 内层图片左上角真实坐标可移动范围
  get rangeInSx() {
    return CoordMath.calcRangeCoord(this.sw, this.cw, this.scale);
  }

  get rangeInSy() {
    return CoordMath.calcRangeCoord(this.sh, this.ch, this.scale);
  }

  _init() {
    if (!this.context) {
      return;
    }

    // 获取容器宽高
    let size = util.getSize(this.context);

    // 设置元素样式相对定位便于 canvas 的定位
    util.setStyle(this.context, {
      position: 'relative'
    });

    // 绘制面板覆盖上下文元素
    this.canvas = util.createElement('canvas', {
      width: size.w + 'px',
      height: size.h + 'px',
      position: 'absolute',
      left: 0,
      top: 0,
      textAlign: 'center',
      lineHeight: size.h + 'px',
      fontSize: '16px',
      color: 'white'
    });

    // 浏览器不支持提示文案
    this.canvas.innerHTML = '您的浏览器不支持 canvas 请升级您的浏览器';
    this.context.appendChild(this.canvas);

    // 绘制面板属性
    this.cw = size.w * this.dpr;
    this.ch = size.h * this.dpr;

    // 初始绘制圆心坐标
    this.ox = this.cw / 2;
    this.oy = this.ch / 2;

    // 设置 canvas 内尺寸大小
    this.canvas.width = this.cw;
    this.canvas.height = this.ch;

    // 绘制上下文
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * @description 创建长按下载图片
   * @param {*} imgDom 
   */
  _createLongTapImg(imgDom) {
    util.setStyle(imgDom, {
      position: 'absolute',
      left: '0',
      top: '0',
      zIndex: 9999,
      opacity: 0,
      filter: 'alpha(0)',
      width: '100%',
      height: '100%'
    });

    this.context.appendChild(imgDom);
  }

  /**
   * @description 绘制动画帧
   */
  _draw() {
    // 擦除上一帧
    this.ctx.clearRect(0, 0, this.cw, this.ch);

    this.ctx.save();

    this.ctx.translate(this.ox, this.oy);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.drawCan, this.sx, this.sy, this.dw, this.dh);

    this.ctx.restore();
  }

  /**
   * @description 过渡动画
   * @param {string} name 
   * @param {number} toValue 
   * @param {number} time 
   * @param {function} endCallback 
   */
  _transition(name, toValue, time, endCallback) {
    let value = this[name],
      dv = toValue - value,
      bt = new Date(),
      _this = this,
      currentEase = CoordMath.ease;

    let toTick = function () {
      let dt = new Date() - bt;

      if (dt >= time) {
        _this[name] = toValue;
        _this._draw();
        cancelAnimationFrame(_this[name + 'tickID']);

        _this[name + 'tickID'] = null;
        endCallback && endCallback(11);
        return;
      }

      _this[name] = dv * currentEase(dt / time) + value;
      _this._draw();
      _this[name + 'tickID'] = requestAnimationFrame(toTick);
    };

    toTick();
  }

  _transitionScale(tv, fn) {
    this._transition('scale', tv, 400, fn);
  }

  _transitionPan(name, target, fn) {
    this._transition(name, target, 400, fn);
  }

  _tap(ev) {
    clearTimeout(this._tapTimer);

    this._tapTimer = setTimeout(() => {
      this.options.tap && this.options.tap(ev);
    }, 200);
  }

  _doubleTap(ev) {
    // 关闭 tap 回调
    clearTimeout(this._tapTimer);
    
    let middleZoom = CoordMath.calcAverage(this.options.minZoom, this.options.doubleZoom);
    let nextZoom = this.scale > middleZoom ? this.options.minZoom : this.options.doubleZoom;

    if (nextZoom === this.options.doubleZoom) {
      // 点击点映射到坐标系坐标
      let tx = CoordMath.covertRealCoord(ev.center.x, this.dpr);
      let ty = CoordMath.covertRealCoord(ev.center.y, this.dpr);

      // 相对于 tx, ty 作为坐标系时的坐标
      let relativeInSx = CoordMath.calcRelativeCoordBeforeScale(this.realInSx, tx, this.scale);
      let relativeInSy = CoordMath.calcRelativeCoordBeforeScale(this.realInSy, ty, this.scale);

      // 相对于 tx, ty 进行缩放后图片源左上角的坐标
      let afRealInSx = CoordMath.calcRealCoordAfterScale(relativeInSx, tx, nextZoom);
      let afRealInSy = CoordMath.calcRealCoordAfterScale(relativeInSy, ty, nextZoom);

      // 缩放后的坐标范围
      let rangX = CoordMath.calcRangeCoord(this.sw, this.cw, nextZoom);
      let rangY = CoordMath.calcRangeCoord(this.sh, this.ch, nextZoom);

      let nOx = tx;

      if (rangX.min === rangX.max) {
        nOx = this.cw / 2;
      } else {
        if (afRealInSx < rangX.min) {
          // 逆推afRealInSx = rangX.min -> tx
          nOx = (rangX.min - this.realInSx * nextZoom / this.scale) / (1 - nextZoom / this.scale);
        }

        if (afRealInSx > rangX.max) {
          // 逆推afRealInSx = rangX.max -> tx
          nOx = (rangX.max - this.realInSx * nextZoom / this.scale) / (1 - nextZoom / this.scale);
        }
      }

      let nOy = ty;

      if (rangY.min === rangY.max) {
        nOy = this.ch / 2;
      } else {
        if (afRealInSy < rangY.min) {
          nOy = (rangY.min - this.realInSy * nextZoom / this.scale) / (1 - nextZoom / this.scale);
        }

        if (afRealInSy > rangY.max) {
          nOy = (rangY.max - this.realInSy * nextZoom / this.scale) / (1 - nextZoom / this.scale);
        }
      }

      let x = CoordMath.calcRelativeCoordBeforeScale(this.realSx, nOx, this.scale);
      let y = CoordMath.calcRelativeCoordBeforeScale(this.realSy, nOy, this.scale);

      this._updateCoord(nOx, nOy, x, y, () => {
        this._transitionScale(nextZoom);
      });
    } else {
      this.reset();
    }
  }

  _panStart(ev) {
    this.lastPanX = ev.deltaX;
    this.lastPanY = ev.deltaY;
  }

  _panMove(ev) {
    // 若缩放没结束则不掉用
    if (this.isPinch) {
      return;
    }

    let endPanX = ev.deltaX;
    let endPanY = ev.deltaY;

    // 计算偏移位置
    let offsetX = (endPanX - this.lastPanX) * this.dpr;
    let offsetY = (endPanY - this.lastPanY) * this.dpr;

    // 重置最后一次位置
    this.lastPanX = endPanX;
    this.lastPanY = endPanY;

    // 变化后 inSx, inSy 的实际坐标
    let afRealInSx = CoordMath.calcRealCoordAfterScale(this.inSx, this.ox + offsetX, this.scale);
    let afRealInSy = CoordMath.calcRealCoordAfterScale(this.inSy, this.oy + offsetY, this.scale);

    // 当前坐标范围
    let rangX = this.rangeInSx;
    let rangY = this.rangeInSy;

    let ox = this.ox;
    let oy = this.oy;

    if (this.options.softX || (afRealInSx >= rangX.min && afRealInSx <= rangX.max)) {
      this.canMoveX = true;
      ox += offsetX;
    } else {
      this.canMoveX = false;
    }

    if (this.options.softY || (afRealInSy >= rangY.min && afRealInSy <= rangY.max)) {
      this.canMoveY = true;
      oy += offsetY;
    } else {
      this.canMoveY = false;
    }

    this._updateCoord(ox, oy, this.sx, this.sy, () => {
      this._draw();
    });

    // 阻止默认行为（微信移动时拖动效果）
    ev.preventDefault();
  }

  _panEnd() {
    // 若缩放没结束则不掉用
    if (this.isPinch) {
      return;
    }

    let ox = this.ox;
    let oy = this.oy;

    // ox 
    let realInSx = this.realInSx;
    let rangX = this.rangeInSx;

    if (realInSx < rangX.min) {
      ox = this.ox + rangX.min - realInSx;
    } else if (realInSx > rangX.max) {
      ox = this.ox + rangX.max - realInSx;
    }

    // oy
    let realInSy = this.realInSy;
    let rangY = this.rangeInSy;

    if (realInSy < rangY.min) {
      oy = this.oy + rangY.min - realInSy;
    } else if (realInSy > rangY.max) {
      oy = this.oy + rangY.max - realInSy;
    }

    // 动画
    if (ox !== this.ox) {
      this._transitionPan('ox', ox);
    }

    if (oy !== this.oy) {
      this._transitionPan('oy', oy);
    }
  }

  _calcRealCoord(ox, oy, sx, sy, scale) {
    let inSx = sx + (this.dw - this.sw) / 2;
    let inSy = sy + (this.dh - this.sh) / 2;

    let realInSx = CoordMath.calcRealCoord(inSx * scale, ox);
    let realInSy = CoordMath.calcRealCoord(inSy * scale, oy);

    let rangX = CoordMath.calcRangeCoord(this.sw, this.cw, scale);
    let rangY = CoordMath.calcRangeCoord(this.sh, this.ch, scale);

    if (realInSx < rangX.min) {
      realInSx = rangX.min;
    } else if (realInSx > rangX.max) {
      realInSx = rangX.max;
    }

    if (realInSy < rangY.min) {
      realInSy = rangY.min;
    } else if (realInSy > rangY.max) {
      realInSy = rangY.max;
    }

    return {
      realSx: ((realInSx - ox) / scale - (this.dw - this.sw) / 2) * scale + ox,
      realSy: ((realInSy - oy) / scale - (this.dh - this.sh) / 2) * scale + oy
    }
  }

  _calcRightPalace(rightScale) {
    // 小于 1 图像应该一直居中
    if (rightScale <= 1) {
      // 坐标原定 为图形中点
      let ox = this.cw / 2;
      let oy = this.ch / 2;

      // // 绘制相对坐标
      let sx = -this.dw / 2;
      let sy = -this.dh / 2;

      // // 外层真实坐标
      let rightRealSx = CoordMath.calcRealCoord(sx * rightScale, ox);
      let rightRealSy = CoordMath.calcRealCoord(sy * rightScale, oy);

      // x'*r - tx = x; 
      // y'*r - ty = y; 
      // x'*ar - tx = ax; 
      // y'*ar - ty = ay; 
      // (tx, ty) (x', y')

      let x = (rightRealSx - this.realSx) / (rightScale - this.scale);
      let y = (rightRealSy - this.realSy) / (rightScale - this.scale);

      let tx = -x * rightScale + rightRealSx;
      let ty = -y * rightScale + rightRealSy;

      this.ox = tx;
      this.oy = ty;
      this.sx = x;
      this.sy = y;
    } else {
      let {
        realSx: rightRealSx,
        realSy: rightRealSy
      } = this._calcRealCoord(this.ox, this.oy, this.sx, this.sy, rightScale);
      let x = (rightRealSx - this.realSx) / (rightScale - this.scale);
      let y = (rightRealSy - this.realSy) / (rightScale - this.scale);

      let tx = -x * rightScale + rightRealSx;
      let ty = -y * rightScale + rightRealSy;

      this.ox = tx;
      this.oy = ty;
      this.sx = x;
      this.sy = y;
    }
  }

  _pinchStart(ev) {
    this._startPinchScale = ev.scale;
  }

  _pinchMove(ev) {
    // 正在缩放
    this.isPinch = true;

    // 点击点映射到坐标系坐标
    let tx = CoordMath.covertRealCoord(ev.center.x, this.dpr);
    let ty = CoordMath.covertRealCoord(ev.center.y, this.dpr);

    let x = CoordMath.calcRelativeCoordBeforeScale(this.realSx, tx, this.scale);
    let y = CoordMath.calcRelativeCoordBeforeScale(this.realSy, ty, this.scale);

    this._endPinchScale = ev.scale;
    let offsetScale = this._endPinchScale / this._startPinchScale;
    this._startPinchScale = ev.scale;

    this.ox = tx;
    this.oy = ty;
    this.sx = x;
    this.sy = y;

    this.scale *= offsetScale;
    this._draw();
  }

  _pinchEnd(ev) {
    let scale = this.scale;

    // 判断缩放是否超过边界
    if (scale < this.options.minZoom) {
      scale = this.options.minZoom;
      this._calcRightPalace(scale);

    } else if (scale > this.options.maxZoom) {
      scale = this.options.maxZoom;
      this._calcRightPalace(scale);
    }

    if (scale !== this.scale) {
      this._transitionScale(scale, () => {
        this.isPinch = false;
      });
    } else {
      this.isPinch = false;
      this._panEnd();
    }
  }

  /**
   * @description 更新坐标系
   * @param {number} ox 新原点
   * @param {number} oy 新原点
   */
  _updateCoord(ox, oy, sx, sy, fn) {
    this.ox = ox;
    this.oy = oy;

    this.sx = sx;
    this.sy = sy;

    fn && fn();
  }

  // 渲染
  show() {
    if (this.sOffCan) {
      return this.bind();
    }

    let _this = this;

    new util.pullImage(this.imgSrc).after((err, imgDom) => {
      if (err) {
        // 图片加载失败
        _this.options.err && _this.options.err(err);
        return err;
      }

      // 图片加载完成
      _this.options.load && _this.options.load(imgDom);

      let size = {};
      let sOffDrawW = 0;
      let sOffDrawH = 0;

      if (_this.angle % 90 === 0 && (_this.angle / 90) % 2 !== 0) {
        size = CoordMath.calcJustSize(imgDom.height, imgDom.width, _this.cw, _this.ch);
        sOffDrawH = size.w;
        sOffDrawW = size.h;
      } else {
        size = CoordMath.calcJustSize(imgDom.width, imgDom.height, _this.cw, _this.ch);
        sOffDrawW = size.w;
        sOffDrawH = size.h;
      }

      // 初始离屏 canvas 大小
      _this.sw = size.w;
      _this.sh = size.h;

      // 绘制原始离屏 canvas
      _this.sOffCan = util.getOffCanvas({
        img: imgDom,
        sw: sOffDrawW,
        sh: sOffDrawH,
        cw: size.w,
        ch: size.h,
        rotate: _this.angle
      });

      // 真正绘制的离屏 canvas 尺寸
      _this.dw = _this.dh = Math.ceil(
        Math.sqrt(
          Math.pow(size.w, 2) + Math.pow(size.h, 2)
        )
      );

      // 真正绘制的离屏 canvas
      _this.drawCan = util.getOffCanvas({
        img: _this.sOffCan,
        sw: _this.sw,
        sh: _this.sh,
        cw: _this.dw,
        ch: _this.dh,
        rotate: 0
      });

      // 绘制起点
      _this.sx = -_this.dw / 2;
      _this.sy = -_this.dh / 2;

      _this.initSx = CoordMath.calcRealCoord(_this.sx * this.scale, this.ox);
      _this.initSy = CoordMath.calcRealCoord(_this.sy * this.scale, this.oy);

      // 长按下载实现
      if (_this.options.longPressDownload && !util.isPc()) {
        _this._createLongTapImg(imgDom);
      }

      // 绘制初始值
      _this._draw();
      _this.bind();
    });

    // 创建手势实例
    this.hammer = new Hammer(this.context);
    // 开启缩放手势
    this.hammer.get('pinch').set({
      enable: true
    });
    // 设置双击偏差范围
    this.hammer.get('doubletap').set({
      posThreshold: 60
    });
    // 设置最小相应移动的距离
    this.hammer.get('pan').set({
      threshold: 0
    });
  }

  bind() {
    if (this._bind || !this.sOffCan) {
      return;
    }

    // 事件绑定
    this._bind = true;

    for (let type in this.events) {
      this.hammer.on(type, this.events[type])
    }
  }

  unbind() {
    if(!this._bind){
      return;
    }

    // 取消事件绑定
    this._bind = false;

    for (let type in this.events) {
      this.hammer.off(type, this.events[type]);
    }
  }

  // 重置变换
  reset() {
    // 现在真实坐标
    let realSx = this.realSx;
    let realSy = this.realSy;

    // 初始真实坐标
    let initSx = this.initSx;
    let initSy = this.initSy;

    // 计算原点
    let ox = (initSx * this.scale / this.options.minZoom - realSx) / (this.scale / this.options.minZoom - 1);
    let oy = (initSy * this.scale / this.options.minZoom - realSy) / (this.scale / this.options.minZoom - 1);

    // 计算相对偏移
    let x = CoordMath.calcRelativeCoordBeforeScale(initSx, ox, this.options.minZoom);
    let y = CoordMath.calcRelativeCoordBeforeScale(initSy, oy, this.options.minZoom);

    // 更新坐标系并绘制
    this._updateCoord(ox, oy, x, y, () => {
      this._transitionScale(this.options.minZoom)
    });
  }
}