// @ts-nocheck
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fabric } from 'fabric';

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

interface CanvasState {
  // Canvas instance
  canvas: any | null;
  canvasContainer: HTMLElement | null;
  
  // Canvas properties
  width: number;
  height: number;
  zoom: number;
  backgroundColor: string;
  
  // View state
  panX: number;
  panY: number;
  
  // Performance tracking
  fps: number;
  memoryUsage: number;
  objectCount: number;
  
  // Canvas presets
  presets: typeof SIMPLE_GAME_ASSET_PRESETS;
  
  // Actions
  initializeCanvas: () => Promise<void>;
  setCanvas: (canvas: any | null) => void;
  setCanvasContainer: (container: HTMLElement | null) => void;
  setCanvasSize: (width: number, height: number) => void;
  setZoom: (zoom: number) => void;
  setBackgroundColor: (color: string) => void;
  setPan: (x: number, y: number) => void;
  fitToScreen: () => void;
  resetView: () => void;
  updatePerformanceMetrics: (fps: number, memory: number, objectCount?: number) => void;
  destroyCanvas: () => void;
  
  // Preset actions
  applyPreset: (presetKey: keyof typeof SIMPLE_GAME_ASSET_PRESETS) => void;
  getPresetList: () => Array<{ key: string; name: string; width: number; height: number }>;
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      // Initial state
      canvas: null,
      canvasContainer: null,
      width: 1920,
      height: 1080,
      zoom: 1,
      backgroundColor: '#ffffff',
      panX: 0,
      panY: 0,
      fps: 60,
      memoryUsage: 0,
      objectCount: 0,
      presets: SIMPLE_GAME_ASSET_PRESETS,

      // Actions
      initializeCanvas: async () => {
        try {
          console.log('Canvas store initialized successfully');
          // 初始化基本设置
          set({ 
            fps: 60, 
            memoryUsage: 0, 
            objectCount: 0,
            zoom: 1,
            panX: 0,
            panY: 0
          });
        } catch (error) {
          console.error('Failed to initialize canvas store:', error);
          // 不抛出错误，让应用继续初始化
        }
      },

      setCanvas: (canvas: unknown | null) => {
        set({ canvas });
      },

      setCanvasContainer: (container: HTMLElement | null) => {
        set({ canvasContainer: container });
      },

      setCanvasSize: (width: number, height: number) => {
        const { canvas } = get();
        if (canvas) {
          canvas.setDimensions({ width, height });
          canvas.renderAll();
        }
        set({ width, height });
      },

      setZoom: (zoom: number) => {
        const { canvas } = get();
        const clampedZoom = Math.max(0.1, Math.min(5, zoom));
        
        if (canvas) {
          canvas.setZoom(clampedZoom);
          canvas.renderAll();
        }
        
        set({ zoom: clampedZoom });
      },

      setBackgroundColor: (color: string) => {
        const { canvas } = get();
        if (canvas) {
          canvas.setBackgroundColor(color, () => {
            canvas.renderAll();
          });
        }
        set({ backgroundColor: color });
      },

      setPan: (x: number, y: number) => {
        const { canvas } = get();
        if (canvas) {
          canvas.relativePan(new any(x - get().panX, y - get().panY));
          canvas.renderAll();
        }
        set({ panX: x, panY: y });
      },

      fitToScreen: () => {
        const { canvas, canvasContainer, width, height } = get();
        if (!canvas || !canvasContainer) return;

        const containerRect = canvasContainer.getBoundingClientRect();
        const scaleX = (containerRect.width - 40) / width;
        const scaleY = (containerRect.height - 40) / height;
        const scale = Math.min(scaleX, scaleY, 1);

        canvas.setZoom(scale);
        canvas.absolutePan(new any(
          (containerRect.width - width * scale) / 2,
          (containerRect.height - height * scale) / 2
        ));
        canvas.renderAll();

        set({ zoom: scale, panX: 0, panY: 0 });
      },

      resetView: () => {
        const { canvas } = get();
        if (canvas) {
          canvas.setZoom(1);
          canvas.absolutePan(new any(0, 0));
          canvas.renderAll();
        }
        set({ zoom: 1, panX: 0, panY: 0 });
      },

      updatePerformanceMetrics: (fps: number, memory: number, objectCount = 0) => {
        set({ fps, memoryUsage: memory, objectCount });
      },

      destroyCanvas: () => {
        const { canvas } = get();
        if (canvas) {
          canvas.dispose();
        }
        set({ 
          canvas: null, 
          canvasContainer: null,
          panX: 0,
          panY: 0,
          zoom: 1
        });
      },

      // Preset actions
      applyPreset: (presetKey: keyof typeof SIMPLE_GAME_ASSET_PRESETS) => {
        const preset = SIMPLE_GAME_ASSET_PRESETS[presetKey];
        if (preset) {
          get().setCanvasSize(preset.width, preset.height);
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
      name: 'canvas-store',
    }
  )
);