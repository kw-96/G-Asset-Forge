import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, data: any) => ipcRenderer.invoke('fs:writeFile', filePath, data),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    createDirectory: (dirPath: string) => ipcRenderer.invoke('fs:createDirectory', dirPath)
  },

  // Window operations
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    
    // Window state listeners
    onMaximized: (callback: () => void) => ipcRenderer.on('window:maximized', callback),
    onUnmaximized: (callback: () => void) => ipcRenderer.on('window:unmaximized', callback),
    onEnterFullScreen: (callback: () => void) => ipcRenderer.on('window:enter-full-screen', callback),
    onLeaveFullScreen: (callback: () => void) => ipcRenderer.on('window:leave-full-screen', callback)
  },

  // App information
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform')
  },

  // Menu event listeners
  menu: {
    onNewProject: (callback: () => void) => ipcRenderer.on('menu:new-project', callback),
    onOpenProject: (callback: () => void) => ipcRenderer.on('menu:open-project', callback),
    onSaveProject: (callback: () => void) => ipcRenderer.on('menu:save-project', callback),
    onExport: (callback: () => void) => ipcRenderer.on('menu:export', callback),
    onUndo: (callback: () => void) => ipcRenderer.on('menu:undo', callback),
    onRedo: (callback: () => void) => ipcRenderer.on('menu:redo', callback),
    onZoomIn: (callback: () => void) => ipcRenderer.on('menu:zoom-in', callback),
    onZoomOut: (callback: () => void) => ipcRenderer.on('menu:zoom-out', callback),
    onFitToScreen: (callback: () => void) => ipcRenderer.on('menu:fit-to-screen', callback)
  },

  // Remove all listeners for cleanup
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
});

// Type definitions for the exposed API
export interface ElectronAPI {
  fs: {
    readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    writeFile: (filePath: string, data: any) => Promise<{ success: boolean; path?: string; error?: string }>;
    exists: (filePath: string) => Promise<boolean>;
    createDirectory: (dirPath: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    onMaximized: (callback: () => void) => void;
    onUnmaximized: (callback: () => void) => void;
    onEnterFullScreen: (callback: () => void) => void;
    onLeaveFullScreen: (callback: () => void) => void;
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}