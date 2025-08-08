/**
 * 调试面板Hook
 * 管理调试面板的显示状态和快捷键
 */

import { useState, useEffect, useCallback } from 'react';
import { devDebugTools } from '../utils/DevDebugTools';

export interface UseDebugPanelOptions {
  enabled?: boolean;
  shortcutKey?: string;
  autoEnable?: boolean;
}

export const useDebugPanel = (options: UseDebugPanelOptions = {}) => {
  const {
    enabled = process.env['NODE_ENV'] === 'development',
    shortcutKey = 'F12',
    autoEnable = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);

  // 切换调试面板显示
  const togglePanel = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  // 显示调试面板
  const showPanel = useCallback(() => {
    setIsVisible(true);
  }, []);

  // 隐藏调试面板
  const hidePanel = useCallback(() => {
    setIsVisible(false);
  }, []);

  // 启用/禁用调试工具
  const toggleDebugTools = useCallback((enable?: boolean) => {
    const newState = enable !== undefined ? enable : !isDebugEnabled;
    setIsDebugEnabled(newState);
    devDebugTools.setEnabled(newState);
  }, [isDebugEnabled]);

  // 处理键盘快捷键
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // F12 切换调试面板
      if (event.key === shortcutKey) {
        event.preventDefault();
        togglePanel();
      }

      // Ctrl+Shift+D 切换调试工具
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDebugTools();
      }

      // Ctrl+Shift+C 清除调试日志
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        devDebugTools.clearLogs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, shortcutKey, togglePanel, toggleDebugTools]);

  // 自动启用调试工具
  useEffect(() => {
    if (enabled && autoEnable && !isDebugEnabled) {
      toggleDebugTools(true);
    }
  }, [enabled, autoEnable, isDebugEnabled, toggleDebugTools]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (isDebugEnabled) {
        devDebugTools.setEnabled(false);
      }
    };
  }, [isDebugEnabled]);

  return {
    isVisible,
    isDebugEnabled,
    showPanel,
    hidePanel,
    togglePanel,
    toggleDebugTools,
    enabled,
  };
};