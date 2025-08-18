/**
 * Electron主进程入口文件 - 应用程序的核心启动和管理逻辑
 * @description 负责Electron应用的初始化、窗口管理、IPC通信、菜单设置和生命周期管理
 * @author 开发团队
 */

// Global polyfill for Electron main process
if (typeof global === 'undefined') {
  // eslint-disable-next-line no-global-assign
  (global as typeof globalThis) = globalThis;
}

import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { WindowManager } from './managers/WindowManager';
import { SecurityConfig } from './config/security';
import { IpcHandlers } from './handlers/ipcHandlers';
import { logger } from './utils/logger';

/**
 * 应用程序主类 - 管理Electron应用的整个生命周期
 * @description 负责应用初始化、窗口创建、IPC设置、菜单配置和资源清理
 * @author 开发团队
 * @since 1.0.0
 * @example
 * // 应用程序会自动创建实例并初始化
 * new Application();
 */
class Application {
  private mainWindow: BrowserWindow | null = null;
  private windowManager: WindowManager;
  private ipcHandlers: IpcHandlers;

  /**
   * 构造函数 - 初始化应用程序实例
   * @description 创建窗口管理器和IPC处理器实例，并启动应用初始化流程
   */
  constructor() {
    this.windowManager = new WindowManager();
    this.ipcHandlers = new IpcHandlers();
    this.initializeApp();
  }

  /**
   * 初始化应用程序 - 设置应用事件监听和生命周期管理
   * @description 配置应用就绪、窗口关闭、退出前等事件的处理逻辑，并设置安全策略
   * @private
   */
  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupIpcHandlers();
      this.setupMenu();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    // Handle app window closed
    app.on('window-all-closed', () => {
      this.cleanup();
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app before quit
    app.on('before-quit', () => {
      this.cleanup();
    });

    // Security: Prevent new window creation and add comprehensive security headers
    app.on('web-contents-created', (_event, contents) => {
      // 防止创建新窗口
      contents.setWindowOpenHandler(({ url }: { url: string }) => {
        logger.warn('Window open attempt blocked:', url);
        return { action: 'deny' };
      });

      // 防止导航到外部URL
      contents.on('will-navigate', (event: Electron.Event, navigationUrl: string) => {
        const parsedUrl = new URL(navigationUrl);
        
        // 允许开发环境的localhost导航
        if (process.env['NODE_ENV'] === 'development') {
          if (parsedUrl.origin === 'http://localhost:3000' || 
              parsedUrl.origin === 'https://localhost:3000') {
            return;
          }
        }
        
        // 阻止其他导航
        logger.warn('Navigation blocked:', navigationUrl);
        event.preventDefault();
      });

      // 注意：new-window事件在较新的Electron版本中已被弃用
      // setWindowOpenHandler已经足够处理新窗口阻止

      // 添加全面的安全headers
      contents.session.webRequest.onHeadersReceived((details, callback) => {
        const securityHeaders = SecurityConfig.getAllSecurityHeaders();
        
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            ...Object.keys(securityHeaders).reduce((acc, key) => {
              acc[key] = [securityHeaders[key as keyof typeof securityHeaders]];
              return acc;
            }, {} as Record<string, string[]>)
          }
        });
      });

      // 拦截并验证资源加载
      contents.session.webRequest.onBeforeRequest((details, callback) => {
        const url = details.url;
        
        // 验证URL安全性
        if (!SecurityConfig.isSafeUrl(url)) {
          logger.warn('Unsafe URL blocked:', url);
          callback({ cancel: true });
          return;
        }
        
        callback({ cancel: false });
      });
    });
  }

  /**
   * 创建主窗口 - 创建并配置应用程序的主窗口
   * @description 通过窗口管理器创建主窗口，加载渲染进程页面，设置开发工具和窗口事件
   * @private
   */
  private createMainWindow(): void {
    this.mainWindow = this.windowManager.createMainWindow();
    
    // Load the renderer
    const isDev = process.env['NODE_ENV'] === 'development';
    
    // 统一使用文件加载方式
    const rendererPath = path.join(__dirname, '../renderer/index.html');
    logger.info('Loading renderer from:', rendererPath);
    this.mainWindow.loadFile(rendererPath);
    
    if (isDev) {
      // 开发环境下打开开发者工具
      this.mainWindow.webContents.openDevTools();
    }

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }


  /**
   * 设置IPC处理器 - 配置主进程与渲染进程间的通信处理
   * @description 通过IPC处理器设置所有进程间通信的处理程序
   * @private
   */
  private setupIpcHandlers(): void {
    // 使用统一的IPC处理器设置所有处理程序
    this.ipcHandlers.setupHandlers(this.mainWindow);

    logger.warn('IPC handlers setup completed');
  }

  /**
   * 清理应用资源 - 在应用退出前清理所有资源
   * @description 清理IPC处理器、窗口监听器等资源，确保应用正常退出
   * @private
   */
  private cleanup(): void {
    try {
      logger.warn('Starting application cleanup...');
      
      // 清理IPC处理器
      this.ipcHandlers.cleanup();
      
      // 清理窗口相关资源
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.removeAllListeners();
        this.mainWindow = null;
      }
      
      logger.warn('Application cleanup completed');
    } catch (error) {
      logger.warn('Error during cleanup:', error);
    }
  }

  /**
   * 设置应用菜单 - 创建和配置应用程序的菜单栏
   * @description 创建包含文件、编辑、视图等功能的完整菜单系统，并设置快捷键
   * @private
   */
  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: '文件',
        submenu: [
          {
            label: '新建项目',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu:new-project');
            }
          },
          {
            label: '打开项目',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.mainWindow?.webContents.send('menu:open-project');
            }
          },
          {
            label: '保存项目',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow?.webContents.send('menu:save-project');
            }
          },
          { type: 'separator' },
          {
            label: '导出',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow?.webContents.send('menu:export');
            }
          },
          { type: 'separator' },
          {
            label: '退出',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: '编辑',
        submenu: [
          {
            label: '撤销',
            accelerator: 'CmdOrCtrl+Z',
            click: () => {
              this.mainWindow?.webContents.send('menu:undo');
            }
          },
          {
            label: '重做',
            accelerator: 'CmdOrCtrl+Shift+Z',
            click: () => {
              this.mainWindow?.webContents.send('menu:redo');
            }
          },
          { type: 'separator' },
          {
            label: '剪切',
            accelerator: 'CmdOrCtrl+X',
            click: () => {
              this.mainWindow?.webContents.send('menu:cut');
            }
          },
          {
            label: '复制',
            accelerator: 'CmdOrCtrl+C',
            click: () => {
              this.mainWindow?.webContents.send('menu:copy');
            }
          },
          {
            label: '粘贴',
            accelerator: 'CmdOrCtrl+V',
            click: () => {
              this.mainWindow?.webContents.send('menu:paste');
            }
          }
        ]
      },
      {
        label: '视图',
        submenu: [
          {
            label: '显示/隐藏标尺',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow?.webContents.send('menu:toggle-ruler');
            }
          },
          {
            label: '显示/隐藏参考线',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
              this.mainWindow?.webContents.send('menu:toggle-guides');
            }
          },
          { type: 'separator' },
          {
            label: '放大',
            accelerator: 'CmdOrCtrl+Plus',
            click: () => {
              this.mainWindow?.webContents.send('menu:zoom-in');
            }
          },
          {
            label: '缩小',
            accelerator: 'CmdOrCtrl+-',
            click: () => {
              this.mainWindow?.webContents.send('menu:zoom-out');
            }
          },
          {
            label: '适应屏幕',
            accelerator: 'CmdOrCtrl+0',
            click: () => {
              this.mainWindow?.webContents.send('menu:fit-to-screen');
            }
          },
          { type: 'separator' },
          {
            label: '切换开发者工具',
            accelerator: process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
            click: () => {
              this.mainWindow?.webContents.toggleDevTools();
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

// Initialize the application
new Application();