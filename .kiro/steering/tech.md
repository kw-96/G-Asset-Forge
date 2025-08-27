# 技术栈

## 核心技术

- **前端框架**: React 18 + TypeScript
- **构建系统**: Vite + esbuild 快速构建
- **包管理器**: PNPM 工作空间支持
- **桌面框架**: Electron 跨平台桌面应用
- **后端框架**: NestJS (Node.js)
- **数据库**: Prisma ORM
- **文档**: VitePress

## 开发工具

- **代码质量**: ESLint + Prettier + Husky
- **测试**: Jest + ts-jest
- **样式**: Sass/SCSS
- **组件开发**: Storybook
- **Git 钩子**: Husky + lint-staged
- **提交规范**: Conventional Commits + commitlint

## 构建配置

- **TypeScript**: 严格模式，ES5 目标
- **模块系统**: ESNext + Node 解析
- **JSX**: React JSX 转换
- **打包**: Vite 开发和生产构建

## 常用命令

### 开发

```bash
# 启动所有包的开发模式
pnpm run dev

# 启动多人版本
pnpm run dev-m

# 启动特定应用
pnpm run app:dev              # 主应用
pnpm run app-m:dev           # 多人应用
pnpm run workbench:dev       # 工作台
pnpm run backend:dev         # 后端 API
pnpm run docs:dev            # 文档

# 启动 Electron 桌面应用
pnpm run electron:dev
```

### 构建

```bash
# 构建所有包（排除 backend 和 workbench）
pnpm run build

# 构建特定应用
pnpm run app:build           # 主 Web 应用
pnpm run components:build    # 组件库

# 构建 Electron 桌面应用
pnpm run electron:build      # 完整构建和打包
pnpm run electron:pack       # 构建不打包
pnpm run electron:dist       # 分发构建
```

### 测试和质量

```bash
# 运行测试（排除 backend）
pnpm run test

# 代码检查
pnpm run eslint:check

# 组件开发
pnpm run storybook
```

### 包开发

```bash
# 单独包开发
pnpm run common:dev
pnpm run core:dev
pnpm run geo:dev
pnpm run icons:dev
pnpm run components:dev
```

## 环境要求

- **Node.js**: >= 18.12.0
- **PNPM**: >= 8.0.0
- **平台**: Windows、macOS、Linux

## 代码风格配置

- **Prettier**: 单引号、尾随逗号、80 字符宽度、2 空格缩进
- **ESLint**: TypeScript 推荐 + React hooks + 导入排序
- **导入排序**: simple-import-sort 插件自动排序
- **命名**: 类型/类使用 PascalCase，一致的类型导入
