/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main/main.ts":
/*!**************************!*\
  !*** ./src/main/main.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _managers_FileSystemManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./managers/FileSystemManager */ \"./src/main/managers/FileSystemManager.ts\");\n/* harmony import */ var _managers_WindowManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./managers/WindowManager */ \"./src/main/managers/WindowManager.ts\");\n\n\n// import * as fs from 'fs-extra'; // 暂时不需要，后续会用到\n\n\nclass Application {\n    constructor() {\n        this.mainWindow = null;\n        this.fileSystemManager = new _managers_FileSystemManager__WEBPACK_IMPORTED_MODULE_2__.FileSystemManager();\n        this.windowManager = new _managers_WindowManager__WEBPACK_IMPORTED_MODULE_3__.WindowManager();\n        this.initializeApp();\n    }\n    initializeApp() {\n        // Handle app ready\n        electron__WEBPACK_IMPORTED_MODULE_0__.app.whenReady().then(() => {\n            this.createMainWindow();\n            this.setupIpcHandlers();\n            this.setupMenu();\n            electron__WEBPACK_IMPORTED_MODULE_0__.app.on('activate', () => {\n                if (electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow.getAllWindows().length === 0) {\n                    this.createMainWindow();\n                }\n            });\n        });\n        // Handle app window closed\n        electron__WEBPACK_IMPORTED_MODULE_0__.app.on('window-all-closed', () => {\n            if (process.platform !== 'darwin') {\n                electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();\n            }\n        });\n        // Security: Prevent new window creation\n        electron__WEBPACK_IMPORTED_MODULE_0__.app.on('web-contents-created', (event, contents) => {\n            contents.setWindowOpenHandler(({ url: _url }) => {\n                // Prevent opening new windows\n                return { action: 'deny' };\n            });\n        });\n    }\n    createMainWindow() {\n        this.mainWindow = this.windowManager.createMainWindow();\n        // Load the renderer\n        const isDev = \"development\" === 'development';\n        if (isDev) {\n            this.mainWindow.loadURL('http://localhost:3000');\n            this.mainWindow.webContents.openDevTools();\n        }\n        else {\n            this.mainWindow.loadFile(path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, '../renderer/index.html'));\n        }\n        // Handle window closed\n        this.mainWindow.on('closed', () => {\n            this.mainWindow = null;\n        });\n    }\n    setupIpcHandlers() {\n        // File system operations\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('fs:readFile', async (event, filePath) => {\n            return await this.fileSystemManager.readFile(filePath);\n        });\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('fs:writeFile', async (event, filePath, data) => {\n            return await this.fileSystemManager.writeFile(filePath, data);\n        });\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('fs:exists', async (event, filePath) => {\n            return await this.fileSystemManager.exists(filePath);\n        });\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('fs:createDirectory', async (event, dirPath) => {\n            return await this.fileSystemManager.createDirectory(dirPath);\n        });\n        // Window operations\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('window:minimize', () => {\n            this.mainWindow?.minimize();\n        });\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('window:maximize', () => {\n            if (this.mainWindow?.isMaximized()) {\n                this.mainWindow.unmaximize();\n            }\n            else {\n                this.mainWindow?.maximize();\n            }\n        });\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('window:close', () => {\n            this.mainWindow?.close();\n        });\n        // App info\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('app:getVersion', () => {\n            return electron__WEBPACK_IMPORTED_MODULE_0__.app.getVersion();\n        });\n        electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('app:getPlatform', () => {\n            return process.platform;\n        });\n    }\n    setupMenu() {\n        const template = [\n            {\n                label: '文件',\n                submenu: [\n                    {\n                        label: '新建项目',\n                        accelerator: 'CmdOrCtrl+N',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:new-project');\n                        }\n                    },\n                    {\n                        label: '打开项目',\n                        accelerator: 'CmdOrCtrl+O',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:open-project');\n                        }\n                    },\n                    {\n                        label: '保存项目',\n                        accelerator: 'CmdOrCtrl+S',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:save-project');\n                        }\n                    },\n                    { type: 'separator' },\n                    {\n                        label: '导出',\n                        accelerator: 'CmdOrCtrl+E',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:export');\n                        }\n                    },\n                    { type: 'separator' },\n                    {\n                        label: '退出',\n                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',\n                        click: () => {\n                            electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();\n                        }\n                    }\n                ]\n            },\n            {\n                label: '编辑',\n                submenu: [\n                    {\n                        label: '撤销',\n                        accelerator: 'CmdOrCtrl+Z',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:undo');\n                        }\n                    },\n                    {\n                        label: '重做',\n                        accelerator: 'CmdOrCtrl+Shift+Z',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:redo');\n                        }\n                    },\n                    { type: 'separator' },\n                    {\n                        label: '剪切',\n                        accelerator: 'CmdOrCtrl+X',\n                        role: 'cut'\n                    },\n                    {\n                        label: '复制',\n                        accelerator: 'CmdOrCtrl+C',\n                        role: 'copy'\n                    },\n                    {\n                        label: '粘贴',\n                        accelerator: 'CmdOrCtrl+V',\n                        role: 'paste'\n                    }\n                ]\n            },\n            {\n                label: '视图',\n                submenu: [\n                    {\n                        label: '放大',\n                        accelerator: 'CmdOrCtrl+Plus',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:zoom-in');\n                        }\n                    },\n                    {\n                        label: '缩小',\n                        accelerator: 'CmdOrCtrl+-',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:zoom-out');\n                        }\n                    },\n                    {\n                        label: '适应屏幕',\n                        accelerator: 'CmdOrCtrl+0',\n                        click: () => {\n                            this.mainWindow?.webContents.send('menu:fit-to-screen');\n                        }\n                    },\n                    { type: 'separator' },\n                    {\n                        label: '切换开发者工具',\n                        accelerator: 'F12',\n                        click: () => {\n                            this.mainWindow?.webContents.toggleDevTools();\n                        }\n                    }\n                ]\n            }\n        ];\n        const menu = electron__WEBPACK_IMPORTED_MODULE_0__.Menu.buildFromTemplate(template);\n        electron__WEBPACK_IMPORTED_MODULE_0__.Menu.setApplicationMenu(menu);\n    }\n}\n// Initialize the application\nnew Application();\n\n\n//# sourceURL=webpack://g-asset-forge/./src/main/main.ts?\n}");

/***/ }),

/***/ "./src/main/managers/FileSystemManager.ts":
/*!************************************************!*\
  !*** ./src/main/managers/FileSystemManager.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   FileSystemManager: () => (/* binding */ FileSystemManager)\n/* harmony export */ });\n/* harmony import */ var fs_extra__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs-extra */ \"fs-extra\");\n/* harmony import */ var fs_extra__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs_extra__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nclass FileSystemManager {\n    constructor() {\n        this.userDataPath = electron__WEBPACK_IMPORTED_MODULE_2__.app.getPath('userData');\n        this.sharedDrivePath = this.detectSharedDrive();\n        this.initializeDirectories();\n    }\n    detectSharedDrive() {\n        // Try to detect shared network drives\n        // This is a simplified implementation - in production, this would be configurable\n        const possiblePaths = [\n            'Z:\\\\', // Common Windows network drive\n            '/Volumes/Shared', // macOS network volume\n            '/mnt/shared' // Linux mount point\n        ];\n        for (const drivePath of possiblePaths) {\n            try {\n                if (fs_extra__WEBPACK_IMPORTED_MODULE_0__.existsSync(drivePath)) {\n                    return drivePath;\n                }\n            }\n            catch (error) {\n                // Continue checking other paths\n            }\n        }\n        return null;\n    }\n    async initializeDirectories() {\n        try {\n            // Create local directories\n            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, 'projects'));\n            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, 'assets'));\n            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, 'templates'));\n            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, 'exports'));\n            // Create shared directories if available\n            if (this.sharedDrivePath) {\n                try {\n                    await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.sharedDrivePath, 'g-asset-forge', 'shared-assets'));\n                    await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.join(this.sharedDrivePath, 'g-asset-forge', 'shared-projects'));\n                }\n                catch (error) {\n                    console.warn('Could not create shared directories:', error);\n                }\n            }\n        }\n        catch (error) {\n            console.error('Failed to initialize directories:', error);\n        }\n    }\n    async readFile(filePath) {\n        try {\n            const fullPath = this.resolvePath(filePath);\n            const data = await fs_extra__WEBPACK_IMPORTED_MODULE_0__.readFile(fullPath, 'utf8');\n            return { success: true, data };\n        }\n        catch (error) {\n            return { success: false, error: error.message };\n        }\n    }\n    async writeFile(filePath, data) {\n        try {\n            const fullPath = this.resolvePath(filePath);\n            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(path__WEBPACK_IMPORTED_MODULE_1__.dirname(fullPath));\n            // Try shared drive first, fallback to local\n            if (this.isSharedPath(filePath) && this.sharedDrivePath) {\n                try {\n                    await fs_extra__WEBPACK_IMPORTED_MODULE_0__.writeFile(fullPath, data, 'utf8');\n                    return { success: true, path: fullPath, location: 'shared' };\n                }\n                catch (error) {\n                    // Fallback to local storage\n                    const localPath = this.getLocalFallbackPath(filePath);\n                    await fs_extra__WEBPACK_IMPORTED_MODULE_0__.writeFile(localPath, data, 'utf8');\n                    return {\n                        success: true,\n                        path: localPath,\n                        location: 'local',\n                        fallbackUsed: true,\n                        originalError: error.message\n                    };\n                }\n            }\n            else {\n                await fs_extra__WEBPACK_IMPORTED_MODULE_0__.writeFile(fullPath, data, 'utf8');\n                return { success: true, path: fullPath, location: 'local' };\n            }\n        }\n        catch (error) {\n            return { success: false, error: error.message };\n        }\n    }\n    async exists(filePath) {\n        try {\n            const fullPath = this.resolvePath(filePath);\n            return await fs_extra__WEBPACK_IMPORTED_MODULE_0__.pathExists(fullPath);\n        }\n        catch (error) {\n            return false;\n        }\n    }\n    async createDirectory(dirPath) {\n        try {\n            const fullPath = this.resolvePath(dirPath);\n            await fs_extra__WEBPACK_IMPORTED_MODULE_0__.ensureDir(fullPath);\n            return { success: true, path: fullPath };\n        }\n        catch (error) {\n            return { success: false, error: error.message };\n        }\n    }\n    resolvePath(filePath) {\n        // Handle absolute paths\n        if (path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(filePath)) {\n            return filePath;\n        }\n        // Handle shared paths\n        if (this.isSharedPath(filePath) && this.sharedDrivePath) {\n            return path__WEBPACK_IMPORTED_MODULE_1__.join(this.sharedDrivePath, 'g-asset-forge', filePath.replace('shared/', ''));\n        }\n        // Handle local paths\n        return path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, filePath);\n    }\n    isSharedPath(filePath) {\n        return filePath.startsWith('shared/') || filePath.includes('/shared/');\n    }\n    getLocalFallbackPath(filePath) {\n        const relativePath = filePath.replace('shared/', 'local-fallback/');\n        return path__WEBPACK_IMPORTED_MODULE_1__.join(this.userDataPath, relativePath);\n    }\n    getSharedDriveStatus() {\n        return {\n            available: this.sharedDrivePath !== null,\n            path: this.sharedDrivePath\n        };\n    }\n    getUserDataPath() {\n        return this.userDataPath;\n    }\n}\n\n\n//# sourceURL=webpack://g-asset-forge/./src/main/managers/FileSystemManager.ts?\n}");

/***/ }),

/***/ "./src/main/managers/WindowManager.ts":
/*!********************************************!*\
  !*** ./src/main/managers/WindowManager.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   WindowManager: () => (/* binding */ WindowManager)\n/* harmony export */ });\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n\n\nclass WindowManager {\n    constructor() {\n        this.windows = new Map();\n    }\n    createMainWindow() {\n        const { width, height } = electron__WEBPACK_IMPORTED_MODULE_0__.screen.getPrimaryDisplay().workAreaSize;\n        const mainWindow = new electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow({\n            width: Math.min(1400, width * 0.9),\n            height: Math.min(900, height * 0.9),\n            minWidth: 1200,\n            minHeight: 800,\n            webPreferences: {\n                nodeIntegration: false,\n                contextIsolation: true,\n                preload: path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, 'preload.js'),\n                webSecurity: true,\n                allowRunningInsecureContent: false\n            },\n            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',\n            show: false, // Don't show until ready\n            icon: process.platform === 'win32'\n                ? path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, '../../assets/icon.ico')\n                : path__WEBPACK_IMPORTED_MODULE_1__.join(__dirname, '../../assets/icon.png')\n        });\n        // Show window when ready to prevent visual flash\n        mainWindow.once('ready-to-show', () => {\n            mainWindow.show();\n            // Center the window\n            mainWindow.center();\n        });\n        // Handle window state changes\n        mainWindow.on('maximize', () => {\n            mainWindow.webContents.send('window:maximized');\n        });\n        mainWindow.on('unmaximize', () => {\n            mainWindow.webContents.send('window:unmaximized');\n        });\n        mainWindow.on('enter-full-screen', () => {\n            mainWindow.webContents.send('window:enter-full-screen');\n        });\n        mainWindow.on('leave-full-screen', () => {\n            mainWindow.webContents.send('window:leave-full-screen');\n        });\n        // Store window reference\n        this.windows.set('main', mainWindow);\n        return mainWindow;\n    }\n    getWindow(windowId) {\n        return this.windows.get(windowId);\n    }\n    closeWindow(windowId) {\n        const window = this.windows.get(windowId);\n        if (window && !window.isDestroyed()) {\n            window.close();\n            this.windows.delete(windowId);\n        }\n    }\n    closeAllWindows() {\n        this.windows.forEach((window, windowId) => {\n            if (!window.isDestroyed()) {\n                window.close();\n            }\n        });\n        this.windows.clear();\n    }\n    focusWindow(windowId) {\n        const window = this.windows.get(windowId);\n        if (window && !window.isDestroyed()) {\n            if (window.isMinimized()) {\n                window.restore();\n            }\n            window.focus();\n        }\n    }\n}\n\n\n//# sourceURL=webpack://g-asset-forge/./src/main/managers/WindowManager.ts?\n}");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "fs-extra":
/*!***************************!*\
  !*** external "fs-extra" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("fs-extra");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main/main.ts");
/******/ 	
/******/ })()
;