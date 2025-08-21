/**
 * 画布显示状态上下文 - 管理画布显示选项的全局状态
 * @description 提供画布网格、标尺、参考线等显示状态的全局管理
 * @author 开发团队
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useCanvasState, type CanvasDisplayState, type CanvasStateHook } from '../../../hooks/useCanvasState';

interface CanvasDisplayContextType extends CanvasStateHook {}

const CanvasDisplayContext = createContext<CanvasDisplayContextType | null>(null);

interface CanvasDisplayProviderProps {
  children: ReactNode;
  initialState?: Partial<CanvasDisplayState>;
}

/**
 * 画布显示状态提供者
 */
export const CanvasDisplayProvider: React.FC<CanvasDisplayProviderProps> = ({
  children,
  initialState
}) => {
  const canvasState = useCanvasState(initialState);

  return (
    <CanvasDisplayContext.Provider value={canvasState}>
      {children}
    </CanvasDisplayContext.Provider>
  );
};

/**
 * 使用画布显示状态Hook
 */
export const useCanvasDisplay = (): CanvasDisplayContextType => {
  const context = useContext(CanvasDisplayContext);
  if (!context) {
    throw new Error('useCanvasDisplay must be used within a CanvasDisplayProvider');
  }
  return context;
};