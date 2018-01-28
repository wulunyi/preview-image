import * as hammer from 'hammerjs';
import { 
  isString, 
  isObject,
  isEmpty,
  isEqual,
  flowRight 
} from 'lodash';
import { 
  isHTMLElement, 
  isImgElement, 
  getImgElSrc,
  getDeviceDpr,
  getHTMLElementSize,
  getHTMLElementStyle,
  setStyle
} from './utils/util';
import Pullimg from './utils/pullimg';

// interface
import { Options } from './interface/interface';

const defaultOptions = {
  doubleZoom: 2, // 双击
  maxZoom: 4, // 最大缩放
  minZoom: 1, // 最小缩放
  longPressDownload: true, // 长按下载
  angled: 0, // 绘制旋转角度
  softX: true, //  遇到边界是否开启过渡动画
  softY: true,
  onTap: () => {}, // 轻点回调
  onLoad: () => {}, // 图片加载完成回调
  onErr: () => {} // 图片加载失败回调
};

export default class Preview {
  // 共有属性
  public imgEl: HTMLImageElement; // 图片 DOM 
  public imgPath: string; // 图片地址
  public drawingBoard: HTMLCanvasElement;// 画板
  public drawingContext: CanvasRenderingContext2D;// 绘画上下文
  public drawingContextSize: {w: number, h: number};// 上下文宽高
  public imgCanvas: HTMLCanvasElement;// 绘制图片的 canvas 离屏 canvas
  public canMoveX: boolean = false; // x 轴是否可以移动
  public canMoveY: boolean = false; // y 轴是否可以移动
  public dpr: number = getDeviceDpr(); // 设备 dpr
  public scale: number; // 当前缩放

  // 私有属性
  private _options: Options = {...defaultOptions};
  private _angle: number; // 旋转角度

  // set get
  set options(options: Options) {
    if (isObject(options)) {
      this._options = {
        ...defaultOptions,
        ...options
      }
    }

     // 初始化值
     this.angle = this._options.angled;
     this.scale = this._options.minZoom;
  }

  get options() {
    return this._options;
  }

  set angle(deg: number) {
    if (deg % 90 !== 0) {
      this._angle = 0;
    } else {
      this._angle = deg % 360;
    }
  }

  get angle(): number {
    return this._angle || 0;
  }

  constructor(public el: HTMLElement, resource: string|HTMLImageElement, options: Options) {
    if (!isHTMLElement(el)) {
      console.error('el must HTMLElement');
    } else {
      // 调整 position
      Preview.adjustElPosition(this.el);
    }

    if (isString(resource)) {
      this.imgPath = resource;
    } else if (isImgElement(resource)) {
      this.imgEl = resource;
      this.imgPath = getImgElSrc(resource);
    }

    if (isEmpty(this.imgPath)) {
      console.error('resource illegal');
    }

    this.options = options;

    // 绘制画板设置
    const size = getHTMLElementSize(this.el);

    // 获取绘画面板
    this.drawingBoard = Preview.createDrawingBoard(size);
    this.drawingContextSize = {
      w: size.w * this.dpr,
      h: size.h * this.dpr
    };

    // 设置实际绘画空间大小
    this.drawingBoard.width = this.drawingContextSize.w;
    this.drawingBoard.height = this.drawingContextSize.h;
    this.drawingContext = this.drawingBoard.getContext('2d');

    // 推入页面
    this.appendChild(this.drawingBoard);
  }

  /**
   * name
   */
  private appendChild(el) {
    this.el.appendChild(el);
  }

  static adjustElPosition(el: HTMLElement) {
    const {position} = getHTMLElementStyle(el);

    if (isEqual(position, 'static')) {
      setStyle(el, {
        position: 'relative'
      });
    }
  }

  static createDrawingBoard(size: {w:number, h:number} = {w: 0, h: 0}) {
    const canvas = document.createElement('canvas');

    setStyle(canvas, {
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

    canvas.innerHTML = '您的浏览器不支持 canvas 请升级您的浏览器';

    return canvas;
  }

  static createLongTapImg(resourece: string|HTMLImageElement) {
    let img;

    if (isString(resourece)) {
      const img = document.createElement('img');
      img.src = resourece;
    } else if (isHTMLElement(resourece)){
      img = resourece.cloneNode();
    } else {
      console.error('resource 不合法');
    }
    
    setStyle(img, {
      position: 'absolute',
      left: '0',
      top: '0',
      zIndex: 9999,
      // opacity: 0,
      // filter: 'alpha(0)',
      width: '100%',
      height: '100%'
    });

    return img;
  }

  /**
   * show
   */
  public show = () => {
    // 如果已经存在则直接恢复事件监听
    if (this.imgCanvas) {
      this.bind();
      return;
    }

    // 初始化离线图片 canvas 的绘制
    if (isHTMLElement(this.imgEl) && this.imgEl.complete) {
      this.options.onLoad();
      this.render();
      new Pullimg(this.imgPath).after((err, img) => {
        if (err) {
          this.options.onErr();
          return;
        }
        this.imgEl = img;
        this.options.onLoad();
        this.render();
      });
    }
  }

  private render() {
    // 创建长按下载图片
    if (this._options.longPressDownload) {
      this.appendChild(Preview.createLongTapImg(this.imgEl));
    }


  }

  public bind() {

  }
}