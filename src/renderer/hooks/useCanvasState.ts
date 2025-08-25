/**
 * 画布状态管理Hook - 管理标尺、网格、参考线等显示状态
 * @description 提供画布显示选项的状态管理和事件监听
 * @author 开发团队
 */

import { useState, useEffect, useCallback } from 'react';
import { canvasEvents } from '../logic/utils/events/canvasEvents';
import { useCanvasStore } from '../stores/canvasStore';

export interface CanvasDisplayState {
  showGrid: boolean;
  showRuler: boolean;
  showGuides: boolean;
}

export interface CanvasStateHook {
  displayState: CanvasDisplayState;
  toggleGrid: () => void;
  toggleRuler: () => void;
  toggleGuides: () => void;
  setShowGrid: (show: boolean) => void;
  setShowRuler: (show: boolean) => void;
  setShowGuides: (show: boolean) => void;
}

/**
 * 画布状态管理Hook
 * @param initialState 初始状态
 * @returns 画布状态和控制方法
 */
export const useCanvasState = (initialState?: Partial<CanvasDisplayState>): CanvasStateHook => {
  const { setShowGrid: setStoreShowGrid, setShowRuler: setStoreShowRuler, setShowGuides: setStoreShowGuides } = useCanvasStore();
  
  const [displayState, setDisplayState] = useState<CanvasDisplayState>({
    showGrid: true,
    showRuler: true,
    showGuides: true,
    ...initialState
  });

  // 切换网格显示
  const toggleGrid = useCallback(() => {
    setDisplayState(prev => {
      const newShowGrid = !prev.showGrid;
      setStoreShowGrid(newShowGrid); // 同步到canvas store
      return {
        ...prev,
        showGrid: newShowGrid
      };
    });
  }, [setStoreShowGrid]);

  // 切换标尺显示
  const toggleRuler = useCallback(() => {
    setDisplayState(prev => {
      const newShowRuler = !prev.showRuler;
      setStoreShowRuler(newShowRuler); // 同步到canvas store
      return {
        ...prev,
        showRuler: newShowRuler
      };
    });
  }, [setStoreShowRuler]);

  // 切换参考线显示
  const toggleGuides = useCallback(() => {
    setDisplayState(prev => {
      const newShowGuides = !prev.showGuides;
      setStoreShowGuides(newShowGuides); // 同步到canvas store
      return {
        ...prev,
        showGuides: newShowGuides
      };
    });
  }, [setStoreShowGuides]);

  // 设置网格显示
  const setShowGrid = useCallback((show: boolean) => {
    setDisplayState(prev => ({
      ...prev,
      showGrid: show
    }));
    // 使用setTimeout避免在渲染过程中调用store方法
    setTimeout(() => setStoreShowGrid(show), 0);
  }, [setStoreShowGrid]);

  // 设置标尺显示
  const setShowRuler = useCallback((show: boolean) => {
    setDisplayState(prev => ({
      ...prev,
      showRuler: show
    }));
    // 使用setTimeout避免在渲染过程中调用store方法
    setTimeout(() => setStoreShowRuler(show), 0);
  }, [setStoreShowRuler]);

  // 设置参考线显示
  const setShowGuides = useCallback((show: boolean) => {
    setDisplayState(prev => ({
      ...prev,
      showGuides: show
    }));
    // 使用setTimeout避免在渲染过程中调用store方法
    setTimeout(() => setStoreShowGuides(show), 0);
  }, [setStoreShowGuides]);

  // 监听画布事件
  useEffect(() => {
    const handleToggleGrid = () => {
      setDisplayState(prev => {
        const newShowGrid = !prev.showGrid;
        // 使用setTimeout避免在渲染过程中调用store方法
        setTimeout(() => setStoreShowGrid(newShowGrid), 0);
        return {
          ...prev,
          showGrid: newShowGrid
        };
      });
    };

    const handleToggleRuler = () => {
      setDisplayState(prev => {
        const newShowRuler = !prev.showRuler;
        // 使用setTimeout避免在渲染过程中调用store方法
        setTimeout(() => setStoreShowRuler(newShowRuler), 0);
        return {
          ...prev,
          showRuler: newShowRuler
        };
      });
    };

    const handleToggleGuides = () => {
      setDisplayState(prev => {
        const newShowGuides = !prev.showGuides;
        // 使用setTimeout避免在渲染过程中调用store方法
        setTimeout(() => setStoreShowGuides(newShowGuides), 0);
        return {
          ...prev,
          showGuides: newShowGuides
        };
      });
    };

    // 注册事件监听器
    canvasEvents.on('toggleGrid', handleToggleGrid);
    canvasEvents.on('toggleRuler', handleToggleRuler);
    canvasEvents.on('toggleGuides', handleToggleGuides);

    // 清理事件监听器
    return () => {
      canvasEvents.off('toggleGrid', handleToggleGrid);
      canvasEvents.off('toggleRuler', handleToggleRuler);
      canvasEvents.off('toggleGuides', handleToggleGuides);
    };
  }, [setStoreShowGrid, setStoreShowRuler, setStoreShowGuides]);

  return {
    displayState,
    toggleGrid,
    toggleRuler,
    toggleGuides,
    setShowGrid,
    setShowRuler,
    setShowGuides
  };
};