# CSS 兼容性修复说明

## image-rendering 属性兼容性修复

### 问题描述
Microsoft Edge Tools 检测到 `image-rendering: crisp-edges` 属性在 Edge 浏览器中不被完全支持。

### 修复方案
在 `src/renderer/styles/global.less` 文件中，为了确保跨浏览器兼容性，我们按以下顺序添加了所有必要的前缀属性：

```less
canvas {
  image-rendering: -webkit-optimize-contrast; /* Edge 79+ support */
  image-rendering: -moz-crisp-edges; /* Firefox support */
  image-rendering: -webkit-crisp-edges; /* WebKit/Blink support */
  image-rendering: crisp-edges; /* Standard property */
  image-rendering: pixelated; /* Fallback for older browsers */
}
```

### 浏览器支持
- **Edge 79+**: `-webkit-optimize-contrast`
- **Firefox**: `-moz-crisp-edges`
- **Chrome/Safari**: `-webkit-crisp-edges`
- **现代浏览器**: `crisp-edges` (标准属性)
- **老版本浏览器**: `pixelated` (降级选项)

### 作用
这些属性确保在高 DPI 显示器上，canvas 元素能够以最佳的像素渲染质量显示，避免模糊或不清晰的问题。