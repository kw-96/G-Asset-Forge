/**
 * IPC通信处理器
 * @description 负责处理主进程和渲染进程之间的IPC通信，提供文件系统、窗口控制、应用信息等功能
 * @author 开发团队
 * 
 * 功能模块：
 * - 文件系统操作：读写文件、目录管理、JSON处理
 * - 配置管理：保存、加载、删除应用配置
 * - 窗口控制：最大化、最小化、关闭、尺寸调整
 * - 应用信息：版本、平台、路径获取
 * - 对话框：文件选择、保存对话框
 * - 健康检查：IPC通信状态检测
 * 
 * 特性：
 * - 统一的错误处理和响应格式
 * - 参数验证和安全检查
 * - 自动清理和资源管理
 * - 窗口事件监听和转发
 */
import { ipcMain, app, BrowserWindow, dialog } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';
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
      console.log('正在设置IPC处理器...');
      this.mainWindow = mainWindow;

      // File system operations
      this.registerHandler('fs:readFile', async (_event, filePath: string) => {
        return await this.fileSystemManager.readFile(filePath);
      });

      this.registerHandler('fs:writeFile', async (_event, filePath: string, data: string) => {
        return await this.fileSystemManager.writeFile(filePath, data);
      });

      this.registerHandler('fs:exists', async (_event, filePath: string) => {
        return await this.fileSystemManager.exists(filePath);
      });

      this.registerHandler('fs:createDirectory', async (_event, dirPath: string) => {
        return await this.fileSystemManager.createDirectory(dirPath);
      });

      // 配置管理相关的处理器
      this.registerHandler('config:save', async (_event, configKey: string, configData: any) => {
        return await this.fileSystemManager.saveConfig(configKey, configData);
      });

      this.registerHandler('config:load', async (_event, configKey: string) => {
        return await this.fileSystemManager.loadConfig(configKey);
      });

      this.registerHandler('config:exists', async (_event, configKey: string) => {
        return await this.fileSystemManager.configExists(configKey);
      });

      this.registerHandler('config:delete', async (_event, configKey: string) => {
        return await this.fileSystemManager.deleteConfig(configKey);
      });

      this.registerHandler('config:list', async () => {
        return await this.fileSystemManager.listConfigs();
      });

      // Window operations
      this.registerHandler('window:minimize', async () => {
        this.mainWindow?.minimize();
        return { success: true };
      });

      this.registerHandler('window:maximize', async () => {
        this.mainWindow?.maximize();
        return { success: true };
      });

      this.registerHandler('window:restore', async () => {
        this.mainWindow?.unmaximize();
        return { success: true };
      });

      this.registerHandler('window:close', async () => {
        this.mainWindow?.close();
        return { success: true };
      });

      this.registerHandler('window:isMaximized', async () => {
        return this.mainWindow?.isMaximized() || false;
      });

      // 设置窗口事件监听器
      this.setupWindowEvents();

      this.registerHandler('window:getSize', async () => {
        if (this.mainWindow) {
          const [width, height] = this.mainWindow.getSize();
          return { width, height };
        }
        return { width: 0, height: 0 };
      });

      this.registerHandler('window:setSize', async (_event, width: number, height: number, animate: boolean = true) => {
        if (this.mainWindow) {
          this.mainWindow.setSize(width, height, animate);
          return { success: true };
        }
        return { success: false, error: 'Main window not available' };
      });

      this.registerHandler('window:setResizable', async (_event, resizable: boolean) => {
        if (this.mainWindow) {
          this.mainWindow.setResizable(resizable);
          return { success: true };
        }
        return { success: false, error: 'Main window not available' };
      });

      this.registerHandler('window:center', async () => {
        if (this.mainWindow) {
          this.mainWindow.center();
          return { success: true };
        }
        return { success: false, error: 'Main window not available' };
      });

      this.registerHandler('window:setMinimumSize', async (_event, width: number, height: number) => {
        if (this.mainWindow) {
          this.mainWindow.setMinimumSize(width, height);
          return { success: true };
        }
        return { success: false, error: 'Main window not available' };
      });

      this.registerHandler('window:removeMinimumSize', async () => {
        if (this.mainWindow) {
          // 设置为 0,0 实际上是移除最小尺寸限制
          this.mainWindow.setMinimumSize(0, 0);
          return { success: true };
        }
        return { success: false, error: 'Main window not available' };
      });

      this.registerHandler('window:getMinimumSize', async () => {
        if (this.mainWindow) {
          const [width, height] = this.mainWindow.getMinimumSize();
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

      this.registerHandler('app:getPath', async (_event, name: string) => {
        try {
          return app.getPath(name as any);
        } catch (error) {
          throw new Error(`Invalid path name: ${name}`);
        }
      });

      // Dialogs
      this.registerHandler('dialog:showOpenDialog', async (_event, options: Electron.OpenDialogOptions) => {
        const win = this.mainWindow ?? BrowserWindow.getFocusedWindow() ?? undefined;
        const result = await dialog.showOpenDialog(win!, options);
        return result;
      });

      this.registerHandler('dialog:showSaveDialog', async (_event, options: Electron.SaveDialogOptions) => {
        const win = this.mainWindow ?? BrowserWindow.getFocusedWindow() ?? undefined;
        const result = await dialog.showSaveDialog(win!, options);
        return result;
      });

      // fs-extra bridge (renderer-safe)
      this.registerHandler('fs:stat', async (_event, filePath: string) => {
        const stat = await fs.stat(filePath);
        return { size: stat.size, mtime: stat.mtime.getTime(), isFile: stat.isFile(), isDirectory: stat.isDirectory() };
      });

      this.registerHandler('fs:copy', async (_event, src: string, dest: string, options?: fs.CopyOptions) => {
        await fs.copy(src, dest, options);
        return { success: true };
      });

      this.registerHandler('fs:remove', async (_event, targetPath: string) => {
        await fs.remove(targetPath);
        return { success: true };
      });

      this.registerHandler('fs:move', async (_event, src: string, dest: string, options?: fs.MoveOptions) => {
        await fs.move(src, dest, options);
        return { success: true };
      });

      this.registerHandler('fs:readJson', async (_event, filePath: string) => {
        const data = await fs.readJson(filePath);
        return data;
      });

      this.registerHandler('fs:writeJson', async (_event, filePath: string, data: any, spaces: number = 2) => {
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeJson(filePath, data, { spaces });
        return { success: true, path: filePath };
      });

      // Health check - 用于测试IPC通信是否正常
      this.registerHandler('ipc:healthCheck', async () => {
        return {
          success: true,
          timestamp: Date.now(),
          message: 'IPC communication is working correctly',
        };
      });

      console.log(`IPC处理器注册完成: ${this.handlers.size} 个处理器`);
    } catch (error) {
      console.error('设置IPC处理器失败:', error);
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
          console.error(`IPC处理器错误，通道 ${channel}:`, error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
      };

      // 注册处理器
      ipcMain.handle(channel, wrappedHandler);
      this.handlers.set(channel, handler);

      console.log(`已注册IPC处理器: ${channel}`);
    } catch (error) {
      console.error(`注册通道 ${channel} 的处理器失败:`, error);
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
      console.error(`通道 ${channel} 验证错误:`, error);
      return false;
    }
  }

  public cleanup(): void {
    try {
      console.log('正在清理IPC处理器...');
      
      // 移除所有注册的处理器
      for (const channel of this.handlers.keys()) {
        ipcMain.removeHandler(channel);
        console.log(`已移除IPC处理器: ${channel}`);
      }
      
      // 清空处理器映射
      this.handlers.clear();
      
      // 清理对象引用
      this.mainWindow = null;
      
      console.log('IPC处理器清理完成');
    } catch (error) {
      console.error('清理IPC处理器时发生错误:', error);
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

  // 设置窗口事件监听器
  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    // 监听窗口最大化事件
    this.mainWindow.on('maximize', () => {
      this.mainWindow?.webContents.send('window:maximized');
    });

    // 监听窗口取消最大化事件
    this.mainWindow.on('unmaximize', () => {
      this.mainWindow?.webContents.send('window:unmaximized');
    });

    // 监听全屏进入事件
    this.mainWindow.on('enter-full-screen', () => {
      this.mainWindow?.webContents.send('window:enter-full-screen');
    });

    // 监听全屏退出事件
    this.mainWindow.on('leave-full-screen', () => {
      this.mainWindow?.webContents.send('window:leave-full-screen');
    });
  }
}
