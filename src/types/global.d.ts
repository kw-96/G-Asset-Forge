// Global type definitions for G-Asset Forge

import { ElectronAPI } from '../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Fabric.js extensions
declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      isDragging?: boolean;
      lastPosX?: number;
      lastPosY?: number;
    }
  }
}

// Performance API extension
interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export {};