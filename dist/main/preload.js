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

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
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
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*****************************!*\
  !*** ./src/main/preload.ts ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* provided dependency */ var global = __webpack_require__(/*! global/window */ "./node_modules/global/window.js");
// Global polyfill for Electron preload process
if (typeof global === 'undefined') {
    // eslint-disable-next-line no-global-assign
    global = globalThis;
}

// Safe wrapper for IPC calls with error handling
const safeInvoke = async (channel, ...args) => {
    try {
        const result = await electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke(channel, ...args);
        // 确保返回一致的格式
        if (result === undefined || result === null) {
            return { success: true, data: null };
        }
        // 如果结果已经是期望的格式，直接返回
        if (typeof result === 'object' && result !== null && ('success' in result || 'timestamp' in result)) {
            return result;
        }
        // 否则包装结果
        return { success: true, data: result };
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(`IPC invoke failed for ${channel}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
// Safe wrapper for event listeners
const safeOn = (channel, callback) => {
    try {
        const wrappedCallback = (_event, ...args) => {
            try {
                callback(...args);
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Event handler failed for ${channel}:`, error);
            }
        };
        electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on(channel, wrappedCallback);
        return () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.removeListener(channel, wrappedCallback);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to setup listener for ${channel}:`, error);
        return () => { };
    }
};
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('electronAPI', {
    // File system operations
    fs: {
        readFile: (filePath) => safeInvoke('fs:readFile', filePath),
        writeFile: (filePath, data) => safeInvoke('fs:writeFile', filePath, data),
        exists: (filePath) => safeInvoke('fs:exists', filePath),
        createDirectory: (dirPath) => safeInvoke('fs:createDirectory', dirPath)
    },
    // Window operations
    window: {
        minimize: () => safeInvoke('window:minimize'),
        maximize: () => safeInvoke('window:maximize'),
        close: () => safeInvoke('window:close'),
        isMaximized: () => safeInvoke('window:isMaximized'),
        getSize: () => safeInvoke('window:getSize'),
        setSize: (width, height, animate) => safeInvoke('window:setSize', width, height, animate),
        setResizable: (resizable) => safeInvoke('window:setResizable', resizable),
        center: () => safeInvoke('window:center'),
        // Window state listeners with cleanup support
        onMaximized: (callback) => safeOn('window:maximized', callback),
        onUnmaximized: (callback) => safeOn('window:unmaximized', callback),
        onEnterFullScreen: (callback) => safeOn('window:enter-full-screen', callback),
        onLeaveFullScreen: (callback) => safeOn('window:leave-full-screen', callback)
    },
    windowControl: {
        minimize: () => safeInvoke('window:minimize'),
        maximize: () => safeInvoke('window:maximize'),
        restore: () => safeInvoke('window:restore'),
        close: () => safeInvoke('window:close'),
        isMaximized: () => safeInvoke('window:isMaximized'),
        // 监听窗口最大化状态变化
        onMaximizeChange: (callback) => {
            const unsubscribeMaximized = safeOn('window:maximized', () => callback(true));
            const unsubscribeUnmaximized = safeOn('window:unmaximized', () => callback(false));
            // 返回清理函数
            return () => {
                unsubscribeMaximized();
                unsubscribeUnmaximized();
            };
        },
        // 移除最大化状态变化监听器
        removeMaximizeChangeListener: (_callback) => {
            // 这个方法主要用于向后兼容，实际清理由 onMaximizeChange 返回的函数处理
            electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.removeAllListeners('window:maximized');
            electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.removeAllListeners('window:unmaximized');
        }
    },
    // App information
    app: {
        getVersion: () => safeInvoke('app:getVersion'),
        getPlatform: () => safeInvoke('app:getPlatform'),
        getName: () => safeInvoke('app:getName'),
        getPath: (name) => safeInvoke('app:getPath', name)
    },
    // Menu event listeners with cleanup support
    menu: {
        onNewProject: (callback) => safeOn('menu:new-project', callback),
        onOpenProject: (callback) => safeOn('menu:open-project', callback),
        onSaveProject: (callback) => safeOn('menu:save-project', callback),
        onExport: (callback) => safeOn('menu:export', callback),
        onUndo: (callback) => safeOn('menu:undo', callback),
        onRedo: (callback) => safeOn('menu:redo', callback),
        onZoomIn: (callback) => safeOn('menu:zoom-in', callback),
        onZoomOut: (callback) => safeOn('menu:zoom-out', callback),
        onFitToScreen: (callback) => safeOn('menu:fit-to-screen', callback)
    },
    // Utility functions
    removeAllListeners: (channel) => {
        try {
            electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.removeAllListeners(channel);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to remove listeners for ${channel}:`, error);
        }
    },
    // Health check for communication
    healthCheck: () => safeInvoke('ipc:healthCheck')
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBLEVBQUUsZ0JBQWdCLE1BQU07QUFDeEIsVUFBVSxNQUFNO0FBQ2hCLEVBQUU7QUFDRjtBQUNBLEVBQUU7QUFDRjtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUNaQSxxQzs7Ozs7O1VDQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7Ozs7Ozs7Ozs7OztBQ05BLCtDQUErQztBQUMvQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRSxDQUFDO0lBQ2xDLDRDQUE0QztJQUMzQyxNQUE0QixHQUFHLFVBQVUsQ0FBQztBQUM3QyxDQUFDO0FBRXVFO0FBRXhFLGlEQUFpRDtBQUNqRCxNQUFNLFVBQVUsR0FBRyxLQUFLLEVBQUUsT0FBZSxFQUFFLEdBQUcsSUFBZSxFQUFFLEVBQUU7SUFDL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsTUFBTSxpREFBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMxRCxZQUFZO1FBQ1osSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUM1QyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUNELG9CQUFvQjtRQUNwQixJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLE1BQU0sSUFBSSxXQUFXLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNwRyxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBQ0QsU0FBUztRQUNULE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLHNDQUFzQztRQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixPQUFPLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxPQUFPO1lBQ0wsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZTtTQUNoRSxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMsQ0FBQztBQUVGLG1DQUFtQztBQUNuQyxNQUFNLE1BQU0sR0FBRyxDQUFDLE9BQWUsRUFBRSxRQUFzQyxFQUFFLEVBQUU7SUFDekUsSUFBSSxDQUFDO1FBQ0gsTUFBTSxlQUFlLEdBQUcsQ0FBQyxNQUF3QixFQUFFLEdBQUcsSUFBZSxFQUFFLEVBQUU7WUFDdkUsSUFBSSxDQUFDO2dCQUNILFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3BCLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNmLHNDQUFzQztnQkFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsT0FBTyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0QsQ0FBQztRQUNILENBQUMsQ0FBQztRQUNGLGlEQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN6QyxPQUFPLEdBQUcsRUFBRSxDQUFDLGlEQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLHNDQUFzQztRQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxPQUFPLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqRSxPQUFPLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztJQUNsQixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsa0VBQWtFO0FBQ2xFLHFEQUFxRDtBQUNyRCxtREFBYSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRTtJQUM3Qyx5QkFBeUI7SUFDekIsRUFBRSxFQUFFO1FBQ0YsUUFBUSxFQUFFLENBQUMsUUFBZ0IsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7UUFDbkUsU0FBUyxFQUFFLENBQUMsUUFBZ0IsRUFBRSxJQUFhLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztRQUMxRixNQUFNLEVBQUUsQ0FBQyxRQUFnQixFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQztRQUMvRCxlQUFlLEVBQUUsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUM7S0FDaEY7SUFFRCxvQkFBb0I7SUFDcEIsTUFBTSxFQUFFO1FBQ04sUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztRQUM3QyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDO1FBQzdDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDO1FBQ3ZDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUM7UUFDbkQsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUMzQyxPQUFPLEVBQUUsQ0FBQyxLQUFhLEVBQUUsTUFBYyxFQUFFLE9BQWlCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztRQUNuSCxZQUFZLEVBQUUsQ0FBQyxTQUFrQixFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsU0FBUyxDQUFDO1FBQ2xGLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO1FBRXpDLDhDQUE4QztRQUM5QyxXQUFXLEVBQUUsQ0FBQyxRQUFvQixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDO1FBQzNFLGFBQWEsRUFBRSxDQUFDLFFBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUM7UUFDL0UsaUJBQWlCLEVBQUUsQ0FBQyxRQUFvQixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDO1FBQ3pGLGlCQUFpQixFQUFFLENBQUMsUUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQztLQUMxRjtJQUVELGFBQWEsRUFBRTtRQUNiLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUM7UUFDN0MsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztRQUM3QyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQzNDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDO1FBQ3ZDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUM7UUFFbkQsY0FBYztRQUNkLGdCQUFnQixFQUFFLENBQUMsUUFBd0MsRUFBRSxFQUFFO1lBQzdELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sc0JBQXNCLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRW5GLFNBQVM7WUFDVCxPQUFPLEdBQUcsRUFBRTtnQkFDVixvQkFBb0IsRUFBRSxDQUFDO2dCQUN2QixzQkFBc0IsRUFBRSxDQUFDO1lBQzNCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxlQUFlO1FBQ2YsNEJBQTRCLEVBQUUsQ0FBQyxTQUF5QyxFQUFFLEVBQUU7WUFDMUUsOENBQThDO1lBQzlDLGlEQUFXLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNuRCxpREFBVyxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDdkQsQ0FBQztLQUNGO0lBRUQsa0JBQWtCO0lBQ2xCLEdBQUcsRUFBRTtRQUNILFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztRQUNoRCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztRQUN4QyxPQUFPLEVBQUUsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDO0tBQzNEO0lBRUQsNENBQTRDO0lBQzVDLElBQUksRUFBRTtRQUNKLFlBQVksRUFBRSxDQUFDLFFBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUM7UUFDNUUsYUFBYSxFQUFFLENBQUMsUUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQztRQUM5RSxhQUFhLEVBQUUsQ0FBQyxRQUFvQixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDO1FBQzlFLFFBQVEsRUFBRSxDQUFDLFFBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO1FBQ25FLE1BQU0sRUFBRSxDQUFDLFFBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO1FBQy9ELE1BQU0sRUFBRSxDQUFDLFFBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO1FBQy9ELFFBQVEsRUFBRSxDQUFDLFFBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDO1FBQ3BFLFNBQVMsRUFBRSxDQUFDLFFBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO1FBQ3RFLGFBQWEsRUFBRSxDQUFDLFFBQW9CLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUM7S0FDaEY7SUFFRCxvQkFBb0I7SUFDcEIsa0JBQWtCLEVBQUUsQ0FBQyxPQUFlLEVBQUUsRUFBRTtRQUN0QyxJQUFJLENBQUM7WUFDSCxpREFBVyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2Ysc0NBQXNDO1lBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLE9BQU8sR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLENBQUM7SUFDSCxDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUM7Q0FDakQsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS8uL25vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2UvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcImVsZWN0cm9uXCIiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS8uL3NyYy9tYWluL3ByZWxvYWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIHdpbjtcblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB3aW4gPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB3aW4gPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICB3aW4gPSBzZWxmO1xufSBlbHNlIHtcbiAgICB3aW4gPSB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3aW47XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gR2xvYmFsIHBvbHlmaWxsIGZvciBFbGVjdHJvbiBwcmVsb2FkIHByb2Nlc3NcclxuaWYgKHR5cGVvZiBnbG9iYWwgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWdsb2JhbC1hc3NpZ25cclxuICAoZ2xvYmFsIGFzIHR5cGVvZiBnbG9iYWxUaGlzKSA9IGdsb2JhbFRoaXM7XHJcbn1cclxuXHJcbmltcG9ydCB7IGNvbnRleHRCcmlkZ2UsIGlwY1JlbmRlcmVyLCBJcGNSZW5kZXJlckV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nO1xyXG5cclxuLy8gU2FmZSB3cmFwcGVyIGZvciBJUEMgY2FsbHMgd2l0aCBlcnJvciBoYW5kbGluZ1xyXG5jb25zdCBzYWZlSW52b2tlID0gYXN5bmMgKGNoYW5uZWw6IHN0cmluZywgLi4uYXJnczogdW5rbm93bltdKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGlwY1JlbmRlcmVyLmludm9rZShjaGFubmVsLCAuLi5hcmdzKTtcclxuICAgIC8vIOehruS/nei/lOWbnuS4gOiHtOeahOagvOW8j1xyXG4gICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkIHx8IHJlc3VsdCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBudWxsIH07XHJcbiAgICB9XHJcbiAgICAvLyDlpoLmnpznu5Pmnpzlt7Lnu4/mmK/mnJ/mnJvnmoTmoLzlvI/vvIznm7TmjqXov5Tlm55cclxuICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JyAmJiByZXN1bHQgIT09IG51bGwgJiYgKCdzdWNjZXNzJyBpbiByZXN1bHQgfHwgJ3RpbWVzdGFtcCcgaW4gcmVzdWx0KSkge1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgLy8g5ZCm5YiZ5YyF6KOF57uT5p6cXHJcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcclxuICAgIGNvbnNvbGUuZXJyb3IoYElQQyBpbnZva2UgZmFpbGVkIGZvciAke2NoYW5uZWx9OmAsIGVycm9yKTtcclxuICAgIHJldHVybiB7IFxyXG4gICAgICBzdWNjZXNzOiBmYWxzZSwgXHJcbiAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJyBcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gU2FmZSB3cmFwcGVyIGZvciBldmVudCBsaXN0ZW5lcnNcclxuY29uc3Qgc2FmZU9uID0gKGNoYW5uZWw6IHN0cmluZywgY2FsbGJhY2s6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgd3JhcHBlZENhbGxiYWNrID0gKF9ldmVudDogSXBjUmVuZGVyZXJFdmVudCwgLi4uYXJnczogdW5rbm93bltdKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY2FsbGJhY2soLi4uYXJncyk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBFdmVudCBoYW5kbGVyIGZhaWxlZCBmb3IgJHtjaGFubmVsfTpgLCBlcnJvcik7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBpcGNSZW5kZXJlci5vbihjaGFubmVsLCB3cmFwcGVkQ2FsbGJhY2spO1xyXG4gICAgcmV0dXJuICgpID0+IGlwY1JlbmRlcmVyLnJlbW92ZUxpc3RlbmVyKGNoYW5uZWwsIHdyYXBwZWRDYWxsYmFjayk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXHJcbiAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gc2V0dXAgbGlzdGVuZXIgZm9yICR7Y2hhbm5lbH06YCwgZXJyb3IpO1xyXG4gICAgcmV0dXJuICgpID0+IHt9O1xyXG4gIH1cclxufTtcclxuXHJcbi8vIEV4cG9zZSBwcm90ZWN0ZWQgbWV0aG9kcyB0aGF0IGFsbG93IHRoZSByZW5kZXJlciBwcm9jZXNzIHRvIHVzZVxyXG4vLyB0aGUgaXBjUmVuZGVyZXIgd2l0aG91dCBleHBvc2luZyB0aGUgZW50aXJlIG9iamVjdFxyXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCdlbGVjdHJvbkFQSScsIHtcclxuICAvLyBGaWxlIHN5c3RlbSBvcGVyYXRpb25zXHJcbiAgZnM6IHtcclxuICAgIHJlYWRGaWxlOiAoZmlsZVBhdGg6IHN0cmluZykgPT4gc2FmZUludm9rZSgnZnM6cmVhZEZpbGUnLCBmaWxlUGF0aCksXHJcbiAgICB3cml0ZUZpbGU6IChmaWxlUGF0aDogc3RyaW5nLCBkYXRhOiB1bmtub3duKSA9PiBzYWZlSW52b2tlKCdmczp3cml0ZUZpbGUnLCBmaWxlUGF0aCwgZGF0YSksXHJcbiAgICBleGlzdHM6IChmaWxlUGF0aDogc3RyaW5nKSA9PiBzYWZlSW52b2tlKCdmczpleGlzdHMnLCBmaWxlUGF0aCksXHJcbiAgICBjcmVhdGVEaXJlY3Rvcnk6IChkaXJQYXRoOiBzdHJpbmcpID0+IHNhZmVJbnZva2UoJ2ZzOmNyZWF0ZURpcmVjdG9yeScsIGRpclBhdGgpXHJcbiAgfSxcclxuXHJcbiAgLy8gV2luZG93IG9wZXJhdGlvbnNcclxuICB3aW5kb3c6IHtcclxuICAgIG1pbmltaXplOiAoKSA9PiBzYWZlSW52b2tlKCd3aW5kb3c6bWluaW1pemUnKSxcclxuICAgIG1heGltaXplOiAoKSA9PiBzYWZlSW52b2tlKCd3aW5kb3c6bWF4aW1pemUnKSxcclxuICAgIGNsb3NlOiAoKSA9PiBzYWZlSW52b2tlKCd3aW5kb3c6Y2xvc2UnKSxcclxuICAgIGlzTWF4aW1pemVkOiAoKSA9PiBzYWZlSW52b2tlKCd3aW5kb3c6aXNNYXhpbWl6ZWQnKSxcclxuICAgIGdldFNpemU6ICgpID0+IHNhZmVJbnZva2UoJ3dpbmRvdzpnZXRTaXplJyksXHJcbiAgICBzZXRTaXplOiAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFuaW1hdGU/OiBib29sZWFuKSA9PiBzYWZlSW52b2tlKCd3aW5kb3c6c2V0U2l6ZScsIHdpZHRoLCBoZWlnaHQsIGFuaW1hdGUpLFxyXG4gICAgc2V0UmVzaXphYmxlOiAocmVzaXphYmxlOiBib29sZWFuKSA9PiBzYWZlSW52b2tlKCd3aW5kb3c6c2V0UmVzaXphYmxlJywgcmVzaXphYmxlKSxcclxuICAgIGNlbnRlcjogKCkgPT4gc2FmZUludm9rZSgnd2luZG93OmNlbnRlcicpLFxyXG4gICAgXHJcbiAgICAvLyBXaW5kb3cgc3RhdGUgbGlzdGVuZXJzIHdpdGggY2xlYW51cCBzdXBwb3J0XHJcbiAgICBvbk1heGltaXplZDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBzYWZlT24oJ3dpbmRvdzptYXhpbWl6ZWQnLCBjYWxsYmFjayksXHJcbiAgICBvblVubWF4aW1pemVkOiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHNhZmVPbignd2luZG93OnVubWF4aW1pemVkJywgY2FsbGJhY2spLFxyXG4gICAgb25FbnRlckZ1bGxTY3JlZW46IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCd3aW5kb3c6ZW50ZXItZnVsbC1zY3JlZW4nLCBjYWxsYmFjayksXHJcbiAgICBvbkxlYXZlRnVsbFNjcmVlbjogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBzYWZlT24oJ3dpbmRvdzpsZWF2ZS1mdWxsLXNjcmVlbicsIGNhbGxiYWNrKVxyXG4gIH0sXHJcblxyXG4gIHdpbmRvd0NvbnRyb2w6IHtcclxuICAgIG1pbmltaXplOiAoKSA9PiBzYWZlSW52b2tlKCd3aW5kb3c6bWluaW1pemUnKSxcclxuICAgIG1heGltaXplOiAoKSA9PiBzYWZlSW52b2tlKCd3aW5kb3c6bWF4aW1pemUnKSxcclxuICAgIHJlc3RvcmU6ICgpID0+IHNhZmVJbnZva2UoJ3dpbmRvdzpyZXN0b3JlJyksXHJcbiAgICBjbG9zZTogKCkgPT4gc2FmZUludm9rZSgnd2luZG93OmNsb3NlJyksXHJcbiAgICBpc01heGltaXplZDogKCkgPT4gc2FmZUludm9rZSgnd2luZG93OmlzTWF4aW1pemVkJyksXHJcbiAgICBcclxuICAgIC8vIOebkeWQrOeql+WPo+acgOWkp+WMlueKtuaAgeWPmOWMllxyXG4gICAgb25NYXhpbWl6ZUNoYW5nZTogKGNhbGxiYWNrOiAoaXNNYXhpbWl6ZWQ6IGJvb2xlYW4pID0+IHZvaWQpID0+IHtcclxuICAgICAgY29uc3QgdW5zdWJzY3JpYmVNYXhpbWl6ZWQgPSBzYWZlT24oJ3dpbmRvdzptYXhpbWl6ZWQnLCAoKSA9PiBjYWxsYmFjayh0cnVlKSk7XHJcbiAgICAgIGNvbnN0IHVuc3Vic2NyaWJlVW5tYXhpbWl6ZWQgPSBzYWZlT24oJ3dpbmRvdzp1bm1heGltaXplZCcsICgpID0+IGNhbGxiYWNrKGZhbHNlKSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyDov5Tlm57muIXnkIblh73mlbBcclxuICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICB1bnN1YnNjcmliZU1heGltaXplZCgpO1xyXG4gICAgICAgIHVuc3Vic2NyaWJlVW5tYXhpbWl6ZWQoKTtcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vIOenu+mZpOacgOWkp+WMlueKtuaAgeWPmOWMluebkeWQrOWZqFxyXG4gICAgcmVtb3ZlTWF4aW1pemVDaGFuZ2VMaXN0ZW5lcjogKF9jYWxsYmFjazogKGlzTWF4aW1pemVkOiBib29sZWFuKSA9PiB2b2lkKSA9PiB7XHJcbiAgICAgIC8vIOi/meS4quaWueazleS4u+imgeeUqOS6juWQkeWQjuWFvOWuue+8jOWunumZhea4heeQhueUsSBvbk1heGltaXplQ2hhbmdlIOi/lOWbnueahOWHveaVsOWkhOeQhlxyXG4gICAgICBpcGNSZW5kZXJlci5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3dpbmRvdzptYXhpbWl6ZWQnKTtcclxuICAgICAgaXBjUmVuZGVyZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCd3aW5kb3c6dW5tYXhpbWl6ZWQnKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBBcHAgaW5mb3JtYXRpb25cclxuICBhcHA6IHtcclxuICAgIGdldFZlcnNpb246ICgpID0+IHNhZmVJbnZva2UoJ2FwcDpnZXRWZXJzaW9uJyksXHJcbiAgICBnZXRQbGF0Zm9ybTogKCkgPT4gc2FmZUludm9rZSgnYXBwOmdldFBsYXRmb3JtJyksXHJcbiAgICBnZXROYW1lOiAoKSA9PiBzYWZlSW52b2tlKCdhcHA6Z2V0TmFtZScpLFxyXG4gICAgZ2V0UGF0aDogKG5hbWU6IHN0cmluZykgPT4gc2FmZUludm9rZSgnYXBwOmdldFBhdGgnLCBuYW1lKVxyXG4gIH0sXHJcblxyXG4gIC8vIE1lbnUgZXZlbnQgbGlzdGVuZXJzIHdpdGggY2xlYW51cCBzdXBwb3J0XHJcbiAgbWVudToge1xyXG4gICAgb25OZXdQcm9qZWN0OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHNhZmVPbignbWVudTpuZXctcHJvamVjdCcsIGNhbGxiYWNrKSxcclxuICAgIG9uT3BlblByb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCdtZW51Om9wZW4tcHJvamVjdCcsIGNhbGxiYWNrKSxcclxuICAgIG9uU2F2ZVByb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCdtZW51OnNhdmUtcHJvamVjdCcsIGNhbGxiYWNrKSxcclxuICAgIG9uRXhwb3J0OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHNhZmVPbignbWVudTpleHBvcnQnLCBjYWxsYmFjayksXHJcbiAgICBvblVuZG86IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCdtZW51OnVuZG8nLCBjYWxsYmFjayksXHJcbiAgICBvblJlZG86IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCdtZW51OnJlZG8nLCBjYWxsYmFjayksXHJcbiAgICBvblpvb21JbjogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBzYWZlT24oJ21lbnU6em9vbS1pbicsIGNhbGxiYWNrKSxcclxuICAgIG9uWm9vbU91dDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBzYWZlT24oJ21lbnU6em9vbS1vdXQnLCBjYWxsYmFjayksXHJcbiAgICBvbkZpdFRvU2NyZWVuOiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHNhZmVPbignbWVudTpmaXQtdG8tc2NyZWVuJywgY2FsbGJhY2spXHJcbiAgfSxcclxuXHJcbiAgLy8gVXRpbGl0eSBmdW5jdGlvbnNcclxuICByZW1vdmVBbGxMaXN0ZW5lcnM6IChjaGFubmVsOiBzdHJpbmcpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlwY1JlbmRlcmVyLnJlbW92ZUFsbExpc3RlbmVycyhjaGFubmVsKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byByZW1vdmUgbGlzdGVuZXJzIGZvciAke2NoYW5uZWx9OmAsIGVycm9yKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBIZWFsdGggY2hlY2sgZm9yIGNvbW11bmljYXRpb25cclxuICBoZWFsdGhDaGVjazogKCkgPT4gc2FmZUludm9rZSgnaXBjOmhlYWx0aENoZWNrJylcclxufSk7XHJcblxyXG4vLyBUeXBlIGRlZmluaXRpb25zIGZvciB0aGUgZXhwb3NlZCBBUElcclxuZXhwb3J0IGludGVyZmFjZSBFbGVjdHJvbkFQSSB7XHJcbiAgZnM6IHtcclxuICAgIHJlYWRGaWxlOiAoZmlsZVBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIH0+O1xyXG4gICAgd3JpdGVGaWxlOiAoZmlsZVBhdGg6IHN0cmluZywgZGF0YTogdW5rbm93bikgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IHBhdGg/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIH0+O1xyXG4gICAgZXhpc3RzOiAoZmlsZVBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTxib29sZWFuPjtcclxuICAgIGNyZWF0ZURpcmVjdG9yeTogKGRpclBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IHBhdGg/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIH0+O1xyXG4gIH07XHJcbiAgd2luZG93OiB7XHJcbiAgICBtaW5pbWl6ZTogKCkgPT4gUHJvbWlzZTx2b2lkPjtcclxuICAgIG1heGltaXplOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgY2xvc2U6ICgpID0+IFByb21pc2U8dm9pZD47XHJcbiAgICBpc01heGltaXplZDogKCkgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PjtcclxuICAgIGdldFNpemU6ICgpID0+IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9OyBlcnJvcj86IHN0cmluZyB9PjtcclxuICAgIHNldFNpemU6ICh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYW5pbWF0ZT86IGJvb2xlYW4pID0+IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PjtcclxuICAgIHNldFJlc2l6YWJsZTogKHJlc2l6YWJsZTogYm9vbGVhbikgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+O1xyXG4gICAgY2VudGVyOiAoKSA9PiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT47XHJcbiAgICBvbk1heGltaXplZDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gICAgb25Vbm1heGltaXplZDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gICAgb25FbnRlckZ1bGxTY3JlZW46IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uTGVhdmVGdWxsU2NyZWVuOiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgfTtcclxuICB3aW5kb3dDb250cm9sOiB7XHJcbiAgICBtaW5pbWl6ZTogKCkgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBhbnk7IGVycm9yPzogc3RyaW5nIH0+O1xyXG4gICAgbWF4aW1pemU6ICgpID0+IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PjtcclxuICAgIHJlc3RvcmU6ICgpID0+IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PjtcclxuICAgIGNsb3NlOiAoKSA9PiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT47XHJcbiAgICBpc01heGltaXplZDogKCkgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PjtcclxuICAgIG9uTWF4aW1pemVDaGFuZ2U6IChjYWxsYmFjazogKGlzTWF4aW1pemVkOiBib29sZWFuKSA9PiB2b2lkKSA9PiAoKSA9PiB2b2lkO1xyXG4gICAgcmVtb3ZlTWF4aW1pemVDaGFuZ2VMaXN0ZW5lcjogKGNhbGxiYWNrOiAoaXNNYXhpbWl6ZWQ6IGJvb2xlYW4pID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgfTtcclxuICBhcHA6IHtcclxuICAgIGdldFZlcnNpb246ICgpID0+IFByb21pc2U8c3RyaW5nPjtcclxuICAgIGdldFBsYXRmb3JtOiAoKSA9PiBQcm9taXNlPHN0cmluZz47XHJcbiAgfTtcclxuICBtZW51OiB7XHJcbiAgICBvbk5ld1Byb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uT3BlblByb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uU2F2ZVByb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uRXhwb3J0OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgICBvblVuZG86IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uUmVkbzogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gICAgb25ab29tSW46IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uWm9vbU91dDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gICAgb25GaXRUb1NjcmVlbjogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gIH07XHJcbiAgcmVtb3ZlQWxsTGlzdGVuZXJzOiAoY2hhbm5lbDogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIGhlYWx0aENoZWNrOiAoKSA9PiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgdGltZXN0YW1wPzogbnVtYmVyOyBtZXNzYWdlPzogc3RyaW5nIH0+O1xyXG59XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICBlbGVjdHJvbkFQSTogRWxlY3Ryb25BUEk7XHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9