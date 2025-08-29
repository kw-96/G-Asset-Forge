/**
 * 窗口管理器 - 负责应用的窗口创建、控制和事件处理
 * @description 管理主窗口、子窗口、窗口状态、尺寸调整等窗口管理功能
 * @author 开发团队
 */
const { BrowserWindow } = require('electron');
const path = require('path');
const { SecurityConfig } = require('./config/security');

class WindowManager {
  constructor() {
    this.windows = new Map();
  }

  createMainWindow(options = {}) {
    // 根据模式设置窗口属性
    const isWelcomeMode = !options.webPreferences?.devTools;

    const mainWindow = new BrowserWindow({
      width: options.width ?? (isWelcomeMode ? 480 : 1400),
      height: options.height ?? (isWelcomeMode ? 320 : 900),
      minWidth: options.minWidth ?? (isWelcomeMode ? 480 : 800),
      minHeight: options.minHeight ?? (isWelcomeMode ? 320 : 600),
      maxWidth: isWelcomeMode ? 480 : undefined, // 欢迎模式下限制最大宽度
      maxHeight: isWelcomeMode ? 320 : undefined, // 欢迎模式下限制最大高度
      webPreferences: {
        ...SecurityConfig.webSecurity,
        preload: path.join(__dirname, './preload.js'),
        // 额外的安全设置
        backgroundThrottling: false, // 防止后台节流影响性能
        disableDialogs: false, // 允许对话框（用于错误报告）
        safeDialogs: true, // 启用安全对话框
        safeDialogsMessage: 'G-Asset-Forge检测到不安全的对话框尝试', // 安全对话框消息
        // 应用 CSP 策略
        webSecurity: SecurityConfig.webSecurity.webSecurity,
        sandbox: SecurityConfig.webSecurity.webPreferences.sandbox,
        ...options.webPreferences,
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
      frame: false, // 隐藏系统窗口框架，使用自定义标题栏
      show: false, // Don't show until ready
      icon:
        process.platform === 'win32'
          ? path.join(__dirname, '../assets/icon-GAF.ico')
          : path.join(__dirname, '../assets/icon.GAF.png'),
      // 额外的窗口安全设置
      transparent: false, // 不允许透明窗口
      thickFrame: isWelcomeMode ? false : true, // 欢迎模式下禁用厚框架
      acceptFirstMouse: false, // 提高安全性
      disableAutoHideCursor: false, // 允许光标自动隐藏
      enableLargerThanScreen: false, // 不允许窗口大于屏幕
      fullscreen: false, // 默认不全屏
      fullscreenable: isWelcomeMode ? false : true, // 欢迎模式下不允许全屏
      hasShadow: true, // 窗口阴影
      maximizable: isWelcomeMode ? false : true, // 欢迎模式下不允许最大化
      minimizable: true, // 允许最小化
      movable: true, // 允许移动
      resizable: isWelcomeMode ? false : true, // 欢迎模式不可调整大小，开发模式可调整
      skipTaskbar: false, // 显示在任务栏
      useContentSize: false, // 使用窗口边界计算大小
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

  getWindow(windowId) {
    return this.windows.get(windowId);
  }

  closeWindow(windowId) {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      window.close();
      this.windows.delete(windowId);
    }
  }

  closeAllWindows() {
    this.windows.forEach((window, windowId) => {
      if (!window.isDestroyed()) {
        console.log(`关闭窗口: ${windowId}`);
        window.close();
      }
    });
    this.windows.clear();
  }

  focusWindow(windowId) {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
    }
  }
}

module.exports = { WindowManager };
