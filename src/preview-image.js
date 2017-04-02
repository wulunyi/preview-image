/**
 * @description 图片预览组件
 */

import * as util from './util';
import * as BaseMath from './base-math';
import hammer from 'hammerjs';
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

    // 离屏绘制 canvas 绘制
    this.dw = 0;
    this.dh = 0;

    // 是否在移动
    this.isMoveX = true;
    this.isMoveY = true;

    // 绘制参数
    this.angle = 0;
    this.scale = this.options.minZoom;

    // 事件配置选项
    this.events = {
      // 'tap': this.tap.bind(this),
      'doubletap': this._doubleTap.bind(this),
      'pinchstart': this._pinchStart.bind(this),
      'pinchmove': this._pinchMove.bind(this),
      'pinchend': this._pinchEnd.bind(this),
      'panstart': this._panStart.bind(this),
      'panmove': this._panMove.bind(this),
      'panend': this._panEnd.bind(this),
      // 'rotatestart': this.rotateStart.bind(this),
      // 'rotatemove': this.rotateMove.bind(this),
      // 'rotateend': this.rotateEnd.bind(this)
    };

    // 初始化
    this._init();
  }

  /**
   * @description 存上下文 dom
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
      rotated: false, // 是否开启旋转
      doubleZoom: 2, // 双击
      maxZoom: 4, // 最大缩放
      minZoom: 0.5, // 最小缩放
      longPressDownload: true, // 长按下载
      angled: 0, // 绘制旋转角度
      softX: true, //  遇到边界是否开启过渡动画
      softY: true,
      tap: null
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
    return this.sx + (this.dw - this.sw) / 2;
  }

  get inSy() {
    return this.sy + (this.dh - this.sh) / 2;
  }

  // 内层图片左上角的真实坐标
  get realInSx() {
    return BaseMath.calcRealCoord(this.inSx * this.scale, this.ox);
  }

  get realInSy() {
    return BaseMath.calcRealCoord(this.inSy * this.scale, this.oy)
  }

  // 外层图片左上角绘制真实坐标
  get realSx() {
    return BaseMath.calcRealCoord(this.sx * this.scale, this.ox);
  }

  get realSy() {
    return BaseMath.calcRealCoord(this.sy * this.scale, this.oy);
  }

  // 内层图片左上角真实坐标可移动范围
  get rangeInSx() {
    return BaseMath.calcRangeCoord(this.sw, this.cw, this.scale);
  }

  get rangeInSy() {
    return BaseMath.calcRangeCoord(this.sh, this.ch, this.scale);
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
      currentEase = BaseMath.ease;

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
    this._transition('scale', tv, 200, fn);
  }

  _transitionPan(name, target, fn) {
    this._transition(name, target, 200, fn);
  }

  _doubleTap(ev) {
    let middleZoom = (this.options.minZoom + this.options.doubleZoom) / 2;
    let nextZoom = this.scale > middleZoom ? this.options.minZoom : this.options.doubleZoom;

    if (nextZoom === this.options.doubleZoom) {
      // 点击点映射到坐标系坐标
      let tx = BaseMath.covertRealCoord(ev.center.x, this.dpr);
      let ty = BaseMath.covertRealCoord(ev.center.y, this.dpr);

      // 相对于 tx, ty 作为坐标系时的坐标
      let relativeInSx = BaseMath.calcRelativeCoord(this.realInSx, tx) / this.scale;
      let relativeInSy = BaseMath.calcRelativeCoord(this.realInSy, ty) / this.scale;

      // 相对于 tx, ty 进行缩放后图片源左上角的坐标
      let afRealInSx = BaseMath.calcRealCoord(relativeInSx * nextZoom, tx);
      let afRealInSy = BaseMath.calcRealCoord(relativeInSy * nextZoom, ty);

      // 缩放后的坐标范围
      let rangX = BaseMath.calcRangeCoord(this.sw, this.cw, nextZoom);
      let rangY = BaseMath.calcRangeCoord(this.sh, this.ch, nextZoom);

      if (rangX.min === rangX.max) {
        tx = this.cw / 2;
      } else {
        if (afRealInSx < rangX.min) {
          // 逆推afRealInSx = rangX.min -> tx
          tx = (rangX.min - this.realInSx * nextZoom / this.scale) / (1 - nextZoom / this.scale);
        }

        if (afRealInSx > rangX.max) {
          // 逆推afRealInSx = rangX.max -> tx
          tx = (rangX.max - this.realInSx * nextZoom / this.scale) / (1 - nextZoom / this.scale);
        }
      }

      if (rangY.min === rangY.max) {
        ty = this.ch / 2;
      } else {
        if (afRealInSy < rangY.min) {
          ty = (rangY.min - this.realInSy * nextZoom / this.scale) / (1 - nextZoom / this.scale);
        }

        if (afRealInSy > rangY.max) {
          ty = (rangY.max - this.realInSy * nextZoom / this.scale) / (1 - nextZoom / this.scale);
        }
      }

      let x = BaseMath.calcRelativeCoord(this.realSx, tx) / this.scale;
      let y = BaseMath.calcRelativeCoord(this.realSy, ty) / this.scale;

      this.ox = tx;
      this.oy = ty;

      this.sx = x;
      this.sy = y;
    } else {
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
      let x = BaseMath.calcRelativeCoord(initSx, ox) / this.options.minZoom;
      let y = BaseMath.calcRelativeCoord(initSy, oy) / this.options.minZoom;

      this.ox = ox;
      this.oy = oy;

      this.sx = x;
      this.sy = y;
    }

    // this.transition(nextZoom, this.ox, this.oy, 300);
    this._transitionScale(nextZoom, ()=>{
    });
  }

  _panStart(ev) {
    this.lastPanX = ev.deltaX;
    this.lastPanY = ev.deltaY;
  }

  _panMove(ev) {
    let endPanX = ev.deltaX;
    let endPanY = ev.deltaY;

    // 计算偏移位置
    let offsetX = (endPanX - this.lastPanX) * this.dpr;
    let offsetY = (endPanY - this.lastPanY) * this.dpr;

    // 重置最后一次位置
    this.lastPanX = endPanX;
    this.lastPanY = endPanY;

    // 变化后 inSx, inSy 的实际坐标
    let afRealInSx = BaseMath.calcRealCoord(this.inSx, this.ox + offsetX);
    let afRealInSy = BaseMath.calcRealCoord(this.inSy, this.oy + offsetY);

    // 当前坐标范围
    let rangX = this.rangeInSx;
    let rangY = this.rangeInSy;

    if (this.options.softX) {
      this.ox += offsetX;
    } else if (afRealInSx < rangX.min) {
      this.ox += offsetX + rangX.min - afRealInSx;
    } else if (afRealInSx > rangX.max) {
      this.ox += offsetX - afRealInSx + rangX.max;
    } else {
      this.ox += offsetX;
    }

    if (this.options.softY) {
      this.oy += offsetY;
    } else if (afRealInSy < rangY.min) {
      this.oy += offsetY + rangY.min - afRealInSy;
    } else if (afRealInSy > rangY.max) {
      this.oy += offsetY - afRealInSy + rangY.max;
    } else {
      this.oy += offsetY;
    }

    this._draw();
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

    if (this.options.softX) {
      let realInSx = this.realInSx;
      let rangX = this.rangeInSx;

      if (realInSx < rangX.min) {
        ox = this.ox + rangX.min - realInSx;
      } else if (realInSx > rangX.max) {
        ox = this.ox + rangX.max - realInSx;
      }
    }

    if (this.options.softY) {
      let realInSy = this.realInSy;
      let rangY = this.rangeInSy;

      if (realInSy < rangY.min) {
        oy = this.oy + rangY.min - realInSy;
      } else if (realInSy > rangY.max) {
        oy = this.oy + rangY.max - realInSy;
      }
    }

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

    let realInSx = BaseMath.calcRealCoord(inSx * scale, ox);
    let realInSy = BaseMath.calcRealCoord(inSy * scale, oy);

    let rangX = BaseMath.calcRangeCoord(this.sw, this.cw, scale);
    let rangY = BaseMath.calcRangeCoord(this.sh, this.ch, scale);

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
      let rightRealSx = BaseMath.calcRealCoord(sx * rightScale, ox);
      let rightRealSy = BaseMath.calcRealCoord(sy * rightScale, oy);

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
      let {realSx:rightRealSx , realSy:rightRealSy} = this._calcRealCoord(this.ox, this.oy, this.sx, this.sy, rightScale);
      let x = (rightRealSx - this.realSx) / (rightScale - this.scale);
      let y = (rightRealSy - this.realSy) / (rightScale - this.scale);

      let tx = -x * rightScale + rightRealSx;
      let ty = -y * rightScale + rightRealSy;

      this.ox = tx;
      this.oy = ty;
      this.sx = x;
      this.sy = y;

      // // 现在真实坐标
      // let realSx = this.realSx;
      // let realSy = this.realSy;

      // // 计算原点
      // let ox = (initSx * this.scale / rightScale - realSx) / (this.scale / rightScale - 1);
      // let oy = (initSy * this.scale / rightScale - realSy) / (this.scale / rightScale - 1);

      // // 计算相对偏移
      // let x = BaseMath.calcRelativeCoord(initSx, ox) / rightScale;
      // let y = BaseMath.calcRelativeCoord(initSy, oy) / rightScale;

      // this.ox = ox;
      // this.oy = oy;

      // this.sx = x;
      // this.sy = y;
    }
  }

  _pinchStart(ev) {
    this._startPinchScale = ev.scale;
  }

  _pinchMove(ev) {
    // 正在缩放
    this.isPinch = true;

    // 点击点映射到坐标系坐标
    let tx = BaseMath.covertRealCoord(ev.center.x, this.dpr);
    let ty = BaseMath.covertRealCoord(ev.center.y, this.dpr);

    let x = BaseMath.calcRelativeCoord(this.realSx, tx) / this.scale;
    let y = BaseMath.calcRelativeCoord(this.realSy, ty) / this.scale;

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

  // 渲染
  show(s) {
    this.imgSrc = s;
    let _this = this;

    new util.pullImage(this.imgSrc).after((err, imgDom) => {
      if (err) {
        return err;
      }

      let size = BaseMath.calcJustSize(imgDom.width, imgDom.height, _this.cw, _this.ch);

      // 初始离屏 canvas 大小
      _this.sw = size.w;
      _this.sh = size.h;

      // 绘制原始离屏 canvas
      _this.sOffCan = util.getOffCanvas({
        img: imgDom,
        sw: size.w,
        sh: size.h,
        cw: size.w,
        ch: size.h,
        rotate: 0
      });

      // if (_this.angle === 90) {
      //   size = BaseMath.calcJustSize(imgDom.height, imgDom.width, _this.cw, _this.ch);
      //   _this.sw = size.w;
      //   _this.sh = size.h;
      // }

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

      _this.initSx = BaseMath.calcRealCoord(_this.sx * this.scale, this.ox);
      _this.initSy = BaseMath.calcRealCoord(_this.sy * this.scale, this.oy);

      // 长按下载实现
      if (_this.options.longPressDownload) {
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
      threshold: 0.1
    });

    // 根据配置管理旋转
    // if(this.DEFAULT_CONFIG.ROTATE){
    // 	this.hammer.get('rotate').set({ enable: true });
    // }
  }

  bind() {
    for (let type in this.events) {
      this.hammer.on(type, this.events[type])
    }
  }

  unbind() {
    for (let type in this.events) {
      this.hammer.off(type, this.events[type]);
    }
  }

  // 重置变换
  reset() {}
}