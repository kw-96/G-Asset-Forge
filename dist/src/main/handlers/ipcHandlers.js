import { ipcMain, app } from 'electron';
import { FileSystemManager } from '../managers/FileSystemManager';
export class IpcHandlers {
    constructor() {
        this.mainWindow = null;
        this.fileSystemManager = new FileSystemManager();
        this.handlers = new Map();
    }
    setupHandlers(mainWindow) {
        try {
            console.log('Setting up IPC handlers...');
            this.mainWindow = mainWindow;
            // File system operations
            this.registerHandler('fs:readFile', async (_event, filePath) => {
                return await this.fileSystemManager.readFile(filePath);
            });
            this.registerHandler('fs:writeFile', async (_event, filePath, data) => {
                return await this.fileSystemManager.writeFile(filePath, data);
            });
            this.registerHandler('fs:exists', async (_event, filePath) => {
                return await this.fileSystemManager.exists(filePath);
            });
            this.registerHandler('fs:createDirectory', async (_event, dirPath) => {
                return await this.fileSystemManager.createDirectory(dirPath);
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
            this.registerHandler('window:setSize', async (_event, width, height, animate = true) => {
                if (this.mainWindow) {
                    this.mainWindow.setSize(width, height, animate);
                    return { success: true };
                }
                return { success: false, error: 'Main window not available' };
            });
            this.registerHandler('window:setResizable', async (_event, resizable) => {
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
            this.registerHandler('app:getPath', async (_event, name) => {
                try {
                    return app.getPath(name);
                }
                catch (error) {
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
        }
        catch (error) {
            console.error('Failed to setup IPC handlers:', error);
            throw error;
        }
    }
    registerHandler(channel, handler) {
        try {
            // 包装处理器以提供统一的错误处理
            const wrappedHandler = async (...args) => {
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
                }
                catch (error) {
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
        }
        catch (error) {
            console.error(`Failed to register handler for channel ${channel}:`, error);
        }
    }
    validateArgs(channel, args) {
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
        }
        catch (error) {
            console.error(`Validation error for channel ${channel}:`, error);
            return false;
        }
    }
    cleanup() {
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
        }
        catch (error) {
            console.error('Error during IPC handlers cleanup:', error);
        }
    }
    // 获取注册的处理器数量
    getHandlerCount() {
        return this.handlers.size;
    }
    // 检查指定通道是否已注册
    hasHandler(channel) {
        return this.handlers.has(channel);
    }
    // 获取所有注册的通道名称
    getChannels() {
        return Array.from(this.handlers.keys());
    }
    // 设置窗口事件监听器
    setupWindowEvents() {
        if (!this.mainWindow)
            return;
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
//# sourceMappingURL=ipcHandlers.js.map