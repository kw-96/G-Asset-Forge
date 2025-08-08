// Global polyfill for Electron preload process
if (typeof global === 'undefined') {
    // eslint-disable-next-line no-global-assign
    global = globalThis;
}
import { contextBridge, ipcRenderer } from 'electron';
// Safe wrapper for IPC calls with error handling
const safeInvoke = async (channel, ...args) => {
    try {
        const result = await ipcRenderer.invoke(channel, ...args);
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
        ipcRenderer.on(channel, wrappedCallback);
        return () => ipcRenderer.removeListener(channel, wrappedCallback);
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to setup listener for ${channel}:`, error);
        return () => { };
    }
};
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
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
            ipcRenderer.removeAllListeners('window:maximized');
            ipcRenderer.removeAllListeners('window:unmaximized');
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
            ipcRenderer.removeAllListeners(channel);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to remove listeners for ${channel}:`, error);
        }
    },
    // Health check for communication
    healthCheck: () => safeInvoke('ipc:healthCheck')
});
//# sourceMappingURL=preload.js.map