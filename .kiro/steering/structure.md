# 项目结构与组织

## 根目录结构

```text
g-asset-forge/
├── src/                    # 源代码
│   ├── main/              # Electron主进程
│   ├── renderer/          # React渲染进程
│   │   ├── engines/       # 多编辑器引擎
│   │   │   ├── suika/     # Suika引擎集成
│   │   │   └── h5-editor/ # H5编辑器引擎
│   │   ├── managers/      # 业务管理器
│   │   │   ├── canvas/    # 画布管理
│   │   │   ├── tools/     # 工具管理
│   │   │   ├── history/   # 历史记录管理
│   │   │   └── assets/    # 素材管理
│   │   └── ui/            # UI组件库
│   ├── types/             # 共享TypeScript定义
│   └── utils/             # 共享工具
├── assets/                # 静态资源（图片、字体、图标）
├── dist/                  # 构建输出
├── docs/                  # 技术文档
├── scripts/               # 构建和工具脚本
├── 开发文档/              # 中文开发文档
├── .kiro/                 # Kiro IDE配置
│   ├── specs/             # 项目规格文档
│   └── steering/          # AI助手指导文档
└── logs/                  # 开发日志
```

## 源代码组织

### 主进程 (`src/main/`)

- **main.ts** - Electron主进程入口点
- **preload.ts** - 主进程和渲染进程间的安全IPC桥接
- **managers/** - 系统级管理器（文件、窗口等）

### 渲染进程 (`src/renderer/`)

```text
renderer/
├── components/            # React组件
│   ├── Canvas/           # 画布相关组件
│   ├── Layout/           # 应用布局组件
│   ├── Properties/       # 工具属性面板
│   └── ui/               # 可复用UI组件
├── engines/              # 多编辑器引擎架构
│   ├── suika/           # Suika引擎集成
│   │   ├── Editor.ts    # Suika编辑器核心
│   │   ├── Scene.ts     # 场景管理
│   │   └── Graph.ts     # 图形对象
│   └── h5-editor/       # H5编辑器引擎
│       ├── core/        # h5-editor核心
│       ├── components/  # Vue组件适配
│       └── export/      # 导出引擎
├── managers/            # 业务管理器
│   ├── canvas/         # 画布管理器
│   ├── tools/          # 工具管理器
│   ├── history/        # 历史记录管理器
│   └── assets/         # 素材库管理器
├── stores/             # Zustand状态管理
├── tools/              # 画布工具实现
├── ui/                 # 自定义UI组件库
│   ├── components/     # 基础UI组件
│   ├── styles/         # 样式系统
│   └── theme/          # 主题配置
├── styles/             # 全局样式和主题
├── hooks/              # 自定义React钩子
├── utils/              # 渲染进程特定工具
├── App.tsx             # 主应用组件
└── index.tsx           # 渲染进程入口点
```

## 关键组件分类

### 画布系统

- **CanvasComponent.tsx** - 主画布包装器，支持多引擎切换
- **CanvasArea.tsx** - 画布容器，包含缩放/平移控制
- **CanvasToolbar.tsx** - 画布专用工具栏（缩放、预设）
- **FloatingToolbar.tsx** - 上下文敏感的工具选项

### 布局组件

- **Layout.tsx** - 主应用布局
- **MainToolbar.tsx** - 主应用工具栏
- **ToolPropertiesPanel.tsx** - 右侧属性面板

### 多引擎架构

- **engines/suika/** - Suika引擎集成
  - **SuikaAdapter.ts** - Suika到React的适配层
  - **CanvasEngine.ts** - 画布引擎接口实现
- **engines/h5-editor/** - H5编辑器引擎
  - **H5EditorManager.ts** - H5编辑器管理器
  - **VueAdapter.ts** - Vue组件适配层

### 工具系统

- **managers/tools/ToolManager.ts** - 中央工具协调器
- **tools/toolConfig.ts** - 工具配置和注册
- **tools/SelectTool.ts** - 选择工具（对象选择、移动、旋转）
- **tools/TextTool.ts** - 文本工具（字体、大小、颜色）
- **tools/ImageTool.ts** - 图片工具（上传、调整、裁剪）
- **tools/ShapeTool.ts** - 形状工具（10种基础形状）
- **tools/BrushTool.ts** - 画笔工具（大小、透明度）
- **tools/CropTool.ts** - 裁剪工具（精确矩形裁剪）

### 状态管理

- **stores/appStore.ts** - 全局应用状态
- **stores/canvasStore.ts** - 画布特定状态（缩放、选择等）
- **stores/toolStore.ts** - 工具状态管理
- **stores/assetStore.ts** - 素材库状态管理
- 存储文件遵循Zustand模式配合TypeScript

### 业务管理器

- **managers/canvas/** - 画布管理器
  - **CanvasManager.ts** - 画布生命周期管理
  - **ViewportManager.ts** - 视口控制（缩放、平移）
- **managers/history/** - 历史记录管理器
  - **HistoryManager.ts** - 操作历史记录
  - **UndoRedoManager.ts** - 撤销重做功能
- **managers/assets/** - 素材库管理器
  - **AssetLibraryManager.ts** - 素材分类和存储
  - **AssetSearchManager.ts** - 素材搜索和过滤

## 路径映射与导入

### TypeScript路径别名

```typescript
// 在tsconfig.json中配置
"@/*": ["*"]                                    // src根目录
"@/components/*": ["renderer/components/*"]     // React组件
"@/ui/*": ["renderer/components/ui/*"]          // UI组件
"@/canvas/*": ["renderer/components/Canvas/*"]  // 画布组件
"@/tools/*": ["renderer/components/tools/*"]    // 工具组件
"@/panels/*": ["renderer/components/panels/*"]  // 面板组件
"@/engines/*": ["renderer/engines/*"]           // 引擎系统
"@suika/*": ["renderer/engines/suika/*"]        // Suika引擎
"@h5-editor/*": ["renderer/engines/h5-editor/*"] // H5编辑器引擎
"@/managers/*": ["renderer/managers/*"]         // 业务管理器
"@/canvas-manager/*": ["renderer/managers/canvas/*"] // 画布管理器
"@/tools-manager/*": ["renderer/managers/tools/*"]   // 工具管理器
"@/history-manager/*": ["renderer/managers/history/*"] // 历史管理器
"@/assets-manager/*": ["renderer/managers/assets/*"]   // 素材管理器
"@/models/*": ["renderer/models/*"]             // 数据模型
"@/stores/*": ["renderer/stores/*"]             // 状态存储
"@/utils/*": ["renderer/utils/*"]               // 工具函数
"@/hooks/*": ["renderer/hooks/*"]               // React钩子
"@/styles/*": ["renderer/styles/*"]             // 样式文件
"@/types/*": ["types/*"]                        // 类型定义
"@main/*": ["main/*"]                           // 主进程
"@renderer/*": ["renderer/*"]                   // 渲染进程
"@shared/*": ["shared/*"]                       // 共享代码
"@assets/*": ["../assets/*"]                    // 静态资源
"@images/*": ["../assets/images/*"]             // 图片资源
"@fonts/*": ["../assets/fonts/*"]               // 字体资源
"@icons/*": ["../assets/icons/*"]               // 图标资源
"@/core/*": ["renderer/core/*"]                 // 核心功能
"@/ui-components/*": ["renderer/ui/components/*"] // UI组件库
"@/ui-styles/*": ["renderer/ui/styles/*"]       // UI样式
"@/ui-theme/*": ["renderer/ui/theme/*"]         // UI主题
```

### 导入约定

```typescript
// 优先使用路径别名而非相对导入
import { CanvasComponent } from '@/components/Canvas/CanvasComponent';
import { useCanvasStore } from '@/stores/canvasStore';
import { BrushTool } from '@/tools/BrushTool';
import { SuikaAdapter } from '@suika/SuikaAdapter';
import { H5EditorManager } from '@h5-editor/H5EditorManager';
import { ToolManager } from '@/tools-manager/ToolManager';

// 仅对密切相关的文件使用相对导入
import { ToolConfig } from './toolConfig';
import { BrushProperties } from '../Properties/BrushProperties';
```

## 文件命名约定

- **组件**: PascalCase描述性名称 (`CanvasComponent.tsx`)
- **存储**: camelCase加"Store"后缀 (`canvasStore.ts`)
- **工具**: PascalCase加"Tool"后缀 (`BrushTool.ts`)
- **类型**: PascalCase接口，camelCase类型文件
- **工具函数**: camelCase描述性名称
- **常量**: UPPER_SNAKE_CASE专用文件

## 代码组织原则

- **多引擎架构**: 支持Suika和h5-editor双引擎系统
- **基于功能分组**: 相关组件按功能分组
- **清晰分离**: 主进程与渲染进程代码分离
- **模块化工具**: 每个画布工具都是自包含的
- **管理器模式**: 业务逻辑封装在专用管理器中
- **适配器模式**: 不同引擎通过适配器统一接口
- **共享工具**: 通用代码放在专用工具模块中
- **类型安全**: 全面的TypeScript定义
- **性能聚焦**: 代码组织支持60fps渲染目标

## 开发阶段架构演进

### 第1周: 基础画布系统

- 重点: `engines/suika/` 和 `managers/canvas/`
- Suika引擎集成和画布基础功能

### 第2周: 设计工具套件

- 重点: `tools/` 和 `managers/tools/`
- 5种核心设计工具实现

### 第3周: H5编辑器

- 重点: `engines/h5-editor/`
- H5编辑器引擎集成和导出功能

### 第4周: 素材库系统

- 重点: `managers/assets/`
- 素材管理和初始内容导入

## 文档结构

- **docs/** - 技术实现指南
- **开发文档/** - 中文开发文档和规划
- **.kiro/specs/** - 项目规格和任务文档
- **.kiro/steering/** - AI助手指导文档
- **README.md** - 项目概述和设置说明
- **组件级别** - 复杂函数的JSDoc注释
- **API文档** - 从TypeScript定义生成
