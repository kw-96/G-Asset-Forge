# G-Asset Forge 项目初始化指南

## 项目概述
G-Asset Forge 是一个基于 Electron、React 和 TypeScript 的游戏资源创建工具，专为企业网络环境设计。该工具旨在提供流畅的画布操作体验，支持游戏素材制作所需的各种功能。

## 技术架构
- **应用类型**: 桌面应用 (Electron)
- **前端框架**: React + TypeScript
- **状态管理**: Zustand
- **画布引擎**: Fabric.js
- **构建工具**: Webpack
- **测试框架**: Jest
- **UI库**: Ant Design

## 环境要求
- Node.js >= 18.x
- npm >= 8.x
- Python 3.x (用于 node-gyp)
- Windows/macOS/Linux 操作系统

## 初始化步骤

### 1. 克隆项目
```bash
git clone <repository-url>
cd g-asset-forge
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
项目使用 dotenv 进行环境配置管理。创建以下环境文件：

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

示例 `.env.development`:
```
NODE_ENV=development
APP_NAME=G-Asset Forge
```

### 4. 开发模式启动
```bash
# 启动开发模式（主进程、渲染进程和Electron应用）
npm run dev

# 或者按顺序启动
npm run dev:sequential
```

### 5. 构建项目
```bash
# 构建主进程和渲染进程
npm run build

# 打包应用
npm run dist

# 打包特定平台
npm run dist:win    # Windows
npm run dist:mac    # macOS
```

## 项目结构
```
g-asset-forge/
├── src/
│   ├── main/          # Electron 主进程代码
│   │   ├── config/    # 配置文件
│   │   ├── handlers/  # IPC 处理器
│   │   ├── managers/  # 管理器
│   │   ├── utils/     # 工具函数
│   │   ├── main.ts    # 主进程入口
│   │   └── preload.ts # 预加载脚本
│   ├── renderer/      # 渲染进程代码 (React)
│   │   ├── components/ # React 组件
│   │   ├── stores/     # Zustand 状态管理
│   │   ├── engines/    # 核心引擎
│   │   ├── App.tsx     # 主应用组件
│   │   └── index.tsx   # 渲染进程入口
├── dist/              # 编译输出目录
├── assets/            # 静态资源
├── scripts/           # 脚本文件
├── webpack.*.js      # Webpack 配置文件
├── package.json       # 项目配置
└── README.md          # 项目说明
```

## MVP核心功能

### 1. 基础画布系统
- 画布创建与基础操作（缩放、平移）
- 操作历史系统（撤销/重做）
- 导出功能（PNG/JPG格式）
- 性能要求：60fps流畅操作，内存占用 < 100MB

### 2. 基础设计工具
- 选择工具
- 文本工具
- 图片工具
- 基础图形工具
- 画笔工具和裁剪工具

### 3. 基础H5编辑器
- 自由画布设置
- 实时预览
- 图片导出功能
- 导出参数控制

### 4. 基础素材库
- 游戏背景、角色、UI元素、图标、特效等分类
- 素材搜索和管理功能
- 自定义素材上传

## 开发工具和脚本

### 主要 npm 脚本
- `npm run dev` - 启动开发模式
- `npm run build` - 构建生产版本
- `npm run start` - 启动已构建的应用
- `npm run lint` - 代码检查
- `npm run test` - 运行测试
- `npm run clean` - 清理构建文件

### 调试
- 使用 Chrome DevTools 调试渲染进程
- 在开发模式下会自动打开 DevTools
- 查看控制台输出以获取错误信息

## 安全配置
项目包含全面的安全配置，详情请参考 `docs/security.md`：

### 主要安全特性
- 内容安全策略 (CSP) 分开发和生产环境配置
- Electron 安全配置（禁用 nodeIntegration，启用 contextIsolation）
- 窗口安全（阻止新窗口创建和外部URL导航）
- 资源加载验证

### 开发环境安全
- 允许 webpack dev server 和热重载功能
- 放宽部分 CSP 限制以支持开发调试

### 生产环境安全
- 严格的 CSP 策略
- 禁用不安全的 eval 功能
- 限制资源加载源

## 性能优化
项目已实现以下性能优化措施：

### 画布性能
- 60fps 流畅操作
- 内存使用控制在 100MB 以内
- 平滑缩放和平移动画
- 智能视图适应

### 内存管理
- 对象池管理
- 自动垃圾回收
- 内存使用监控
- 性能警告系统

## 常见问题解决

### 端口冲突
如果开发服务器端口 (3001) 被占用，请修改 `webpack.renderer.config.js` 中的 `devServer.port` 配置。

### 构建错误
如果遇到构建错误，请尝试：
1. 清理缓存: `npm run clean`
2. 重新安装依赖: `npm install`
3. 检查 TypeScript 编译错误

### IPC 通信问题
如果主进程和渲染进程之间通信失败：
1. 检查 preload.ts 中的 API 暴露
2. 确认 ipcHandlers.ts 中的处理器注册
3. 查看控制台错误信息

### 初始化问题
如果应用卡在加载界面，请参考 `docs/INITIALIZATION_FIX_SUMMARY.md`：
1. 检查 Electron API 可用性
2. 确保完善的错误处理和降级机制
3. 验证画布存储初始化逻辑

## 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送分支
5. 创建 Pull Request

## 许可证
MIT License