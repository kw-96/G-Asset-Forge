# 项目结构

## 单体仓库架构

这是一个 PNPM 工作空间单体仓库，应用程序和共享包之间有清晰的分离。

```t
G-Asset Forge/
├── apps/                     # 应用程序
│   ├── g-asset-forge/           # 主图形编辑器 (React + Vite)
│   ├── g-asset-forge-multiplayer/ # 多人版本
│   ├── workbench/               # 开发工作台 (Vue)
│   ├── backend/                 # NestJS API 服务器
│   └── docs/                    # VitePress 文档
├── packages/                 # 共享库
│   ├── common/                  # 通用工具和类型
│   ├── core/                    # 核心图形引擎
│   ├── geo/                     # 几何工具
│   ├── components/              # React UI 组件
│   └── icons/                   # 图标库
├── electron/                 # Electron 桌面应用配置
├── scripts/                  # 构建和开发脚本
├── assets/                   # 静态资源（图标、图片）
├── demo/                     # 演示文件和示例
└── logs/                     # 开发日志
```

## 包依赖关系

### 工作空间引用

- 所有应用使用 `workspace:^` 协议依赖共享包
- 包可以依赖工作空间内的其他包
- 核心依赖流向：`apps` → `packages` → `common`

### 关键包职责

- **@g-asset-forge/common**: 基础工具、类型和共享逻辑
- **@g-asset-forge/core**: 图形引擎和 Canvas 渲染
- **@g-asset-forge/geo**: 几何计算和工具
- **@g-asset-forge/components**: 可复用的 React UI 组件
- **@g-asset-forge/icons**: 图标库和组件

## 应用程序结构

### 主应用 (`apps/g-asset-forge`)

- **框架**: React + TypeScript + Vite
- **依赖**: 所有工作空间包 + React 生态系统
- **构建输出**: `build/` 目录
- **入口**: `index.html` → `src/main.tsx`

### 多人应用 (`apps/g-asset-forge-multiplayer`)

- **框架**: React + TypeScript + Vite
- **用途**: 协作编辑功能
- **与主应用结构类似**

### 后端 (`apps/backend`)

- **框架**: NestJS + TypeScript
- **数据库**: Prisma ORM
- **结构**: 标准 NestJS，包含 `src/`、`test/`、`prisma/`
- **容器化**: Docker 支持，配合 nginx

### 工作台 (`apps/workbench`)

- **框架**: Vue + TypeScript + Vite
- **用途**: 开发和测试工具
- **容器化**: Docker 支持

## 配置文件

### 根级别

- `package.json`: 工作空间根配置，包含共享脚本
- `pnpm-workspace.yaml`: 工作空间包定义
- `tsconfig.json`: 基础 TypeScript 配置
- `electron-builder.json`: 桌面应用构建配置
- `.eslintrc.json`: 共享代码检查规则

### 包级别

- 每个包都有自己的 `package.json`、`tsconfig.json`、`vite.config.ts`
- 应用可能有额外配置（如特定规则的 `.eslintrc.cjs`）

## 开发工作流

### 添加新包

1. 在 `packages/` 目录中创建
2. 添加到 `pnpm-workspace.yaml`（`packages/*` 自动包含）
3. 在使用的应用中用 `workspace:^` 引用

### 跨包开发

- 使用 `pnpm run dev` 启动所有包的监听模式
- 单独包开发使用 `pnpm run <package>:dev`
- 构建顺序由 PNPM 工作空间依赖自动处理

### 文件组织约定

- 所有包的源代码放在 `src/`
- 构建输出放在 `dist/`
- 应用的静态资源放在 `public/`
- 类型定义与实现代码放在一起
- 包的 `src/index.ts` 作为桶导出
