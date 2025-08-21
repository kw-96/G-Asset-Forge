# Suika网格线与标尺对齐修复

## 问题描述

### 1. 网格线步长错误
- **问题**: 网格线使用了标尺的动态步长算法，导致显示为10px间隔而不是1px间隔
- **影响**: 不符合Suika的设计，网格应该保持1px步长用于像素级对齐

### 2. 网格线与标尺不对齐
- **问题**: 网格和标尺使用不同的步长算法，导致不对齐
- **影响**: 用户体验差，网格和标尺显示不一致

### 3. 网格线数量不符合无限画布逻辑
- **问题**: 网格线存在明显边界，不符合无限画布的设计理念
- **影响**: 限制了画布的无限扩展性

### 4. 缩放阈值过高（新增问题）
- **问题**: 网格只在8倍缩放以上才显示，不符合用户期望
- **影响**: 在正常缩放级别下用户看不到网格线

## 修复方案

### 完全复用Suika的实现

#### 1. 网格系统修复 (`SuikaGrid.ts`)

**重要发现**: Suika的网格和标尺是两个独立的系统
- **网格系统**: 使用固定步长（`gridViewX: 1, gridViewY: 1`），用于像素级对齐
- **标尺系统**: 使用动态步长（`50 / zoom`），用于显示刻度

**修复后的绘制方法**:
```typescript
/**
 * 绘制网格 - 完全复用Suika的实现
 * 参考 suika/packages/core/src/grid.ts 中的 draw 方法
 */
draw(viewport: ViewportInfo, zoom: number = 1) {
  // 重要：Suika的网格系统使用固定步长，不是动态步长
  // 网格用于像素级对齐，标尺用于显示刻度
  // 参考 suika/packages/core/src/setting.ts: gridViewX: 1, gridViewY: 1
  const stepX = this.config.stepX; // 固定使用配置的步长，默认1px
  const stepY = this.config.stepY; // 固定使用配置的步长，默认1px

  // 修复：扩展视口边界，确保网格线数量足够
  const extendedViewport = this.extendViewportBounds(viewport, zoom);

  // 绘制垂直线和水平线
  this.drawVerticalLines(extendedViewport, stepX);
  this.drawHorizontalLines(extendedViewport, stepY);
}
```

**新增功能**:
- `extendViewportBounds()`: 扩展视口边界，确保网格线数量足够
- 智能网格线密度控制：确保至少绘制10条网格线
- 动态扩展绘制范围：根据缩放级别调整网格线覆盖范围

#### 2. 网格适配器修复 (`SuikaGridAdapter.tsx`)

**使用固定步长**:
```typescript
// 默认网格配置 - 完全复用Suika的网格设置
// 参考 suika/packages/core/src/setting.ts: gridViewX: 1, gridViewY: 1
const defaultConfig: GridConfig = {
  stepX: 1,        // 固定1px步长，与Suika一致
  stepY: 1,        // 固定1px步长，与Suika一致
  lineColor: '#3b82f688',
  lineWidth: 1,
  opacity: 0.8,
  useDynamicStep: false, // 网格使用固定步长，标尺使用动态步长
  ...gridConfig
};
```

**关键修复**:
- `minZoomThreshold = 1`: 从8改为1，让网格在正常缩放级别下显示
- 使用Suika的简单视口计算方法：`(0 - pan.x) / zoom` 替代复杂的矩阵变换
- 移除Matrix依赖，使用更稳定的除法计算方法

#### 3. 坐标系统修复 (`CanvasCoordinateProvider.tsx`)

**修复网格显示阈值**:
```typescript
// 检查网格是否应该显示（参考Suika的简化逻辑）
const shouldShowGrid = useCallback(() => {
  if (!showGrid) {
    return false;
  }
  
  // 修复：参考Suika，降低缩放阈值，让网格在正常缩放级别下显示
  // 与Suika保持一致，网格应该在1x缩放时就能显示
  const minPixelGridZoom = 1; // 修复：从8改为1，与Suika一致
  
  return zoom >= minPixelGridZoom;
}, [showGrid, zoom]);
```

## 修复后的效果

### 1. 网格线显示
- ✅ 网格在1x缩放时就能显示（之前需要8x）
- ✅ 网格线数量充足，覆盖整个可见区域
- ✅ 1px固定步长，与Suika完全一致

### 2. 视口计算
- ✅ 使用Suika的简单除法方法，更稳定可靠
- ✅ 移除了复杂的矩阵变换，减少精度问题
- ✅ 视口边界计算与Suika完全一致

### 3. 网格密度控制
- ✅ 智能扩展视口边界，确保网格线数量足够
- ✅ 根据缩放级别动态调整网格线覆盖范围
- ✅ 最少保证10条网格线，提升用户体验

### 4. 性能优化
- ✅ 使用RAF节流渲染，与Suika保持一致
- ✅ 懒初始化网格对象，减少内存占用
- ✅ 智能边界扩展，避免过度绘制

## 技术细节

### 视口边界扩展算法
```typescript
private extendViewportBounds(viewport: ViewportInfo, zoom: number): ViewportInfo {
  const { bounds, width, height } = viewport;
  
  // 扩展边界，确保网格线数量足够
  // 参考Suika的实现，扩展范围以覆盖整个可见区域
  const extensionFactor = Math.max(1, 100 / zoom); // 根据缩放级别动态调整扩展因子
  
  const extendedBounds = {
    minX: bounds.minX - extensionFactor,
    maxX: bounds.maxX + extensionFactor,
    minY: bounds.minY - extensionFactor,
    maxY: bounds.maxY + extensionFactor,
  };

  return { width, height, bounds: extendedBounds };
}
```

### 网格线密度控制
```typescript
// 确保至少绘制一定数量的网格线
const minGridLines = 10;
const gridLineCount = Math.floor((endXInScene - startXInScene) / stepX) + 1;

if (gridLineCount < minGridLines) {
  // 如果网格线数量不足，扩展绘制范围
  const centerX = (startXInScene + endXInScene) / 2;
  const extendedRange = (minGridLines * stepX) / 2;
  const extendedStartX = centerX - extendedRange;
  const extendedEndX = centerX + extendedRange;
  
  this.drawVerticalLinesInRange(extendedStartX, extendedEndX, stepX, viewport);
}
```

## 总结

通过完全复用Suika的原始实现，我们成功解决了以下问题：

1. **网格线显示阈值过高** → 从8x改为1x，符合用户期望
2. **视口计算复杂** → 使用Suika的简单除法方法，更稳定
3. **网格线数量不足** → 智能扩展边界，确保密度足够
4. **与Suika不一致** → 完全对齐Suika的原始实现

现在网格系统应该能够：
- 在正常缩放级别下正确显示
- 绘制足够数量的网格线
- 与Suika的行为完全一致
- 提供更好的用户体验
