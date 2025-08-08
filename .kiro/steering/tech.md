# 技术栈与构建系统

## 核心技术

- **桌面框架**: Electron 26+ (跨平台桌面应用)
- **前端框架**: React 18 + TypeScript 5.2+
- **画布引擎**: 
  - **Suika引擎**: 主要画布系统（高性能2D渲染）
  - **h5-editor引擎**: H5编辑器模式（专业导出）
  - **Fabric.js**: 备用画布引擎（向后兼容）
- **状态管理**: Zustand (轻量级状态管理)
- **UI框架**: 自定义UI组件系统（移除Ant Design依赖）
  - styled-components 样式系统
  - @radix-ui 无障碍组件基础
  - 支持暗色/亮色主题切换
- **构建系统**: Webpack 5 多编辑器架构配置
- **包管理器**: npm (支持pnpm)

## 多编辑器架构

### Suika引擎集成
- **核心类**: Editor、Scene、Graph
- **功能**: 高性能Canvas渲染、事件系统、视口变换
- **优势**: 60fps流畅操作、内存优化、React适配层

### h5-editor引擎集成
- **核心功能**: 页面管理、组件系统、专业导出
- **Vue适配**: Vue组件到React的适配层
- **导出引擎**: 高质量PNG/JPG导出，3秒内完成

## 开发依赖

- **TypeScript**: 启用严格模式，包含完整路径映射
- **代码检查**: ESLint + @typescript-eslint 配合React hooks规则
- **测试框架**: Jest + React Testing Library (jsdom环境)
- **打包工具**: electron-builder 用于分发包

## 关键库

- **性能监控**: stats.js 实时监控
- **动画效果**: framer-motion UI过渡动画
- **UI组件**: @radix-ui 无障碍组件
- **颜色选择器**: react-colorful
- **文件操作**: fs-extra, sharp 图像处理
- **工具库**: fractional-indexing 图层排序
- **Vue集成**: Vue 3.x + @vue/runtime-dom (h5-editor适配)

## 构建命令

### 开发环境

```bash
# 启动开发环境（并发进程）
npm run dev

# 启动单独进程
npm run dev:renderer    # React应用的Webpack开发服务器
npm run dev:main       # Electron主进程TypeScript编译
npm run dev:electron   # 启动Electron热重载

# 替代的顺序启动方式
npm run dev:sequential
```

### 生产构建

```bash
# 构建主进程和渲染进程
npm run build

# 构建单独进程
npm run build:main     # 编译Electron主进程
npm run build:renderer # 构建React生产应用

# 创建分发包
npm run dist          # 所有平台
npm run dist:win      # Windows安装程序
npm run dist:mac      # macOS DMG
```

### 开发工具

```bash
# 代码质量
npm run lint          # ESLint检查
npm run lint:fix      # 自动修复ESLint问题
npm run type-check    # TypeScript类型检查

# 测试
npm run test          # 运行Jest测试
npm run test:watch    # 监视模式测试
npm run test:coverage # 覆盖率报告

# 维护
npm run clean         # 清理dist目录
npm run clean:all     # 清理所有内容包括node_modules
npm run reinstall     # 清理安装依赖
```

## 架构模式

- **进程分离**: 主进程(Node.js) + 渲染进程(React)
- **IPC通信**: 安全的预加载脚本用于进程间通信
- **模块化设计**: 基于组件的架构，清晰的关注点分离
- **性能优先**: 60fps渲染目标配合内存监控
- **路径映射**: 广泛的TypeScript路径别名实现清晰导入

## 配置文件

- `webpack.common.js` - 共享webpack配置
- `webpack.main.config.js` - Electron主进程构建
- `webpack.renderer.config.js` - React渲染进程构建
- `tsconfig.json` - TypeScript严格模式配置
- `electron-builder.json` - 分发打包配置
