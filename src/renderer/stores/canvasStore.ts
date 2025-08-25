/**
 * 画布状态管理 - 统一管理Suika画布的视图和显示状态
 * @description 与Suika引擎集成，管理画布缩放、平移、网格、标尺等视图相关状态
 * @author 开发团队
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SuikaEditor } from '../logic/engines/suika';



export interface CanvasState {
  // Suika编辑器实例
  suikaEditor: SuikaEditor | null;
  
  // Suika工具状态
  suikaToolState: {
    activeTool: string;
    enabledTools: string[];
    isPathEditorActive: boolean;
  };
  
  // 画布模式
  mode: 'design' | 'h5';
  
  // 无限画布属性 (与Suika同步)
  zoom: number; // 缩放级别 (1 = 100%, 0.1 = 10%, 32 = 3200%)
  panX: number; // 水平平移
  panY: number; // 垂直平移
  
  // 显示选项
  showGrid: boolean;
  showRuler: boolean;
  showGuides: boolean; // 参考线显示状态
  snapToGrid: boolean;
  
  // 画布设置
  backgroundColor: string;
  gridSize: number;
  
  // 性能跟踪
  fps: number;
  memoryUsage: number;
  objectCount: number;
  

  
  // Suika集成方法
  setSuikaEditor: (editor: SuikaEditor | null) => void;
  syncFromSuika: () => void;
  syncToSuika: () => void;
  
  // 模式切换
  setMode: (mode: 'design' | 'h5') => void;
  
  // 操作方法 (通过Suika执行)
  initializeCanvas: () => Promise<void>;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowRuler: (show: boolean) => void;
  setShowGuides: (show: boolean) => void; // 设置参考线显示
  setSnapToGrid: (snap: boolean) => void;
  setBackgroundColor: (color: string) => void;
  setGridSize: (size: number) => void;
  
  // 视图控制 (通过Suika执行)
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetView: () => void;
  centerView: () => void;
  
  // 性能监控
  updatePerformanceMetrics: (fps: number, memory: number, objectCount?: number) => void;
  


  // Suika工具状态管理
  updateSuikaToolState: (toolState: Partial<CanvasState['suikaToolState']>) => void;
  setSuikaActiveTool: (toolName: string) => void;
  setSuikaEnabledTools: (tools: string[]) => void;
  setSuikaPathEditorActive: (active: boolean) => void;
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      // Suika集成状态
      suikaEditor: null,
      suikaToolState: {
        activeTool: 'select',
        enabledTools: [],
        isPathEditorActive: false,
      },
      mode: 'design',
      
      // 初始状态
      zoom: 1, // 改为倍数系统：1 = 100%
      panX: 0,
      panY: 0,
      showGrid: true,
      showRuler: true,
      showGuides: true, // 默认显示参考线
      snapToGrid: false,
      backgroundColor: '#ffffff',
      gridSize: 1, // 改为1px，支持1px精度的网格线
      fps: 60,
      memoryUsage: 0,
      objectCount: 0,


      // Suika集成方法
      setSuikaEditor: (editor: SuikaEditor | null) => {
        set({ suikaEditor: editor });
        if (editor) {
          // 同步初始状态到Suika
          const state = get();
          state.syncToSuika();
        }
      },

      syncFromSuika: () => {
        const { suikaEditor } = get();
        if (!suikaEditor) return;

        try {
          const zoom = suikaEditor.viewportManager?.getZoom() || 1;
          const pos = suikaEditor.viewportManager?.getPos() || { x: 0, y: 0 };
          const showGrid = suikaEditor.setting?.get('enablePixelGrid') || false;
          const showRuler = suikaEditor.setting?.get('enableRuler') || false;
          const snapToGrid = suikaEditor.setting?.get('snapToGrid') || false;

          set({
            zoom,
            panX: pos.x,
            panY: pos.y,
            showGrid,
            showRuler,
            snapToGrid,
          });
        } catch (error) {
          console.warn('[canvas-store] 从Suika同步状态失败:', error);
        }
      },

      syncToSuika: () => {
        const { suikaEditor, zoom, showGrid, snapToGrid, showRuler, showGuides } = get();
        if (!suikaEditor) return;

        try {
          // 同步视口状态 - 使用正确的Suika API
          const pageSize = suikaEditor.viewportManager.getPageSize();
          const center = { x: pageSize.width / 2, y: pageSize.height / 2 };
          suikaEditor.viewportManager?.setZoom(zoom, center);
          
          // 同步显示设置
          suikaEditor.setting?.set('enablePixelGrid', showGrid);
          suikaEditor.setting?.set('enableRuler', showRuler);
          suikaEditor.setting?.set('snapToGrid', snapToGrid);
          suikaEditor.setting?.set('snapToObjects', showGuides); // 参考线通过snapToObjects控制
          
          // 重新渲染
          suikaEditor.render?.();
        } catch (error) {
          console.warn('[canvas-store] 同步状态到Suika失败:', error);
        }
      },

      // 模式切换
      setMode: (mode: 'design' | 'h5') => {
        const { suikaEditor } = get();
        set({ mode });
        
        if (suikaEditor) {
          // 根据模式调整Suika设置
          if (mode === 'h5') {
            // H5模式：禁用网格，中心画布区域跟设计模式保持一致
            suikaEditor.setting?.set('enablePixelGrid', false);
          } else {
            // 设计模式：启用网格，无限画布
            suikaEditor.setting?.set('enablePixelGrid', get().showGrid);
          }
          suikaEditor.render?.();
        }
      },

      // 初始化画布 (通过Suika)
      initializeCanvas: async () => {
        try {
          set({ 
            fps: 60, 
            memoryUsage: 0, 
            objectCount: 0,
            zoom: 1, // 改为倍数系统：1 = 100%
            panX: 0,
            panY: 0
          });
          
          // 同步到Suika
          get().syncToSuika();
        } catch (error) {
          console.error('画布初始化失败:', error);
        }
      },

      // 缩放控制 - 通过Suika执行
      setZoom: (zoom: number) => {
        const { suikaEditor } = get();
        const clampedZoom = Math.max(0.1, Math.min(32, zoom)); // 支持0.1-32倍缩放 (10%-3200%)
        
        set({ zoom: clampedZoom });
        
        if (suikaEditor?.viewportManager) {
          // 使用视口中心作为缩放中心
          const pageSize = suikaEditor.viewportManager.getPageSize();
          const center = { x: pageSize.width / 2, y: pageSize.height / 2 };
          suikaEditor.viewportManager.setZoom(clampedZoom, center);
          suikaEditor.render?.();
        }
      },

      zoomIn: () => {
        const { zoom, suikaEditor } = get();
        // 扩展缩放级别，支持精确编辑 - 使用倍数系统
        const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 8, 12, 16, 24, 32];
        const currentIndex = zoomLevels.findIndex(level => level >= zoom);
        const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
        const nextZoom = zoomLevels[nextIndex];
        
        if (nextZoom !== undefined) {
          set({ zoom: nextZoom });
          
          if (suikaEditor?.viewportManager) {
            suikaEditor.viewportManager.zoomIn();
            suikaEditor.render?.();
          }
        }
      },

      zoomOut: () => {
        const { zoom, suikaEditor } = get();
        // 扩展缩放级别，支持精确编辑 - 使用倍数系统
        const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 8, 12, 16, 24, 32];
        const currentIndex = zoomLevels.findIndex(level => level >= zoom);
        const prevIndex = Math.max(currentIndex - 1, 0);
        const prevZoom = zoomLevels[prevIndex];
        
        if (prevZoom !== undefined) {
          set({ zoom: prevZoom });
          
          if (suikaEditor?.viewportManager) {
            suikaEditor.viewportManager.zoomOut();
            suikaEditor.render?.();
          }
        }
      },

      zoomToFit: () => {
        const { suikaEditor } = get();
        set({ zoom: 1, panX: 0, panY: 0 }); // 改为倍数系统：1 = 100%
        
        if (suikaEditor?.viewportManager) {
          suikaEditor.viewportManager.zoomToFit();
          suikaEditor.render?.();
          // 同步状态
          get().syncFromSuika();
        }
      },

      // 平移控制 - 通过Suika执行
      setPan: (x: number, y: number) => {
        const { suikaEditor } = get();
        set({ panX: x, panY: y });
        
        if (suikaEditor?.viewportManager) {
          // 使用translate方法进行平移
          const currentPos = suikaEditor.viewportManager.getPos();
          const deltaX = x - currentPos.x;
          const deltaY = y - currentPos.y;
          suikaEditor.viewportManager.translate(deltaX, deltaY);
          suikaEditor.render?.();
        }
      },

      centerView: () => {
        const { suikaEditor } = get();
        set({ panX: 0, panY: 0 });
        
        if (suikaEditor?.viewportManager) {
          // 重置视口到中心
          suikaEditor.viewportManager.resetViewport();
          suikaEditor.render?.();
          // 同步状态
          get().syncFromSuika();
        }
      },

      resetView: () => {
        const { suikaEditor } = get();
        set({ zoom: 1, panX: 0, panY: 0 }); // 改为倍数系统：1 = 100%
        
        if (suikaEditor?.viewportManager) {
          suikaEditor.viewportManager.resetViewport();
          suikaEditor.render?.();
          // 同步状态
          get().syncFromSuika();
        }
      },

      // 显示选项 - 通过Suika执行
      setShowGrid: (show: boolean) => {
        const { suikaEditor, mode } = get();
        set({ showGrid: show });
        
        if (suikaEditor?.setting) {
          // H5模式下不显示网格
          const shouldShow = show && mode === 'design';
          suikaEditor.setting.set('enablePixelGrid', shouldShow);
          suikaEditor.render?.();
        }
      },

      setShowRuler: (show: boolean) => {
        const { suikaEditor } = get();
        set({ showRuler: show });
        
        if (suikaEditor) {
          if (show) {
            suikaEditor.ruler?.open();
          } else {
            suikaEditor.ruler?.close();
          }
          suikaEditor.render?.();
        }
      },

      setShowGuides: (show: boolean) => {
        const { suikaEditor } = get();
        set({ showGuides: show });
        
        if (suikaEditor?.setting) {
          // 参考线通过snapToObjects控制，当启用对象吸附时会显示参考线
          // 注意：这里不应该影响snapToObjects，因为它是吸附功能，不是显示功能
          // 参考线的显示应该通过其他方式控制
          if (show) {
            // 启用参考线显示
            suikaEditor.setting.set('showGuides', true);
          } else {
            // 隐藏参考线显示
            suikaEditor.setting.set('showGuides', false);
          }
          suikaEditor.render?.();
        }
      },

      setSnapToGrid: (snap: boolean) => {
        const { suikaEditor } = get();
        set({ snapToGrid: snap });
        
        if (suikaEditor?.setting) {
          suikaEditor.setting.set('snapToGrid', snap);
          // 注意：snapToObjects不应该被snapToGrid影响，它们是独立的功能
          // suikaEditor.setting.set('snapToObjects', snap);
          suikaEditor.render?.();
        }
      },

      // 画布设置 - 通过Suika执行
      setBackgroundColor: (color: string) => {
        const { suikaEditor } = get();
        set({ backgroundColor: color });
        
        if (suikaEditor?.setting) {
          // 使用正确的Suika设置名称
          suikaEditor.setting.set('canvasBgColor', color);
          suikaEditor.render?.();
        }
      },

      setGridSize: (size: number) => {
        const { suikaEditor } = get();
        const clampedSize = Math.max(10, Math.min(100, size));
        set({ gridSize: clampedSize });
        
        if (suikaEditor?.setting) {
          // 暂时注释掉gridSize设置，等待API完善
          console.log('[canvas-store] 设置网格大小:', clampedSize);
          // suikaEditor.setting.set('gridSize', clampedSize);
          suikaEditor.render?.();
        }
      },

      // 性能监控
      updatePerformanceMetrics: (fps: number, memory: number, objectCount = 0) => {
        set({ fps, memoryUsage: memory, objectCount });
      },

      // Suika工具状态管理
      updateSuikaToolState: (toolState: Partial<CanvasState['suikaToolState']>) => {
        set(state => ({
          suikaToolState: {
            ...state.suikaToolState,
            ...toolState,
          }
        }));
      },

      setSuikaActiveTool: (toolName: string) => {
        set(state => ({
          suikaToolState: {
            ...state.suikaToolState,
            activeTool: toolName,
          }
        }));
      },

      setSuikaEnabledTools: (tools: string[]) => {
        set(state => ({
          suikaToolState: {
            ...state.suikaToolState,
            enabledTools: tools,
          }
        }));
      },

      setSuikaPathEditorActive: (active: boolean) => {
        set(state => ({
          suikaToolState: {
            ...state.suikaToolState,
            isPathEditorActive: active,
          }
        }));
      },
    }),
    {
      name: 'infinite-canvas-store',
    }
  )
);