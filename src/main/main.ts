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

class Application {
  private mainWindow: BrowserWindow | null = null;
  private windowManager: WindowManager;
  private ipcHandlers: IpcHandlers;

  constructor() {
    this.windowManager = new WindowManager();
    this.ipcHandlers = new IpcHandlers();
    this.initializeApp();
  }

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


  private setupIpcHandlers(): void {
    // 使用统一的IPC处理器设置所有处理程序
    this.ipcHandlers.setupHandlers(this.mainWindow);

    logger.warn('IPC handlers setup completed');
  }

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