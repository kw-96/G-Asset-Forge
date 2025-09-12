const { contextBridge, ipcRenderer } = require('electron');

// 暴露受保护的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 菜单事件监听
  onMenuNew: (callback) => ipcRenderer.on('menu-new', callback),
  onMenuOpen: (callback) => ipcRenderer.on('menu-open', callback),
  onMenuSave: (callback) => ipcRenderer.on('menu-save', callback),

  // 窗口控制 API
  windowControl: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    restore: () => ipcRenderer.invoke('window:restore'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizeChange: (callback) =>
      ipcRenderer.on('window:maximized', () => callback(true)),
    resize: (width, height, resizable = true) =>
      ipcRenderer.invoke('window:resize', { width, height, resizable }),
  },

  // 窗口状态事件
  onWindowMaximized: (callback) => ipcRenderer.on('window:maximized', callback),
  onWindowUnmaximized: (callback) =>
    ipcRenderer.on('window:unmaximized', callback),
  onWindowEnterFullScreen: (callback) =>
    ipcRenderer.on('window:enter-full-screen', callback),
  onWindowLeaveFullScreen: (callback) =>
    ipcRenderer.on('window:leave-full-screen', callback),

  // 移除事件监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // 平台信息
  platform: process.platform,

  // 版本信息
  versions: process.versions,

  // 文件操作 API
  saveFile: async (options) => {
    return await ipcRenderer.invoke('file:save', options);
  },

  saveFileDialog: async (filename, data) => {
    return await ipcRenderer.invoke('file:save-dialog', { filename, data });
  },

  getDefaultDirectory: async () => {
    return await ipcRenderer.invoke('file:get-default-directory');
  },

  readFile: async (options) => {
    return await ipcRenderer.invoke('file:read', options);
  },

  deleteFile: async (options) => {
    return await ipcRenderer.invoke('file:delete', options);
  },

  readDirectory: async (options) => {
    return await ipcRenderer.invoke('file:read-directory', options);
  },
});

// 当 DOM 加载完成后设置一些默认行为
window.addEventListener('DOMContentLoaded', () => {
  // 设置页面标题
  document.title = 'G-Asset Forge';

  // 添加一些桌面应用特有的样式
  const style = document.createElement('style');
  style.textContent = `
    /* 桌面应用特有的样式 */
    body {
      -webkit-user-select: none;
      user-select: none; /* 防止文本选择 */
    }

    /* 标题栏区域允许拖动窗口，但标签页区域除外 */
    .sk-header {
      -webkit-app-region: drag; /* 允许拖动窗口 */
    }

    .project-tab {
      -webkit-app-region: no-drag !important;
      app-region: no-drag !important;
    }

    /* 自定义滚动条 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `;
  document.head.appendChild(style);
});
