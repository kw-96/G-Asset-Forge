import { ipcMain, app, BrowserWindow } from 'electron';
import { FileSystemManager } from '../managers/FileSystemManager';

interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class IpcHandlers {
  private fileSystemManager: FileSystemManager;
  private handlers: Map<string, (...args: any[]) => Promise<any>>;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.fileSystemManager = new FileSystemManager();
    this.handlers = new Map();
  }

  public setupHandlers(mainWindow: BrowserWindow | null): void {
    try {
      console.log('Setting up IPC handlers...');
      this.mainWindow = mainWindow;

      // File system operations
      this.registerHandler('fs:readFile', async (event, filePath: string) => {
        return await this.fileSystemManager.readFile(filePath);
      });

      this.registerHandler('fs:writeFile', async (event, filePath: string, data: string) => {
        return await this.fileSystemManager.writeFile(filePath, data);
      });

      this.registerHandler('fs:exists', async (event, filePath: string) => {
        return await this.fileSystemManager.exists(filePath);
      });

      this.registerHandler('fs:createDirectory', async (event, dirPath: string) => {
        return await this.fileSystemManager.createDirectory(dirPath);
      });

      // Window operations
      this.registerHandler('window:minimize', async () => {
        this.mainWindow?.minimize();
        return { success: true };
      });

      this.registerHandler('window:maximize', async () => {
        if (this.mainWindow?.isMaximized()) {
          this.mainWindow.unmaximize();
        } else {
          this.mainWindow?.maximize();
        }
        return { success: true };
      });

      this.registerHandler('window:close', async () => {
        this.mainWindow?.close();
        return { success: true };
      });

      this.registerHandler('window:isMaximized', async () => {
        return this.mainWindow?.isMaximized() || false;
      });

      this.registerHandler('window:getSize', async () => {
        if (this.mainWindow) {
          const [width, height] = this.mainWindow.getSize();
          return { width, height };
        }
        return { width: 0, height: 0 };
      });

      // App information
      this.registerHandler('app:getVersion', async () => {
        return app.getVersion();
      });

      this.registerHandler('app:getPlatform', async () => {
        return process.platform;
      });

      this.registerHandler('app:getName', async () => {
        return app.getName();
      });

      this.registerHandler('app:getPath', async (event, name: string) => {
        try {
          return app.getPath(name as any);
        } catch (error) {
          throw new Error(`Invalid path name: ${name}`);
        }
      });

      // Health check - 用于测试IPC通信是否正常
      this.registerHandler('ipc:healthCheck', async () => {
        return {
          success: true,
          timestamp: Date.now(),
          message: 'IPC communication is working correctly',
        };
      });

      console.log(`IPC handlers registered: ${this.handlers.size} handlers`);
    } catch (error) {
      console.error('Failed to setup IPC handlers:', error);
      throw error;
    }
  }

  private registerHandler(channel: string, handler: (...args: any[]) => Promise<any>): void {
    try {
      // 包装处理器以提供统一的错误处理
      const wrappedHandler = async (...args: any[]): Promise<IpcResponse> => {
        try {
          // 验证参数
          if (!this.validateArgs(channel, args)) {
            return {
              success: false,
              error: `Invalid arguments for channel: ${channel}`
            };
          }

          const result = await handler(...args);
          
          // 如果结果已经是IpcResponse格式，直接返回
          if (result && typeof result === 'object' && 'success' in result) {
            return result;
          }
          
          // 否则包装成功的结果
          return {
            success: true,
            data: result
          };
        } catch (error) {
          console.error(`IPC handler error for channel ${channel}:`, error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
      };

      // 注册处理器
      ipcMain.handle(channel, wrappedHandler);
      this.handlers.set(channel, handler);

      console.log(`Registered IPC handler: ${channel}`);
    } catch (error) {
      console.error(`Failed to register handler for channel ${channel}:`, error);
    }
  }

  private validateArgs(channel: string, args: any[]): boolean {
    try {
      // 基本参数验证
      if (!Array.isArray(args) || args.length === 0) {
        return true; // 某些处理器可能不需要参数
      }

      // 特定通道的参数验证
      switch (channel) {
        case 'fs:readFile':
        case 'fs:exists':
        case 'fs:createDirectory':
          return args.length >= 2 && typeof args[1] === 'string' && args[1].length > 0;
        
        case 'fs:writeFile':
          return args.length >= 3 && typeof args[1] === 'string' && args[1].length > 0;
        
        case 'app:getPath':
          return args.length >= 2 && typeof args[1] === 'string' && args[1].length > 0;
        
        default:
          return true;
      }
    } catch (error) {
      console.error(`Validation error for channel ${channel}:`, error);
      return false;
    }
  }

  public cleanup(): void {
    try {
      console.log('Cleaning up IPC handlers...');
      
      // 移除所有注册的处理器
      for (const channel of this.handlers.keys()) {
        ipcMain.removeHandler(channel);
        console.log(`Removed IPC handler: ${channel}`);
      }
      
      // 清空处理器映射
      this.handlers.clear();
      
      // 清理对象引用
      this.mainWindow = null;
      
      console.log('IPC handlers cleanup completed');
    } catch (error) {
      console.error('Error during IPC handlers cleanup:', error);
    }
  }

  // 获取注册的处理器数量
  public getHandlerCount(): number {
    return this.handlers.size;
  }

  // 检查指定通道是否已注册
  public hasHandler(channel: string): boolean {
    return this.handlers.has(channel);
  }

  // 获取所有注册的通道名称
  public getChannels(): string[] {
    return Array.from(this.handlers.keys());
  }
}