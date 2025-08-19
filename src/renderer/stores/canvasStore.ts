/**
 * 画布状态管理 - 管理无限画布的视图和显示状态
 * @description 管理画布缩放、平移、网格、标尺等视图相关状态
 * @author 开发团队
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 简化的游戏素材预设
const SIMPLE_GAME_ASSET_PRESETS = {
  MOBILE_PORTRAIT: { width: 1080, height: 1920, name: '手机竖屏 (1080x1920)' },
  MOBILE_LANDSCAPE: { width: 1920, height: 1080, name: '手机横屏 (1920x1080)' },
  TABLET_PORTRAIT: { width: 768, height: 1024, name: '平板竖屏 (768x1024)' },
  TABLET_LANDSCAPE: { width: 1024, height: 768, name: '平板横屏 (1024x768)' },
  DESKTOP: { width: 1920, height: 1080, name: '桌面 (1920x1080)' },
  SQUARE: { width: 1080, height: 1080, name: '正方形 (1080x1080)' },
  HD: { width: 1280, height: 720, name: 'HD (1280x720)' },
  ICON_SMALL: { width: 64, height: 64, name: '小图标 (64x64)' },
  ICON_MEDIUM: { width: 128, height: 128, name: '中图标 (128x128)' },
  ICON_LARGE: { width: 256, height: 256, name: '大图标 (256x256)' }
};

export interface CanvasState {
  // 无限画布属性
  zoom: number; // 缩放级别 (1 = 100%, 0.1 = 10%, 32 = 3200%)
  panX: number; // 水平平移
  panY: number; // 垂直平移
  
  // 显示选项
  showGrid: boolean;
  showRuler: boolean;
  snapToGrid: boolean;
  
  // 画布设置
  backgroundColor: string;
  gridSize: number;
  
  // 性能跟踪
  fps: number;
  memoryUsage: number;
  objectCount: number;
  
  // 画布预设
  presets: typeof SIMPLE_GAME_ASSET_PRESETS;
  
  // 操作方法
  initializeCanvas: () => Promise<void>;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowRuler: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setBackgroundColor: (color: string) => void;
  setGridSize: (size: number) => void;
  
  // 视图控制
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetView: () => void;
  centerView: () => void;
  
  // 性能监控
  updatePerformanceMetrics: (fps: number, memory: number, objectCount?: number) => void;
  
  // 预设操作
  applyPreset: (presetKey: keyof typeof SIMPLE_GAME_ASSET_PRESETS) => void;
  getPresetList: () => Array<{ key: string; name: string; width: number; height: number }>;
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      zoom: 1, // 改为倍数系统：1 = 100%
      panX: 0,
      panY: 0,
      showGrid: true,
      showRuler: true,
      snapToGrid: false,
      backgroundColor: '#ffffff',
      gridSize: 1, // 改为1px，支持1px精度的网格线
      fps: 60,
      memoryUsage: 0,
      objectCount: 0,
      presets: SIMPLE_GAME_ASSET_PRESETS,

      // 初始化画布
      initializeCanvas: async () => {
        try {
          console.log('无限画布系统初始化成功');
          set({ 
            fps: 60, 
            memoryUsage: 0, 
            objectCount: 0,
            zoom: 1, // 改为倍数系统：1 = 100%
            panX: 0,
            panY: 0
          });
        } catch (error) {
          console.error('画布初始化失败:', error);
        }
      },

      // 缩放控制 - 统一使用倍数系统，与ZoomPanContext保持一致
      setZoom: (zoom: number) => {
        const clampedZoom = Math.max(0.1, Math.min(32, zoom)); // 支持0.1-32倍缩放 (10%-3200%)
        set({ zoom: clampedZoom });
      },

      zoomIn: () => {
        const { zoom } = get();
        // 扩展缩放级别，支持精确编辑 - 使用倍数系统
        const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 8, 12, 16, 24, 32];
        const currentIndex = zoomLevels.findIndex(level => level >= zoom);
        const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
        const nextZoom = zoomLevels[nextIndex];
        if (nextZoom !== undefined) {
          set({ zoom: nextZoom });
        }
      },

      zoomOut: () => {
        const { zoom } = get();
        // 扩展缩放级别，支持精确编辑 - 使用倍数系统
        const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 8, 12, 16, 24, 32];
        const currentIndex = zoomLevels.findIndex(level => level >= zoom);
        const prevIndex = Math.max(currentIndex - 1, 0);
        const prevZoom = zoomLevels[prevIndex];
        if (prevZoom !== undefined) {
          set({ zoom: prevZoom });
        }
      },

      zoomToFit: () => {
        // TODO: 根据元素范围计算合适的缩放级别
        set({ zoom: 1, panX: 0, panY: 0 }); // 改为倍数系统：1 = 100%
      },

      // 平移控制
      setPan: (x: number, y: number) => {
        set({ panX: x, panY: y });
      },

      centerView: () => {
        set({ panX: 0, panY: 0 });
      },

      resetView: () => {
        set({ zoom: 1, panX: 0, panY: 0 }); // 改为倍数系统：1 = 100%
      },

      // 显示选项
      setShowGrid: (show: boolean) => {
        set({ showGrid: show });
      },

      setShowRuler: (show: boolean) => {
        set({ showRuler: show });
      },

      setSnapToGrid: (snap: boolean) => {
        set({ snapToGrid: snap });
      },

      // 画布设置
      setBackgroundColor: (color: string) => {
        set({ backgroundColor: color });
      },

      setGridSize: (size: number) => {
        const clampedSize = Math.max(10, Math.min(100, size));
        set({ gridSize: clampedSize });
      },

      // 性能监控
      updatePerformanceMetrics: (fps: number, memory: number, objectCount = 0) => {
        set({ fps, memoryUsage: memory, objectCount });
      },

      // 预设操作
      applyPreset: (presetKey: keyof typeof SIMPLE_GAME_ASSET_PRESETS) => {
        const preset = SIMPLE_GAME_ASSET_PRESETS[presetKey];
        if (preset) {
          // 对于无限画布，预设主要用于参考尺寸
          console.log(`应用预设: ${preset.name} (${preset.width}x${preset.height})`);
        }
      },

      getPresetList: () => {
        return Object.entries(SIMPLE_GAME_ASSET_PRESETS).map(([key, preset]) => ({
          key,
          name: preset.name,
          width: preset.width,
          height: preset.height
        }));
      },
    }),
    {
      name: 'infinite-canvas-store',
    }
  )
);