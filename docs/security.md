# 应用程序安全配置说明

## 概述

G-Asset Forge 应用程序采用了多层安全防护策略，以确保应用程序的安全性和稳定性。

## 安全配置

### 1. 内容安全策略 (CSP)

应用程序使用了严格的内容安全策略，分为开发环境和生产环境两种配置：

#### 开发环境CSP
- 允许 `unsafe-eval`：Webpack开发服务器需要此权限进行热重载
- 允许本地连接：支持webpack dev server和websocket连接
- 允许内联样式：开发时的样式注入

#### 生产环境CSP
- 禁止 `unsafe-eval`：提高安全性
- 限制连接源：仅允许自身域名
- 更严格的资源限制

### 2. Electron安全配置

- **nodeIntegration**: `false` - 禁用Node.js集成
- **contextIsolation**: `true` - 启用上下文隔离
- **webSecurity**: `true` - 启用Web安全
- **allowRunningInsecureContent**: `false` - 禁止不安全内容
- **experimentalFeatures**: `false` - 禁用实验性功能
- **sandbox**: `false` - 因需要preload脚本而禁用沙箱
- **disableBlinkFeatures**: `'Auxclick'` - 禁用可能不安全的功能

### 3. 窗口安全

- 阻止新窗口创建
- 阻止外部URL导航
- 启用安全的窗口管理

## 安全警告处理

### Electron Security Warning (Insecure Content-Security-Policy)

**问题**: 渲染进程没有启用内容安全策略或使用了不安全的策略

**解决方案**:
1. 在HTML中设置了基础CSP策略
2. 通过主进程动态注入更严格的CSP头
3. 区分开发和生产环境的安全级别

### 为什么在开发环境允许 unsafe-eval

Webpack的热重载（Hot Module Replacement）功能需要使用 `eval()` 来动态执行模块代码。在生产环境中，代码已经预编译，不需要此功能。

## 安全最佳实践

1. **始终使用最新版本的Electron**
2. **定期审查和更新依赖包**
3. **在生产环境中禁用开发者工具**
4. **使用代码签名**
5. **实施自动更新机制**

## 如何测试安全配置

1. 启动应用程序
2. 打开开发者工具
3. 检查控制台是否还有安全警告
4. 验证CSP策略是否正确应用

```bash
# 清理并启动应用
npm run clean:cache
npm run dev
```

## 相关文件

- `src/main/config/security.ts` - 安全配置
- `src/main/managers/WindowManager.ts` - 窗口安全设置
- `src/main/main.ts` - 主进程安全措施
- `src/renderer/index.html` - 渲染进程CSP策略