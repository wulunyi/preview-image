# H5 单图预览

## 简介

采用 canvas 实现在 H5 端对于图片的预览，功能类似于 QQ 和微信浏览器图片预览功能
### 功能列表

+ 双指缩放
+ 双击缩放
+ 移动


## 安装

```shell
  npm install preview-image --save
```

## 使用
```javascript
  var PreviewImage = require("preview-image").default;
  
  // 配置选项
  var options = {
    doubleZoom: 2, // 双击缩放比 default 2
    maxZoom: 4, // 最大缩放比 default 4
    minZoom: 1, // 最小缩放比 default 1
    longPressDownLoad: false ,// H5 端长按图片下载 default false
    angled: 0, // 图片初始旋转角度,取值为 90 * n 不满足设置为 0 default 0 
    softX: true , // 当到达左右边界是否支持过渡动画 default true
    softY: true, // 当到达上下边界是否支持过渡动画 default true
    tap: null, // 轻点图片回调函数 default null
    load: null, // 图片加载完成回调 default null
    err: null, // 图片加载失败回调 default null
  }

  var element = document.getElementsByClassName('context')[0];

  var previewImage = new PreviewImage( 
    element, // 上下文元素（图片显示容器）
    'http://xxx.com/xxx.png', // 图片地址
    options // 配置选项
  });
  
  previewImage.show();
```

## API

### show()
开始渲染（重复调用，相当于掉用 bind()）

### bind()
开启事件

### unbind()
关闭事件

### reset()
重置为初始状态

## demo
```shell
  git clone ...

  cd preview-image
  npm install
  npm run dev
```