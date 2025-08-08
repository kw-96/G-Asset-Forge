// Global polyfill for Electron preload process
if (typeof global === 'undefined') {
  // eslint-disable-next-line no-global-assign
  (global as typeof globalThis) = globalThis;
}

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Safe wrapper for IPC calls with error handling
const safeInvoke = async (channel: string, ...args: unknown[]) => {
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`IPC invoke failed for ${channel}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Safe wrapper for event listeners
const safeOn = (channel: string, callback: (...args: unknown[]) => void) => {
  try {
    const wrappedCallback = (_event: IpcRendererEvent, ...args: unknown[]) => {
      try {
        callback(...args);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Event handler failed for ${channel}:`, error);
      }
    };
    ipcRenderer.on(channel, wrappedCallback);
    return () => ipcRenderer.removeListener(channel, wrappedCallback);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to setup listener for ${channel}:`, error);
    return () => {};
  }
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  fs: {
    readFile: (filePath: string) => safeInvoke('fs:readFile', filePath),
    writeFile: (filePath: string, data: unknown) => safeInvoke('fs:writeFile', filePath, data),
    exists: (filePath: string) => safeInvoke('fs:exists', filePath),
    createDirectory: (dirPath: string) => safeInvoke('fs:createDirectory', dirPath)
  },

  // Window operations
  window: {
    minimize: () => safeInvoke('window:minimize'),
    maximize: () => safeInvoke('window:maximize'),
    close: () => safeInvoke('window:close'),
    isMaximized: () => safeInvoke('window:isMaximized'),
    getSize: () => safeInvoke('window:getSize'),
    setSize: (width: number, height: number, animate?: boolean) => safeInvoke('window:setSize', width, height, animate),
    setResizable: (resizable: boolean) => safeInvoke('window:setResizable', resizable),
    center: () => safeInvoke('window:center'),
    
    // Window state listeners with cleanup support
    onMaximized: (callback: () => void) => safeOn('window:maximized', callback),
    onUnmaximized: (callback: () => void) => safeOn('window:unmaximized', callback),
    onEnterFullScreen: (callback: () => void) => safeOn('window:enter-full-screen', callback),
    onLeaveFullScreen: (callback: () => void) => safeOn('window:leave-full-screen', callback)
  },

  windowControl: {
    minimize: () => safeInvoke('window:minimize'),
    maximize: () => safeInvoke('window:maximize'),
    restore: () => safeInvoke('window:restore'),
    close: () => safeInvoke('window:close'),
    isMaximized: () => safeInvoke('window:isMaximized'),
    
    // 监听窗口最大化状态变化
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
      const unsubscribeMaximized = safeOn('window:maximized', () => callback(true));
      const unsubscribeUnmaximized = safeOn('window:unmaximized', () => callback(false));
      
      // 返回清理函数
      return () => {
        unsubscribeMaximized();
        unsubscribeUnmaximized();
      };
    },
    
    // 移除最大化状态变化监听器
    removeMaximizeChangeListener: (_callback: (isMaximized: boolean) => void) => {
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
    getPath: (name: string) => safeInvoke('app:getPath', name)
  },

  // Menu event listeners with cleanup support
  menu: {
    onNewProject: (callback: () => void) => safeOn('menu:new-project', callback),
    onOpenProject: (callback: () => void) => safeOn('menu:open-project', callback),
    onSaveProject: (callback: () => void) => safeOn('menu:save-project', callback),
    onExport: (callback: () => void) => safeOn('menu:export', callback),
    onUndo: (callback: () => void) => safeOn('menu:undo', callback),
    onRedo: (callback: () => void) => safeOn('menu:redo', callback),
    onZoomIn: (callback: () => void) => safeOn('menu:zoom-in', callback),
    onZoomOut: (callback: () => void) => safeOn('menu:zoom-out', callback),
    onFitToScreen: (callback: () => void) => safeOn('menu:fit-to-screen', callback)
  },

  // Utility functions
  removeAllListeners: (channel: string) => {
    try {
      ipcRenderer.removeAllListeners(channel);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to remove listeners for ${channel}:`, error);
    }
  },

  // Health check for communication
  healthCheck: () => safeInvoke('ipc:healthCheck')
});

// Type definitions for the exposed API
export interface ElectronAPI {
  fs: {
    readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    writeFile: (filePath: string, data: unknown) => Promise<{ success: boolean; path?: string; error?: string }>;
    exists: (filePath: string) => Promise<boolean>;
    createDirectory: (dirPath: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
    getSize: () => Promise<{ success: boolean; data?: { width: number; height: number }; error?: string }>;
    setSize: (width: number, height: number, animate?: boolean) => Promise<{ success: boolean; error?: string }>;
    setResizable: (resizable: boolean) => Promise<{ success: boolean; error?: string }>;
    center: () => Promise<{ success: boolean; error?: string }>;
    onMaximized: (callback: () => void) => void;
    onUnmaximized: (callback: () => void) => void;
    onEnterFullScreen: (callback: () => void) => void;
    onLeaveFullScreen: (callback: () => void) => void;
  };
  windowControl: {
    minimize: () => Promise<{ success: boolean; data?: any; error?: string }>;
    maximize: () => Promise<{ success: boolean; data?: any; error?: string }>;
    restore: () => Promise<{ success: boolean; data?: any; error?: string }>;
    close: () => Promise<{ success: boolean; data?: any; error?: string }>;
    isMaximized: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
    removeMaximizeChangeListener: (callback: (isMaximized: boolean) => void) => void;
  };
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
  };
  menu: {
    onNewProject: (callback: () => void) => void;
    onOpenProject: (callback: () => void) => void;
    onSaveProject: (callback: () => void) => void;
    onExport: (callback: () => void) => void;
    onUndo: (callback: () => void) => void;
    onRedo: (callback: () => void) => void;
    onZoomIn: (callback: () => void) => void;
    onZoomOut: (callback: () => void) => void;
    onFitToScreen: (callback: () => void) => void;
  };
  removeAllListeners: (channel: string) => void;
  healthCheck: () => Promise<{ success: boolean; timestamp?: number; message?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}