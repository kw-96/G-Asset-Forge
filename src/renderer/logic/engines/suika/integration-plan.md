# Suika引擎集成计划

## 目标

直接复用Suika实现并适配集成进实际项目中，包括核心实现和UI交互等，清除旧的实现，保证实现不产生冲突，并且在项目中是统一的。

## 需要集成的核心系统

### 1. 画布系统（适配现有的设计模式和H5模式）

- **源文件**: `suika/packages/core/src/editor.ts`
- **目标**: 替换现有的 `src/renderer/logic/engines/suika/suika-canvas-engine.ts`
- **功能**: 核心编辑器、场景图、渲染系统

### 2. 标尺系统（将现有的清除，完全复用）

- **源文件**: `suika/packages/core/src/ruler.ts`
- **目标**: 替换现有的标尺实现
- **功能**: 智能标尺、刻度显示、选择区域高亮

### 3. 坐标系统（将现有的清除，完全复用）

- **源文件**: `suika/packages/core/src/viewport_manager.ts`
- **目标**: 替换现有的坐标转换系统
- **功能**: 视口管理、坐标转换、场景边界计算

### 4. 缩放平移系统（将现有的清除，完全复用）

- **源文件**: `suika/packages/core/src/viewport_manager.ts` (zoomIn, zoomOut, translate等方法)
- **目标**: 替换现有的缩放平移实现
- **功能**: 智能缩放、平滑平移、适应内容

### 5. 设置系统

- **源文件**: `suika/packages/core/src/setting.ts`
- **目标**: 集成到现有的配置系统
- **功能**: 用户偏好、编辑器设置、主题配置

### 6. 辅助线系统（将现有的清除，完全复用）

- **源文件**: `suika/packages/core/src/ref_line.ts`
- **目标**: 替换现有的辅助线实现
- **功能**: 智能对齐、参考线、吸附功能

## 实施步骤

### 阶段1: 核心依赖复制

1. 复制Suika核心包到项目中
2. 安装必要的依赖包
3. 配置TypeScript路径映射

### 阶段2: 核心系统集成

1. 集成SuikaEditor核心类
2. 集成ViewportManager
3. 集成Ruler系统
4. 集成RefLine系统
5. 集成Setting系统

### 阶段3: 适配器重构

1. 重构SuikaCanvasEngine适配器
2. 更新React组件集成
3. 更新事件处理系统

### 阶段4: 清理旧实现

1. 移除冲突的旧实现
2. 更新导入路径
3. 统一接口定义

### 阶段5: 测试和验证

1. 功能测试
2. 性能测试
3. 兼容性测试

## 文件映射关系

| Suika源文件 | 项目目标位置 | 状态 |
|------------|-------------|------|
| `suika/packages/core/src/editor.ts` | `src/renderer/logic/engines/suika/core/editor.ts` | 待复制 |
| `suika/packages/core/src/viewport_manager.ts` | `src/renderer/logic/engines/suika/core/viewport-manager.ts` | 待复制 |
| `suika/packages/core/src/ruler.ts` | `src/renderer/logic/engines/suika/core/ruler.ts` | 待复制 |
| `suika/packages/core/src/ref_line.ts` | `src/renderer/logic/engines/suika/core/ref-line.ts` | 待复制 |
| `suika/packages/core/src/setting.ts` | `src/renderer/logic/engines/suika/core/setting.ts` | 待复制 |
| `suika/packages/common/src/*` | `src/renderer/logic/engines/suika/common/*` | 待复制 |
| `suika/packages/geo/src/*` | `src/renderer/logic/engines/suika/geo/*` | 待复制 |

## 依赖关系分析

### 核心依赖

- `@suika/common`: 通用工具函数
- `@suika/geo`: 几何计算库
- `@suika/core`: 核心编辑器功能

### 需要适配的接口

- React组件集成
- 事件系统
- 状态管理（Zustand）
- 主题系统

## 风险评估

### 高风险

- 依赖包版本冲突
- TypeScript类型不兼容
- 现有功能破坏

### 中风险

- 性能影响
- UI组件适配
- 事件处理变更

### 低风险

- 配置迁移
- 样式调整
- 文档更新
