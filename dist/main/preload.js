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

/***/ "./src/main/preload.ts":
/*!*****************************!*\
  !*** ./src/main/preload.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n\n// Expose protected methods that allow the renderer process to use\n// the ipcRenderer without exposing the entire object\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('electronAPI', {\n    // File system operations\n    fs: {\n        readFile: (filePath) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('fs:readFile', filePath),\n        writeFile: (filePath, data) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('fs:writeFile', filePath, data),\n        exists: (filePath) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('fs:exists', filePath),\n        createDirectory: (dirPath) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('fs:createDirectory', dirPath)\n    },\n    // Window operations\n    window: {\n        minimize: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('window:minimize'),\n        maximize: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('window:maximize'),\n        close: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('window:close'),\n        // Window state listeners\n        onMaximized: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('window:maximized', callback),\n        onUnmaximized: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('window:unmaximized', callback),\n        onEnterFullScreen: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('window:enter-full-screen', callback),\n        onLeaveFullScreen: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('window:leave-full-screen', callback)\n    },\n    // App information\n    app: {\n        getVersion: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('app:getVersion'),\n        getPlatform: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('app:getPlatform')\n    },\n    // Menu event listeners\n    menu: {\n        onNewProject: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:new-project', callback),\n        onOpenProject: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:open-project', callback),\n        onSaveProject: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:save-project', callback),\n        onExport: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:export', callback),\n        onUndo: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:undo', callback),\n        onRedo: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:redo', callback),\n        onZoomIn: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:zoom-in', callback),\n        onZoomOut: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:zoom-out', callback),\n        onFitToScreen: (callback) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('menu:fit-to-screen', callback)\n    },\n    // Remove all listeners for cleanup\n    removeAllListeners: (channel) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.removeAllListeners(channel)\n});\n\n\n//# sourceURL=webpack://g-asset-forge/./src/main/preload.ts?\n}");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main/preload.ts");
/******/ 	
/******/ })()
;