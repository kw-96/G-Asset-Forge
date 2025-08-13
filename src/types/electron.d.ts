// 定义 ElectronAPI 接口，用于与 Electron 主进程通信
interface ElectronAPI {
  // 应用程序相关功能
  app: {
    getVersion: () => Promise<string>; // 获取应用程序版本
    getPlatform: () => Promise<string>; // 获取运行平台
    quit: () => void; // 退出应用程序
  };
  
  // 窗口控制功能
  windowControl: {
    minimize: () => Promise<{ success: boolean }>; // 最小化窗口
    maximize: () => Promise<{ success: boolean }>; // 最大化窗口
    restore: () => Promise<{ success: boolean }>; // 还原窗口
    close: () => Promise<{ success: boolean }>; // 关闭窗口
    isMaximized: () => Promise<boolean>; // 检查窗口是否已最大化
    onMaximizeChange: (callback: (maximized: boolean) => void) => void; // 监听窗口最大化状态变化
    removeMaximizeChangeListener: (callback: (maximized: boolean) => void) => void; // 移除最大化状态监听器
  };

  // 新增的窗口控制功能
  window: {
    setSize: (width: number, height: number, animate?: boolean) => Promise<{ success: boolean }>; // 设置窗口大小
    getSize: () => Promise<{ success: boolean; data?: { width: number; height: number } }>; // 获取窗口大小
    setResizable: (resizable: boolean) => Promise<{ success: boolean }>; // 设置窗口是否可调整大小
    center: () => Promise<{ success: boolean }>; // 居中窗口
  };
  
  // 菜单相关功能
  menu: {
    onNewProject: (callback: () => void) => void; // 新建项目事件监听
    onOpenProject: (callback: () => void) => void; // 打开项目事件监听
    onSaveProject: (callback: () => void) => void; // 保存项目事件监听
    onExport: (callback: () => void) => void; // 导出事件监听
    onUndo: (callback: () => void) => void; // 撤销操作事件监听
    onRedo: (callback: () => void) => void; // 重做操作事件监听
    onZoomIn: (callback: () => void) => void; // 放大事件监听
    onZoomOut: (callback: () => void) => void; // 缩小事件监听
    onFitToScreen: (callback: () => void) => void; // 适应屏幕事件监听
  };

  removeAllListeners: (channel: string) => void; // 移除所有指定通道的监听器
}

// 扩展全局 Window 接口，添加 electronAPI 属性
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// 导出空对象，确保此文件被视为模块
export { };

