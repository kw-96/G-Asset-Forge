import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { SecurityConfig } from '../config/security';

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();

  createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    const mainWindow = new BrowserWindow({
      width: Math.min(1400, width * 0.9),
      height: Math.min(900, height * 0.9),
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        ...SecurityConfig.webSecurity,
        preload: path.join(__dirname, './preload.js'),
        // 额外的安全设置
        backgroundThrottling: false, // 防止后台节流影响性能
        disableDialogs: false, // 允许对话框（用于错误报告）
        safeDialogs: true, // 启用安全对话框
        safeDialogsMessage: 'G-Asset-Forge检测到不安全的对话框尝试', // 安全对话框消息
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
      frame: false, // 隐藏系统窗口框架，使用自定义标题栏
      show: false, // Don't show until ready
      icon: process.platform === 'win32' 
        ? path.join(__dirname, '../../assets/icon.ico')
        : path.join(__dirname, '../../assets/icon.png'),
      // 额外的窗口安全设置
      transparent: false, // 不允许透明窗口
      thickFrame: true, // 允许厚框架调整大小
      acceptFirstMouse: false, // 提高安全性
      disableAutoHideCursor: false, // 允许光标自动隐藏
      enableLargerThanScreen: false, // 不允许窗口大于屏幕
      fullscreen: false, // 默认不全屏
      fullscreenable: true, // 允许全屏
      hasShadow: true, // 窗口阴影
      maximizable: true, // 允许最大化
      minimizable: true, // 允许最小化
      movable: true, // 允许移动
      resizable: true, // 允许调整大小
      skipTaskbar: false, // 显示在任务栏
      useContentSize: false, // 使用窗口边界计算大小
      // webSecurity 选项应该在 webPreferences 中设置，这里移除重复设置
    });

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      
      // Center the window
      mainWindow.center();
    });

    // Handle window state changes
    mainWindow.on('maximize', () => {
      mainWindow.webContents.send('window:maximized');
    });

    mainWindow.on('unmaximize', () => {
      mainWindow.webContents.send('window:unmaximized');
    });

    mainWindow.on('enter-full-screen', () => {
      mainWindow.webContents.send('window:enter-full-screen');
    });

    mainWindow.on('leave-full-screen', () => {
      mainWindow.webContents.send('window:leave-full-screen');
    });

    // Store window reference
    this.windows.set('main', mainWindow);

    return mainWindow;
  }

  getWindow(windowId: string): BrowserWindow | undefined {
    return this.windows.get(windowId);
  }

  closeWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      window.close();
      this.windows.delete(windowId);
    }
  }

  closeAllWindows(): void {
    this.windows.forEach((window, _windowId) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.windows.clear();
  }

  focusWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
    }
  }
}