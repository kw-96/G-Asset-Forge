# 窗口控制功能实现文档

## 概述

本文档描述了在 GAF (Game Asset Framework) Electron 应用中实现的动态窗口控制功能。该功能允许应用根据不同的界面状态智能调整窗口大小和行为。

## 功能特性

### 1. 智能窗口模式切换
- **欢迎模式**: 600x450 固定大小，不可调整
- **主界面模式**: 1200x800 默认大小，可调整

### 2. 平滑过渡效果
- 窗口大小变化带有动画效果
- 自动居中窗口
- 状态保持和恢复

### 3. 用户体验优化
- 首次启动时显示紧凑的欢迎界面
- 完成欢迎流程后自动扩展为主工作界面
- 记住用户的窗口设置

## 技术实现

### 1. 主进程 IPC 处理器 (`src/main/ipc-handlers.ts`)

```typescript
// 窗口控制相关处理器
ipcMain.handle('window:setSize', async (event, width: number, height: number, animate: boolean = true) => {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setSize(width, height, animate);
      return { success: true };
    }
    return { success: false, error: 'Window not found' };
  } catch (error) {
    console.error('Failed to set window size:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});
```

### 2. 预加载脚本 API (`src/main/preload.ts`)

```typescript
window: {
  setSize: (width: number, height: number, animate?: boolean) => 
    ipcRenderer.invoke('window:setSize', width, height, animate),
  getSize: () => 
    ipcRenderer.invoke('window:getSize'),
  setResizable: (resizable: boolean) => 
    ipcRenderer.invoke('window:setResizable', resizable),
  center: () => 
    ipcRenderer.invoke('window:center')
}
```

### 3. React Hook (`src/renderer/components/App/AppContainer.tsx`)

```typescript
const useWindowControl = () => {
  const originalSizeRef = useRef<{ width: number; height: number } | null>(null);

  const setWelcomeMode = async () => {
    // 保存当前窗口大小
    const sizeResult = await window.electronAPI.window.getSize();
    if (sizeResult.success && sizeResult.data) {
      originalSizeRef.current = sizeResult.data;
    }

    // 设置欢迎页面模式
    await window.electronAPI.window.setSize(600, 450, true);
    await window.electronAPI.window.setResizable(false);
    await window.electronAPI.window.center();
  };

  const restoreNormalMode = async () => {
    // 恢复窗口设置
    await window.electronAPI.window.setResizable(true);
    
    if (originalSizeRef.current) {
      await window.electronAPI.window.setSize(
        originalSizeRef.current.width,
        originalSizeRef.current.height,
        true
      );
    } else {
      await window.electronAPI.window.setSize(1200, 800, true);
    }
    
    await window.electronAPI.window.center();
  };

  return { setWelcomeMode, restoreNormalMode };
};
```

## API 接口

### window.electronAPI.window

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `setSize` | `width: number, height: number, animate?: boolean` | `Promise<{success: boolean}>` | 设置窗口大小 |
| `getSize` | 无 | `Promise<{success: boolean, data?: {width, height}}>` | 获取当前窗口大小 |
| `setResizable` | `resizable: boolean` | `Promise<{success: boolean}>` | 设置窗口是否可调整大小 |
| `center` | 无 | `Promise<{success: boolean}>` | 居中窗口 |

## 使用流程

1. **应用启动**
   - 检查是否为首次使用
   - 如果是首次，切换到欢迎模式

2. **欢迎模式**
   - 窗口固定为 600x450
   - 显示欢迎界面
   - 禁用窗口大小调整

3. **主界面模式**
   - 恢复窗口可调整大小
   - 设置为 1200x800 或恢复之前的大小
   - 显示主工作界面

## 错误处理

- 所有 IPC 调用都包含 try-catch 错误处理
- 优雅的降级机制
- 详细的错误日志记录
- 用户友好的错误提示

## 性能优化

- 使用 useRef 避免不必要的重新渲染
- 异步操作避免阻塞 UI
- 智能的状态保持机制

## 兼容性

- 支持 Windows、macOS、Linux
- 兼容不同的屏幕分辨率
- 响应式布局适配

## 未来扩展

- 支持更多窗口状态（如全屏模式）
- 用户自定义窗口大小设置
- 多窗口管理功能
- 窗口状态持久化

## 测试

建议测试场景：
1. 首次启动应用
2. 窗口大小调整
3. 不同屏幕分辨率下的表现
4. 错误场景处理

---

*文档版本: v1.0*  
*更新时间: 2024年12月*