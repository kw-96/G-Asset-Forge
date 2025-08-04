# G-Asset Forge

专为企业网络环境设计的游戏资产创建桌面应用程序。

## 功能特性

- **基于画布的编辑**: 由 Fabric.js 驱动，提供流畅的 2D 图形操作
- **设计工具**: 选择、文本、图像、形状、画笔和裁剪工具
- **H5 编辑器**: 专门用于移动游戏资产创建的模式
- **资产库**: 有组织的游戏相关资产集合
- **跨平台**: 支持 Windows 和 macOS
- **网络集成**: 支持共享网络驱动器进行团队协作
- **性能优化**: 60fps 渲染和内存使用监控

## 技术栈

- **桌面框架**: Electron 26+
- **前端**: React 18 + TypeScript
- **画布引擎**: Fabric.js 5.x
- **状态管理**: Zustand
- **UI 组件**: Ant Design
- **构建工具**: Webpack + electron-builder

## 开发环境设置

### 前置要求

- Node.js 18+
- npm 或 yarn
- Git

### 安装步骤

1. 克隆仓库:

```bash
git clone <repository-url>
cd g-asset-forge
```

2. 安装依赖:

```bash
npm install
```

3. 启动应用程序:

```bash
npm run dev
```

这将在开发模式下同时启动主进程和渲染进程。

## 启动应用程序

### 方法1：开发模式启动（推荐）

1. **启动开发服务器**：

```bash
npm run dev
```

这个命令会同时启动：

- 渲染进程的webpack开发服务器
- 主进程的webpack构建监听

2. **等待编译完成**后，在另一个终端窗口运行：

```bash
npm start
```

### 方法2：分步启动

如果上面的方法有问题，可以分步执行：

1. **先启动渲染进程开发服务器**：

```bash
npm run dev:renderer
```

2. **在新终端窗口启动主进程构建**：

```bash
npm run dev:main
```

3. **等待两个进程都编译完成后，启动Electron**：

```bash
npm start
```

### 方法3：生产构建启动

如果开发模式有问题，可以尝试生产构建：

1. **构建应用**：

```bash
npm run build
```

2. **启动应用**：

```bash
npm start
```

### 预期功能

启动成功后，你应该能看到：

1. **主窗口界面**：
   - 顶部菜单栏
   - 左侧工具栏
   - 中央画布区域
   - 右侧属性面板

2. **画布功能**：
   - 画布工具栏（缩放控制、预设尺寸选择）
   - 可缩放和平移的画布（支持50%-500%缩放范围）
   - 性能监控按钮（右上角蓝色圆形按钮）
   - 60fps流畅操作体验

3. **性能监控**：
   - 点击右上角的性能监控按钮
   - 查看FPS、内存使用、对象数量等实时指标
   - 内存使用限制在100MB以内

### 常见问题解决

如果启动过程中遇到问题，请尝试：

1. **清理依赖并重新安装**：

```bash
rm -rf node_modules package-lock.json
npm install
```

2. **检查Node.js版本**：
确保使用Node.js 16+版本

3. **检查端口占用**：
如果webpack开发服务器端口被占用，可以修改配置或关闭占用端口的程序

4. **Windows用户**：
如果遇到权限问题，请以管理员身份运行命令行

### 可用脚本

- `npm run dev` - 启动带热重载的开发服务器
- `npm run build` - 构建生产版本应用程序
- `npm run start` - 启动已构建的应用程序
- `npm run test` - 运行单元测试
- `npm run test:watch` - 在监视模式下运行测试
- `npm run lint` - 运行 ESLint
- `npm run lint:fix` - 自动修复 ESLint 问题
- `npm run pack` - 打包应用程序（不创建安装程序）
- `npm run dist` - 创建分发包
- `npm run dist:win` - 创建 Windows 安装程序
- `npm run dist:mac` - 创建 macOS 安装程序

## 项目结构

```text
src/
├── main/                 # Electron 主进程
│   ├── managers/        # 系统管理器（文件、窗口）
│   ├── main.ts         # 主进程入口点
│   └── preload.ts      # 安全预加载脚本
├── renderer/            # React 应用程序
│   ├── components/     # React 组件
│   ├── stores/         # Zustand 状态存储
│   ├── styles/         # 全局样式
│   ├── App.tsx         # 主应用组件
│   └── index.tsx       # 渲染进程入口点
└── types/              # TypeScript 类型定义
```

## 架构设计

应用程序采用模块化架构：

- **主进程**: 处理系统操作、文件 I/O 和窗口管理
- **渲染进程**: 基于 React 的 UI，具有画布编辑功能
- **IPC 通信**: 通过预加载脚本在进程间进行安全通信
- **状态管理**: 使用 Zustand 存储应用程序和画布状态
- **画布引擎**: Fabric.js 集成用于 2D 图形操作

## 性能要求

- **启动时间**: 在标准企业硬件上 < 5 秒
- **内存使用**: 应用程序总内存 < 500MB
- **画布性能**: 操作期间 60fps 渲染
- **文件操作**: 标准项目响应时间 < 1 秒
- **网络访问**: 共享驱动器操作 99% 可用性

## 生产构建

### Windows

```bash
npm run dist:win
```

在 `release` 目录中创建 Windows 安装程序 (.exe)。

### macOS

```bash
npm run dist:mac
```

在 `release` 目录中创建 macOS 安装程序 (.dmg)。

## 测试

项目包含全面的测试：

- **单元测试**: Jest + React Testing Library
- **集成测试**: Electron 测试工具
- **性能测试**: 画布和内存使用监控

运行测试:

```bash
npm test
```

## 贡献指南

1. 遵循现有的代码风格和约定
2. 为新功能编写测试
3. 根据需要更新文档
4. 确保所有测试在提交前通过

## 许可证

MIT 许可证 - 详情请参阅 LICENSE 文件。

## 核心画布系统功能

当前版本已实现完整的核心画布系统：

### 画布引擎

- ✅ 多画布实例管理
- ✅ 15+种游戏素材尺寸预设（移动端、平板、图标等）
- ✅ 完整的事件系统和生命周期管理
- ✅ 实时性能监控集成

### 视图控制

- ✅ 缩放功能：10%-500%范围（超出需求的50%-200%）
- ✅ 平滑平移：支持鼠标、键盘、触摸交互
- ✅ 适应屏幕：智能计算最佳缩放和居中
- ✅ 键盘快捷键：Ctrl+/-缩放，Ctrl+0重置，Ctrl+1适应

### 内存管理和性能优化

- ✅ 内存监控：实时追踪，限制100MB以内
- ✅ 对象池：复用Fabric.js对象，减少GC压力
- ✅ 纹理缓存：智能缓存管理，自动清理
- ✅ 60fps性能保证：requestAnimationFrame优化

## 支持

有关企业部署支持和配置，请参阅 `docs/` 目录中的部署文档。
