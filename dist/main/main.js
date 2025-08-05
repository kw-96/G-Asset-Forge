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
                if (this.mainWindow?.isMaximized()) {
                    this.mainWindow.unmaximize();
                }
                else {
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
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
            show: false, // Don't show until ready
            icon: process.platform === 'win32'
                ? path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, '../../assets/icon.ico')
                : path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, '../../assets/icon.png'),
            // 额外的窗口安全设置
            frame: true, // 保持窗口框架
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBLEVBQUUsZ0JBQWdCLE1BQU07QUFDeEIsVUFBVSxNQUFNO0FBQ2hCLEVBQUU7QUFDRjtBQUNBLEVBQUU7QUFDRjtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7O0FDWkE7OztHQUdHO0FBRUksTUFBTSxjQUFjLEdBQUc7SUFDNUI7OztPQUdHO0lBQ0gsR0FBRyxFQUFFO1FBQ0gsNENBQTRDO1FBQzVDLFdBQVcsRUFBRSw0YkFBNGI7UUFDemMsd0JBQXdCO1FBQ3hCLFVBQVUsRUFBRSwwT0FBME87S0FDdlA7SUFFRDs7T0FFRztJQUNILFdBQVcsRUFBRTtRQUNYLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsV0FBVyxFQUFFLElBQUk7UUFDakIsMkJBQTJCLEVBQUUsS0FBSztRQUNsQyxvQkFBb0IsRUFBRSxLQUFLO1FBQzNCLE9BQU8sRUFBRSxLQUFLO1FBQ2Qsb0JBQW9CLEVBQUUsVUFBVTtRQUNoQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE9BQU87UUFDMUIsMEJBQTBCLEVBQUUsS0FBSztRQUNqQyx1QkFBdUIsRUFBRSxLQUFLO1FBQzlCLEtBQUssRUFBRSxJQUFJLEVBQUUsaUJBQWlCO1FBQzlCLGtCQUFrQixFQUFFLEtBQUs7S0FDMUI7SUFFRDs7T0FFRztJQUNILGVBQWUsRUFBRTtRQUNmLGlCQUFpQixFQUFFLE1BQU07UUFDekIsa0JBQWtCLEVBQUUsZUFBZTtRQUNuQyx3QkFBd0IsRUFBRSxTQUFTO1FBQ25DLGlCQUFpQixFQUFFLGlDQUFpQztLQUNyRDtJQUVEOztPQUVHO0lBQ0gsYUFBYTtRQUNYLE1BQU0sYUFBYSxHQUFHLGFBQXVCLEtBQUssYUFBYSxDQUFDO1FBQ2hFLE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7SUFDcEUsQ0FBQztJQUVEOztPQUVHO0lBQ0gscUJBQXFCO1FBQ25CLE9BQU87WUFDTCx5QkFBeUIsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQy9DLEdBQUcsSUFBSSxDQUFDLGVBQWU7U0FDeEIsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsQ0FBQyxHQUFXO1FBQ25CLElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFeEUsSUFBSSxJQUF5QyxFQUFFLENBQUM7Z0JBQzlDLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLEVBQUUsQ0FBQztvQkFDdkUsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFDRCxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUM7b0JBQzNFLE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7WUFDSCxDQUFDO1lBRUQsT0FBTyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFBQyxNQUFNLENBQUM7WUFDUCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JGcUQ7QUFDVztBQVEzRCxNQUFNLFdBQVc7SUFLdEI7UUFGUSxlQUFVLEdBQXlCLElBQUksQ0FBQztRQUc5QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSwwRUFBaUIsRUFBRSxDQUFDO1FBQ2pELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRU0sYUFBYSxDQUFDLFVBQWdDO1FBQ25ELElBQUksQ0FBQztZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUU3Qix5QkFBeUI7WUFDekIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFnQixFQUFFLEVBQUU7Z0JBQ3JFLE9BQU8sTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFnQixFQUFFLElBQVksRUFBRSxFQUFFO2dCQUNwRixPQUFPLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQWdCLEVBQUUsRUFBRTtnQkFDbkUsT0FBTyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFvQixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBZSxFQUFFLEVBQUU7Z0JBQzNFLE9BQU8sTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELENBQUMsQ0FBQyxDQUFDO1lBRUgsb0JBQW9CO1lBQ3BCLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNqRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDL0IsQ0FBQztxQkFBTSxDQUFDO29CQUNOLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQUM7Z0JBQzlCLENBQUM7Z0JBQ0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUM5QyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUN6QixPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDcEQsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEtBQUssQ0FBQztZQUNqRCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ2hELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUNwQixNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2xELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQzNCLENBQUM7Z0JBQ0QsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsa0JBQWtCO1lBQ2xCLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ2hELE9BQU8seUNBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ2pELE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUM3QyxPQUFPLHlDQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQVksRUFBRSxFQUFFO2dCQUNqRSxJQUFJLENBQUM7b0JBQ0gsT0FBTyx5Q0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFXLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2hELENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILCtCQUErQjtZQUMvQixJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNqRCxPQUFPO29CQUNMLE9BQU8sRUFBRSxJQUFJO29CQUNiLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNyQixPQUFPLEVBQUUsd0NBQXdDO2lCQUNsRCxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksV0FBVyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RELE1BQU0sS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7SUFFTyxlQUFlLENBQUMsT0FBZSxFQUFFLE9BQXlDO1FBQ2hGLElBQUksQ0FBQztZQUNILGtCQUFrQjtZQUNsQixNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsR0FBRyxJQUFXLEVBQXdCLEVBQUU7Z0JBQ3BFLElBQUksQ0FBQztvQkFDSCxPQUFPO29CQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUN0QyxPQUFPOzRCQUNMLE9BQU8sRUFBRSxLQUFLOzRCQUNkLEtBQUssRUFBRSxrQ0FBa0MsT0FBTyxFQUFFO3lCQUNuRCxDQUFDO29CQUNKLENBQUM7b0JBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFFdEMsNEJBQTRCO29CQUM1QixJQUFJLE1BQU0sSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksU0FBUyxJQUFJLE1BQU0sRUFBRSxDQUFDO3dCQUNoRSxPQUFPLE1BQU0sQ0FBQztvQkFDaEIsQ0FBQztvQkFFRCxZQUFZO29CQUNaLE9BQU87d0JBQ0wsT0FBTyxFQUFFLElBQUk7d0JBQ2IsSUFBSSxFQUFFLE1BQU07cUJBQ2IsQ0FBQztnQkFDSixDQUFDO2dCQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7b0JBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsT0FBTyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ2xFLE9BQU87d0JBQ0wsT0FBTyxFQUFFLEtBQUs7d0JBQ2QsS0FBSyxFQUFFLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtxQkFDekUsQ0FBQztnQkFDSixDQUFDO1lBQ0gsQ0FBQyxDQUFDO1lBRUYsUUFBUTtZQUNSLDZDQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsMENBQTBDLE9BQU8sR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdFLENBQUM7SUFDSCxDQUFDO0lBRU8sWUFBWSxDQUFDLE9BQWUsRUFBRSxJQUFXO1FBQy9DLElBQUksQ0FBQztZQUNILFNBQVM7WUFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUM5QyxPQUFPLElBQUksQ0FBQyxDQUFDLGVBQWU7WUFDOUIsQ0FBQztZQUVELFlBQVk7WUFDWixRQUFRLE9BQU8sRUFBRSxDQUFDO2dCQUNoQixLQUFLLGFBQWEsQ0FBQztnQkFDbkIsS0FBSyxXQUFXLENBQUM7Z0JBQ2pCLEtBQUssb0JBQW9CO29CQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFL0UsS0FBSyxjQUFjO29CQUNqQixPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFL0UsS0FBSyxhQUFhO29CQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFL0U7b0JBQ0UsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsT0FBTyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakUsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0lBQ0gsQ0FBQztJQUVNLE9BQU87UUFDWixJQUFJLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFFM0MsYUFBYTtZQUNiLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUMzQyw2Q0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNqRCxDQUFDO1lBRUQsVUFBVTtZQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFdEIsU0FBUztZQUNULElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0QsQ0FBQztJQUNILENBQUM7SUFFRCxhQUFhO0lBQ04sZUFBZTtRQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFFRCxjQUFjO0lBQ1AsVUFBVSxDQUFDLE9BQWU7UUFDL0IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsY0FBYztJQUNQLFdBQVc7UUFDaEIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzTjhCO0FBQ0Y7QUFDRTtBQUV4QixNQUFNLGlCQUFpQjtJQUk1QjtRQUNFLElBQUksQ0FBQyxZQUFZLEdBQUcseUNBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU8saUJBQWlCO1FBQ3ZCLHNDQUFzQztRQUN0QyxrRkFBa0Y7UUFDbEYsTUFBTSxhQUFhLEdBQUc7WUFDcEIsTUFBTSxFQUFFLCtCQUErQjtZQUN2QyxpQkFBaUIsRUFBRSx1QkFBdUI7WUFDMUMsYUFBYSxDQUFDLG9CQUFvQjtTQUNuQyxDQUFDO1FBRUYsS0FBSyxNQUFNLFNBQVMsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUM7Z0JBQ0gsSUFBSSxnREFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7b0JBQzdCLE9BQU8sU0FBUyxDQUFDO2dCQUNuQixDQUFDO1lBQ0gsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2YsZ0NBQWdDO1lBQ2xDLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sS0FBSyxDQUFDLHFCQUFxQjtRQUNqQyxJQUFJLENBQUM7WUFDSCwyQkFBMkI7WUFDM0IsTUFBTSwrQ0FBWSxDQUFDLHNDQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sK0NBQVksQ0FBQyxzQ0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLCtDQUFZLENBQUMsc0NBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDOUQsTUFBTSwrQ0FBWSxDQUFDLHNDQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRTVELHlDQUF5QztZQUN6QyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDO29CQUNILE1BQU0sK0NBQVksQ0FBQyxzQ0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7b0JBQ3RGLE1BQU0sK0NBQVksQ0FBQyxzQ0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDMUYsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzlELENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVELENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFnQjtRQUM3QixJQUFJLENBQUM7WUFDSCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sSUFBSSxHQUFHLE1BQU0sOENBQVcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUcsS0FBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdELENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFnQixFQUFFLElBQVM7UUFDekMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxNQUFNLCtDQUFZLENBQUMseUNBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRTNDLDRDQUE0QztZQUM1QyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN4RCxJQUFJLENBQUM7b0JBQ0gsTUFBTSwrQ0FBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDO2dCQUMvRCxDQUFDO2dCQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7b0JBQ2YsNEJBQTRCO29CQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3RELE1BQU0sK0NBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUM1QyxPQUFPO3dCQUNMLE9BQU8sRUFBRSxJQUFJO3dCQUNiLElBQUksRUFBRSxTQUFTO3dCQUNmLFFBQVEsRUFBRSxPQUFPO3dCQUNqQixZQUFZLEVBQUUsSUFBSTt3QkFDbEIsYUFBYSxFQUFHLEtBQWUsQ0FBQyxPQUFPO3FCQUN4QyxDQUFDO2dCQUNKLENBQUM7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sTUFBTSwrQ0FBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQzlELENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRyxLQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0QsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQWdCO1FBQzNCLElBQUksQ0FBQztZQUNILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsT0FBTyxNQUFNLGdEQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUFlO1FBQ25DLElBQUksQ0FBQztZQUNILE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0MsTUFBTSwrQ0FBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdCLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRyxLQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0QsQ0FBQztJQUNILENBQUM7SUFFTyxXQUFXLENBQUMsUUFBZ0I7UUFDbEMsd0JBQXdCO1FBQ3hCLElBQUksNENBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQzlCLE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxzQkFBc0I7UUFDdEIsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN4RCxPQUFPLHNDQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRixDQUFDO1FBRUQscUJBQXFCO1FBQ3JCLE9BQU8sc0NBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTyxZQUFZLENBQUMsUUFBZ0I7UUFDbkMsT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFFBQWdCO1FBQzNDLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDcEUsT0FBTyxzQ0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELG9CQUFvQjtRQUNsQixPQUFPO1lBQ0wsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLEtBQUssSUFBSTtZQUN4QyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWU7U0FDM0IsQ0FBQztJQUNKLENBQUM7SUFFRCxlQUFlO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzNCLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeEpnRDtBQUNwQjtBQUN1QjtBQUU3QyxNQUFNLGFBQWE7SUFBMUI7UUFDVSxZQUFPLEdBQStCLElBQUksR0FBRyxFQUFFLENBQUM7SUF3RzFELENBQUM7SUF0R0MsZ0JBQWdCO1FBQ2QsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyw0Q0FBTSxDQUFDLGlCQUFpQixFQUFFLENBQUMsWUFBWSxDQUFDO1FBRWxFLE1BQU0sVUFBVSxHQUFHLElBQUksbURBQWEsQ0FBQztZQUNuQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLEdBQUcsQ0FBQztZQUNsQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNuQyxRQUFRLEVBQUUsSUFBSTtZQUNkLFNBQVMsRUFBRSxHQUFHO1lBQ2QsY0FBYyxFQUFFO2dCQUNkLEdBQUcsNERBQWMsQ0FBQyxXQUFXO2dCQUM3QixPQUFPLEVBQUUsc0NBQVMsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDO2dCQUM3QyxVQUFVO2dCQUNWLG9CQUFvQixFQUFFLEtBQUssRUFBRSxhQUFhO2dCQUMxQyxjQUFjLEVBQUUsS0FBSyxFQUFFLGdCQUFnQjtnQkFDdkMsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVO2dCQUM3QixrQkFBa0IsRUFBRSwyQkFBMkIsRUFBRSxVQUFVO2FBQzVEO1lBQ0QsYUFBYSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDeEUsSUFBSSxFQUFFLEtBQUssRUFBRSx5QkFBeUI7WUFDdEMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTztnQkFDaEMsQ0FBQyxDQUFDLHNDQUFTLENBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDO2dCQUMvQyxDQUFDLENBQUMsc0NBQVMsQ0FBQyxTQUFTLEVBQUUsdUJBQXVCLENBQUM7WUFDakQsWUFBWTtZQUNaLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUztZQUN0QixXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVU7WUFDOUIsVUFBVSxFQUFFLElBQUksRUFBRSxZQUFZO1lBQzlCLGdCQUFnQixFQUFFLEtBQUssRUFBRSxRQUFRO1lBQ2pDLHFCQUFxQixFQUFFLEtBQUssRUFBRSxXQUFXO1lBQ3pDLHNCQUFzQixFQUFFLEtBQUssRUFBRSxZQUFZO1lBQzNDLFVBQVUsRUFBRSxLQUFLLEVBQUUsUUFBUTtZQUMzQixjQUFjLEVBQUUsSUFBSSxFQUFFLE9BQU87WUFDN0IsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPO1lBQ3hCLFdBQVcsRUFBRSxJQUFJLEVBQUUsUUFBUTtZQUMzQixXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVE7WUFDM0IsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPO1lBQ3RCLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUztZQUMxQixXQUFXLEVBQUUsS0FBSyxFQUFFLFNBQVM7WUFDN0IsY0FBYyxFQUFFLEtBQUssRUFBRSxhQUFhO1lBQ3BDLGdEQUFnRDtTQUNqRCxDQUFDLENBQUM7UUFFSCxpREFBaUQ7UUFDakQsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVsQixvQkFBb0I7WUFDcEIsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBRUgsOEJBQThCO1FBQzlCLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtZQUM3QixVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxDQUFDO1FBRUgsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1lBQy9CLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxVQUFVLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtZQUN0QyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQyxDQUFDO1FBRUgsVUFBVSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7WUFDdEMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUMxRCxDQUFDLENBQUMsQ0FBQztRQUVILHlCQUF5QjtRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFckMsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxRQUFnQjtRQUN4QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxXQUFXLENBQUMsUUFBZ0I7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztZQUNwQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxDQUFDO0lBQ0gsQ0FBQztJQUVELGVBQWU7UUFDYixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxXQUFXLENBQUMsUUFBZ0I7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztZQUNwQyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO2dCQUN6QixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbkIsQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQixDQUFDO0lBQ0gsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7Ozs7OztBQzdHRDs7O0dBR0c7QUFFSCxJQUFZLFFBS1g7QUFMRCxXQUFZLFFBQVE7SUFDbEIseUNBQVM7SUFDVCx1Q0FBUTtJQUNSLHVDQUFRO0lBQ1IseUNBQVM7QUFDWCxDQUFDLEVBTFcsUUFBUSxLQUFSLFFBQVEsUUFLbkI7QUFFRCxNQUFNLE1BQU07SUFHVjtRQUNFLGFBQWE7UUFDYixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQXlDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQWEsQ0FBQztJQUM3RixDQUFDO0lBRU8sU0FBUyxDQUFDLEtBQWU7UUFDL0IsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUNoQyxDQUFDO0lBRU8sYUFBYSxDQUFDLEtBQWEsRUFBRSxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ2xFLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFNBQVMsTUFBTSxLQUFLLEtBQUssT0FBTyxFQUFFLENBQUM7UUFFaEUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN6QyxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNoQyxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ25DLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ2xDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQyxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ2xDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQyxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ25DLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBRUQsU0FBUztBQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7Ozs7Ozs7Ozs7OztBQzdEbkMscUM7Ozs7Ozs7Ozs7O0FDQUEscUM7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOQSw0Q0FBNEM7QUFDNUMsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztJQUNsQyw0Q0FBNEM7SUFDM0MsTUFBNEIsR0FBRyxVQUFVLENBQUM7QUFDN0MsQ0FBQztBQUVtRDtBQUN2QjtBQUM0QjtBQUNOO0FBQ0U7QUFDYjtBQUV4QyxNQUFNLFdBQVc7SUFLZjtRQUpRLGVBQVUsR0FBeUIsSUFBSSxDQUFDO1FBSzlDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxrRUFBYSxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLDhEQUFXLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVPLGFBQWE7UUFDbkIsbUJBQW1CO1FBQ25CLHlDQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUN4QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFakIseUNBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtnQkFDdEIsSUFBSSxtREFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzFCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsMkJBQTJCO1FBQzNCLHlDQUFHLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtZQUMvQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ2xDLHlDQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDYixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCx5QkFBeUI7UUFDekIseUNBQUcsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtZQUN6QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCwrRUFBK0U7UUFDL0UseUNBQUcsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDbEQsVUFBVTtZQUNWLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFtQixFQUFFLEVBQUU7Z0JBQ3pELGlEQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDO1lBRUgsYUFBYTtZQUNiLFFBQVEsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBcUIsRUFBRSxhQUFxQixFQUFFLEVBQUU7Z0JBQzVFLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUV6QyxxQkFBcUI7Z0JBQ3JCLElBQUksSUFBeUMsRUFBRSxDQUFDO29CQUM5QyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssdUJBQXVCO3dCQUM1QyxTQUFTLENBQUMsTUFBTSxLQUFLLHdCQUF3QixFQUFFLENBQUM7d0JBQ2xELE9BQU87b0JBQ1QsQ0FBQztnQkFDSCxDQUFDO2dCQUVELFNBQVM7Z0JBQ1QsaURBQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ2xELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztZQUVILHFDQUFxQztZQUNyQyxrQ0FBa0M7WUFFbEMsaUJBQWlCO1lBQ2pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUNsRSxNQUFNLGVBQWUsR0FBRyw0REFBYyxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBRS9ELFFBQVEsQ0FBQztvQkFDUCxlQUFlLEVBQUU7d0JBQ2YsR0FBRyxPQUFPLENBQUMsZUFBZTt3QkFDMUIsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTs0QkFDbEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQW1DLENBQUMsQ0FBQyxDQUFDOzRCQUNsRSxPQUFPLEdBQUcsQ0FBQzt3QkFDYixDQUFDLEVBQUUsRUFBOEIsQ0FBQztxQkFDbkM7aUJBQ0YsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxZQUFZO1lBQ1osUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUNoRSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUV4QixXQUFXO2dCQUNYLElBQUksQ0FBQyw0REFBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNuQyxpREFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDeEMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQzNCLE9BQU87Z0JBQ1QsQ0FBQztnQkFFRCxRQUFRLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGdCQUFnQjtRQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV4RCxvQkFBb0I7UUFDcEIsTUFBTSxLQUFLLEdBQUcsYUFBdUIsS0FBSyxhQUFhLENBQUM7UUFFeEQsYUFBYTtRQUNiLE1BQU0sWUFBWSxHQUFHLHNDQUFTLENBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDcEUsaURBQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdkMsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLGVBQWU7WUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRUQsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBR08sZ0JBQWdCO1FBQ3RCLHNCQUFzQjtRQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFaEQsaURBQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU8sT0FBTztRQUNiLElBQUksQ0FBQztZQUNILGlEQUFNLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFFL0MsV0FBVztZQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFM0IsV0FBVztZQUNYLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDO1lBRUQsaURBQU0sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLGlEQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUM7SUFDSCxDQUFDO0lBRU8sU0FBUztRQUNmLE1BQU0sUUFBUSxHQUEwQztZQUN0RDtnQkFDRSxLQUFLLEVBQUUsSUFBSTtnQkFDWCxPQUFPLEVBQUU7b0JBQ1A7d0JBQ0UsS0FBSyxFQUFFLE1BQU07d0JBQ2IsV0FBVyxFQUFFLGFBQWE7d0JBQzFCLEtBQUssRUFBRSxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQ3hELENBQUM7cUJBQ0Y7b0JBQ0Q7d0JBQ0UsS0FBSyxFQUFFLE1BQU07d0JBQ2IsV0FBVyxFQUFFLGFBQWE7d0JBQzFCLEtBQUssRUFBRSxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7d0JBQ3pELENBQUM7cUJBQ0Y7b0JBQ0Q7d0JBQ0UsS0FBSyxFQUFFLE1BQU07d0JBQ2IsV0FBVyxFQUFFLGFBQWE7d0JBQzFCLEtBQUssRUFBRSxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7d0JBQ3pELENBQUM7cUJBQ0Y7b0JBQ0QsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO29CQUNyQjt3QkFDRSxLQUFLLEVBQUUsSUFBSTt3QkFDWCxXQUFXLEVBQUUsYUFBYTt3QkFDMUIsS0FBSyxFQUFFLEdBQUcsRUFBRTs0QkFDVixJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBQ25ELENBQUM7cUJBQ0Y7b0JBQ0QsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO29CQUNyQjt3QkFDRSxLQUFLLEVBQUUsSUFBSTt3QkFDWCxXQUFXLEVBQUUsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUTt3QkFDL0QsS0FBSyxFQUFFLEdBQUcsRUFBRTs0QkFDVix5Q0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNiLENBQUM7cUJBQ0Y7aUJBQ0Y7YUFDRjtZQUNEO2dCQUNFLEtBQUssRUFBRSxJQUFJO2dCQUNYLE9BQU8sRUFBRTtvQkFDUDt3QkFDRSxLQUFLLEVBQUUsSUFBSTt3QkFDWCxXQUFXLEVBQUUsYUFBYTt3QkFDMUIsS0FBSyxFQUFFLEdBQUcsRUFBRTs0QkFDVixJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQ2pELENBQUM7cUJBQ0Y7b0JBQ0Q7d0JBQ0UsS0FBSyxFQUFFLElBQUk7d0JBQ1gsV0FBVyxFQUFFLG1CQUFtQjt3QkFDaEMsS0FBSyxFQUFFLEdBQUcsRUFBRTs0QkFDVixJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQ2pELENBQUM7cUJBQ0Y7b0JBQ0QsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO29CQUNyQjt3QkFDRSxLQUFLLEVBQUUsSUFBSTt3QkFDWCxXQUFXLEVBQUUsYUFBYTt3QkFDMUIsS0FBSyxFQUFFLEdBQUcsRUFBRTs0QkFDVixJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ2hELENBQUM7cUJBQ0Y7b0JBQ0Q7d0JBQ0UsS0FBSyxFQUFFLElBQUk7d0JBQ1gsV0FBVyxFQUFFLGFBQWE7d0JBQzFCLEtBQUssRUFBRSxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUNqRCxDQUFDO3FCQUNGO29CQUNEO3dCQUNFLEtBQUssRUFBRSxJQUFJO3dCQUNYLFdBQVcsRUFBRSxhQUFhO3dCQUMxQixLQUFLLEVBQUUsR0FBRyxFQUFFOzRCQUNWLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDbEQsQ0FBQztxQkFDRjtpQkFDRjthQUNGO1lBQ0Q7Z0JBQ0UsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsT0FBTyxFQUFFO29CQUNQO3dCQUNFLEtBQUssRUFBRSxJQUFJO3dCQUNYLFdBQVcsRUFBRSxnQkFBZ0I7d0JBQzdCLEtBQUssRUFBRSxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUNwRCxDQUFDO3FCQUNGO29CQUNEO3dCQUNFLEtBQUssRUFBRSxJQUFJO3dCQUNYLFdBQVcsRUFBRSxhQUFhO3dCQUMxQixLQUFLLEVBQUUsR0FBRyxFQUFFOzRCQUNWLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzt3QkFDckQsQ0FBQztxQkFDRjtvQkFDRDt3QkFDRSxLQUFLLEVBQUUsTUFBTTt3QkFDYixXQUFXLEVBQUUsYUFBYTt3QkFDMUIsS0FBSyxFQUFFLEdBQUcsRUFBRTs0QkFDVixJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQzt3QkFDMUQsQ0FBQztxQkFDRjtvQkFDRCxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7b0JBQ3JCO3dCQUNFLEtBQUssRUFBRSxTQUFTO3dCQUNoQixXQUFXLEVBQUUsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYzt3QkFDNUUsS0FBSyxFQUFFLEdBQUcsRUFBRTs0QkFDVixJQUFJLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDaEQsQ0FBQztxQkFDRjtpQkFDRjthQUNGO1NBQ0YsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFHLDBDQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsMENBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFFRCw2QkFBNkI7QUFDN0IsSUFBSSxXQUFXLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvLi9ub2RlX21vZHVsZXMvZ2xvYmFsL3dpbmRvdy5qcyIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlLy4vc3JjL21haW4vY29uZmlnL3NlY3VyaXR5LnRzIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvLi9zcmMvbWFpbi9oYW5kbGVycy9pcGNIYW5kbGVycy50cyIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlLy4vc3JjL21haW4vbWFuYWdlcnMvRmlsZVN5c3RlbU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS8uL3NyYy9tYWluL21hbmFnZXJzL1dpbmRvd01hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS8uL3NyYy9tYWluL3V0aWxzL2xvZ2dlci50cyIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJlbGVjdHJvblwiIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvZXh0ZXJuYWwgY29tbW9uanMgXCJmcy1leHRyYVwiIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcInBhdGhcIiIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2Uvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlLy4vc3JjL21haW4vbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgd2luO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIHdpbiA9IHNlbGY7XG59IGVsc2Uge1xuICAgIHdpbiA9IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbjtcbiIsIi8qKlxyXG4gKiDlupTnlKjnqIvluo/lronlhajphY3nva5cclxuICog5Z+65LqORWxlY3Ryb27mnIDmlrDlronlhajmnIDkvbPlrp7ot7VcclxuICovXHJcblxyXG5leHBvcnQgY29uc3QgU2VjdXJpdHlDb25maWcgPSB7XHJcbiAgLyoqXHJcbiAgICog5YaF5a655a6J5YWo562W55Wl6YWN572uXHJcbiAgICog6YG15b6qIEVsZWN0cm9uIOWuieWFqOaMh+WNl+WSjCBDU1Ag5pyA5L2z5a6e6Le1XHJcbiAgICovXHJcbiAgQ1NQOiB7XHJcbiAgICAvLyDlvIDlj5Hnjq/looNDU1AgLSDlhYHorrh3ZWJwYWNrLWRldi1zZXJ2ZXLng63ph43ovb3kvYbpmZDliLbliLDnibnlrprnq6/lj6NcclxuICAgIGRldmVsb3BtZW50OiBcImRlZmF1bHQtc3JjICdzZWxmJzsgc2NyaXB0LXNyYyAnc2VsZicgJ3Vuc2FmZS1ldmFsJyAndW5zYWZlLWlubGluZScgaHR0cDovL2xvY2FsaG9zdDozMDAwIHdzOi8vbG9jYWxob3N0OjMwMDA7IHN0eWxlLXNyYyAnc2VsZicgJ3Vuc2FmZS1pbmxpbmUnIGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMDsgaW1nLXNyYyAnc2VsZicgZGF0YTogYmxvYjogaHR0cDovL2xvY2FsaG9zdDozMDAwOyBmb250LXNyYyAnc2VsZicgZGF0YTogaHR0cDovL2xvY2FsaG9zdDozMDAwOyBjb25uZWN0LXNyYyAnc2VsZicgaHR0cDovL2xvY2FsaG9zdDozMDAwIHdzOi8vbG9jYWxob3N0OjMwMDAgd3NzOi8vbG9jYWxob3N0OjMwMDA7IHdvcmtlci1zcmMgJ3NlbGYnIGJsb2I6OyBmcmFtZS1zcmMgJ25vbmUnOyBvYmplY3Qtc3JjICdub25lJzsgYmFzZS11cmkgJ3NlbGYnOyBmb3JtLWFjdGlvbiAnc2VsZidcIixcclxuICAgIC8vIOeUn+S6p+eOr+Wig0NTUCAtIOaUvuWuvemZkOWItuS7peehruS/neato+W4uOi/kOihjFxyXG4gICAgcHJvZHVjdGlvbjogXCJkZWZhdWx0LXNyYyAnc2VsZic7IHNjcmlwdC1zcmMgJ3NlbGYnICd1bnNhZmUtaW5saW5lJzsgc3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZSc7IGltZy1zcmMgJ3NlbGYnIGRhdGE6IGJsb2I6OyBmb250LXNyYyAnc2VsZicgZGF0YTo7IGNvbm5lY3Qtc3JjICdzZWxmJzsgZnJhbWUtc3JjICdub25lJzsgb2JqZWN0LXNyYyAnbm9uZSc7IGJhc2UtdXJpICdzZWxmJzsgZm9ybS1hY3Rpb24gJ3NlbGYnXCJcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBXZWLlronlhajphY3nva5cclxuICAgKi9cclxuICB3ZWJTZWN1cml0eToge1xyXG4gICAgbm9kZUludGVncmF0aW9uOiBmYWxzZSxcclxuICAgIGNvbnRleHRJc29sYXRpb246IHRydWUsXHJcbiAgICB3ZWJTZWN1cml0eTogdHJ1ZSxcclxuICAgIGFsbG93UnVubmluZ0luc2VjdXJlQ29udGVudDogZmFsc2UsXHJcbiAgICBleHBlcmltZW50YWxGZWF0dXJlczogZmFsc2UsXHJcbiAgICBzYW5kYm94OiBmYWxzZSxcclxuICAgIGRpc2FibGVCbGlua0ZlYXR1cmVzOiAnQXV4Y2xpY2snLFxyXG4gICAgc3BlbGxjaGVjazogZmFsc2UsIC8vIOeugOWMlumFjee9rlxyXG4gICAgbm9kZUludGVncmF0aW9uSW5TdWJGcmFtZXM6IGZhbHNlLFxyXG4gICAgbm9kZUludGVncmF0aW9uSW5Xb3JrZXI6IGZhbHNlLFxyXG4gICAgd2ViZ2w6IHRydWUsIC8vIOWQr+eUqHdlYmds5Lul5pSv5oyB5Zu+5b2i5aSE55CGXHJcbiAgICBlbmFibGVSZW1vdGVNb2R1bGU6IGZhbHNlXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICog6aKd5aSW55qE5a6J5YWoSGVhZGVyc1xyXG4gICAqL1xyXG4gIHNlY3VyaXR5SGVhZGVyczoge1xyXG4gICAgJ1gtRnJhbWUtT3B0aW9ucyc6ICdERU5ZJyxcclxuICAgICdYLVhTUy1Qcm90ZWN0aW9uJzogJzE7IG1vZGU9YmxvY2snLFxyXG4gICAgJ1gtQ29udGVudC1UeXBlLU9wdGlvbnMnOiAnbm9zbmlmZicsXHJcbiAgICAnUmVmZXJyZXItUG9saWN5JzogJ3N0cmljdC1vcmlnaW4td2hlbi1jcm9zcy1vcmlnaW4nXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICog6I635Y+W5b2T5YmN546v5aKD55qEQ1NQ562W55WlXHJcbiAgICovXHJcbiAgZ2V0Q3VycmVudENTUCgpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgaXNEZXZlbG9wbWVudCA9IHByb2Nlc3MuZW52WydOT0RFX0VOViddID09PSAnZGV2ZWxvcG1lbnQnO1xyXG4gICAgcmV0dXJuIGlzRGV2ZWxvcG1lbnQgPyB0aGlzLkNTUC5kZXZlbG9wbWVudCA6IHRoaXMuQ1NQLnByb2R1Y3Rpb247XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICog6I635Y+W5omA5pyJ5a6J5YWoaGVhZGVyc1xyXG4gICAqL1xyXG4gIGdldEFsbFNlY3VyaXR5SGVhZGVycygpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICdDb250ZW50LVNlY3VyaXR5LVBvbGljeSc6IHRoaXMuZ2V0Q3VycmVudENTUCgpLFxyXG4gICAgICAuLi50aGlzLnNlY3VyaXR5SGVhZGVyc1xyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiDpqozor4FVUkzmmK/lkKblronlhahcclxuICAgKi9cclxuICBpc1NhZmVVcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHVybE9iaiA9IG5ldyBVUkwodXJsKTtcclxuICAgICAgY29uc3QgYWxsb3dlZFByb3RvY29scyA9IFsnaHR0cHM6JywgJ2h0dHA6JywgJ2ZpbGU6JywgJ2RhdGE6JywgJ2Jsb2I6J107XHJcbiAgICAgIFxyXG4gICAgICBpZiAocHJvY2Vzcy5lbnZbJ05PREVfRU5WJ10gPT09ICdkZXZlbG9wbWVudCcpIHtcclxuICAgICAgICBpZiAodXJsT2JqLmhvc3RuYW1lID09PSAnbG9jYWxob3N0JyB8fCB1cmxPYmouaG9zdG5hbWUgPT09ICcxMjcuMC4wLjEnKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVybC5zdGFydHNXaXRoKCdkZXZ0b29sczovLycpIHx8IHVybC5zdGFydHNXaXRoKCdjaHJvbWUtZXh0ZW5zaW9uOi8vJykpIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgcmV0dXJuIGFsbG93ZWRQcm90b2NvbHMuaW5jbHVkZXModXJsT2JqLnByb3RvY29sKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG59OyIsImltcG9ydCB7IGlwY01haW4sIGFwcCwgQnJvd3NlcldpbmRvdyB9IGZyb20gJ2VsZWN0cm9uJztcclxuaW1wb3J0IHsgRmlsZVN5c3RlbU1hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2Vycy9GaWxlU3lzdGVtTWFuYWdlcic7XHJcblxyXG5pbnRlcmZhY2UgSXBjUmVzcG9uc2U8VCA9IGFueT4ge1xyXG4gIHN1Y2Nlc3M6IGJvb2xlYW47XHJcbiAgZGF0YT86IFQ7XHJcbiAgZXJyb3I/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJcGNIYW5kbGVycyB7XHJcbiAgcHJpdmF0ZSBmaWxlU3lzdGVtTWFuYWdlcjogRmlsZVN5c3RlbU1hbmFnZXI7XHJcbiAgcHJpdmF0ZSBoYW5kbGVyczogTWFwPHN0cmluZywgKC4uLmFyZ3M6IGFueVtdKSA9PiBQcm9taXNlPGFueT4+O1xyXG4gIHByaXZhdGUgbWFpbldpbmRvdzogQnJvd3NlcldpbmRvdyB8IG51bGwgPSBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuZmlsZVN5c3RlbU1hbmFnZXIgPSBuZXcgRmlsZVN5c3RlbU1hbmFnZXIoKTtcclxuICAgIHRoaXMuaGFuZGxlcnMgPSBuZXcgTWFwKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0dXBIYW5kbGVycyhtYWluV2luZG93OiBCcm93c2VyV2luZG93IHwgbnVsbCk6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc29sZS5sb2coJ1NldHRpbmcgdXAgSVBDIGhhbmRsZXJzLi4uJyk7XHJcbiAgICAgIHRoaXMubWFpbldpbmRvdyA9IG1haW5XaW5kb3c7XHJcblxyXG4gICAgICAvLyBGaWxlIHN5c3RlbSBvcGVyYXRpb25zXHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCdmczpyZWFkRmlsZScsIGFzeW5jIChfZXZlbnQsIGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5maWxlU3lzdGVtTWFuYWdlci5yZWFkRmlsZShmaWxlUGF0aCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ2ZzOndyaXRlRmlsZScsIGFzeW5jIChfZXZlbnQsIGZpbGVQYXRoOiBzdHJpbmcsIGRhdGE6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZpbGVTeXN0ZW1NYW5hZ2VyLndyaXRlRmlsZShmaWxlUGF0aCwgZGF0YSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ2ZzOmV4aXN0cycsIGFzeW5jIChfZXZlbnQsIGZpbGVQYXRoOiBzdHJpbmcpID0+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5maWxlU3lzdGVtTWFuYWdlci5leGlzdHMoZmlsZVBhdGgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCdmczpjcmVhdGVEaXJlY3RvcnknLCBhc3luYyAoX2V2ZW50LCBkaXJQYXRoOiBzdHJpbmcpID0+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5maWxlU3lzdGVtTWFuYWdlci5jcmVhdGVEaXJlY3RvcnkoZGlyUGF0aCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gV2luZG93IG9wZXJhdGlvbnNcclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ3dpbmRvdzptaW5pbWl6ZScsIGFzeW5jICgpID0+IHtcclxuICAgICAgICB0aGlzLm1haW5XaW5kb3c/Lm1pbmltaXplKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCd3aW5kb3c6bWF4aW1pemUnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFpbldpbmRvdz8uaXNNYXhpbWl6ZWQoKSkge1xyXG4gICAgICAgICAgdGhpcy5tYWluV2luZG93LnVubWF4aW1pemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5tYWluV2luZG93Py5tYXhpbWl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ3dpbmRvdzpjbG9zZScsIGFzeW5jICgpID0+IHtcclxuICAgICAgICB0aGlzLm1haW5XaW5kb3c/LmNsb3NlKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCd3aW5kb3c6aXNNYXhpbWl6ZWQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFpbldpbmRvdz8uaXNNYXhpbWl6ZWQoKSB8fCBmYWxzZTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignd2luZG93OmdldFNpemUnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFpbldpbmRvdykge1xyXG4gICAgICAgICAgY29uc3QgW3dpZHRoLCBoZWlnaHRdID0gdGhpcy5tYWluV2luZG93LmdldFNpemUoKTtcclxuICAgICAgICAgIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEFwcCBpbmZvcm1hdGlvblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignYXBwOmdldFZlcnNpb24nLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGFwcC5nZXRWZXJzaW9uKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ2FwcDpnZXRQbGF0Zm9ybScsIGFzeW5jICgpID0+IHtcclxuICAgICAgICByZXR1cm4gcHJvY2Vzcy5wbGF0Zm9ybTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLnJlZ2lzdGVySGFuZGxlcignYXBwOmdldE5hbWUnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGFwcC5nZXROYW1lKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdGhpcy5yZWdpc3RlckhhbmRsZXIoJ2FwcDpnZXRQYXRoJywgYXN5bmMgKF9ldmVudCwgbmFtZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHJldHVybiBhcHAuZ2V0UGF0aChuYW1lIGFzIGFueSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXRoIG5hbWU6ICR7bmFtZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gSGVhbHRoIGNoZWNrIC0g55So5LqO5rWL6K+VSVBD6YCa5L+h5piv5ZCm5q2j5bi4XHJcbiAgICAgIHRoaXMucmVnaXN0ZXJIYW5kbGVyKCdpcGM6aGVhbHRoQ2hlY2snLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXHJcbiAgICAgICAgICBtZXNzYWdlOiAnSVBDIGNvbW11bmljYXRpb24gaXMgd29ya2luZyBjb3JyZWN0bHknLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc29sZS5sb2coYElQQyBoYW5kbGVycyByZWdpc3RlcmVkOiAke3RoaXMuaGFuZGxlcnMuc2l6ZX0gaGFuZGxlcnNgKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZXR1cCBJUEMgaGFuZGxlcnM6JywgZXJyb3IpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVnaXN0ZXJIYW5kbGVyKGNoYW5uZWw6IHN0cmluZywgaGFuZGxlcjogKC4uLmFyZ3M6IGFueVtdKSA9PiBQcm9taXNlPGFueT4pOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIOWMheijheWkhOeQhuWZqOS7peaPkOS+m+e7n+S4gOeahOmUmeivr+WkhOeQhlxyXG4gICAgICBjb25zdCB3cmFwcGVkSGFuZGxlciA9IGFzeW5jICguLi5hcmdzOiBhbnlbXSk6IFByb21pc2U8SXBjUmVzcG9uc2U+ID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgLy8g6aqM6K+B5Y+C5pWwXHJcbiAgICAgICAgICBpZiAoIXRoaXMudmFsaWRhdGVBcmdzKGNoYW5uZWwsIGFyZ3MpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgZXJyb3I6IGBJbnZhbGlkIGFyZ3VtZW50cyBmb3IgY2hhbm5lbDogJHtjaGFubmVsfWBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoYW5kbGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyDlpoLmnpznu5Pmnpzlt7Lnu4/mmK9JcGNSZXNwb25zZeagvOW8j++8jOebtOaOpei/lOWbnlxyXG4gICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JyAmJiAnc3VjY2VzcycgaW4gcmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIOWQpuWImeWMheijheaIkOWKn+eahOe7k+aenFxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogcmVzdWx0XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBJUEMgaGFuZGxlciBlcnJvciBmb3IgY2hhbm5lbCAke2NoYW5uZWx9OmAsIGVycm9yKTtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCdcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8g5rOo5YaM5aSE55CG5ZmoXHJcbiAgICAgIGlwY01haW4uaGFuZGxlKGNoYW5uZWwsIHdyYXBwZWRIYW5kbGVyKTtcclxuICAgICAgdGhpcy5oYW5kbGVycy5zZXQoY2hhbm5lbCwgaGFuZGxlcik7XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhgUmVnaXN0ZXJlZCBJUEMgaGFuZGxlcjogJHtjaGFubmVsfWApO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIHJlZ2lzdGVyIGhhbmRsZXIgZm9yIGNoYW5uZWwgJHtjaGFubmVsfTpgLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZhbGlkYXRlQXJncyhjaGFubmVsOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTogYm9vbGVhbiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyDln7rmnKzlj4LmlbDpqozor4FcclxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpIHx8IGFyZ3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIOafkOS6m+WkhOeQhuWZqOWPr+iDveS4jemcgOimgeWPguaVsFxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyDnibnlrprpgJrpgZPnmoTlj4LmlbDpqozor4FcclxuICAgICAgc3dpdGNoIChjaGFubmVsKSB7XHJcbiAgICAgICAgY2FzZSAnZnM6cmVhZEZpbGUnOlxyXG4gICAgICAgIGNhc2UgJ2ZzOmV4aXN0cyc6XHJcbiAgICAgICAgY2FzZSAnZnM6Y3JlYXRlRGlyZWN0b3J5JzpcclxuICAgICAgICAgIHJldHVybiBhcmdzLmxlbmd0aCA+PSAyICYmIHR5cGVvZiBhcmdzWzFdID09PSAnc3RyaW5nJyAmJiBhcmdzWzFdLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2FzZSAnZnM6d3JpdGVGaWxlJzpcclxuICAgICAgICAgIHJldHVybiBhcmdzLmxlbmd0aCA+PSAzICYmIHR5cGVvZiBhcmdzWzFdID09PSAnc3RyaW5nJyAmJiBhcmdzWzFdLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2FzZSAnYXBwOmdldFBhdGgnOlxyXG4gICAgICAgICAgcmV0dXJuIGFyZ3MubGVuZ3RoID49IDIgJiYgdHlwZW9mIGFyZ3NbMV0gPT09ICdzdHJpbmcnICYmIGFyZ3NbMV0ubGVuZ3RoID4gMDtcclxuICAgICAgICBcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFZhbGlkYXRpb24gZXJyb3IgZm9yIGNoYW5uZWwgJHtjaGFubmVsfTpgLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBjbGVhbnVwKCk6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc29sZS5sb2coJ0NsZWFuaW5nIHVwIElQQyBoYW5kbGVycy4uLicpO1xyXG4gICAgICBcclxuICAgICAgLy8g56e76Zmk5omA5pyJ5rOo5YaM55qE5aSE55CG5ZmoXHJcbiAgICAgIGZvciAoY29uc3QgY2hhbm5lbCBvZiB0aGlzLmhhbmRsZXJzLmtleXMoKSkge1xyXG4gICAgICAgIGlwY01haW4ucmVtb3ZlSGFuZGxlcihjaGFubmVsKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgUmVtb3ZlZCBJUEMgaGFuZGxlcjogJHtjaGFubmVsfWApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyDmuIXnqbrlpITnkIblmajmmKDlsIRcclxuICAgICAgdGhpcy5oYW5kbGVycy5jbGVhcigpO1xyXG4gICAgICBcclxuICAgICAgLy8g5riF55CG5a+56LGh5byV55SoXHJcbiAgICAgIHRoaXMubWFpbldpbmRvdyA9IG51bGw7XHJcbiAgICAgIFxyXG4gICAgICBjb25zb2xlLmxvZygnSVBDIGhhbmRsZXJzIGNsZWFudXAgY29tcGxldGVkJyk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkdXJpbmcgSVBDIGhhbmRsZXJzIGNsZWFudXA6JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g6I635Y+W5rOo5YaM55qE5aSE55CG5Zmo5pWw6YePXHJcbiAgcHVibGljIGdldEhhbmRsZXJDb3VudCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlcnMuc2l6ZTtcclxuICB9XHJcblxyXG4gIC8vIOajgOafpeaMh+WumumAmumBk+aYr+WQpuW3suazqOWGjFxyXG4gIHB1YmxpYyBoYXNIYW5kbGVyKGNoYW5uZWw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlcnMuaGFzKGNoYW5uZWwpO1xyXG4gIH1cclxuXHJcbiAgLy8g6I635Y+W5omA5pyJ5rOo5YaM55qE6YCa6YGT5ZCN56ewXHJcbiAgcHVibGljIGdldENoYW5uZWxzKCk6IHN0cmluZ1tdIHtcclxuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuaGFuZGxlcnMua2V5cygpKTtcclxuICB9XHJcbn0iLCJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGFwcCB9IGZyb20gJ2VsZWN0cm9uJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlU3lzdGVtTWFuYWdlciB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB1c2VyRGF0YVBhdGg6IHN0cmluZztcclxuICBwcml2YXRlIHJlYWRvbmx5IHNoYXJlZERyaXZlUGF0aDogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnVzZXJEYXRhUGF0aCA9IGFwcC5nZXRQYXRoKCd1c2VyRGF0YScpO1xyXG4gICAgdGhpcy5zaGFyZWREcml2ZVBhdGggPSB0aGlzLmRldGVjdFNoYXJlZERyaXZlKCk7XHJcbiAgICB0aGlzLmluaXRpYWxpemVEaXJlY3RvcmllcygpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkZXRlY3RTaGFyZWREcml2ZSgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIC8vIFRyeSB0byBkZXRlY3Qgc2hhcmVkIG5ldHdvcmsgZHJpdmVzXHJcbiAgICAvLyBUaGlzIGlzIGEgc2ltcGxpZmllZCBpbXBsZW1lbnRhdGlvbiAtIGluIHByb2R1Y3Rpb24sIHRoaXMgd291bGQgYmUgY29uZmlndXJhYmxlXHJcbiAgICBjb25zdCBwb3NzaWJsZVBhdGhzID0gW1xyXG4gICAgICAnWjpcXFxcJywgLy8gQ29tbW9uIFdpbmRvd3MgbmV0d29yayBkcml2ZVxyXG4gICAgICAnL1ZvbHVtZXMvU2hhcmVkJywgLy8gbWFjT1MgbmV0d29yayB2b2x1bWVcclxuICAgICAgJy9tbnQvc2hhcmVkJyAvLyBMaW51eCBtb3VudCBwb2ludFxyXG4gICAgXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGRyaXZlUGF0aCBvZiBwb3NzaWJsZVBhdGhzKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZHJpdmVQYXRoKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGRyaXZlUGF0aDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgLy8gQ29udGludWUgY2hlY2tpbmcgb3RoZXIgcGF0aHNcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplRGlyZWN0b3JpZXMoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBDcmVhdGUgbG9jYWwgZGlyZWN0b3JpZXNcclxuICAgICAgYXdhaXQgZnMuZW5zdXJlRGlyKHBhdGguam9pbih0aGlzLnVzZXJEYXRhUGF0aCwgJ3Byb2plY3RzJykpO1xyXG4gICAgICBhd2FpdCBmcy5lbnN1cmVEaXIocGF0aC5qb2luKHRoaXMudXNlckRhdGFQYXRoLCAnYXNzZXRzJykpO1xyXG4gICAgICBhd2FpdCBmcy5lbnN1cmVEaXIocGF0aC5qb2luKHRoaXMudXNlckRhdGFQYXRoLCAndGVtcGxhdGVzJykpO1xyXG4gICAgICBhd2FpdCBmcy5lbnN1cmVEaXIocGF0aC5qb2luKHRoaXMudXNlckRhdGFQYXRoLCAnZXhwb3J0cycpKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBzaGFyZWQgZGlyZWN0b3JpZXMgaWYgYXZhaWxhYmxlXHJcbiAgICAgIGlmICh0aGlzLnNoYXJlZERyaXZlUGF0aCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBhd2FpdCBmcy5lbnN1cmVEaXIocGF0aC5qb2luKHRoaXMuc2hhcmVkRHJpdmVQYXRoLCAnZy1hc3NldC1mb3JnZScsICdzaGFyZWQtYXNzZXRzJykpO1xyXG4gICAgICAgICAgYXdhaXQgZnMuZW5zdXJlRGlyKHBhdGguam9pbih0aGlzLnNoYXJlZERyaXZlUGF0aCwgJ2ctYXNzZXQtZm9yZ2UnLCAnc2hhcmVkLXByb2plY3RzJykpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBjcmVhdGUgc2hhcmVkIGRpcmVjdG9yaWVzOicsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBpbml0aWFsaXplIGRpcmVjdG9yaWVzOicsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHJlYWRGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZnVsbFBhdGggPSB0aGlzLnJlc29sdmVQYXRoKGZpbGVQYXRoKTtcclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGZzLnJlYWRGaWxlKGZ1bGxQYXRoLCAndXRmOCcpO1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhIH07XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IChlcnJvciBhcyBFcnJvcikubWVzc2FnZSB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgd3JpdGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmdWxsUGF0aCA9IHRoaXMucmVzb2x2ZVBhdGgoZmlsZVBhdGgpO1xyXG4gICAgICBhd2FpdCBmcy5lbnN1cmVEaXIocGF0aC5kaXJuYW1lKGZ1bGxQYXRoKSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBUcnkgc2hhcmVkIGRyaXZlIGZpcnN0LCBmYWxsYmFjayB0byBsb2NhbFxyXG4gICAgICBpZiAodGhpcy5pc1NoYXJlZFBhdGgoZmlsZVBhdGgpICYmIHRoaXMuc2hhcmVkRHJpdmVQYXRoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShmdWxsUGF0aCwgZGF0YSwgJ3V0ZjgnKTtcclxuICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHBhdGg6IGZ1bGxQYXRoLCBsb2NhdGlvbjogJ3NoYXJlZCcgfTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgLy8gRmFsbGJhY2sgdG8gbG9jYWwgc3RvcmFnZVxyXG4gICAgICAgICAgY29uc3QgbG9jYWxQYXRoID0gdGhpcy5nZXRMb2NhbEZhbGxiYWNrUGF0aChmaWxlUGF0aCk7XHJcbiAgICAgICAgICBhd2FpdCBmcy53cml0ZUZpbGUobG9jYWxQYXRoLCBkYXRhLCAndXRmOCcpO1xyXG4gICAgICAgICAgcmV0dXJuIHsgXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxyXG4gICAgICAgICAgICBwYXRoOiBsb2NhbFBhdGgsIFxyXG4gICAgICAgICAgICBsb2NhdGlvbjogJ2xvY2FsJyxcclxuICAgICAgICAgICAgZmFsbGJhY2tVc2VkOiB0cnVlLFxyXG4gICAgICAgICAgICBvcmlnaW5hbEVycm9yOiAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2VcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShmdWxsUGF0aCwgZGF0YSwgJ3V0ZjgnKTtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBwYXRoOiBmdWxsUGF0aCwgbG9jYXRpb246ICdsb2NhbCcgfTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UgfTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGV4aXN0cyhmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmdWxsUGF0aCA9IHRoaXMucmVzb2x2ZVBhdGgoZmlsZVBhdGgpO1xyXG4gICAgICByZXR1cm4gYXdhaXQgZnMucGF0aEV4aXN0cyhmdWxsUGF0aCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBjcmVhdGVEaXJlY3RvcnkoZGlyUGF0aDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGZ1bGxQYXRoID0gdGhpcy5yZXNvbHZlUGF0aChkaXJQYXRoKTtcclxuICAgICAgYXdhaXQgZnMuZW5zdXJlRGlyKGZ1bGxQYXRoKTtcclxuICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgcGF0aDogZnVsbFBhdGggfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogKGVycm9yIGFzIEVycm9yKS5tZXNzYWdlIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc29sdmVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgLy8gSGFuZGxlIGFic29sdXRlIHBhdGhzXHJcbiAgICBpZiAocGF0aC5pc0Fic29sdXRlKGZpbGVQYXRoKSkge1xyXG4gICAgICByZXR1cm4gZmlsZVBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHNoYXJlZCBwYXRoc1xyXG4gICAgaWYgKHRoaXMuaXNTaGFyZWRQYXRoKGZpbGVQYXRoKSAmJiB0aGlzLnNoYXJlZERyaXZlUGF0aCkge1xyXG4gICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuc2hhcmVkRHJpdmVQYXRoLCAnZy1hc3NldC1mb3JnZScsIGZpbGVQYXRoLnJlcGxhY2UoJ3NoYXJlZC8nLCAnJykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBsb2NhbCBwYXRoc1xyXG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnVzZXJEYXRhUGF0aCwgZmlsZVBhdGgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc1NoYXJlZFBhdGgoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGZpbGVQYXRoLnN0YXJ0c1dpdGgoJ3NoYXJlZC8nKSB8fCBmaWxlUGF0aC5pbmNsdWRlcygnL3NoYXJlZC8nKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0TG9jYWxGYWxsYmFja1BhdGgoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBmaWxlUGF0aC5yZXBsYWNlKCdzaGFyZWQvJywgJ2xvY2FsLWZhbGxiYWNrLycpO1xyXG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnVzZXJEYXRhUGF0aCwgcmVsYXRpdmVQYXRoKTtcclxuICB9XHJcblxyXG4gIGdldFNoYXJlZERyaXZlU3RhdHVzKCk6IHsgYXZhaWxhYmxlOiBib29sZWFuOyBwYXRoOiBzdHJpbmcgfCBudWxsIH0ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYXZhaWxhYmxlOiB0aGlzLnNoYXJlZERyaXZlUGF0aCAhPT0gbnVsbCxcclxuICAgICAgcGF0aDogdGhpcy5zaGFyZWREcml2ZVBhdGhcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBnZXRVc2VyRGF0YVBhdGgoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLnVzZXJEYXRhUGF0aDtcclxuICB9XHJcbn0iLCJpbXBvcnQgeyBCcm93c2VyV2luZG93LCBzY3JlZW4gfSBmcm9tICdlbGVjdHJvbic7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IFNlY3VyaXR5Q29uZmlnIH0gZnJvbSAnLi4vY29uZmlnL3NlY3VyaXR5JztcclxuXHJcbmV4cG9ydCBjbGFzcyBXaW5kb3dNYW5hZ2VyIHtcclxuICBwcml2YXRlIHdpbmRvd3M6IE1hcDxzdHJpbmcsIEJyb3dzZXJXaW5kb3c+ID0gbmV3IE1hcCgpO1xyXG5cclxuICBjcmVhdGVNYWluV2luZG93KCk6IEJyb3dzZXJXaW5kb3cge1xyXG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBzY3JlZW4uZ2V0UHJpbWFyeURpc3BsYXkoKS53b3JrQXJlYVNpemU7XHJcbiAgICBcclxuICAgIGNvbnN0IG1haW5XaW5kb3cgPSBuZXcgQnJvd3NlcldpbmRvdyh7XHJcbiAgICAgIHdpZHRoOiBNYXRoLm1pbigxNDAwLCB3aWR0aCAqIDAuOSksXHJcbiAgICAgIGhlaWdodDogTWF0aC5taW4oOTAwLCBoZWlnaHQgKiAwLjkpLFxyXG4gICAgICBtaW5XaWR0aDogMTIwMCxcclxuICAgICAgbWluSGVpZ2h0OiA4MDAsXHJcbiAgICAgIHdlYlByZWZlcmVuY2VzOiB7XHJcbiAgICAgICAgLi4uU2VjdXJpdHlDb25maWcud2ViU2VjdXJpdHksXHJcbiAgICAgICAgcHJlbG9hZDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vcHJlbG9hZC5qcycpLFxyXG4gICAgICAgIC8vIOmineWklueahOWuieWFqOiuvue9rlxyXG4gICAgICAgIGJhY2tncm91bmRUaHJvdHRsaW5nOiBmYWxzZSwgLy8g6Ziy5q2i5ZCO5Y+w6IqC5rWB5b2x5ZON5oCn6IO9XHJcbiAgICAgICAgZGlzYWJsZURpYWxvZ3M6IGZhbHNlLCAvLyDlhYHorrjlr7nor53moYbvvIjnlKjkuo7plJnor6/miqXlkYrvvIlcclxuICAgICAgICBzYWZlRGlhbG9nczogdHJ1ZSwgLy8g5ZCv55So5a6J5YWo5a+56K+d5qGGXHJcbiAgICAgICAgc2FmZURpYWxvZ3NNZXNzYWdlOiAnRy1Bc3NldC1Gb3JnZeajgOa1i+WIsOS4jeWuieWFqOeahOWvueivneahhuWwneivlScsIC8vIOWuieWFqOWvueivneahhua2iOaBr1xyXG4gICAgICB9LFxyXG4gICAgICB0aXRsZUJhclN0eWxlOiBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJyA/ICdoaWRkZW5JbnNldCcgOiAnZGVmYXVsdCcsXHJcbiAgICAgIHNob3c6IGZhbHNlLCAvLyBEb24ndCBzaG93IHVudGlsIHJlYWR5XHJcbiAgICAgIGljb246IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgXHJcbiAgICAgICAgPyBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vYXNzZXRzL2ljb24uaWNvJylcclxuICAgICAgICA6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9hc3NldHMvaWNvbi5wbmcnKSxcclxuICAgICAgLy8g6aKd5aSW55qE56qX5Y+j5a6J5YWo6K6+572uXHJcbiAgICAgIGZyYW1lOiB0cnVlLCAvLyDkv53mjIHnqpflj6PmoYbmnrZcclxuICAgICAgdHJhbnNwYXJlbnQ6IGZhbHNlLCAvLyDkuI3lhYHorrjpgI/mmI7nqpflj6NcclxuICAgICAgdGhpY2tGcmFtZTogdHJ1ZSwgLy8g5YWB6K645Y6a5qGG5p626LCD5pW05aSn5bCPXHJcbiAgICAgIGFjY2VwdEZpcnN0TW91c2U6IGZhbHNlLCAvLyDmj5Dpq5jlronlhajmgKdcclxuICAgICAgZGlzYWJsZUF1dG9IaWRlQ3Vyc29yOiBmYWxzZSwgLy8g5YWB6K645YWJ5qCH6Ieq5Yqo6ZqQ6JePXHJcbiAgICAgIGVuYWJsZUxhcmdlclRoYW5TY3JlZW46IGZhbHNlLCAvLyDkuI3lhYHorrjnqpflj6PlpKfkuo7lsY/luZVcclxuICAgICAgZnVsbHNjcmVlbjogZmFsc2UsIC8vIOm7mOiupOS4jeWFqOWxj1xyXG4gICAgICBmdWxsc2NyZWVuYWJsZTogdHJ1ZSwgLy8g5YWB6K645YWo5bGPXHJcbiAgICAgIGhhc1NoYWRvdzogdHJ1ZSwgLy8g56qX5Y+j6Zi05b2xXHJcbiAgICAgIG1heGltaXphYmxlOiB0cnVlLCAvLyDlhYHorrjmnIDlpKfljJZcclxuICAgICAgbWluaW1pemFibGU6IHRydWUsIC8vIOWFgeiuuOacgOWwj+WMllxyXG4gICAgICBtb3ZhYmxlOiB0cnVlLCAvLyDlhYHorrjnp7vliqhcclxuICAgICAgcmVzaXphYmxlOiB0cnVlLCAvLyDlhYHorrjosIPmlbTlpKflsI9cclxuICAgICAgc2tpcFRhc2tiYXI6IGZhbHNlLCAvLyDmmL7npLrlnKjku7vliqHmoI9cclxuICAgICAgdXNlQ29udGVudFNpemU6IGZhbHNlLCAvLyDkvb/nlKjnqpflj6PovrnnlYzorqHnrpflpKflsI9cclxuICAgICAgLy8gd2ViU2VjdXJpdHkg6YCJ6aG55bqU6K+l5ZyoIHdlYlByZWZlcmVuY2VzIOS4reiuvue9ru+8jOi/memHjOenu+mZpOmHjeWkjeiuvue9rlxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2hvdyB3aW5kb3cgd2hlbiByZWFkeSB0byBwcmV2ZW50IHZpc3VhbCBmbGFzaFxyXG4gICAgbWFpbldpbmRvdy5vbmNlKCdyZWFkeS10by1zaG93JywgKCkgPT4ge1xyXG4gICAgICBtYWluV2luZG93LnNob3coKTtcclxuICAgICAgXHJcbiAgICAgIC8vIENlbnRlciB0aGUgd2luZG93XHJcbiAgICAgIG1haW5XaW5kb3cuY2VudGVyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgd2luZG93IHN0YXRlIGNoYW5nZXNcclxuICAgIG1haW5XaW5kb3cub24oJ21heGltaXplJywgKCkgPT4ge1xyXG4gICAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLnNlbmQoJ3dpbmRvdzptYXhpbWl6ZWQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG1haW5XaW5kb3cub24oJ3VubWF4aW1pemUnLCAoKSA9PiB7XHJcbiAgICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMuc2VuZCgnd2luZG93OnVubWF4aW1pemVkJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBtYWluV2luZG93Lm9uKCdlbnRlci1mdWxsLXNjcmVlbicsICgpID0+IHtcclxuICAgICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5zZW5kKCd3aW5kb3c6ZW50ZXItZnVsbC1zY3JlZW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG1haW5XaW5kb3cub24oJ2xlYXZlLWZ1bGwtc2NyZWVuJywgKCkgPT4ge1xyXG4gICAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLnNlbmQoJ3dpbmRvdzpsZWF2ZS1mdWxsLXNjcmVlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU3RvcmUgd2luZG93IHJlZmVyZW5jZVxyXG4gICAgdGhpcy53aW5kb3dzLnNldCgnbWFpbicsIG1haW5XaW5kb3cpO1xyXG5cclxuICAgIHJldHVybiBtYWluV2luZG93O1xyXG4gIH1cclxuXHJcbiAgZ2V0V2luZG93KHdpbmRvd0lkOiBzdHJpbmcpOiBCcm93c2VyV2luZG93IHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLndpbmRvd3MuZ2V0KHdpbmRvd0lkKTtcclxuICB9XHJcblxyXG4gIGNsb3NlV2luZG93KHdpbmRvd0lkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMud2luZG93cy5nZXQod2luZG93SWQpO1xyXG4gICAgaWYgKHdpbmRvdyAmJiAhd2luZG93LmlzRGVzdHJveWVkKCkpIHtcclxuICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICAgIHRoaXMud2luZG93cy5kZWxldGUod2luZG93SWQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xvc2VBbGxXaW5kb3dzKCk6IHZvaWQge1xyXG4gICAgdGhpcy53aW5kb3dzLmZvckVhY2goKHdpbmRvdywgX3dpbmRvd0lkKSA9PiB7XHJcbiAgICAgIGlmICghd2luZG93LmlzRGVzdHJveWVkKCkpIHtcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLndpbmRvd3MuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIGZvY3VzV2luZG93KHdpbmRvd0lkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMud2luZG93cy5nZXQod2luZG93SWQpO1xyXG4gICAgaWYgKHdpbmRvdyAmJiAhd2luZG93LmlzRGVzdHJveWVkKCkpIHtcclxuICAgICAgaWYgKHdpbmRvdy5pc01pbmltaXplZCgpKSB7XHJcbiAgICAgICAgd2luZG93LnJlc3RvcmUoKTtcclxuICAgICAgfVxyXG4gICAgICB3aW5kb3cuZm9jdXMoKTtcclxuICAgIH1cclxuICB9XHJcbn0iLCIvKipcclxuICog5bqU55So56iL5bqP5pel5b+X5bel5YW3XHJcbiAqIOaPkOS+m+e7n+S4gOeahOaXpeW/l+iusOW9leaOpeWPo1xyXG4gKi9cclxuXHJcbmV4cG9ydCBlbnVtIExvZ0xldmVsIHtcclxuICBERUJVRyA9IDAsXHJcbiAgSU5GTyA9IDEsXHJcbiAgV0FSTiA9IDIsXHJcbiAgRVJST1IgPSAzXHJcbn1cclxuXHJcbmNsYXNzIExvZ2dlciB7XHJcbiAgcHJpdmF0ZSBsb2dMZXZlbDogTG9nTGV2ZWw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgLy8g5qC55o2u546v5aKD6K6+572u5pel5b+X57qn5YirXHJcbiAgICB0aGlzLmxvZ0xldmVsID0gcHJvY2Vzcy5lbnZbJ05PREVfRU5WJ10gPT09ICdkZXZlbG9wbWVudCcgPyBMb2dMZXZlbC5ERUJVRyA6IExvZ0xldmVsLklORk87XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3VsZExvZyhsZXZlbDogTG9nTGV2ZWwpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBsZXZlbCA+PSB0aGlzLmxvZ0xldmVsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmb3JtYXRNZXNzYWdlKGxldmVsOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZywgLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcclxuICAgIGNvbnN0IGZvcm1hdHRlZE1lc3NhZ2UgPSBgWyR7dGltZXN0YW1wfV0gWyR7bGV2ZWx9XSAke21lc3NhZ2V9YDtcclxuICAgIFxyXG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zb2xlLmxvZyhmb3JtYXR0ZWRNZXNzYWdlLCAuLi5hcmdzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGZvcm1hdHRlZE1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuc2hvdWxkTG9nKExvZ0xldmVsLkRFQlVHKSkge1xyXG4gICAgICB0aGlzLmZvcm1hdE1lc3NhZ2UoJ0RFQlVHJywgbWVzc2FnZSwgLi4uYXJncyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnNob3VsZExvZyhMb2dMZXZlbC5JTkZPKSkge1xyXG4gICAgICB0aGlzLmZvcm1hdE1lc3NhZ2UoJ0lORk8nLCBtZXNzYWdlLCAuLi5hcmdzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuc2hvdWxkTG9nKExvZ0xldmVsLldBUk4pKSB7XHJcbiAgICAgIHRoaXMuZm9ybWF0TWVzc2FnZSgnV0FSTicsIG1lc3NhZ2UsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuc2hvdWxkTG9nKExvZ0xldmVsLkVSUk9SKSkge1xyXG4gICAgICB0aGlzLmZvcm1hdE1lc3NhZ2UoJ0VSUk9SJywgbWVzc2FnZSwgLi4uYXJncyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyDlr7zlh7rljZXkvovlrp7kvotcclxuZXhwb3J0IGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmcy1leHRyYVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBHbG9iYWwgcG9seWZpbGwgZm9yIEVsZWN0cm9uIG1haW4gcHJvY2Vzc1xyXG5pZiAodHlwZW9mIGdsb2JhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZ2xvYmFsLWFzc2lnblxyXG4gIChnbG9iYWwgYXMgdHlwZW9mIGdsb2JhbFRoaXMpID0gZ2xvYmFsVGhpcztcclxufVxyXG5cclxuaW1wb3J0IHsgYXBwLCBCcm93c2VyV2luZG93LCBNZW51IH0gZnJvbSAnZWxlY3Ryb24nO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBXaW5kb3dNYW5hZ2VyIH0gZnJvbSAnLi9tYW5hZ2Vycy9XaW5kb3dNYW5hZ2VyJztcclxuaW1wb3J0IHsgU2VjdXJpdHlDb25maWcgfSBmcm9tICcuL2NvbmZpZy9zZWN1cml0eSc7XHJcbmltcG9ydCB7IElwY0hhbmRsZXJzIH0gZnJvbSAnLi9oYW5kbGVycy9pcGNIYW5kbGVycyc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vdXRpbHMvbG9nZ2VyJztcclxuXHJcbmNsYXNzIEFwcGxpY2F0aW9uIHtcclxuICBwcml2YXRlIG1haW5XaW5kb3c6IEJyb3dzZXJXaW5kb3cgfCBudWxsID0gbnVsbDtcclxuICBwcml2YXRlIHdpbmRvd01hbmFnZXI6IFdpbmRvd01hbmFnZXI7XHJcbiAgcHJpdmF0ZSBpcGNIYW5kbGVyczogSXBjSGFuZGxlcnM7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy53aW5kb3dNYW5hZ2VyID0gbmV3IFdpbmRvd01hbmFnZXIoKTtcclxuICAgIHRoaXMuaXBjSGFuZGxlcnMgPSBuZXcgSXBjSGFuZGxlcnMoKTtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZUFwcCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplQXBwKCk6IHZvaWQge1xyXG4gICAgLy8gSGFuZGxlIGFwcCByZWFkeVxyXG4gICAgYXBwLndoZW5SZWFkeSgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLmNyZWF0ZU1haW5XaW5kb3coKTtcclxuICAgICAgdGhpcy5zZXR1cElwY0hhbmRsZXJzKCk7XHJcbiAgICAgIHRoaXMuc2V0dXBNZW51KCk7XHJcblxyXG4gICAgICBhcHAub24oJ2FjdGl2YXRlJywgKCkgPT4ge1xyXG4gICAgICAgIGlmIChCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHRoaXMuY3JlYXRlTWFpbldpbmRvdygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgYXBwIHdpbmRvdyBjbG9zZWRcclxuICAgIGFwcC5vbignd2luZG93LWFsbC1jbG9zZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2xlYW51cCgpO1xyXG4gICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2RhcndpbicpIHtcclxuICAgICAgICBhcHAucXVpdCgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGUgYXBwIGJlZm9yZSBxdWl0XHJcbiAgICBhcHAub24oJ2JlZm9yZS1xdWl0JywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmNsZWFudXAoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNlY3VyaXR5OiBQcmV2ZW50IG5ldyB3aW5kb3cgY3JlYXRpb24gYW5kIGFkZCBjb21wcmVoZW5zaXZlIHNlY3VyaXR5IGhlYWRlcnNcclxuICAgIGFwcC5vbignd2ViLWNvbnRlbnRzLWNyZWF0ZWQnLCAoX2V2ZW50LCBjb250ZW50cykgPT4ge1xyXG4gICAgICAvLyDpmLLmraLliJvlu7rmlrDnqpflj6NcclxuICAgICAgY29udGVudHMuc2V0V2luZG93T3BlbkhhbmRsZXIoKHsgdXJsIH06IHsgdXJsOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICAgIGxvZ2dlci53YXJuKCdXaW5kb3cgb3BlbiBhdHRlbXB0IGJsb2NrZWQ6JywgdXJsKTtcclxuICAgICAgICByZXR1cm4geyBhY3Rpb246ICdkZW55JyB9O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIOmYsuatouWvvOiIquWIsOWklumDqFVSTFxyXG4gICAgICBjb250ZW50cy5vbignd2lsbC1uYXZpZ2F0ZScsIChldmVudDogRWxlY3Ryb24uRXZlbnQsIG5hdmlnYXRpb25Vcmw6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwobmF2aWdhdGlvblVybCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5YWB6K645byA5Y+R546v5aKD55qEbG9jYWxob3N05a+86IiqXHJcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52WydOT0RFX0VOViddID09PSAnZGV2ZWxvcG1lbnQnKSB7XHJcbiAgICAgICAgICBpZiAocGFyc2VkVXJsLm9yaWdpbiA9PT0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcgfHwgXHJcbiAgICAgICAgICAgICAgcGFyc2VkVXJsLm9yaWdpbiA9PT0gJ2h0dHBzOi8vbG9jYWxob3N0OjMwMDAnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6Zi75q2i5YW25LuW5a+86IiqXHJcbiAgICAgICAgbG9nZ2VyLndhcm4oJ05hdmlnYXRpb24gYmxvY2tlZDonLCBuYXZpZ2F0aW9uVXJsKTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIOazqOaEj++8mm5ldy13aW5kb3fkuovku7blnKjovoPmlrDnmoRFbGVjdHJvbueJiOacrOS4reW3suiiq+W8g+eUqFxyXG4gICAgICAvLyBzZXRXaW5kb3dPcGVuSGFuZGxlcuW3sue7j+i2s+Wkn+WkhOeQhuaWsOeql+WPo+mYu+atolxyXG5cclxuICAgICAgLy8g5re75Yqg5YWo6Z2i55qE5a6J5YWoaGVhZGVyc1xyXG4gICAgICBjb250ZW50cy5zZXNzaW9uLndlYlJlcXVlc3Qub25IZWFkZXJzUmVjZWl2ZWQoKGRldGFpbHMsIGNhbGxiYWNrKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2VjdXJpdHlIZWFkZXJzID0gU2VjdXJpdHlDb25maWcuZ2V0QWxsU2VjdXJpdHlIZWFkZXJzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2FsbGJhY2soe1xyXG4gICAgICAgICAgcmVzcG9uc2VIZWFkZXJzOiB7XHJcbiAgICAgICAgICAgIC4uLmRldGFpbHMucmVzcG9uc2VIZWFkZXJzLFxyXG4gICAgICAgICAgICAuLi5PYmplY3Qua2V5cyhzZWN1cml0eUhlYWRlcnMpLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcclxuICAgICAgICAgICAgICBhY2Nba2V5XSA9IFtzZWN1cml0eUhlYWRlcnNba2V5IGFzIGtleW9mIHR5cGVvZiBzZWN1cml0eUhlYWRlcnNdXTtcclxuICAgICAgICAgICAgICByZXR1cm4gYWNjO1xyXG4gICAgICAgICAgICB9LCB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8g5oum5oiq5bm26aqM6K+B6LWE5rqQ5Yqg6L29XHJcbiAgICAgIGNvbnRlbnRzLnNlc3Npb24ud2ViUmVxdWVzdC5vbkJlZm9yZVJlcXVlc3QoKGRldGFpbHMsIGNhbGxiYWNrKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gZGV0YWlscy51cmw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g6aqM6K+BVVJM5a6J5YWo5oCnXHJcbiAgICAgICAgaWYgKCFTZWN1cml0eUNvbmZpZy5pc1NhZmVVcmwodXJsKSkge1xyXG4gICAgICAgICAgbG9nZ2VyLndhcm4oJ1Vuc2FmZSBVUkwgYmxvY2tlZDonLCB1cmwpO1xyXG4gICAgICAgICAgY2FsbGJhY2soeyBjYW5jZWw6IHRydWUgfSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNhbGxiYWNrKHsgY2FuY2VsOiBmYWxzZSB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlTWFpbldpbmRvdygpOiB2b2lkIHtcclxuICAgIHRoaXMubWFpbldpbmRvdyA9IHRoaXMud2luZG93TWFuYWdlci5jcmVhdGVNYWluV2luZG93KCk7XHJcbiAgICBcclxuICAgIC8vIExvYWQgdGhlIHJlbmRlcmVyXHJcbiAgICBjb25zdCBpc0RldiA9IHByb2Nlc3MuZW52WydOT0RFX0VOViddID09PSAnZGV2ZWxvcG1lbnQnO1xyXG4gICAgXHJcbiAgICAvLyDnu5/kuIDkvb/nlKjmlofku7bliqDovb3mlrnlvI9cclxuICAgIGNvbnN0IHJlbmRlcmVyUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9yZW5kZXJlci9pbmRleC5odG1sJyk7XHJcbiAgICBsb2dnZXIuaW5mbygnTG9hZGluZyByZW5kZXJlciBmcm9tOicsIHJlbmRlcmVyUGF0aCk7XHJcbiAgICB0aGlzLm1haW5XaW5kb3cubG9hZEZpbGUocmVuZGVyZXJQYXRoKTtcclxuICAgIFxyXG4gICAgaWYgKGlzRGV2KSB7XHJcbiAgICAgIC8vIOW8gOWPkeeOr+Wig+S4i+aJk+W8gOW8gOWPkeiAheW3peWFt1xyXG4gICAgICB0aGlzLm1haW5XaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHdpbmRvdyBjbG9zZWRcclxuICAgIHRoaXMubWFpbldpbmRvdy5vbignY2xvc2VkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLm1haW5XaW5kb3cgPSBudWxsO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cElwY0hhbmRsZXJzKCk6IHZvaWQge1xyXG4gICAgLy8g5L2/55So57uf5LiA55qESVBD5aSE55CG5Zmo6K6+572u5omA5pyJ5aSE55CG56iL5bqPXHJcbiAgICB0aGlzLmlwY0hhbmRsZXJzLnNldHVwSGFuZGxlcnModGhpcy5tYWluV2luZG93KTtcclxuXHJcbiAgICBsb2dnZXIud2FybignSVBDIGhhbmRsZXJzIHNldHVwIGNvbXBsZXRlZCcpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjbGVhbnVwKCk6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgbG9nZ2VyLndhcm4oJ1N0YXJ0aW5nIGFwcGxpY2F0aW9uIGNsZWFudXAuLi4nKTtcclxuICAgICAgXHJcbiAgICAgIC8vIOa4heeQhklQQ+WkhOeQhuWZqFxyXG4gICAgICB0aGlzLmlwY0hhbmRsZXJzLmNsZWFudXAoKTtcclxuICAgICAgXHJcbiAgICAgIC8vIOa4heeQhueql+WPo+ebuOWFs+i1hOa6kFxyXG4gICAgICBpZiAodGhpcy5tYWluV2luZG93ICYmICF0aGlzLm1haW5XaW5kb3cuaXNEZXN0cm95ZWQoKSkge1xyXG4gICAgICAgIHRoaXMubWFpbldpbmRvdy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcclxuICAgICAgICB0aGlzLm1haW5XaW5kb3cgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBsb2dnZXIud2FybignQXBwbGljYXRpb24gY2xlYW51cCBjb21wbGV0ZWQnKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGxvZ2dlci53YXJuKCdFcnJvciBkdXJpbmcgY2xlYW51cDonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldHVwTWVudSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHRlbXBsYXRlOiBFbGVjdHJvbi5NZW51SXRlbUNvbnN0cnVjdG9yT3B0aW9uc1tdID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWw6ICfmlofku7YnLFxyXG4gICAgICAgIHN1Ym1lbnU6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICfmlrDlu7rpobnnm64nLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtOJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ21lbnU6bmV3LXByb2plY3QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICfmiZPlvIDpobnnm64nLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtPJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ21lbnU6b3Blbi1wcm9qZWN0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn5L+d5a2Y6aG555uuJyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrUycsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYWluV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCdtZW51OnNhdmUtcHJvamVjdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+WvvOWHuicsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK0UnLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTpleHBvcnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcicgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICfpgIDlh7onLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyAnQ21kK1EnIDogJ0N0cmwrUScsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgYXBwLnF1aXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGxhYmVsOiAn57yW6L6RJyxcclxuICAgICAgICBzdWJtZW51OiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn5pKk6ZSAJyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6ICdDbWRPckN0cmwrWicsXHJcbiAgICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYWluV2luZG93Py53ZWJDb250ZW50cy5zZW5kKCdtZW51OnVuZG8nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICfph43lgZonLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtTaGlmdCtaJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ21lbnU6cmVkbycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJyB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+WJquWIhycsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK1gnLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTpjdXQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICflpI3liLYnLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtDJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ21lbnU6Y29weScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+eymOi0tCcsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsK1YnLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTpwYXN0ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWw6ICfop4blm74nLFxyXG4gICAgICAgIHN1Ym1lbnU6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICfmlL7lpKcnLFxyXG4gICAgICAgICAgICBhY2NlbGVyYXRvcjogJ0NtZE9yQ3RybCtQbHVzJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnNlbmQoJ21lbnU6em9vbS1pbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+e8qeWwjycsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsKy0nLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTp6b29tLW91dCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbDogJ+mAguW6lOWxj+W5lScsXHJcbiAgICAgICAgICAgIGFjY2VsZXJhdG9yOiAnQ21kT3JDdHJsKzAnLFxyXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMubWFpbldpbmRvdz8ud2ViQ29udGVudHMuc2VuZCgnbWVudTpmaXQtdG8tc2NyZWVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7IHR5cGU6ICdzZXBhcmF0b3InIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAn5YiH5o2i5byA5Y+R6ICF5bel5YW3JyxcclxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6IHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nID8gJ0NtZCtPcHRpb24rSScgOiAnQ3RybCtTaGlmdCtJJyxcclxuICAgICAgICAgICAgY2xpY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1haW5XaW5kb3c/LndlYkNvbnRlbnRzLnRvZ2dsZURldlRvb2xzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgbWVudSA9IE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUodGVtcGxhdGUpO1xyXG4gICAgTWVudS5zZXRBcHBsaWNhdGlvbk1lbnUobWVudSk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBJbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvblxyXG5uZXcgQXBwbGljYXRpb24oKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=