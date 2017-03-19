# 图片预览组件——H5

## 简介

   图片预览组件，基于 canvas API 实现，提供对图片的放大、缩小、移动、旋转等一些列的变换操作。

## 安装

```shell
  npm install image-preview --save-dev
```

## 使用
```javascript
  var PreviewImage = require("preview-image");
  var previewImage = new PreviewImage( element, {
    imageSrc: 'http://xxx.com/xxx.png', // 图片地址
    rotatable: false, // 是否开启旋转
    doubleZoom: 2, // 双击缩放
    maxZoom: 4, // 最大缩放
    minZoom: 1, // 最小缩放
    longPressDownload: false, // 是否长按下载图片
    angled: 45, // 初始旋转角度
    soft: true // 边界是否开启过渡动画
  });
  
  previewImage.start();
```

## API

### start()
### bind()
### unbind()
