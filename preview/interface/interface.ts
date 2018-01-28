export interface Options{
  doubleZoom?: number; // 双击缩放倍数
  maxZoom?: number; // 缩放最大边界
  minZoom?: number; // 缩放最小边界
  longPressDownload?: boolean; // 是否长按下载
  angled?: number; // 初始旋转角度
  softX?: boolean; // 遇到边界是否开启过渡动画
  softY?: boolean; // 遇到边界是否开启过渡动画
  onTap?: () => void; // 轻点回调
  onLoad?: () => void; // 图片加载完成回调
  onErr?: () => void; // 图片加载失败回调
}