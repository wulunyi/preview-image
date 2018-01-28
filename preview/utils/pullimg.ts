import {isFunction} from 'lodash';

export default class Pullimg {
  public afterFn: (err: Error, img: HTMLImageElement) => void = ()=>{};

  constructor(public src) {
    setTimeout(() => {
      const img = document.createElement('img');

      img.addEventListener('load', (ev) => {
        this.success(img);
      });

      img.addEventListener('error', (ev) => {
        this.fail();
      });

      img.src = src;

      // 从缓存中取图片的时候
      if (img.complete) {
        this.success(img);
      }
    }, 0);

    return this;
  }

  private success(img: HTMLImageElement) {
    this.afterFn(null, img);
  }

  private fail() {
    this.afterFn(new Error('load:err'), null);
  }

  public after = (fn: (err: Error, img: HTMLImageElement) => void) => {
    if (isFunction(fn)) {
      this.afterFn = fn;
    }
  }
}