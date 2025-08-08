/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/global/window.js":
/*!***************************************!*\
  !*** ./node_modules/global/window.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var global = __webpack_require__(/*! global/window */ "./node_modules/global/window.js");
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;


/***/ }),

/***/ "./src/main/config/security.ts":
/*!*************************************!*\
  !*** ./src/main/config/security.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SecurityConfig: () => (/* binding */ SecurityConfig)
/* harmony export */ });
/**
 * 应用程序安全配置
 * 基于Electron最新安全最佳实践
 */
const SecurityConfig = {
    /**
     * 内容安全策略配置
     * 遵循 Electron 安全指南和 CSP 最佳实践
     */
    CSP: {
        // 开发环境CSP - 允许webpack-dev-server热重载但限制到特定端口
        development: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3000 ws://localhost:3000; style-src 'self' 'unsafe-inline' http://localhost:3000; img-src 'self' data: blob: http://localhost:3000; font-src 'self' data: http://localhost:3000; connect-src 'self' http://localhost:3000 ws://localhost:3000 wss://localhost:3000; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
        // 生产环境CSP - 放宽限制以确保正常运行
        production: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
    },
    /**
     * Web安全配置
     */
    webSecurity: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        sandbox: false,
        disableBlinkFeatures: 'Auxclick',
        spellcheck: false, // 简化配置
        nodeIntegrationInSubFrames: false,
        nodeIntegrationInWorker: false,
        webgl: true, // 启用webgl以支持图形处理
        enableRemoteModule: false
    },
    /**
     * 额外的安全Headers
     */
    securityHeaders: {
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    /**
     * 获取当前环境的CSP策略
     */
    getCurrentCSP() {
        const isDevelopment = "development" === 'development';
        return isDevelopment ? this.CSP.development : this.CSP.production;
    },
    /**
     * 获取所有安全headers
     */
    getAllSecurityHeaders() {
        return {
            'Content-Security-Policy': this.getCurrentCSP(),
            ...this.securityHeaders
        };
    },
    /**
     * 验证URL是否安全
     */
    isSafeUrl(url) {
        try {
            const urlObj = new URL(url);
            const allowedProtocols = ['https:', 'http:', 'file:', 'data:', 'blob:'];
            if (true) {
                if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
                    return true;
                }
                if (url.startsWith('devtools://') || url.startsWith('chrome-extension://')) {
                    return true;
                }
            }
            return allowedProtocols.includes(urlObj.protocol);
        }
        catch {
            return false;
        }
    }
};


/***/ }),

/***/ "./src/main/handlers/ipcHandlers.ts":
/*!******************************************!*\
  !*** ./src/main/handlers/ipcHandlers.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IpcHandlers: () => (/* binding */ IpcHandlers)
/* harmony export */ });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _managers_FileSystemManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../managers/FileSystemManager */ "./src/main/managers/FileSystemManager.ts");


class IpcHandlers {
    constructor() {
        this.mainWindow = null;
        this.fileSystemManager = new _managers_FileSystemManager__WEBPACK_IMPORTED_MODULE_1__.FileSystemManager();
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
                return electron__WEBPACK_IMPORTED_MODULE_0__.app.getVersion();
            });
            this.registerHandler('app:getPlatform', async () => {
                return process.platform;
            });
            this.registerHandler('app:getName', async () => {
                return electron__WEBPACK_IMPORTED_MODULE_0__.app.getName();
            });
            this.registerHandler('app:getPath', async (_event, name) => {
                try {
                    return electron__WEBPACK_IMPORTED_MODULE_0__.app.getPath(name);
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
            electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle(channel, wrappedHandler);
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
                electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.removeHandler(channel);
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


/***/ }),

/***/ "./src/main/managers/FileSystemManager.ts":
/*!************************************************!*\
  !*** ./src/main/managers/FileSystemManager.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FileSystemManager: () => (/* binding */ FileSystemManager)
/* harmony export */ });
/* harmony import */ var fs_extra__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs-extra */ "fs-extra");
/* harmony import */ var fs_extra__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs_extra__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_2__);



class FileSystemManager {
    constructor() {
        this.userDataPath = electron__WEBPACK_IMPORTED_MODULE_2__.app.getPath('userData');
        this.sharedDrivePath = this.detectSharedDrive();
        this.initializeDirectories();
    }
    detectSharedDrive() {
        // Try to detect shared network drives
        // This is a simplified implementation - in production, this would be configurable
        const possiblePaths = [
            'Z:\\', // Common Windows network drive
            '/Volumes/Shared', // macOS network volume
            '/mnt/shared' // Linux mount point
        ];
        for (const drivePath of possiblePaths) {
            try {
                if (fs_extra__WEBPACK_IMPORTED_MODULE_0__.existsSync(drivePath)) {
                    return drivePath;
                }
            }
            catch (error) {
                // Continue checking other paths
            }
        }
        return null;
    }
    async initializeDirectories() {
        try {
            // Create local directories
            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, 'projects'));
            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, 'assets'));
            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, 'templates'));
            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, 'exports'));
            // Create shared directories if available
            if (this.sharedDrivePath) {
                try {
                    await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.sharedDrivePath, 'g-asset-forge', 'shared-assets'));
                    await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.sharedDrivePath, 'g-asset-forge', 'shared-projects'));
                }
                catch (error) {
                    console.warn('Could not create shared directories:', error);
                }
            }
        }
        catch (error) {
            console.error('Failed to initialize directories:', error);
        }
    }
    async readFile(filePath) {
        try {
            const fullPath = this.resolvePath(filePath);
            const data = await fs_extra__WEBPACK_IMPORTED_MODULE_0__.readFile(fullPath, 'utf8');
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async writeFile(filePath, data) {
        try {
            const fullPath = this.resolvePath(filePath);
            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.dirname(fullPath));
            // Try shared drive first, fallback to local
            if (this.isSharedPath(filePath) && this.sharedDrivePath) {
                try {
                    await fs_extra__WEBPACK_IMPORTED_MODULE_0__.writeFile(fullPath, data, 'utf8');
                    return { success: true, path: fullPath, location: 'shared' };
                }
                catch (error) {
                    // Fallback to local storage
                    const localPath = this.getLocalFallbackPath(filePath);
                    await fs_extra__WEBPACK_IMPORTED_MODULE_0__.writeFile(localPath, data, 'utf8');
                    return {
                        success: true,
                        path: localPath,
                        location: 'local',
                        fallbackUsed: true,
                        originalError: error.message
                    };
                }
            }
            else {
                await fs_extra__WEBPACK_IMPORTED_MODULE_0__.writeFile(fullPath, data, 'utf8');
                return { success: true, path: fullPath, location: 'local' };
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async exists(filePath) {
        try {
            const fullPath = this.resolvePath(filePath);
            return await fs_extra__WEBPACK_IMPORTED_MODULE_0__.pathExists(fullPath);
        }
        catch (error) {
            return false;
        }
    }
    async createDirectory(dirPath) {
        try {
            const fullPath = this.resolvePath(dirPath);
            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(fullPath);
            return { success: true, path: fullPath };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    resolvePath(filePath) {
        // Handle absolute paths
        if (path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(filePath)) {
            return filePath;
        }
        // Handle shared paths
        if (this.isSharedPath(filePath) && this.sharedDrivePath) {
            return path__WEBPACK_IMPORTED_MODULE_1__.join(this.sharedDrivePath, 'g-asset-forge', filePath.replace('shared/', ''));
        }
        // Handle local paths
        return path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, filePath);
    }
    isSharedPath(filePath) {
        return filePath.startsWith('shared/') || filePath.includes('/shared/');
    }
    getLocalFallbackPath(filePath) {
        const relativePath = filePath.replace('shared/', 'local-fallback/');
        return path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, relativePath);
    }
    getSharedDriveStatus() {
        return {
            available: this.sharedDrivePath !== null,
            path: this.sharedDrivePath
        };
    }
    getUserDataPath() {
        return this.userDataPath;
    }
}


/***/ }),

/***/ "./src/main/managers/WindowManager.ts":
/*!********************************************!*\
  !*** ./src/main/managers/WindowManager.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WindowManager: () => (/* binding */ WindowManager)
/* harmony export */ });
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _config_security__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../config/security */ "./src/main/config/security.ts");



class WindowManager {
    constructor() {
        this.windows = new Map();
    }
    createMainWindow() {
        const { width, height } = electron__WEBPACK_IMPORTED_MODULE_0__.screen.getPrimaryDisplay().workAreaSize;
        const mainWindow = new electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow({
            width: Math.min(1400, width * 0.9),
            height: Math.min(900, height * 0.9),
            minWidth: 1200,
            minHeight: 800,
            webPreferences: {
                ..._config_security__WEBPACK_IMPORTED_MODULE_2__.SecurityConfig.webSecurity,
                preload: path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, './preload.js'),
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
                ? path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, '../../assets/icon.ico')
                : path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, '../../assets/icon.png'),
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
        this.windows.forEach((window, _windowId) => {
            if (!window.isDestroyed()) {
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


/***/ }),

/***/ "./src/main/utils/logger.ts":
/*!**********************************!*\
  !*** ./src/main/utils/logger.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LogLevel: () => (/* binding */ LogLevel),
/* harmony export */   logger: () => (/* binding */ logger)
/* harmony export */ });
/**
 * 应用程序日志工具
 * 提供统一的日志记录接口
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor() {
        // 根据环境设置日志级别
        this.logLevel =  true ? LogLevel.DEBUG : 0;
    }
    shouldLog(level) {
        return level >= this.logLevel;
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;
        if (args.length > 0) {
            console.log(formattedMessage, ...args);
        }
        else {
            console.log(formattedMessage);
        }
    }
    debug(message, ...args) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.formatMessage('DEBUG', message, ...args);
        }
    }
    info(message, ...args) {
        if (this.shouldLog(LogLevel.INFO)) {
            this.formatMessage('INFO', message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.shouldLog(LogLevel.WARN)) {
            this.formatMessage('WARN', message, ...args);
        }
    }
    error(message, ...args) {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.formatMessage('ERROR', message, ...args);
        }
    }
}
// 导出单例实例
const logger = new Logger();


/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ }),

/***/ "fs-extra":
/*!***************************!*\
  !*** external "fs-extra" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("fs-extra");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!**************************!*\
  !*** ./src/main/main.ts ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _managers_WindowManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./managers/WindowManager */ "./src/main/managers/WindowManager.ts");
/* harmony import */ var _config_security__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./config/security */ "./src/main/config/security.ts");
/* harmony import */ var _handlers_ipcHandlers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./handlers/ipcHandlers */ "./src/main/handlers/ipcHandlers.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/logger */ "./src/main/utils/logger.ts");
/* provided dependency */ var global = __webpack_require__(/*! global/window */ "./node_modules/global/window.js");
// Global polyfill for Electron main process
if (typeof global === 'undefined') {
    // eslint-disable-next-line no-global-assign
    global = globalThis;
}






class Application {
    constructor() {
        this.mainWindow = null;
        this.windowManager = new _managers_WindowManager__WEBPACK_IMPORTED_MODULE_2__.WindowManager();
        this.ipcHandlers = new _handlers_ipcHandlers__WEBPACK_IMPORTED_MODULE_4__.IpcHandlers();
        this.initializeApp();
    }
    initializeApp() {
        // Handle app ready
        electron__WEBPACK_IMPORTED_MODULE_0__.app.whenReady().then(() => {
            this.createMainWindow();
            this.setupIpcHandlers();
            this.setupMenu();
            electron__WEBPACK_IMPORTED_MODULE_0__.app.on('activate', () => {
                if (electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow.getAllWindows().length === 0) {
                    this.createMainWindow();
                }
            });
        });
        // Handle app window closed
        electron__WEBPACK_IMPORTED_MODULE_0__.app.on('window-all-closed', () => {
            this.cleanup();
            if (process.platform !== 'darwin') {
                electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
            }
        });
        // Handle app before quit
        electron__WEBPACK_IMPORTED_MODULE_0__.app.on('before-quit', () => {
            this.cleanup();
        });
        // Security: Prevent new window creation and add comprehensive security headers
        electron__WEBPACK_IMPORTED_MODULE_0__.app.on('web-contents-created', (_event, contents) => {
            // 防止创建新窗口
            contents.setWindowOpenHandler(({ url }) => {
                _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.warn('Window open attempt blocked:', url);
                return { action: 'deny' };
            });
            // 防止导航到外部URL
            contents.on('will-navigate', (event, navigationUrl) => {
                const parsedUrl = new URL(navigationUrl);
                // 允许开发环境的localhost导航
                if (true) {
                    if (parsedUrl.origin === 'http://localhost:3000' ||
                        parsedUrl.origin === 'https://localhost:3000') {
                        return;
                    }
                }
                // 阻止其他导航
                _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.warn('Navigation blocked:', navigationUrl);
                event.preventDefault();
            });
            // 注意：new-window事件在较新的Electron版本中已被弃用
            // setWindowOpenHandler已经足够处理新窗口阻止
            // 添加全面的安全headers
            contents.session.webRequest.onHeadersReceived((details, callback) => {
                const securityHeaders = _config_security__WEBPACK_IMPORTED_MODULE_3__.SecurityConfig.getAllSecurityHeaders();
                callback({
                    responseHeaders: {
                        ...details.responseHeaders,
                        ...Object.keys(securityHeaders).reduce((acc, key) => {
                            acc[key] = [securityHeaders[key]];
                            return acc;
                        }, {})
                    }
                });
            });
            // 拦截并验证资源加载
            contents.session.webRequest.onBeforeRequest((details, callback) => {
                const url = details.url;
                // 验证URL安全性
                if (!_config_security__WEBPACK_IMPORTED_MODULE_3__.SecurityConfig.isSafeUrl(url)) {
                    _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.warn('Unsafe URL blocked:', url);
                    callback({ cancel: true });
                    return;
                }
                callback({ cancel: false });
            });
        });
    }
    createMainWindow() {
        this.mainWindow = this.windowManager.createMainWindow();
        // Load the renderer
        const isDev = "development" === 'development';
        // 统一使用文件加载方式
        const rendererPath = path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, '../renderer/index.html');
        _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.info('Loading renderer from:', rendererPath);
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
    setupIpcHandlers() {
        // 使用统一的IPC处理器设置所有处理程序
        this.ipcHandlers.setupHandlers(this.mainWindow);
        _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.warn('IPC handlers setup completed');
    }
    cleanup() {
        try {
            _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.warn('Starting application cleanup...');
            // 清理IPC处理器
            this.ipcHandlers.cleanup();
            // 清理窗口相关资源
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.removeAllListeners();
                this.mainWindow = null;
            }
            _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.warn('Application cleanup completed');
        }
        catch (error) {
            _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.warn('Error during cleanup:', error);
        }
    }
    setupMenu() {
        const template = [
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
                            electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
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
        const menu = electron__WEBPACK_IMPORTED_MODULE_0__.Menu.buildFromTemplate(template);
        electron__WEBPACK_IMPORTED_MODULE_0__.Menu.setApplicationMenu(menu);
    }
}
// Initialize the application
new Application();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TUFBTSxJQUFJLEdBQUcsMENBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QywwQ0FBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FDRjtBQUVELDZCQUE2QjtBQUM3QixJQUFJLFdBQVcsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS8uL25vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvLi9zcmMvbWFpbi9jb25maWcvc2VjdXJpdHkudHMiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS8uL3NyYy9tYWluL2hhbmRsZXJzL2lwY0hhbmRsZXJzLnRzIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvLi9zcmMvbWFpbi9tYW5hZ2Vycy9GaWxlU3lzdGVtTWFuYWdlci50cyIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlLy4vc3JjL21haW4vbWFuYWdlcnMvV2luZG93TWFuYWdlci50cyIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlLy4vc3JjL21haW4vdXRpbHMvbG9nZ2VyLnRzIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcImVsZWN0cm9uXCIiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS9leHRlcm5hbCBjb21tb25qcyBcImZzLWV4dHJhXCIiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwicGF0aFwiIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvLi9zcmMvbWFpbi9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciB3aW47XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgd2luID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgd2luID0ge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2luO1xuIiwiLyoqXHJcbiAqIOW6lOeUqOeoi+W6j+WuieWFqOmFjee9rlxyXG4gKiDln7rkuo5FbGVjdHJvbuacgOaWsOWuieWFqOacgOS9s+Wunui3tVxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBTZWN1cml0eUNvbmZpZyA9IHtcclxuICAvKipcclxuICAgKiDlhoXlrrnlronlhajnrZbnlaXphY3nva5cclxuICAgKiDpgbXlvqogRWxlY3Ryb24g5a6J5YWo5oyH5Y2X5ZKMIENTUCDmnIDkvbPlrp7ot7VcclxuICAgKi9cclxuICBDU1A6IHtcclxuICAgIC8vIOW8gOWPkeeOr+Wig0NTUCAtIOWFgeiuuHdlYnBhY2stZGV2LXNlcnZlcueDremHjei9veS9humZkOWItuWIsOeJueWumuerr+WPo1xyXG4gICAgZGV2ZWxvcG1lbnQ6IFwiZGVmYXVsdC1zcmMgJ3NlbGYnOyBzY3JpcHQtc3JjICdzZWxmJyAndW5zYWZlLWV2YWwnICd1bnNhZmUtaW5saW5lJyBodHRwOi8vbG9jYWxob3N0OjMwMDAgd3M6Ly9sb2NhbGhvc3Q6MzAwMDsgc3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZScgaHR0cDovL2xvY2FsaG9zdDozMDAwOyBpbWctc3JjICdzZWxmJyBkYXRhOiBibG9iOiBodHRwOi8vbG9jYWxob3N0OjMwMDA7IGZvbnQtc3JjICdzZWxmJyBkYXRhOiBodHRwOi8vbG9jYWxob3N0OjMwMDA7IGNvbm5lY3Qtc3JjICdzZWxmJyBodHRwOi8vbG9jYWxob3N0OjMwMDAgd3M6Ly9sb2NhbGhvc3Q6MzAwMCB3c3M6Ly9sb2NhbGhvc3Q6MzAwMDsgd29ya2VyLXNyYyAnc2VsZicgYmxvYjo7IGZyYW1lLXNyYyAnbm9uZSc7IG9iamVjdC1zcmMgJ25vbmUnOyBiYXNlLXVyaSAnc2VsZic7IGZvcm0tYWN0aW9uICdzZWxmJ1wiLFxyXG4gICAgLy8g55Sf5Lqn546v5aKDQ1NQIC0g5pS+5a696ZmQ5Yi25Lul56Gu5L+d5q2j5bi46L+Q6KGMXHJcbiAgICBwcm9kdWN0aW9uOiBcImRlZmF1bHQtc3JjICdzZWxmJzsgc2NyaXB0LXNyYyAnc2VsZicgJ3Vuc2FmZS1pbmxpbmUnOyBzdHlsZS1zcmMgJ3NlbGYnICd1bnNhZmUtaW5saW5lJzsgaW1nLXNyYyAnc2VsZicgZGF0YTogYmxvYjo7IGZvbnQtc3JjICdzZWxmJyBkYXRhOjsgY29ubmVjdC1zcmMgJ3NlbGYnOyBmcmFtZS1zcmMgJ25vbmUnOyBvYmplY3Qtc3JjICdub25lJzsgYmFzZS11cmkgJ3NlbGYnOyBmb3JtLWFjdGlvbiAnc2VsZidcIlxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFdlYuWuieWFqOmFjee9rlxyXG4gICAqL1xyXG4gIHdlYlNlY3VyaXR5OiB7XHJcbiAgICBub2RlSW50ZWdyYXRpb246IGZhbHNlLFxyXG4gICAgY29udGV4dElzb2xhdGlvbjogdHJ1ZSxcclxuICAgIHdlYlNlY3VyaXR5OiB0cnVlLFxyXG4gICAgYWxsb3dSdW5uaW5nSW5zZWN1cmVDb250ZW50OiBmYWxzZSxcclxuICAgIGV4cGVyaW1lbnRhbEZlYXR1cmVzOiBmYWxzZSxcclxuICAgIHNhbmRib3g6IGZhbHNlLFxyXG4gICAgZGlzYWJsZUJsaW5rRmVhdHVyZXM6ICdBdXhjbGljaycsXHJcbiAgICBzcGVsbGNoZWNrOiBmYWxzZSwgLy8g566A5YyW6YWN572uXHJcbiAgICBub2RlSW50ZWdyYXRpb25JblN1YkZyYW1lczogZmFsc2UsXHJcbiAgICBub2RlSW50ZWdyYXRpb25JbldvcmtlcjogZmFsc2UsXHJcbiAgICB3ZWJnbDogdHJ1ZSwgLy8g5ZCv55Sod2ViZ2zku6XmlK/mjIHlm77lvaLlpITnkIZcclxuICAgIGVuYWJsZVJlbW90ZU1vZHVsZTogZmFsc2VcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiDpop3lpJbnmoTlronlhahIZWFkZXJzXHJcbiAgICovXHJcbiAgc2VjdXJpdHlIZWFkZXJzOiB7XHJcbiAgICAnWC1GcmFtZS1PcHRpb25zJzogJ0RFTlknLFxyXG4gICAgJ1gtWFNTLVByb3RlY3Rpb24nOiAnMTsgbW9kZT1ibG9jaycsXHJcbiAgICAnWC1Db250ZW50LVR5cGUtT3B0aW9ucyc6ICdub3NuaWZmJyxcclxuICAgICdSZWZlcnJlci1Qb2xpY3knOiAnc3RyaWN0LW9yaWdpbi13aGVuLWNyb3NzLW9yaWdpbidcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiDojrflj5blvZPliY3njq/looPnmoRDU1DnrZbnlaVcclxuICAgKi9cclxuICBnZXRDdXJyZW50Q1NQKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBpc0RldmVsb3BtZW50ID0gcHJvY2Vzcy5lbnZbJ05PREVfRU5WJ10gPT09ICdkZXZlbG9wbWVudCc7XHJcbiAgICByZXR1cm4gaXNEZXZlbG9wbWVudCA/IHRoaXMuQ1NQLmRldmVsb3BtZW50IDogdGhpcy5DU1AucHJvZHVjdGlvbjtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiDojrflj5bmiYDmnInlronlhahoZWFkZXJzXHJcbiAgICovXHJcbiAgZ2V0QWxsU2VjdXJpdHlIZWFkZXJzKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5JzogdGhpcy5nZXRDdXJyZW50Q1NQKCksXHJcbiAgICAgIC4uLnRoaXMuc2VjdXJpdHlIZWFkZXJzXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIOmqjOivgVVSTOaYr+WQpuWuieWFqFxyXG4gICAqL1xyXG4gIGlzU2FmZVVybCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTCh1cmwpO1xyXG4gICAgICBjb25zdCBhbGxvd2VkUHJvdG9jb2xzID0gWydodHRwczonLCAnaHR0cDonLCAnZmlsZTonLCAnZGF0YTonLCAnYmxvYjonXTtcclxuICAgICAgXHJcbiAgICAgIGlmIChwcm9jZXNzLmVudlsnTk9ERV9FTlYnXSA9PT0gJ2RldmVsb3BtZW50Jykge1xyXG4gICAgICAgIGlmICh1cmxPYmouaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnIHx8IHVybE9iai5ob3N0bmFtZSA9PT0gJzEyNy4wLjAuMScpIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXJsLnN0YXJ0c1dpdGgoJ2RldnRvb2xzOi8vJykgfHwgdXJsLnN0YXJ0c1dpdGgoJ2Nocm9tZS1leHRlbnNpb246Ly8nKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICByZXR1cm4gYWxsb3dlZFByb3RvY29scy5pbmNsdWRlcyh1cmxPYmoucHJvdG9jb2wpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbn07IiwiaW1wb3J0IHsgaXBjTWFpbiwgYXBwLCBCcm93c2VyV2luZG93IH0gZnJvbSAnZWxlY3Ryb24nO1xyXG5pbXBvcnQgeyBGaWxlU3lzdGVtTWFuYWdlciB9IGZyb20gJy4uL21hbmFnZXJzL0ZpbGVTeXN0ZW1NYW5hZ2VyJztcclxuXHJcbmludGVyZmFjZSBJcGNSZXNwb25zZTxUID0gYW55PiB7XHJcbiAgc3VjY2VzczogYm9vbGVhbjtcclxuICBkYXRhPzogVDtcclxuICBlcnJvcj86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIElwY0hhbmRsZXJzIHtcclxuICBwcml2YXRlIGZpbGVTeXN0ZW1NYW5hZ2VyOiBGaWxlU3lzdGVtTWFuYWdlcjtcclxuICBwcml2YXRlIGhhbmRsZXJzOiBNYXA8c3RyaW5nLCAoLi4uYXJnczogYW55W10pID0+IFByb21pc2U8YW55Pj47XHJcbiAgcHJpdmF0ZSBtYWluV2luZG93OiBCcm93c2VyV2luZG93IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5maWxlU3lzdGVtTWFuYWdlciA9IG5ldyBGaWxlU3lzdGVtTWFuYWdlcigpO1xyXG4gICAgdGhpcy5oYW5kbGVycyA9IG5ldyBNYXAoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXR1cEhhbmRsZXJzKG1haW5XaW5kb3c6IEJyb3dzZXJXaW5kb3cgfCBudWxsKTogdm9pZCB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zb2xlLmxvZygnU2V0dGluZyB1cCBJUEMgaGFuZGxlcnMuLi4nKTtcclxuICAgICAgdGhpcy5tYWluV2luZG93ID0gbWFpbldpbmRvdztcclxuXHJcbiAgICAgIC8vIEZpbGUgc3lzdGVtIG9wZXJhdGlvbnNcclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ2ZzOnJlYWRGaWxlJywgYXN5bmMgKF9ldmVudCwgZmlsZVBhdGg6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1NYW5hZ2VyLnJlYWRGaWxlKGZpbGVQYXRoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignZnM6d3JpdGVGaWxlJywgYXN5bmMgKF9ldmVudCwgZmlsZVBhdGg6IHN0cmluZywgZGF0YTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZmlsZVN5c3RlbU1hbmFnZXIud3JpdGVGaWxlKGZpbGVQYXRoLCBkYXRhKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignZnM6ZXhpc3RzJywgYXN5bmMgKF9ldmVudCwgZmlsZVBhdGg6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1NYW5hZ2VyLmV4aXN0cyhmaWxlUGF0aCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ2ZzOmNyZWF0ZURpcmVjdG9yeScsIGFzeW5jIChfZXZlbnQsIGRpclBhdGg6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1NYW5hZ2VyLmNyZWF0ZURpcmVjdG9yeShkaXJQYXRoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBXaW5kb3cgb3BlcmF0aW9uc1xyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignd2luZG93Om1pbmltaXplJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubWFpbldpbmRvdz8ubWluaW1pemUoKTtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ3dpbmRvdzptYXhpbWl6ZScsIGFzeW5jICgpID0+IHtcclxuICAgICAgICB0aGlzLm1haW5XaW5kb3c/Lm1heGltaXplKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCd3aW5kb3c6cmVzdG9yZScsIGFzeW5jICgpID0+IHtcclxuICAgICAgICB0aGlzLm1haW5XaW5kb3c/LnVubWF4aW1pemUoKTtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ3dpbmRvdzpjbG9zZScsIGFzeW5jICgpID0+IHtcclxuICAgICAgICB0aGlzLm1haW5XaW5kb3c/LmNsb3NlKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCd3aW5kb3c6aXNNYXhpbWl6ZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFpbldpbmRvdz8uaXNNYXhpbWl6ZWQoKSB8fCBmYWxzZTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyDorr7nva7nqpflj6Pkuovku7bnm5HlkKzlmahcclxuICAgICAgdGhpcy5zZXR1cFdpbmRvd0V2ZW50cygpO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ3dpbmRvdzpnZXRTaXplJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLm1haW5XaW5kb3cpIHtcclxuICAgICAgICAgIGNvbnN0IFt3aWR0aCwgaGVpZ2h0XSA9IHRoaXMubWFpbldpbmRvdy5nZXRTaXplKCk7XHJcbiAgICAgICAgICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignd2luZG93OnNldFNpemUnLCBhc3luYyAoX2V2ZW50LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYW5pbWF0ZTogYm9vbGVhbiA9IHRydWUpID0+IHtcclxuICAgICAgICBpZiAodGhpcy5tYWluV2luZG93KSB7XHJcbiAgICAgICAgICB0aGlzLm1haW5XaW5kb3cuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0LCBhbmltYXRlKTtcclxuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTWFpbiB3aW5kb3cgbm90IGF2YWlsYWJsZScgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignd2luZG93OnNldFJlc2l6YWJsZScsIGFzeW5jIChfZXZlbnQsIHJlc2l6YWJsZTogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLm1haW5XaW5kb3cpIHtcclxuICAgICAgICAgIHRoaXMubWFpbldpbmRvdy5zZXRSZXNpemFibGUocmVzaXphYmxlKTtcclxuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTWFpbiB3aW5kb3cgbm90IGF2YWlsYWJsZScgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignd2luZG93OmNlbnRlcicsIGFzeW5jICgpID0+IHtcclxuICAgICAgICBpZiAodGhpcy5tYWluV2luZG93KSB7XHJcbiAgICAgICAgICB0aGlzLm1haW5XaW5kb3cuY2VudGVyKCk7XHJcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ01haW4gd2luZG93IG5vdCBhdmFpbGFibGUnIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQXBwIGluZm9ybWF0aW9uXHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCdhcHA6Z2V0VmVyc2lvbicsIGFzeW5jICgpID0+IHtcclxuICAgICAgICByZXR1cm4gYXBwLmdldFZlcnNpb24oKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignYXBwOmdldFBsYXRmb3JtJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBwcm9jZXNzLnBsYXRmb3JtO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCdhcHA6Z2V0TmFtZScsIGFzeW5jICgpID0+IHtcclxuICAgICAgICByZXR1cm4gYXBwLmdldE5hbWUoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignYXBwOmdldFBhdGgnLCBhc3luYyAoX2V2ZW50LCBuYW1lOiBzdHJpbmcpID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgcmV0dXJuIGFwcC5nZXRQYXRoKG5hbWUgYXMgYW55KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhdGggbmFtZTogJHtuYW1lfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBIZWFsdGggY2hlY2sgLSDnlKjkuo7mtYvor5VJUEPpgJrkv6HmmK/lkKbmraPluLhcclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ2lwYzpoZWFsdGhDaGVjaycsIGFzeW5jICgpID0+IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcclxuICAgICAgICAgIG1lc3NhZ2U6ICdJUEMgY29tbXVuaWNhdGlvbiBpcyB3b3JraW5nIGNvcnJlY3RseScsXHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhgSVBDIGhhbmRsZXJzIHJlZ2lzdGVyZWQ6ICR7dGhpcy5oYW5kbGVycy5zaXplfSBoYW5kbGVyc2ApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNldHVwIElQQyBoYW5kbGVyczonLCBlcnJvcik7XHJcbiAgICAgIHRocm93IGVycm9yO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZWdpc3RlckhhbmRsZXIoY2hhbm5lbDogc3RyaW5nLCBoYW5kbGVyOiAoLi4uYXJnczogYW55W10pID0+IFByb21pc2U8YW55Pik6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8g5YyF6KOF5aSE55CG5Zmo5Lul5o+Q5L6b57uf5LiA55qE6ZSZ6K+v5aSE55CGXHJcbiAgICAgIGNvbnN0IHdyYXBwZWRIYW5kbGVyID0gYXN5bmMgKC4uLmFyZ3M6IGFueVtdKTogUHJvbWlzZTxJcGNSZXNwb25zZT4gPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAvLyDpqozor4Hlj4LmlbBcclxuICAgICAgICAgIGlmICghdGhpcy52YWxpZGF0ZUFyZ3MoY2hhbm5lbCwgYXJncykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgICBlcnJvcjogYEludmFsaWQgYXJndW1lbnRzIGZvciBjaGFubmVsOiAke2NoYW5uZWx9YFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGhhbmRsZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIOWmguaenOe7k+aenOW3sue7j+aYr0lwY1Jlc3BvbnNl5qC85byP77yM55u05o6l6L+U5ZueXHJcbiAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnICYmICdzdWNjZXNzJyBpbiByZXN1bHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8g5ZCm5YiZ5YyF6KOF5oiQ5Yqf55qE57uT5p6cXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgICAgICBkYXRhOiByZXN1bHRcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYElQQyBoYW5kbGVyIGVycm9yIGZvciBjaGFubmVsICR7Y2hhbm5lbH06YCwgZXJyb3IpO1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJ1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyDms6jlhozlpITnkIblmahcclxuICAgICAgaXBjTWFpbi5oYW5kbGUoY2hhbm5lbCwgd3JhcHBlZEhhbmRsZXIpO1xyXG4gICAgICB0aGlzLmhhbmRsZXJzLnNldChjaGFubmVsLCBoYW5kbGVyKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKGBSZWdpc3RlcmVkIElQQyBoYW5kbGVyOiAke2NoYW5uZWx9YCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gcmVnaXN0ZXIgaGFuZGxlciBmb3IgY2hhbm5lbCAke2NoYW5uZWx9OmAsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmFsaWRhdGVBcmdzKGNoYW5uZWw6IHN0cmluZywgYXJnczogYW55W10pOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIOWfuuacrOWPguaVsOmqjOivgVxyXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJncykgfHwgYXJncy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8g5p+Q5Lqb5aSE55CG5Zmo5Y+v6IO95LiN6ZyA6KaB5Y+C5pWwXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIOeJueWumumAmumBk+eahOWPguaVsOmqjOivgVxyXG4gICAgICBzd2l0Y2ggKGNoYW5uZWwpIHtcclxuICAgICAgICBjYXNlICdmczpyZWFkRmlsZSc6XHJcbiAgICAgICAgY2FzZSAnZnM6ZXhpc3RzJzpcclxuICAgICAgICBjYXNlICdmczpjcmVhdGVEaXJlY3RvcnknOlxyXG4gICAgICAgICAgcmV0dXJuIGFyZ3MubGVuZ3RoID49IDIgJiYgdHlwZW9mIGFyZ3NbMV0gPT09ICdzdHJpbmcnICYmIGFyZ3NbMV0ubGVuZ3RoID4gMDtcclxuICAgICAgICBcclxuICAgICAgICBjYXNlICdmczp3cml0ZUZpbGUnOlxyXG4gICAgICAgICAgcmV0dXJuIGFyZ3MubGVuZ3RoID49IDMgJiYgdHlwZW9mIGFyZ3NbMV0gPT09ICdzdHJpbmcnICYmIGFyZ3NbMV0ubGVuZ3RoID4gMDtcclxuICAgICAgICBcclxuICAgICAgICBjYXNlICdhcHA6Z2V0UGF0aCc6XHJcbiAgICAgICAgICByZXR1cm4gYXJncy5sZW5ndGggPj0gMiAmJiB0eXBlb2YgYXJnc1sxXSA9PT0gJ3N0cmluZycgJiYgYXJnc1sxXS5sZW5ndGggPiAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihgVmFsaWRhdGlvbiBlcnJvciBmb3IgY2hhbm5lbCAke2NoYW5uZWx9OmAsIGVycm9yKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGNsZWFudXAoKTogdm9pZCB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zb2xlLmxvZygnQ2xlYW5pbmcgdXAgSVBDIGhhbmRsZXJzLi4uJyk7XHJcbiAgICAgIFxyXG4gICAgICAvLyDnp7vpmaTmiYDmnInms6jlhoznmoTlpITnkIblmahcclxuICAgICAgZm9yIChjb25zdCBjaGFubmVsIG9mIHRoaXMuaGFuZGxlcnMua2V5cygpKSB7XHJcbiAgICAgICAgaXBjTWFpbi5yZW1vdmVIYW5kbGVyKGNoYW5uZWwpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBSZW1vdmVkIElQQyBoYW5kbGVyOiAke2NoYW5uZWx9YCk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIOa4heepuuWkhOeQhuWZqOaYoOWwhFxyXG4gICAgICB0aGlzLmhhbmRsZXJzLmNsZWFyKCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyDmuIXnkIblr7nosaHlvJXnlKhcclxuICAgICAgdGhpcy5tYWluV2luZG93ID0gbnVsbDtcclxuICAgICAgXHJcbiAgICAgIGNvbnNvbGUubG9nKCdJUEMgaGFuZGxlcnMgY2xlYW51cCBjb21wbGV0ZWQnKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGR1cmluZyBJUEMgaGFuZGxlcnMgY2xlYW51cDonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDojrflj5bms6jlhoznmoTlpITnkIblmajmlbDph49cclxuICBwdWJsaWMgZ2V0SGFuZGxlckNvdW50KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVycy5zaXplO1xyXG4gIH1cclxuXHJcbiAgLy8g5qOA5p+l5oyH5a6a6YCa6YGT5piv5ZCm5bey5rOo5YaMXHJcbiAgcHVibGljIGhhc0hhbmRsZXIoY2hhbm5lbDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVycy5oYXMoY2hhbm5lbCk7XHJcbiAgfVxyXG5cclxuICAvLyDojrflj5bmiYDmnInms6jlhoznmoTpgJrpgZPlkI3np7BcclxuICBwdWJsaWMgZ2V0Q2hhbm5lbHMoKTogc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5oYW5kbGVycy5rZXlzKCkpO1xyXG4gIH1cclxuXHJcbiAgLy8g6K6+572u56qX5Y+j5LqL5Lu255uR5ZCs5ZmoXHJcbiAgcHJpdmF0ZSBzZXR1cFdpbmRvd0V2ZW50cygpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5tYWluV2luZG93KSByZXR1cm47XHJcblxyXG4gICAgLy8g55uR5ZCs56qX5Y+j5pyA5aSn5YyW5LqL5Lu2XHJcbiAgICB0aGlzLm1haW5XaW5kb3cub24oJ21heGltaXplJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ3dpbmRvdzptYXhpbWl6ZWQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIOebkeWQrOeql+WPo+WPlua2iOacgOWkp+WMluS6i+S7tlxyXG4gICAgdGhpcy5tYWluV2luZG93Lm9uKCd1bm1heGltaXplJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ3dpbmRvdzp1bm1heGltaXplZCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g55uR5ZCs5YWo5bGP6L+b5YWl5LqL5Lu2XHJcbiAgICB0aGlzLm1haW5XaW5kb3cub24oJ2VudGVyLWZ1bGwtc2NyZWVuJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ3dpbmRvdzplbnRlci1mdWxsLXNjcmVlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g55uR5ZCs5YWo5bGP6YCA5Ye65LqL5Lu2XHJcbiAgICB0aGlzLm1haW5XaW5kb3cub24oJ2xlYXZlLWZ1bGwtc2NyZWVuJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ3dpbmRvdzpsZWF2ZS1mdWxsLXNjcmVlbicpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgYXBwIH0gZnJvbSAnZWxlY3Ryb24nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVTeXN0ZW1NYW5hZ2VyIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHVzZXJEYXRhUGF0aDogc3RyaW5nO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2hhcmVkRHJpdmVQYXRoOiBzdHJpbmcgfCBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMudXNlckRhdGFQYXRoID0gYXBwLmdldFBhdGgoJ3VzZXJEYXRhJyk7XHJcbiAgICB0aGlzLnNoYXJlZERyaXZlUGF0aCA9IHRoaXMuZGV0ZWN0U2hhcmVkRHJpdmUoKTtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZURpcmVjdG9yaWVzKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRldGVjdFNoYXJlZERyaXZlKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgLy8gVHJ5IHRvIGRldGVjdCBzaGFyZWQgbmV0d29yayBkcml2ZXNcclxuICAgIC8vIFRoaXMgaXMgYSBzaW1wbGlmaWVkIGltcGxlbWVudGF0aW9uIC0gaW4gcHJvZHVjdGlvbiwgdGhpcyB3b3VsZCBiZSBjb25maWd1cmFibGVcclxuICAgIGNvbnN0IHBvc3NpYmxlUGF0aHMgPSBbXHJcbiAgICAgICdaOlxcXFwnLCAvLyBDb21tb24gV2luZG93cyBuZXR3b3JrIGRyaXZlXHJcbiAgICAgICcvVm9sdW1lcy9TaGFyZWQnLCAvLyBtYWNPUyBuZXR3b3JrIHZvbHVtZVxyXG4gICAgICAnL21udC9zaGFyZWQnIC8vIExpbnV4IG1vdW50IHBvaW50XHJcbiAgICBdO1xyXG5cclxuICAgIGZvciAoY29uc3QgZHJpdmVQYXRoIG9mIHBvc3NpYmxlUGF0aHMpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhkcml2ZVBhdGgpKSB7XHJcbiAgICAgICAgICByZXR1cm4gZHJpdmVQYXRoO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBDb250aW51ZSBjaGVja2luZyBvdGhlciBwYXRoc1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemVEaXJlY3RvcmllcygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIENyZWF0ZSBsb2NhbCBkaXJlY3Rvcmllc1xyXG4gICAgICBhd2FpdCBmcy5lbnN1cmVEaXIocGF0aC5qb2luKHRoaXMudXNlckRhdGFQYXRoLCAncHJvamVjdHMnKSk7XHJcbiAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihwYXRoLmpvaW4odGhpcy51c2VyRGF0YVBhdGgsICdhc3NldHMnKSk7XHJcbiAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihwYXRoLmpvaW4odGhpcy51c2VyRGF0YVBhdGgsICd0ZW1wbGF0ZXMnKSk7XHJcbiAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihwYXRoLmpvaW4odGhpcy51c2VyRGF0YVBhdGgsICdleHBvcnRzJykpO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHNoYXJlZCBkaXJlY3RvcmllcyBpZiBhdmFpbGFibGVcclxuICAgICAgaWYgKHRoaXMuc2hhcmVkRHJpdmVQYXRoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihwYXRoLmpvaW4odGhpcy5zaGFyZWREcml2ZVBhdGgsICdnLWFzc2V0LWZvcmdlJywgJ3NoYXJlZC1hc3NldHMnKSk7XHJcbiAgICAgICAgICBhd2FpdCBmcy5lbnN1cmVEaXIocGF0aC5qb2luKHRoaXMuc2hhcmVkRHJpdmVQYXRoLCAnZy1hc3NldC1mb3JnZScsICdzaGFyZWQtcHJvamVjdHMnKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IGNyZWF0ZSBzaGFyZWQgZGlyZWN0b3JpZXM6JywgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGluaXRpYWxpemUgZGlyZWN0b3JpZXM6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmVhZEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmdWxsUGF0aCA9IHRoaXMucmVzb2x2ZVBhdGgoZmlsZVBhdGgpO1xyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgZnMucmVhZEZpbGUoZnVsbFBhdGgsICd1dGY4Jyk7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGEgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyB3cml0ZUZpbGUoZmlsZVBhdGg6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZ1bGxQYXRoID0gdGhpcy5yZXNvbHZlUGF0aChmaWxlUGF0aCk7XHJcbiAgICAgIGF3YWl0IGZzLmVuc3VyZURpcihwYXRoLmRpcm5hbWUoZnVsbFBhdGgpKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFRyeSBzaGFyZWQgZHJpdmUgZmlyc3QsIGZhbGxiYWNrIHRvIGxvY2FsXHJcbiAgICAgIGlmICh0aGlzLmlzU2hhcmVkUGF0aChmaWxlUGF0aCkgJiYgdGhpcy5zaGFyZWREcml2ZVBhdGgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGZ1bGxQYXRoLCBkYXRhLCAndXRmOCcpO1xyXG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgcGF0aDogZnVsbFBhdGgsIGxvY2F0aW9uOiAnc2hhcmVkJyB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAvLyBGYWxsYmFjayB0byBsb2NhbCBzdG9yYWdlXHJcbiAgICAgICAgICBjb25zdCBsb2NhbFBhdGggPSB0aGlzLmdldExvY2FsRmFsbGJhY2tQYXRoKGZpbGVQYXRoKTtcclxuICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShsb2NhbFBhdGgsIGRhdGEsICd1dGY4Jyk7XHJcbiAgICAgICAgICByZXR1cm4geyBcclxuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSwgXHJcbiAgICAgICAgICAgIHBhdGg6IGxvY2FsUGF0aCwgXHJcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnbG9jYWwnLFxyXG4gICAgICAgICAgICBmYWxsYmFja1VzZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIG9yaWdpbmFsRXJyb3I6IChlcnJvciBhcyBFcnJvcikubWVzc2FnZVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGZ1bGxQYXRoLCBkYXRhLCAndXRmOCcpO1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHBhdGg6IGZ1bGxQYXRoLCBsb2NhdGlvbjogJ2xvY2FsJyB9O1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IChlcnJvciBhcyBFcnJvcikubWVzc2FnZSB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZXhpc3RzKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZ1bGxQYXRoID0gdGhpcy5yZXNvbHZlUGF0aChmaWxlUGF0aCk7XHJcbiAgICAgIHJldHVybiBhd2FpdCBmcy5wYXRoRXhpc3RzKGZ1bGxQYXRoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGNyZWF0ZURpcmVjdG9yeShkaXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZnVsbFBhdGggPSB0aGlzLnJlc29sdmVQYXRoKGRpclBhdGgpO1xyXG4gICAgICBhd2FpdCBmcy5lbnN1cmVEaXIoZnVsbFBhdGgpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBwYXRoOiBmdWxsUGF0aCB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVzb2x2ZVBhdGgoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAvLyBIYW5kbGUgYWJzb2x1dGUgcGF0aHNcclxuICAgIGlmIChwYXRoLmlzQWJzb2x1dGUoZmlsZVBhdGgpKSB7XHJcbiAgICAgIHJldHVybiBmaWxlUGF0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgc2hhcmVkIHBhdGhzXHJcbiAgICBpZiAodGhpcy5pc1NoYXJlZFBhdGgoZmlsZVBhdGgpICYmIHRoaXMuc2hhcmVkRHJpdmVQYXRoKSB7XHJcbiAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5zaGFyZWREcml2ZVBhdGgsICdnLWFzc2V0LWZvcmdlJywgZmlsZVBhdGgucmVwbGFjZSgnc2hhcmVkLycsICcnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIGxvY2FsIHBhdGhzXHJcbiAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMudXNlckRhdGFQYXRoLCBmaWxlUGF0aCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzU2hhcmVkUGF0aChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gZmlsZVBhdGguc3RhcnRzV2l0aCgnc2hhcmVkLycpIHx8IGZpbGVQYXRoLmluY2x1ZGVzKCcvc2hhcmVkLycpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRMb2NhbEZhbGxiYWNrUGF0aChmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UoJ3NoYXJlZC8nLCAnbG9jYWwtZmFsbGJhY2svJyk7XHJcbiAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMudXNlckRhdGFQYXRoLCByZWxhdGl2ZVBhdGgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0U2hhcmVkRHJpdmVTdGF0dXMoKTogeyBhdmFpbGFibGU6IGJvb2xlYW47IHBhdGg6IHN0cmluZyB8IG51bGwgfSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBhdmFpbGFibGU6IHRoaXMuc2hhcmVkRHJpdmVQYXRoICE9PSBudWxsLFxyXG4gICAgICBwYXRoOiB0aGlzLnNoYXJlZERyaXZlUGF0aFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGdldFVzZXJEYXRhUGF0aCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMudXNlckRhdGFQYXRoO1xyXG4gIH1cclxufSIsImltcG9ydCB7IEJyb3dzZXJXaW5kb3csIHNjcmVlbiB9IGZyb20gJ2VsZWN0cm9uJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgU2VjdXJpdHlDb25maWcgfSBmcm9tICcuLi9jb25maWcvc2VjdXJpdHknO1xyXG5cclxuZXhwb3J0IGNsYXNzIFdpbmRvd01hbmFnZXIge1xyXG4gIHByaXZhdGUgd2luZG93czogTWFwPHN0cmluZywgQnJvd3NlcldpbmRvdz4gPSBuZXcgTWFwKCk7XHJcblxyXG4gIGNyZWF0ZU1haW5XaW5kb3coKTogQnJvd3NlcldpbmRvdyB7XHJcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHNjcmVlbi5nZXRQcmltYXJ5RGlzcGxheSgpLndvcmtBcmVhU2l6ZTtcclxuICAgIFxyXG4gICAgY29uc3QgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcclxuICAgICAgd2lkdGg6IE1hdGgubWluKDE0MDAsIHdpZHRoICogMC45KSxcclxuICAgICAgaGVpZ2h0OiBNYXRoLm1pbig5MDAsIGhlaWdodCAqIDAuOSksXHJcbiAgICAgIG1pbldpZHRoOiAxMjAwLFxyXG4gICAgICBtaW5IZWlnaHQ6IDgwMCxcclxuICAgICAgd2ViUHJlZmVyZW5jZXM6IHtcclxuICAgICAgICAuLi5TZWN1cml0eUNvbmZpZy53ZWJTZWN1cml0eSxcclxuICAgICAgICBwcmVsb2FkOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi9wcmVsb2FkLmpzJyksXHJcbiAgICAgICAgLy8g6aKd5aSW55qE5a6J5YWo6K6+572uXHJcbiAgICAgICAgYmFja2dyb3VuZFRocm90dGxpbmc6IGZhbHNlLCAvLyDpmLLmraLlkI7lj7DoioLmtYHlvbHlk43mgKfog71cclxuICAgICAgICBkaXNhYmxlRGlhbG9nczogZmFsc2UsIC8vIOWFgeiuuOWvueivneahhu+8iOeUqOS6jumUmeivr+aKpeWRiu+8iVxyXG4gICAgICAgIHNhZmVEaWFsb2dzOiB0cnVlLCAvLyDlkK/nlKjlronlhajlr7nor53moYZcclxuICAgICAgICBzYWZlRGlhbG9nc01lc3NhZ2U6ICdHLUFzc2V0LUZvcmdl5qOA5rWL5Yiw5LiN5a6J5YWo55qE5a+56K+d5qGG5bCd6K+VJywgLy8g5a6J5YWo5a+56K+d5qGG5raI5oGvXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpdGxlQmFyU3R5bGU6IHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nID8gJ2hpZGRlbkluc2V0JyA6ICdoaWRkZW4nLFxyXG4gICAgICBmcmFtZTogZmFsc2UsIC8vIOmakOiXj+ezu+e7n+eql+WPo+ahhuaetu+8jOS9v+eUqOiHquWumuS5ieagh+mimOagj1xyXG4gICAgICBzaG93OiBmYWxzZSwgLy8gRG9uJ3Qgc2hvdyB1bnRpbCByZWFkeVxyXG4gICAgICBpY29uOiBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInIFxyXG4gICAgICAgID8gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2Fzc2V0cy9pY29uLmljbycpXHJcbiAgICAgICAgOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vYXNzZXRzL2ljb24ucG5nJyksXHJcbiAgICAgIC8vIOmineWklueahOeql+WPo+WuieWFqOiuvue9rlxyXG4gICAgICB0cmFuc3BhcmVudDogZmFsc2UsIC8vIOS4jeWFgeiuuOmAj+aYjueql+WPo1xyXG4gICAgICB0aGlja0ZyYW1lOiB0cnVlLCAvLyDlhYHorrjljprmoYbmnrbosIPmlbTlpKflsI9cclxuICAgICAgYWNjZXB0Rmlyc3RNb3VzZTogZmFsc2UsIC8vIOaPkOmrmOWuieWFqOaAp1xyXG4gICAgICBkaXNhYmxlQXV0b0hpZGVDdXJzb3I6IGZhbHNlLCAvLyDlhYHorrjlhYnmoIfoh6rliqjpmpDol49cclxuICAgICAgZW5hYmxlTGFyZ2VyVGhhblNjcmVlbjogZmFsc2UsIC8vIOS4jeWFgeiuuOeql+WPo+Wkp+S6juWxj+W5lVxyXG4gICAgICBmdWxsc2NyZWVuOiBmYWxzZSwgLy8g6buY6K6k5LiN5YWo5bGPXHJcbiAgICAgIGZ1bGxzY3JlZW5hYmxlOiB0cnVlLCAvLyDlhYHorrjlhajlsY9cclxuICAgICAgaGFzU2hhZG93OiB0cnVlLCAvLyDnqpflj6PpmLTlvbFcclxuICAgICAgbWF4aW1pemFibGU6IHRydWUsIC8vIOWFgeiuuOacgOWkp+WMllxyXG4gICAgICBtaW5pbWl6YWJsZTogdHJ1ZSwgLy8g5YWB6K645pyA5bCP5YyWXHJcbiAgICAgIG1vdmFibGU6IHRydWUsIC8vIOWFgeiuuOenu+WKqFxyXG4gICAgICByZXNpemFibGU6IHRydWUsIC8vIOWFgeiuuOiwg+aVtOWkp+Wwj1xyXG4gICAgICBza2lwVGFza2JhcjogZmFsc2UsIC8vIOaYvuekuuWcqOS7u+WKoeagj1xyXG4gICAgICB1c2VDb250ZW50U2l6ZTogZmFsc2UsIC8vIOS9v+eUqOeql+WPo+i+ueeVjOiuoeeul+Wkp+Wwj1xyXG4gICAgICAvLyB3ZWJTZWN1cml0eSDpgInpobnlupTor6XlnKggd2ViUHJlZmVyZW5jZXMg5Lit6K6+572u77yM6L+Z6YeM56e76Zmk6YeN5aSN6K6+572uXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTaG93IHdpbmRvdyB3aGVuIHJlYWR5IHRvIHByZXZlbnQgdmlzdWFsIGZsYXNoXHJcbiAgICBtYWluV2luZG93Lm9uY2UoJ3JlYWR5LXRvLXNob3cnLCAoKSA9PiB7XHJcbiAgICAgIG1haW5XaW5kb3cuc2hvdygpO1xyXG4gICAgICBcclxuICAgICAgLy8gQ2VudGVyIHRoZSB3aW5kb3dcclxuICAgICAgbWFpbldpbmRvdy5jZW50ZXIoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSB3aW5kb3cgc3RhdGUgY2hhbmdlc1xyXG4gICAgbWFpbldpbmRvdy5vbignbWF4aW1pemUnLCAoKSA9PiB7XHJcbiAgICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMuc2VuZCgnd2luZG93Om1heGltaXplZCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbWFpbldpbmRvdy5vbigndW5tYXhpbWl6ZScsICgpID0+IHtcclxuICAgICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5zZW5kKCd3aW5kb3c6dW5tYXhpbWl6ZWQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG1haW5XaW5kb3cub24oJ2VudGVyLWZ1bGwtc2NyZWVuJywgKCkgPT4ge1xyXG4gICAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLnNlbmQoJ3dpbmRvdzplbnRlci1mdWxsLXNjcmVlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbWFpbldpbmRvdy5vbignbGVhdmUtZnVsbC1zY3JlZW4nLCAoKSA9PiB7XHJcbiAgICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMuc2VuZCgnd2luZG93OmxlYXZlLWZ1bGwtc2NyZWVuJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTdG9yZSB3aW5kb3cgcmVmZXJlbmNlXHJcbiAgICB0aGlzLndpbmRvd3Muc2V0KCdtYWluJywgbWFpbldpbmRvdyk7XHJcblxyXG4gICAgcmV0dXJuIG1haW5XaW5kb3c7XHJcbiAgfVxyXG5cclxuICBnZXRXaW5kb3cod2luZG93SWQ6IHN0cmluZyk6IEJyb3dzZXJXaW5kb3cgfCB1bmRlZmluZWQge1xyXG4gICAgcmV0dXJuIHRoaXMud2luZG93cy5nZXQod2luZG93SWQpO1xyXG4gIH1cclxuXHJcbiAgY2xvc2VXaW5kb3cod2luZG93SWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc3Qgd2luZG93ID0gdGhpcy53aW5kb3dzLmdldCh3aW5kb3dJZCk7XHJcbiAgICBpZiAod2luZG93ICYmICF3aW5kb3cuaXNEZXN0cm95ZWQoKSkge1xyXG4gICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgdGhpcy53aW5kb3dzLmRlbGV0ZSh3aW5kb3dJZCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbG9zZUFsbFdpbmRvd3MoKTogdm9pZCB7XHJcbiAgICB0aGlzLndpbmRvd3MuZm9yRWFjaCgod2luZG93LCBfd2luZG93SWQpID0+IHtcclxuICAgICAgaWYgKCF3aW5kb3cuaXNEZXN0cm95ZWQoKSkge1xyXG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRoaXMud2luZG93cy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgZm9jdXNXaW5kb3cod2luZG93SWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc3Qgd2luZG93ID0gdGhpcy53aW5kb3dzLmdldCh3aW5kb3dJZCk7XHJcbiAgICBpZiAod2luZG93ICYmICF3aW5kb3cuaXNEZXN0cm95ZWQoKSkge1xyXG4gICAgICBpZiAod2luZG93LmlzTWluaW1pemVkKCkpIHtcclxuICAgICAgICB3aW5kb3cucmVzdG9yZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHdpbmRvdy5mb2N1cygpO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIi8qKlxyXG4gKiDlupTnlKjnqIvluo/ml6Xlv5flt6XlhbdcclxuICog5o+Q5L6b57uf5LiA55qE5pel5b+X6K6w5b2V5o6l5Y+jXHJcbiAqL1xyXG5cclxuZXhwb3J0IGVudW0gTG9nTGV2ZWwge1xyXG4gIERFQlVHID0gMCxcclxuICBJTkZPID0gMSxcclxuICBXQVJOID0gMixcclxuICBFUlJPUiA9IDNcclxufVxyXG5cclxuY2xhc3MgTG9nZ2VyIHtcclxuICBwcml2YXRlIGxvZ0xldmVsOiBMb2dMZXZlbDtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAvLyDmoLnmja7njq/looPorr7nva7ml6Xlv5fnuqfliKtcclxuICAgIHRoaXMubG9nTGV2ZWwgPSBwcm9jZXNzLmVudlsnTk9ERV9FTlYnXSA9PT0gJ2RldmVsb3BtZW50JyA/IExvZ0xldmVsLkRFQlVHIDogTG9nTGV2ZWwuSU5GTztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvdWxkTG9nKGxldmVsOiBMb2dMZXZlbCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGxldmVsID49IHRoaXMubG9nTGV2ZWw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZvcm1hdE1lc3NhZ2UobGV2ZWw6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG4gICAgY29uc3QgZm9ybWF0dGVkTWVzc2FnZSA9IGBbJHt0aW1lc3RhbXB9XSBbJHtsZXZlbH1dICR7bWVzc2FnZX1gO1xyXG4gICAgXHJcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGZvcm1hdHRlZE1lc3NhZ2UsIC4uLmFyZ3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5sb2coZm9ybWF0dGVkTWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5zaG91bGRMb2coTG9nTGV2ZWwuREVCVUcpKSB7XHJcbiAgICAgIHRoaXMuZm9ybWF0TWVzc2FnZSgnREVCVUcnLCBtZXNzYWdlLCAuLi5hcmdzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGluZm8obWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuc2hvdWxkTG9nKExvZ0xldmVsLklORk8pKSB7XHJcbiAgICAgIHRoaXMuZm9ybWF0TWVzc2FnZSgnSU5GTycsIG1lc3NhZ2UsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5zaG91bGRMb2coTG9nTGV2ZWwuV0FSTikpIHtcclxuICAgICAgdGhpcy5mb3JtYXRNZXNzYWdlKCdXQVJOJywgbWVzc2FnZSwgLi4uYXJncyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5zaG91bGRMb2coTG9nTGV2ZWwuRVJST1IpKSB7XHJcbiAgICAgIHRoaXMuZm9ybWF0TWVzc2FnZSgnRVJST1InLCBtZXNzYWdlLCAuLi5hcmdzKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIOWvvOWHuuWNleS+i+WunuS+i1xyXG5leHBvcnQgY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcigpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImVsZWN0cm9uXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZzLWV4dHJhXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIEdsb2JhbCBwb2x5ZmlsbCBmb3IgRWxlY3Ryb24gbWFpbiBwcm9jZXNzXHJcbmlmICh0eXBlb2YgZ2xvYmFsID09PSAndW5kZWZpbmVkJykge1xyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1nbG9iYWwtYXNzaWduXHJcbiAgKGdsb2JhbCBhcyB0eXBlb2YgZ2xvYmFsVGhpcykgPSBnbG9iYWxUaGlzO1xyXG59XHJcblxyXG5pbXBvcnQgeyBhcHAsIEJyb3dzZXJXaW5kb3csIE1lbnUgfSBmcm9tICdlbGVjdHJvbic7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IFdpbmRvd01hbmFnZXIgfSBmcm9tICcuL21hbmFnZXJzL1dpbmRvd01hbmFnZXInO1xyXG5pbXBvcnQgeyBTZWN1cml0eUNvbmZpZyB9IGZyb20gJy4vY29uZmlnL3NlY3VyaXR5JztcclxuaW1wb3J0IHsgSXBjSGFuZGxlcnMgfSBmcm9tICcuL2hhbmRsZXJzL2lwY0hhbmRsZXJzJztcclxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi91dGlscy9sb2dnZXInO1xyXG5cclxuY2xhc3MgQXBwbGljYXRpb24ge1xyXG4gIHByaXZhdGUgbWFpbldpbmRvdzogQnJvd3NlcldpbmRvdyB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgd2luZG93TWFuYWdlcjogV2luZG93TWFuYWdlcjtcclxuICBwcml2YXRlIGlwY0hhbmRsZXJzOiBJcGNIYW5kbGVycztcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLndpbmRvd01hbmFnZXIgPSBuZXcgV2luZG93TWFuYWdlcigpO1xyXG4gICAgdGhpcy5pcGNIYW5kbGVycyA9IG5ldyBJcGNIYW5kbGVycygpO1xyXG4gICAgdGhpcy5pbml0aWFsaXplQXBwKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVBcHAoKTogdm9pZCB7XHJcbiAgICAvLyBIYW5kbGUgYXBwIHJlYWR5XHJcbiAgICBhcHAud2hlblJlYWR5KCkudGhlbigoKSA9PiB7XHJcbiAgICAgIHRoaXMuY3JlYXRlTWFpbldpbmRvdygpO1xyXG4gICAgICB0aGlzLnNldHVwSXBjSGFuZGxlcnMoKTtcclxuICAgICAgdGhpcy5zZXR1cE1lbnUoKTtcclxuXHJcbiAgICAgIGFwcC5vbignYWN0aXZhdGUnLCAoKSA9PiB7XHJcbiAgICAgICAgaWYgKEJyb3dzZXJXaW5kb3cuZ2V0QWxsV2luZG93cygpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVNYWluV2luZG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSBhcHAgd2luZG93IGNsb3NlZFxyXG4gICAgYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy5jbGVhbnVwKCk7XHJcbiAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnZGFyd2luJykge1xyXG4gICAgICAgIGFwcC5xdWl0KCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhhbmRsZSBhcHAgYmVmb3JlIHF1aXRcclxuICAgIGFwcC5vbignYmVmb3JlLXF1aXQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2xlYW51cCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2VjdXJpdHk6IFByZXZlbnQgbmV3IHdpbmRvdyBjcmVhdGlvbiBhbmQgYWRkIGNvbXByZWhlbnNpdmUgc2VjdXJpdHkgaGVhZGVyc1xyXG4gICAgYXBwLm9uKCd3ZWItY29udGVudHMtY3JlYXRlZCcsIChfZXZlbnQsIGNvbnRlbnRzKSA9PiB7XHJcbiAgICAgIC8vIOmYsuatouWIm+W7uuaWsOeql+WPo1xyXG4gICAgICBjb250ZW50cy5zZXRXaW5kb3dPcGVuSGFuZGxlcigoeyB1cmwgfTogeyB1cmw6IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgICAgbG9nZ2VyLndhcm4oJ1dpbmRvdyBvcGVuIGF0dGVtcHQgYmxvY2tlZDonLCB1cmwpO1xyXG4gICAgICAgIHJldHVybiB7IGFjdGlvbjogJ2RlbnknIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8g6Ziy5q2i5a+86Iiq5Yiw5aSW6YOoVVJMXHJcbiAgICAgIGNvbnRlbnRzLm9uKCd3aWxsLW5hdmlnYXRlJywgKGV2ZW50OiBFbGVjdHJvbi5FdmVudCwgbmF2aWdhdGlvblVybDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkVXJsID0gbmV3IFVSTChuYXZpZ2F0aW9uVXJsKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyDlhYHorrjlvIDlj5Hnjq/looPnmoRsb2NhbGhvc3Tlr7zoiKpcclxuICAgICAgICBpZiAocHJvY2Vzcy5lbnZbJ05PREVfRU5WJ10gPT09ICdkZXZlbG9wbWVudCcpIHtcclxuICAgICAgICAgIGlmIChwYXJzZWRVcmwub3JpZ2luID09PSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyB8fCBcclxuICAgICAgICAgICAgICBwYXJzZWRVcmwub3JpZ2luID09PSAnaHR0cHM6Ly9sb2NhbGhvc3Q6MzAwMCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDpmLvmraLlhbbku5blr7zoiKpcclxuICAgICAgICBsb2dnZXIud2FybignTmF2aWdhdGlvbiBibG9ja2VkOicsIG5hdmlnYXRpb25VcmwpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8g5rOo5oSP77yabmV3LXdpbmRvd+S6i+S7tuWcqOi+g+aWsOeahEVsZWN0cm9u54mI5pys5Lit5bey6KKr5byD55SoXHJcbiAgICAgIC8vIHNldFdpbmRvd09wZW5IYW5kbGVy5bey57uP6Laz5aSf5aSE55CG5paw56qX5Y+j6Zi75q2iXHJcblxyXG4gICAgICAvLyDmt7vliqDlhajpnaLnmoTlronlhahoZWFkZXJzXHJcbiAgICAgIGNvbnRlbnRzLnNlc3Npb24ud2ViUmVxdWVzdC5vbkhlYWRlcnNSZWNlaXZlZCgoZGV0YWlscywgY2FsbGJhY2spID0+IHtcclxuICAgICAgICBjb25zdCBzZWN1cml0eUhlYWRlcnMgPSBTZWN1cml0eUNvbmZpZy5nZXRBbGxTZWN1cml0eUhlYWRlcnMoKTtcclxuICAgICAgICBcclxuICAgICAgICBjYWxsYmFjayh7XHJcbiAgICAgICAgICByZXNwb25zZUhlYWRlcnM6IHtcclxuICAgICAgICAgICAgLi4uZGV0YWlscy5yZXNwb25zZUhlYWRlcnMsXHJcbiAgICAgICAgICAgIC4uLk9iamVjdC5rZXlzKHNlY3VyaXR5SGVhZGVycykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgIGFjY1trZXldID0gW3NlY3VyaXR5SGVhZGVyc1trZXkgYXMga2V5b2YgdHlwZW9mIHNlY3VyaXR5SGVhZGVyc11dO1xyXG4gICAgICAgICAgICAgIHJldHVybiBhY2M7XHJcbiAgICAgICAgICAgIH0sIHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPilcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyDmi6bmiKrlubbpqozor4HotYTmupDliqDovb1cclxuICAgICAgY29udGVudHMuc2Vzc2lvbi53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdCgoZGV0YWlscywgY2FsbGJhY2spID0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBkZXRhaWxzLnVybDtcclxuICAgICAgICBcclxuICAgICAgICAvLyDpqozor4FVUkzlronlhajmgKdcclxuICAgICAgICBpZiAoIVNlY3VyaXR5Q29uZmlnLmlzU2FmZVVybCh1cmwpKSB7XHJcbiAgICAgICAgICBsb2dnZXIud2FybignVW5zYWZlIFVSTCBibG9ja2VkOicsIHVybCk7XHJcbiAgICAgICAgICBjYWxsYmFjayh7IGNhbmNlbDogdHJ1ZSB9KTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2FsbGJhY2soeyBjYW5jZWw6IGZhbHNlIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVNYWluV2luZG93KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tYWluV2luZG93ID0gdGhpcy53aW5kb3dNYW5hZ2VyLmNyZWF0ZU1haW5XaW5kb3coKTtcclxuICAgIFxyXG4gICAgLy8gTG9hZCB0aGUgcmVuZGVyZXJcclxuICAgIGNvbnN0IGlzRGV2ID0gcHJvY2Vzcy5lbnZbJ05PREVfRU5WJ10gPT09ICdkZXZlbG9wbWVudCc7XHJcbiAgICBcclxuICAgIC8vIOe7n+S4gOS9v+eUqOaWh+S7tuWKoOi9veaWueW8j1xyXG4gICAgY29uc3QgcmVuZGVyZXJQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3JlbmRlcmVyL2luZGV4Lmh0bWwnKTtcclxuICAgIGxvZ2dlci5pbmZvKCdMb2FkaW5nIHJlbmRlcmVyIGZyb206JywgcmVuZGVyZXJQYXRoKTtcclxuICAgIHRoaXMubWFpbldpbmRvdy5sb2FkRmlsZShyZW5kZXJlclBhdGgpO1xyXG4gICAgXHJcbiAgICBpZiAoaXNEZXYpIHtcclxuICAgICAgLy8g5byA5Y+R546v5aKD5LiL5omT5byA5byA5Y+R6ICF5bel5YW3XHJcbiAgICAgIHRoaXMubWFpbldpbmRvdy53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgd2luZG93IGNsb3NlZFxyXG4gICAgdGhpcy5tYWluV2luZG93Lm9uKCdjbG9zZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMubWFpbldpbmRvdyA9IG51bGw7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIHNldHVwSXBjSGFuZGxlcnMoKTogdm9pZCB7XHJcbiAgICAvLyDkvb/nlKjnu5/kuIDnmoRJUEPlpITnkIblmajorr7nva7miYDmnInlpITnkIbnqIvluo9cclxuICAgIHRoaXMuaXBjSGFuZGxlcnMuc2V0dXBIYW5kbGVycyh0aGlzLm1haW5XaW5kb3cpO1xyXG5cclxuICAgIGxvZ2dlci53YXJuKCdJUEMgaGFuZGxlcnMgc2V0dXAgY29tcGxldGVkJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNsZWFudXAoKTogdm9pZCB7XHJcbiAgICB0cnkge1xyXG4gICAgICBsb2dnZXIud2FybignU3RhcnRpbmcgYXBwbGljYXRpb24gY2xlYW51cC4uLicpO1xyXG4gICAgICBcclxuICAgICAgLy8g5riF55CGSVBD5aSE55CG5ZmoXHJcbiAgICAgIHRoaXMuaXBjSGFuZGxlcnMuY2xlYW51cCgpO1xyXG4gICAgICBcclxuICAgICAgLy8g5riF55CG56qX5Y+j55u45YWz6LWE5rqQXHJcbiAgICAgIGlmICh0aGlzLm1haW5XaW5kb3cgJiYgIXRoaXMubWFpbldpbmRvdy5pc0Rlc3Ryb3llZCgpKSB7XHJcbiAgICAgICAgdGhpcy5tYWluV2luZG93LnJlbW92ZUFsbExpc3RlbmVycygpO1xyXG4gICAgICAgIHRoaXMubWFpbldpbmRvdyA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGxvZ2dlci53YXJuKCdBcHBsaWNhdGlvbiBjbGVhbnVwIGNvbXBsZXRlZCcpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgbG9nZ2VyLndhcm4oJ0Vycm9yIGR1cmluZyBjbGVhbnVwOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0dXBNZW51KCk6IHZvaWQge1xyXG4gICAgY29uc3QgdGVtcGxhdGU6IEVsZWN0cm9uLk1lbnVJdGVtQ29uc3RydWN0b3JPcHRpb25zW10gPSBbXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogJ+aWh+S7ticsXHJcbiAgICAgICAgc3VibWVudTogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+aWsOW7uumhueebricsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK04nLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTpuZXctcHJvamVjdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+aJk+W8gOmhueebricsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK08nLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTpvcGVuLXByb2plY3QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICfkv53lrZjpobnnm64nLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtTJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ21lbnU6c2F2ZS1wcm9qZWN0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7IHR5cGU6ICdzZXBhcmF0b3InIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn5a+85Ye6JyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrRScsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYWluV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCdtZW51OmV4cG9ydCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+mAgOWHuicsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJyA/ICdDbWQrUScgOiAnQ3RybCtRJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICBhcHAucXVpdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWw6ICfnvJbovpEnLFxyXG4gICAgICAgIHN1Ym1lbnU6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICfmkqTplIAnLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtaJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ21lbnU6dW5kbycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+mHjeWBmicsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK1NoaWZ0K1onLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTpyZWRvJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7IHR5cGU6ICdzZXBhcmF0b3InIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn5Ymq5YiHJyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrWCcsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYWluV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCdtZW51OmN1dCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+WkjeWIticsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK0MnLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTpjb3B5Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn57KY6LS0JyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrVicsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYWluV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCdtZW51OnBhc3RlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogJ+inhuWbvicsXHJcbiAgICAgICAgc3VibWVudTogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+aUvuWkpycsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK1BsdXMnLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTp6b29tLWluJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn57yp5bCPJyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrLScsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYWluV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCdtZW51Onpvb20tb3V0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn6YCC5bqU5bGP5bmVJyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrMCcsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYWluV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCdtZW51OmZpdC10by1zY3JlZW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcicgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICfliIfmjaLlvIDlj5HogIXlt6XlhbcnLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyAnQ21kK09wdGlvbitJJyA6ICdDdHJsK1NoaWZ0K0knLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMudG9nZ2xlRGV2VG9vbHMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCBtZW51ID0gTWVudS5idWlsZEZyb21UZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICBNZW51LnNldEFwcGxpY2F0aW9uTWVudShtZW51KTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEluaXRpYWxpemUgdGhlIGFwcGxpY2F0aW9uXHJcbm5ldyBBcHBsaWNhdGlvbigpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==