// 全局类型定义，用于G-Asset Forge

import { ElectronAPI } from '../main/preload';

// 扩展全局Window接口，添加electronAPI属性
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Fabric.js库的类型扩展
declare module 'fabric' {
  namespace fabric {
    // 扩展Canvas接口，添加拖拽相关属性
    interface Canvas {
      isDragging?: boolean;
      lastPosX?: number;
      lastPosY?: number;
    }
  }
}

// 扩展Performance接口，添加内存相关属性
interface Performance {
  memory?: {
    usedJSHeapSize: number;    // 已使用的JS堆大小
    totalJSHeapSize: number;   // 总JS堆大小
    jsHeapSizeLimit: number;   // JS堆大小限制
  };
}

// 空导出，确保文件被视为模块
export {};
