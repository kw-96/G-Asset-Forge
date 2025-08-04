import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
// import * as fs from 'fs-extra'; // 暂时不需要，后续会用到
import { FileSystemManager } from './managers/FileSystemManager';
import { WindowManager } from './managers/WindowManager';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private fileSystemManager: FileSystemManager;
  private windowManager: WindowManager;

  constructor() {
    this.fileSystemManager = new FileSystemManager();
    this.windowManager = new WindowManager();
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
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.setWindowOpenHandler(({ url: _url }) => {
        // Prevent opening new windows
        return { action: 'deny' };
      });
    });
  }

  private createMainWindow(): void {
    this.mainWindow = this.windowManager.createMainWindow();
    
    // Load the renderer
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIpcHandlers(): void {
    // File system operations
    ipcMain.handle('fs:readFile', async (event, filePath: string) => {
      return await this.fileSystemManager.readFile(filePath);
    });

    ipcMain.handle('fs:writeFile', async (event, filePath: string, data: string) => {
      return await this.fileSystemManager.writeFile(filePath, data);
    });

    ipcMain.handle('fs:exists', async (event, filePath: string) => {
      return await this.fileSystemManager.exists(filePath);
    });

    ipcMain.handle('fs:createDirectory', async (event, dirPath: string) => {
      return await this.fileSystemManager.createDirectory(dirPath);
    });

    // Window operations
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });

    // App info
    ipcMain.handle('app:getVersion', () => {
      return app.getVersion();
    });

    ipcMain.handle('app:getPlatform', () => {
      return process.platform;
    });
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
            role: 'cut'
          },
          {
            label: '复制',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
          },
          {
            label: '粘贴',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
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
            accelerator: 'F12',
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