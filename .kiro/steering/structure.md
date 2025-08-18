# 项目结构与组织

## 当前项目结构

```text
g-asset-forge/
├── src/                    # 源代码
│   ├── main/              # Electron主进程
│   │   ├── main.ts        # 应用入口 (Application类)
│   │   ├── managers/      # 系统管理器
│   │   ├── handlers/      # IPC处理器
│   │   ├── config/        # 配置管理
│   │   └── utils/         # 工具函数
│   ├── renderer/          # React渲染进程
│   │   ├── App.tsx        # 应用根组件
│   │   ├── components/    # React组件
│   │   │   ├── App/       # 应用容器
│   │   │   ├── Layout/    # 布局组件
│   │   │   ├── Canvas/    # 画布组件
│   │   │   └── AssetLibrary/ # 素材库
│   │   ├── stores/        # Zustand状态管理
│   │   ├── engines/       # 画布引擎
│   │   │   ├── suika/     # Suika引擎
│   │   │   └── h5-editor/ # H5编辑器引擎
│   │   ├── ui/            # UI组件库
│   │   ├── hooks/         # React Hooks
│   │   └── utils/         # 工具函数
│   ├── types/             # 共享类型定义
│   └── utils/             # 共享工具
├── assets/                # 静态资源
├── dist/                  # 构建输出
├── docs/                  # 技术文档
├── scripts/               # 构建脚本
├── 开发文档/              # 中文开发文档
├── .kiro/                 # Kiro IDE配置
│   ├── specs/             # 项目规格文档
│   │   └── project-architecture-refactor/ # 架构重构规格
│   └── steering/          # AI助手指导文档
└── logs/                  # 开发日志
```

## 重构后的目标结构

```text
g-asset-forge/
├── src/                    # 源代码
│   ├── main/              # Electron主进程 (重构)
│   │   ├── core/          # 核心系统
│   │   ├── managers/      # 系统管理器 (扩展)
│   │   ├── services/      # 系统服务 (新增)
│   │   ├── handlers/      # 事件处理器 (扩展)
│   │   ├── config/        # 配置管理 (扩展)
│   │   ├── utils/         # 工具函数 (扩展)
│   │   └── types/         # 类型定义 (新增)
│   ├── renderer/          # React渲染进程 (重构)
│   │   ├── ui/            # UI界面层 (重构)
│   │   │   ├── components/ # 基础UI组件库
│   │   │   │   ├── atoms/  # 原子组件
│   │   │   │   ├── molecules/ # 分子组件
│   │   │   │   ├── organisms/ # 有机体组件
│   │   │   │   └── templates/ # 模板组件
│   │   │   ├── business/   # 业务组件 (迁移)
│   │   │   ├── theme/      # 主题系统 (保持)
│   │   │   └── styles/     # 样式系统 (保持)
│   │   ├── logic/         # 前端逻辑层 (新增)
│   │   │   ├── stores/     # 状态管理 (迁移)
│   │   │   ├── managers/   # 业务管理器 (整合)
│   │   │   ├── engines/    # 引擎适配器 (重构)
│   │   │   ├── services/   # 业务服务 (新增)
│   │   │   └── utils/      # 业务工具 (整合)
│   │   ├── App.tsx        # 应用根组件 (保持)
│   │   └── index.tsx      # 渲染进程入口 (保持)
│   ├── interfaces/        # 接口层 (新增)
│   │   ├── api/           # API接口定义
│   │   ├── types/         # 类型定义
│   │   ├── schemas/       # 数据模式
│   │   └── contracts/     # 接口契约
│   ├── sync/              # 跨局域网同步 (新增)
│   │   ├── core/          # 同步核心
│   │   ├── services/      # 同步服务
│   │   ├── protocols/     # 通信协议
│   │   └── storage/       # 存储管理
│   ├── types/             # 共享类型定义 (保持)
│   └── utils/             # 共享工具 (保持)
├── assets/                # 静态资源 (保持)
├── dist/                  # 构建输出 (保持)
├── docs/                  # 技术文档 (保持)
├── scripts/               # 构建脚本 (保持)
├── 开发文档/              # 中文开发文档 (保持)
├── .kiro/                 # Kiro IDE配置 (保持)
└── logs/                  # 开发日志 (保持)
```

## 分层架构组织

### UI界面层 (`src/renderer/ui/`)

```text
ui/
├── components/            # 基础UI组件库 (重新分类)
│   ├── atoms/            # 原子组件
│   │   ├── Button/       # 按钮组件
│   │   ├── Input/        # 输入框组件
│   │   ├── Icon/         # 图标组件
│   │   └── Text/         # 文本组件
│   ├── molecules/        # 分子组件
│   │   ├── SearchBox/    # 搜索框
│   │   ├── Card/         # 卡片组件
│   │   └── FormField/    # 表单项
│   ├── organisms/        # 有机体组件
│   │   ├── Navbar/       # 导航栏
│   │   ├── Sidebar/      # 侧边栏
│   │   └── Panel/        # 面板组件
│   └── templates/        # 模板组件
│       ├── Layout/       # 布局模板
│       └── Dialog/       # 对话框模板
├── business/             # 业务组件 (从components/迁移)
│   ├── Canvas/           # 画布组件
│   ├── AssetLibrary/     # 素材库
│   ├── Properties/       # 属性面板
│   ├── Layout/           # 布局组件
│   └── Tools/            # 工具组件
├── theme/                # 主题系统 (保持现有)
│   ├── ThemeProvider.tsx # 主题提供者
│   ├── colors.ts         # 颜色定义
│   └── typography.ts     # 字体定义
└── styles/               # 样式系统 (保持现有)
    ├── GlobalStyles.tsx  # 全局样式
    └── animations.ts     # 动画定义
```

### 前端逻辑层 (`src/renderer/logic/`)

```text
logic/
├── stores/               # 状态管理 (迁移扩展)
│   ├── appStore.ts       # 应用状态 (保持)
│   ├── canvasStore.ts    # 画布状态 (保持)
│   ├── toolStore.ts      # 工具状态 (新增)
│   ├── assetStore.ts     # 素材状态 (新增)
│   └── projectStore.ts   # 项目状态 (新增)
├── managers/             # 业务管理器 (整合现有)
│   ├── canvas/           # 画布管理器
│   ├── tools/            # 工具管理器 (整合tools/)
│   ├── assets/           # 素材管理器
│   └── project/          # 项目管理器
├── engines/              # 引擎适配器 (重构现有)
│   ├── adapters/         # 引擎适配器
│   ├── core/             # 引擎核心 (保持)
│   └── EngineFactory.ts  # 引擎工厂
├── services/             # 业务服务 (新增)
│   ├── CanvasService.ts  # 画布服务
│   ├── AssetService.ts   # 素材服务
│   └── ProjectService.ts # 项目服务
└── utils/                # 业务工具 (整合现有)
    ├── validation.ts     # 数据验证
    ├── events/           # 事件系统
    └── performance/      # 性能监控
```

### 主进程核心 (`src/main/`)

```text
main/
├── core/                 # 核心系统 (重构main.ts)
│   ├── Application.ts    # 应用程序主类
│   ├── Lifecycle.ts      # 生命周期管理
│   └── Bootstrap.ts      # 启动引导
├── managers/             # 系统管理器 (扩展现有)
│   ├── WindowManager.ts  # 窗口管理器 (保持)
│   ├── FileSystemManager.ts # 文件系统管理器 (保持)
│   ├── SecurityManager.ts # 安全管理器
│   └── MenuManager.ts    # 菜单管理器
├── services/             # 系统服务 (新增)
│   ├── IPCService.ts     # IPC通信服务
│   ├── FileService.ts    # 文件服务
│   └── LoggingService.ts # 日志服务
├── handlers/             # 事件处理器 (扩展现有)
│   ├── IPCHandlers.ts    # IPC事件处理 (保持)
│   └── MenuHandlers.ts   # 菜单事件处理
├── config/               # 配置管理 (扩展现有)
│   ├── AppConfig.ts      # 应用配置
│   └── SecurityConfig.ts # 安全配置 (重构)
├── utils/                # 工具函数 (扩展现有)
│   ├── logger.ts         # 日志工具 (保持)
│   └── crypto.ts         # 加密工具
└── types/                # 类型定义 (新增)
    ├── main.types.ts     # 主进程类型
    └── ipc.types.ts      # IPC类型
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

### 分层架构原则

- **UI界面层**: 基于原子设计理论的组件分层，支持主题和样式统一管理
- **前端逻辑层**: 业务逻辑与UI分离，使用管理器模式和服务层
- **接口层**: 统一的API定义、类型系统和数据验证
- **主进程核心**: 模块化的系统管理，清晰的服务边界
- **跨局域网同步**: 独立的同步系统，支持设备发现和状态同步

### 现有架构保持

- **多引擎架构**: 支持Suika和h5-editor双引擎系统
- **基于功能分组**: 相关组件按功能分组
- **清晰分离**: 主进程与渲染进程代码分离
- **模块化工具**: 每个画布工具都是自包含的
- **管理器模式**: 业务逻辑封装在专用管理器中
- **适配器模式**: 不同引擎通过适配器统一接口
- **共享工具**: 通用代码放在专用工具模块中
- **类型安全**: 全面的TypeScript定义
- **性能聚焦**: 代码组织支持60fps渲染目标

### 新增架构原则

- **中文注释规范**: 所有文件必须包含标准的中文JSDoc注释
- **渐进式重构**: 保持现有功能的向后兼容性
- **测试驱动**: 每个重构步骤都有对应的测试验证
- **文档同步**: 代码变更同时更新相关文档

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
