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
        // Window state listeners with cleanup support
        onMaximized: (callback) => safeOn('window:maximized', callback),
        onUnmaximized: (callback) => safeOn('window:unmaximized', callback),
        onEnterFullScreen: (callback) => safeOn('window:enter-full-screen', callback),
        onLeaveFullScreen: (callback) => safeOn('window:leave-full-screen', callback)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RSxRQUFRLENBQUM7UUFDbkUsTUFBTSxFQUFFLENBQUMsUUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7UUFDL0QsTUFBTSxFQUFFLENBQUMsUUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7UUFDL0QsUUFBUSxFQUFFLENBQUMsUUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUM7UUFDcEUsU0FBUyxFQUFFLENBQUMsUUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7UUFDdEUsYUFBYSxFQUFFLENBQUMsUUFBb0IsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQztLQUNoRjtJQUVELG9CQUFvQjtJQUNwQixrQkFBa0IsRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFFO1FBQ3RDLElBQUksQ0FBQztZQUNILGlEQUFXLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixzQ0FBc0M7WUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsT0FBTyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckUsQ0FBQztJQUNILENBQUM7SUFFRCxpQ0FBaUM7SUFDakMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztDQUNqRCxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlLy4vbm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwiZWxlY3Ryb25cIiIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2Uvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZy1hc3NldC1mb3JnZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2ctYXNzZXQtZm9yZ2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9nLWFzc2V0LWZvcmdlLy4vc3JjL21haW4vcHJlbG9hZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgd2luO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIHdpbiA9IHNlbGY7XG59IGVsc2Uge1xuICAgIHdpbiA9IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbjtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImVsZWN0cm9uXCIpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBHbG9iYWwgcG9seWZpbGwgZm9yIEVsZWN0cm9uIHByZWxvYWQgcHJvY2Vzc1xyXG5pZiAodHlwZW9mIGdsb2JhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZ2xvYmFsLWFzc2lnblxyXG4gIChnbG9iYWwgYXMgdHlwZW9mIGdsb2JhbFRoaXMpID0gZ2xvYmFsVGhpcztcclxufVxyXG5cclxuaW1wb3J0IHsgY29udGV4dEJyaWRnZSwgaXBjUmVuZGVyZXIsIElwY1JlbmRlcmVyRXZlbnQgfSBmcm9tICdlbGVjdHJvbic7XHJcblxyXG4vLyBTYWZlIHdyYXBwZXIgZm9yIElQQyBjYWxscyB3aXRoIGVycm9yIGhhbmRsaW5nXHJcbmNvbnN0IHNhZmVJbnZva2UgPSBhc3luYyAoY2hhbm5lbDogc3RyaW5nLCAuLi5hcmdzOiB1bmtub3duW10pID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgaXBjUmVuZGVyZXIuaW52b2tlKGNoYW5uZWwsIC4uLmFyZ3MpO1xyXG4gICAgLy8g56Gu5L+d6L+U5Zue5LiA6Ie055qE5qC85byPXHJcbiAgICBpZiAocmVzdWx0ID09PSB1bmRlZmluZWQgfHwgcmVzdWx0ID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IG51bGwgfTtcclxuICAgIH1cclxuICAgIC8vIOWmguaenOe7k+aenOW3sue7j+aYr+acn+acm+eahOagvOW8j++8jOebtOaOpei/lOWbnlxyXG4gICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnICYmIHJlc3VsdCAhPT0gbnVsbCAmJiAoJ3N1Y2Nlc3MnIGluIHJlc3VsdCB8fCAndGltZXN0YW1wJyBpbiByZXN1bHQpKSB7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICAvLyDlkKbliJnljIXoo4Xnu5PmnpxcclxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxyXG4gICAgY29uc29sZS5lcnJvcihgSVBDIGludm9rZSBmYWlsZWQgZm9yICR7Y2hhbm5lbH06YCwgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHsgXHJcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLCBcclxuICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InIFxyXG4gICAgfTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBTYWZlIHdyYXBwZXIgZm9yIGV2ZW50IGxpc3RlbmVyc1xyXG5jb25zdCBzYWZlT24gPSAoY2hhbm5lbDogc3RyaW5nLCBjYWxsYmFjazogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdm9pZCkgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2sgPSAoX2V2ZW50OiBJcGNSZW5kZXJlckV2ZW50LCAuLi5hcmdzOiB1bmtub3duW10pID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjYWxsYmFjayguLi5hcmdzKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEV2ZW50IGhhbmRsZXIgZmFpbGVkIGZvciAke2NoYW5uZWx9OmAsIGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGlwY1JlbmRlcmVyLm9uKGNoYW5uZWwsIHdyYXBwZWRDYWxsYmFjayk7XHJcbiAgICByZXR1cm4gKCkgPT4gaXBjUmVuZGVyZXIucmVtb3ZlTGlzdGVuZXIoY2hhbm5lbCwgd3JhcHBlZENhbGxiYWNrKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcclxuICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBzZXR1cCBsaXN0ZW5lciBmb3IgJHtjaGFubmVsfTpgLCBlcnJvcik7XHJcbiAgICByZXR1cm4gKCkgPT4ge307XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gRXhwb3NlIHByb3RlY3RlZCBtZXRob2RzIHRoYXQgYWxsb3cgdGhlIHJlbmRlcmVyIHByb2Nlc3MgdG8gdXNlXHJcbi8vIHRoZSBpcGNSZW5kZXJlciB3aXRob3V0IGV4cG9zaW5nIHRoZSBlbnRpcmUgb2JqZWN0XHJcbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2VsZWN0cm9uQVBJJywge1xyXG4gIC8vIEZpbGUgc3lzdGVtIG9wZXJhdGlvbnNcclxuICBmczoge1xyXG4gICAgcmVhZEZpbGU6IChmaWxlUGF0aDogc3RyaW5nKSA9PiBzYWZlSW52b2tlKCdmczpyZWFkRmlsZScsIGZpbGVQYXRoKSxcclxuICAgIHdyaXRlRmlsZTogKGZpbGVQYXRoOiBzdHJpbmcsIGRhdGE6IHVua25vd24pID0+IHNhZmVJbnZva2UoJ2ZzOndyaXRlRmlsZScsIGZpbGVQYXRoLCBkYXRhKSxcclxuICAgIGV4aXN0czogKGZpbGVQYXRoOiBzdHJpbmcpID0+IHNhZmVJbnZva2UoJ2ZzOmV4aXN0cycsIGZpbGVQYXRoKSxcclxuICAgIGNyZWF0ZURpcmVjdG9yeTogKGRpclBhdGg6IHN0cmluZykgPT4gc2FmZUludm9rZSgnZnM6Y3JlYXRlRGlyZWN0b3J5JywgZGlyUGF0aClcclxuICB9LFxyXG5cclxuICAvLyBXaW5kb3cgb3BlcmF0aW9uc1xyXG4gIHdpbmRvdzoge1xyXG4gICAgbWluaW1pemU6ICgpID0+IHNhZmVJbnZva2UoJ3dpbmRvdzptaW5pbWl6ZScpLFxyXG4gICAgbWF4aW1pemU6ICgpID0+IHNhZmVJbnZva2UoJ3dpbmRvdzptYXhpbWl6ZScpLFxyXG4gICAgY2xvc2U6ICgpID0+IHNhZmVJbnZva2UoJ3dpbmRvdzpjbG9zZScpLFxyXG4gICAgaXNNYXhpbWl6ZWQ6ICgpID0+IHNhZmVJbnZva2UoJ3dpbmRvdzppc01heGltaXplZCcpLFxyXG4gICAgZ2V0U2l6ZTogKCkgPT4gc2FmZUludm9rZSgnd2luZG93OmdldFNpemUnKSxcclxuICAgIFxyXG4gICAgLy8gV2luZG93IHN0YXRlIGxpc3RlbmVycyB3aXRoIGNsZWFudXAgc3VwcG9ydFxyXG4gICAgb25NYXhpbWl6ZWQ6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCd3aW5kb3c6bWF4aW1pemVkJywgY2FsbGJhY2spLFxyXG4gICAgb25Vbm1heGltaXplZDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBzYWZlT24oJ3dpbmRvdzp1bm1heGltaXplZCcsIGNhbGxiYWNrKSxcclxuICAgIG9uRW50ZXJGdWxsU2NyZWVuOiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHNhZmVPbignd2luZG93OmVudGVyLWZ1bGwtc2NyZWVuJywgY2FsbGJhY2spLFxyXG4gICAgb25MZWF2ZUZ1bGxTY3JlZW46IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCd3aW5kb3c6bGVhdmUtZnVsbC1zY3JlZW4nLCBjYWxsYmFjaylcclxuICB9LFxyXG5cclxuICAvLyBBcHAgaW5mb3JtYXRpb25cclxuICBhcHA6IHtcclxuICAgIGdldFZlcnNpb246ICgpID0+IHNhZmVJbnZva2UoJ2FwcDpnZXRWZXJzaW9uJyksXHJcbiAgICBnZXRQbGF0Zm9ybTogKCkgPT4gc2FmZUludm9rZSgnYXBwOmdldFBsYXRmb3JtJyksXHJcbiAgICBnZXROYW1lOiAoKSA9PiBzYWZlSW52b2tlKCdhcHA6Z2V0TmFtZScpLFxyXG4gICAgZ2V0UGF0aDogKG5hbWU6IHN0cmluZykgPT4gc2FmZUludm9rZSgnYXBwOmdldFBhdGgnLCBuYW1lKVxyXG4gIH0sXHJcblxyXG4gIC8vIE1lbnUgZXZlbnQgbGlzdGVuZXJzIHdpdGggY2xlYW51cCBzdXBwb3J0XHJcbiAgbWVudToge1xyXG4gICAgb25OZXdQcm9qZWN0OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHNhZmVPbignbWVudTpuZXctcHJvamVjdCcsIGNhbGxiYWNrKSxcclxuICAgIG9uT3BlblByb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCdtZW51Om9wZW4tcHJvamVjdCcsIGNhbGxiYWNrKSxcclxuICAgIG9uU2F2ZVByb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCdtZW51OnNhdmUtcHJvamVjdCcsIGNhbGxiYWNrKSxcclxuICAgIG9uRXhwb3J0OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHNhZmVPbignbWVudTpleHBvcnQnLCBjYWxsYmFjayksXHJcbiAgICBvblVuZG86IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCdtZW51OnVuZG8nLCBjYWxsYmFjayksXHJcbiAgICBvblJlZG86IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gc2FmZU9uKCdtZW51OnJlZG8nLCBjYWxsYmFjayksXHJcbiAgICBvblpvb21JbjogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBzYWZlT24oJ21lbnU6em9vbS1pbicsIGNhbGxiYWNrKSxcclxuICAgIG9uWm9vbU91dDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBzYWZlT24oJ21lbnU6em9vbS1vdXQnLCBjYWxsYmFjayksXHJcbiAgICBvbkZpdFRvU2NyZWVuOiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHNhZmVPbignbWVudTpmaXQtdG8tc2NyZWVuJywgY2FsbGJhY2spXHJcbiAgfSxcclxuXHJcbiAgLy8gVXRpbGl0eSBmdW5jdGlvbnNcclxuICByZW1vdmVBbGxMaXN0ZW5lcnM6IChjaGFubmVsOiBzdHJpbmcpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlwY1JlbmRlcmVyLnJlbW92ZUFsbExpc3RlbmVycyhjaGFubmVsKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byByZW1vdmUgbGlzdGVuZXJzIGZvciAke2NoYW5uZWx9OmAsIGVycm9yKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBIZWFsdGggY2hlY2sgZm9yIGNvbW11bmljYXRpb25cclxuICBoZWFsdGhDaGVjazogKCkgPT4gc2FmZUludm9rZSgnaXBjOmhlYWx0aENoZWNrJylcclxufSk7XHJcblxyXG4vLyBUeXBlIGRlZmluaXRpb25zIGZvciB0aGUgZXhwb3NlZCBBUElcclxuZXhwb3J0IGludGVyZmFjZSBFbGVjdHJvbkFQSSB7XHJcbiAgZnM6IHtcclxuICAgIHJlYWRGaWxlOiAoZmlsZVBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIH0+O1xyXG4gICAgd3JpdGVGaWxlOiAoZmlsZVBhdGg6IHN0cmluZywgZGF0YTogdW5rbm93bikgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IHBhdGg/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIH0+O1xyXG4gICAgZXhpc3RzOiAoZmlsZVBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTxib29sZWFuPjtcclxuICAgIGNyZWF0ZURpcmVjdG9yeTogKGRpclBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IHBhdGg/OiBzdHJpbmc7IGVycm9yPzogc3RyaW5nIH0+O1xyXG4gIH07XHJcbiAgd2luZG93OiB7XHJcbiAgICBtaW5pbWl6ZTogKCkgPT4gUHJvbWlzZTx2b2lkPjtcclxuICAgIG1heGltaXplOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgY2xvc2U6ICgpID0+IFByb21pc2U8dm9pZD47XHJcbiAgICBvbk1heGltaXplZDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gICAgb25Vbm1heGltaXplZDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gICAgb25FbnRlckZ1bGxTY3JlZW46IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uTGVhdmVGdWxsU2NyZWVuOiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgfTtcclxuICBhcHA6IHtcclxuICAgIGdldFZlcnNpb246ICgpID0+IFByb21pc2U8c3RyaW5nPjtcclxuICAgIGdldFBsYXRmb3JtOiAoKSA9PiBQcm9taXNlPHN0cmluZz47XHJcbiAgfTtcclxuICBtZW51OiB7XHJcbiAgICBvbk5ld1Byb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uT3BlblByb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uU2F2ZVByb2plY3Q6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uRXhwb3J0OiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XHJcbiAgICBvblVuZG86IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uUmVkbzogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gICAgb25ab29tSW46IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gdm9pZDtcclxuICAgIG9uWm9vbU91dDogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gICAgb25GaXRUb1NjcmVlbjogKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xyXG4gIH07XHJcbiAgcmVtb3ZlQWxsTGlzdGVuZXJzOiAoY2hhbm5lbDogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIGhlYWx0aENoZWNrOiAoKSA9PiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgdGltZXN0YW1wPzogbnVtYmVyOyBtZXNzYWdlPzogc3RyaW5nIH0+O1xyXG59XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICBlbGVjdHJvbkFQSTogRWxlY3Ryb25BUEk7XHJcbiAgfVxyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9