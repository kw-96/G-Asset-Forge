# 设计工具套件

G-Asset Forge MVP 的设计工具套件提供了完整的画笔和裁剪工具实现，参考了 Figma 的设计理念。

## 工具概览

### 画笔工具 (BrushTool)

画笔工具允许用户在画布上自由绘制，支持压感和多种画笔设置。

#### 功能特性

- **可调节画笔大小**: 1-200px
- **透明度控制**: 0-100%
- **硬度设置**: 控制画笔边缘的柔和程度
- **颜色选择**: 支持任意颜色
- **压感支持**: 支持压力感应设备
- **平滑路径**: 使用贝塞尔曲线平滑绘制路径

#### 使用方法

```typescript
import BrushTool from './tools/BrushTool';

const brushTool = new BrushTool({
  size: 10,
  opacity: 1,
  color: '#000000',
  hardness: 0.8
});

// 开始绘制
brushTool.startDrawing(x, y, pressure);

// 继续绘制
brushTool.continueDrawing(x, y, pressure);

// 完成绘制
const stroke = brushTool.finishDrawing();

// 转换为画布元素
const element = brushTool.strokeToCanvasElement(stroke);
```

#### 快捷键

- `B`: 激活画笔工具

### 裁剪工具 (CropTool)

裁剪工具允许用户精确裁剪选中的元素，支持多种宽高比预设。

#### 功能特性

- **精确裁剪**: 像素级精度的裁剪控制
- **宽高比约束**: 支持多种预设宽高比
- **最小尺寸限制**: 防止过小的裁剪区域
- **实时预览**: 裁剪区域的实时可视化
- **拖拽手柄**: 8个控制手柄用于调整裁剪区域

#### 宽高比预设

- 自由裁剪
- 1:1 (正方形)
- 16:9 (横向)
- 4:3 (横向)
- 3:2 (横向)
- 9:16 (竖向)
- 3:4 (竖向)
- 2:3 (竖向)

#### 使用方法

```typescript
import CropTool from './tools/CropTool';

const cropTool = new CropTool({
  maintainAspectRatio: false,
  minWidth: 10,
  minHeight: 10
});

// 开始裁剪
cropTool.startCrop(element);

// 更新裁剪区域
cropTool.updateCropArea({ x: 10, y: 10, width: 100, height: 80 });

// 设置宽高比
cropTool.setAspectRatio(CropTool.ASPECT_RATIOS.SQUARE);

// 应用裁剪
const croppedElement = cropTool.applyCrop();
```

#### 快捷键

- `C`: 激活裁剪工具

## UI 组件

### 悬浮工具栏 (FloatingToolbar)

参考 Figma 设计的悬浮工具栏，位于画布下方居中位置。

#### 特性

- **Figma 风格设计**: 半透明背景，毛玻璃效果
- **响应式布局**: 适配不同屏幕尺寸
- **工具分组**: 逻辑分组的工具按钮
- **快捷键提示**: 悬停显示快捷键
- **状态指示**: 当前激活工具的视觉反馈

#### 工具分组

1. **选择工具组**
   - 选择工具 (V)
   - 抓手工具 (H)

2. **形状工具组**
   - 矩形工具 (R)
   - 椭圆工具 (O)
   - 三角形工具 (Shift+T)
   - 星形工具 (Shift+S)

3. **内容工具组**
   - 文本工具 (T)
   - 图片工具 (Shift+I)
   - 框架工具 (F)

4. **绘制工具组**
   - 画笔工具 (B)
   - 裁剪工具 (C)

### 属性面板

#### 画笔属性面板 (BrushProperties)

- 画笔大小滑块和预设按钮
- 透明度控制
- 硬度调节
- 颜色选择器

#### 裁剪属性面板 (CropProperties)

- 宽高比选择网格
- 最小尺寸设置
- 裁剪区域数值输入
- 应用/取消按钮

## 集成说明

### 工具管理器 (ToolManager)

使用单例模式管理所有工具实例：

```typescript
import ToolManager from './tools/ToolManager';

const toolManager = ToolManager.getInstance();
const brushTool = toolManager.getBrushTool();
const cropTool = toolManager.getCropTool();
```

### 工具切换Hook (useToolSwitch)

提供统一的工具切换接口：

```typescript
import useToolSwitch from '../hooks/useToolSwitch';

const { activeTool, switchTool } = useToolSwitch();
switchTool('brush'); // 自动处理状态清理
```

### 画布组件集成

工具已集成到 `CanvasComponent` 中：

- 鼠标事件处理
- 工具状态管理
- 实时预览渲染
- SVG 路径生成

### 状态管理

工具状态通过 Zustand store 管理：

- 激活工具跟踪
- 元素创建和更新
- 选择状态管理

### 类型定义

扩展了 `CanvasElement` 类型以支持：

- 画笔数据存储
- 图片裁剪信息
- 工具特定属性

## 性能优化

### 画笔工具优化

- 路径简化算法
- 增量渲染
- 内存池管理
- SVG 优化

### 裁剪工具优化

- 边界检查优化
- 实时计算缓存
- 手柄位置缓存

## 测试

提供了完整的单元测试：

- `BrushTool.test.ts`: 画笔工具测试
- `CropTool.test.ts`: 裁剪工具测试

运行测试：

```bash
npm test tools
```

## 扩展性

工具架构支持轻松扩展：

- 新工具类继承基础接口
- 属性面板组件化
- 插件化工具系统

## 最佳实践

1. **性能**: 避免在绘制过程中频繁更新 DOM
2. **用户体验**: 提供实时反馈和预览
3. **可访问性**: 支持键盘导航和屏幕阅读器
4. **响应式**: 适配不同设备和屏幕尺寸
