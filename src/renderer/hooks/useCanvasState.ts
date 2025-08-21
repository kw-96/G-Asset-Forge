/**
 * 画布状态管理Hook - 管理标尺、网格、参考线等显示状态
 * @description 提供画布显示选项的状态管理和事件监听
 * @author 开发团队
 */

import { useState, useEffect, useCallback } from 'react';
import { canvasEvents } from '../logic/utils/events/canvasEvents';

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
  const [displayState, setDisplayState] = useState<CanvasDisplayState>({
    showGrid: true,
    showRuler: true,
    showGuides: true,
    ...initialState
  });

  // 切换网格显示
  const toggleGrid = useCallback(() => {
    setDisplayState(prev => ({
      ...prev,
      showGrid: !prev.showGrid
    }));
  }, []);

  // 切换标尺显示
  const toggleRuler = useCallback(() => {
    setDisplayState(prev => ({
      ...prev,
      showRuler: !prev.showRuler
    }));
  }, []);

  // 切换参考线显示
  const toggleGuides = useCallback(() => {
    setDisplayState(prev => ({
      ...prev,
      showGuides: !prev.showGuides
    }));
  }, []);

  // 设置网格显示
  const setShowGrid = useCallback((show: boolean) => {
    setDisplayState(prev => ({
      ...prev,
      showGrid: show
    }));
  }, []);

  // 设置标尺显示
  const setShowRuler = useCallback((show: boolean) => {
    setDisplayState(prev => ({
      ...prev,
      showRuler: show
    }));
  }, []);

  // 设置参考线显示
  const setShowGuides = useCallback((show: boolean) => {
    setDisplayState(prev => ({
      ...prev,
      showGuides: show
    }));
  }, []);

  // 监听画布事件
  useEffect(() => {
    const handleToggleGrid = () => {
      toggleGrid();
    };

    const handleToggleRuler = () => {
      toggleRuler();
    };

    const handleToggleGuides = () => {
      toggleGuides();
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
  }, [toggleGrid, toggleRuler, toggleGuides]);

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