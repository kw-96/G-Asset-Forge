# G-Asset Forge

**G-Asset Forge** 是一款基于 Canvas 实现的专业图形编辑器，专为游戏资产创建和图形设计而打造。

## ✨ 特性

- 🎨 **专业图形编辑**: 支持矢量图形、位图编辑、图层管理
- 🎮 **游戏资产优化**: 专为游戏开发优化的工具集
- 🚀 **高性能渲染**: 基于 Canvas 的高性能渲染引擎
- 💻 **跨平台支持**: Web 应用 + 桌面应用 (Electron)
- 🌐 **国际化支持**: 中英文界面
- 🔧 **插件系统**: 可扩展的插件架构

## 🛠️ 技术栈

- **前端**: TypeScript + React
- **构建工具**: esbuild + PNPM
- **桌面应用**: electron
- **代码规范**: ESLint + Prettier + Husky

## 🚀 快速开始

### 环境要求

- Node.js >= 18.12.0
- PNPM >= 8.0.0

### 安装依赖

```bash
- 安装 pnpm
npm install -g pnpm

- 安装项目依赖
pnpm install

- 设置 electron 镜像（看网络情况）
pnpm config set registry https://registry.npmmirror.com
pnpm config set electron_mirror https://npmmirror.com/mirrors/electron/

- 安装 electron
pnpm add -D -w electron

- 手动触发 electron 二进制文件的下载（如果 electron 不完整）
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"; node install.js
```

### 开发模式

```bash
# Web 开发
pnpm run dev

# 桌面应用开发
$env:PATH += ";$env:APPDATA\npm"
pnpm run electron:dev
pnpm -w run electron:dev

# 停止开发服务器
taskkill /F /IM node.exe

# 检查问题
npx tsc --noEmit
```

### 构建应用

```bash
# 构建 Web 应用
pnpm run app:build
pnpm -w run app:build

# 构建桌面应用
pnpm run electron:build
pnpm -w run electron:build

# 预览桌面应用
pnpm run electron:preview
```

## 📁 项目结构

```t
G-Asset Forge/
├── apps/                 # 应用程序
│   ├── g-asset-forge/           # 主应用
│   └── g-asset-forge-multiplayer/ # 多人协作版本
├── packages/             # 核心包模块
├── electron/             # Electron 配置
├── scripts/              # 构建脚本
└── demo/                 # 演示文件
```

## 🎯 使用场景

- **游戏开发**: 角色设计、UI 设计、图标制作
- **图形设计**: 矢量图形、插画创作、Logo 设计
- **资产管理**: 游戏资源整理、批量处理
- **原型设计**: 界面原型、交互设计

## 📦 部署方式

### Web 应用

- 静态文件托管
- CDN 加速
- 云服务器部署

### 桌面应用

- Windows (.exe)
- macOS (.dmg)
- Linux (AppImage)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- 在线演示: [开发中]
- 文档: [开发中]
- 社区: [开发中]

---

**G-Asset Forge** - 为游戏开发者打造的图形编辑利器 🎮✨
