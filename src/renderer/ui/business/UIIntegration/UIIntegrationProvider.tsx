/**
 * UI增强集成提供者组件
 * 统一管理所有Figma风格UI增强功能的入口组件
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { UIEnhancementManager } from '../../../logic/utils/UIEnhancementManager';

// UI功能枚举
export enum UIFeature {
  PERFORMANCE_MONITORING = 'performance-monitoring',
  ACCESSIBILITY = 'accessibility',
  CUSTOM_LAYOUT = 'custom-layout',
  BATCH_UPDATES = 'batch-updates',
  NOTIFICATIONS = 'notifications',
  ANIMATIONS = 'animations',
  VIRTUALIZATION = 'virtualization',
  INTERACTIVE_COMPONENTS = 'interactive-components',
  TOOLTIPS = 'tooltips',
  TRANSITIONS = 'transitions'
}

// UI集成配置接口
export interface UIIntegrationConfig {
  enablePerformanceMonitoring: boolean;
  enableAccessibility: boolean;
  enableCustomLayout: boolean;
  enableBatchUpdates: boolean;
  enableNotifications: boolean;
  autoOptimizePerformance: boolean;
  enableAnimations: boolean;
  enableVirtualization: boolean;
  enableInteractiveComponents: boolean;
  enableTooltips: boolean;
  enableTransitions: boolean;
  performanceMode: 'auto' | 'high' | 'balanced' | 'battery';
  debugMode: boolean;
}

// UI集成状态接口
export interface UIIntegrationState {
  isInitialized: boolean;
  enabledFeatures: Set<UIFeature>;
  performanceMetrics: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    interactionDelay: number;
  };
  lastError: string | null;
  initializationProgress: number;
}

// 上下文类型
interface UIIntegrationContextType {
  config: UIIntegrationConfig;
  state: UIIntegrationState;
  manager: UIEnhancementManager;
  enableFeature: (feature: UIFeature) => void;
  disableFeature: (feature: UIFeature) => void;
  toggleFeature: (feature: UIFeature) => void;
  isFeatureEnabled: (feature: UIFeature) => boolean;
  updateConfig: (updates: Partial<UIIntegrationConfig>) => void;
  getPerformanceMetrics: () => UIIntegrationState['performanceMetrics'];
}

// 默认配置
const DEFAULT_CONFIG: UIIntegrationConfig = {
  enablePerformanceMonitoring: true,
  enableAccessibility: true,
  enableCustomLayout: true,
  enableBatchUpdates: true,
  enableNotifications: true,
  autoOptimizePerformance: true,
  enableAnimations: true,
  enableVirtualization: true,
  enableInteractiveComponents: true,
  enableTooltips: true,
  enableTransitions: true,
  performanceMode: 'auto',
  debugMode: process.env['NODE_ENV'] === 'development'
};

// 创建上下文
const UIIntegrationContext = createContext<UIIntegrationContextType | null>(null);

// 自定义Hook获取上下文
export const useUIIntegration = (): UIIntegrationContextType => {
  const context = useContext(UIIntegrationContext);
  if (!context) {
    throw new Error('useUIIntegration must be used within a UIIntegrationProvider');
  }
  return context;
};

// 组件属性接口
interface UIIntegrationProviderProps {
  children: React.ReactNode;
  config?: Partial<UIIntegrationConfig>;
  enabledFeatures?: UIFeature[];
  onStateChange?: (state: UIIntegrationState) => void;
  onError?: (error: Error, errorInfo?: React.ErrorInfo, feature?: UIFeature) => void;
}

/**
 * UI增强集成提供者组件
 */
export const UIIntegrationProvider: React.FC<UIIntegrationProviderProps> = ({
  children,
  config: userConfig = {},
  enabledFeatures,
  onStateChange,
  onError
}) => {
  // 合并配置
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...userConfig
  }), [userConfig]);

  // 获取管理器实例
  const manager = useMemo(() => UIEnhancementManager.getInstance(), []);

  // 状态管理
  const [state, setState] = useState<UIIntegrationState>({
    isInitialized: false,
    enabledFeatures: new Set(),
    performanceMetrics: {
      fps: 0,
      memoryUsage: 0,
      renderTime: 0,
      interactionDelay: 0
    },
    lastError: null,
    initializationProgress: 0
  });

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<UIIntegrationState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange?.(newState);
      return newState;
    });
  }, [onStateChange]);

  // 错误处理
  const handleError = useCallback((error: Error, feature?: UIFeature) => {
    console.error('UI增强功能错误:', error, feature ? `功能: ${feature}` : '');

    updateState({
      lastError: error.message
    });

    // 如果指定了功能，禁用该功能
    if (feature) {
      manager.disableFeature(feature);
      updateState({
        enabledFeatures: new Set(manager.getEnabledFeatures())
      });
    }

    onError?.(error, undefined, feature);
  }, [manager, updateState, onError]);

  // 初始化UI增强功能
  const initializeFeatures = useCallback(async () => {
    try {
      updateState({ initializationProgress: 10 });

      // 根据配置启用功能
      const featuresToEnable = enabledFeatures || Object.values(UIFeature).filter(feature => {
        switch (feature) {
          case UIFeature.PERFORMANCE_MONITORING:
            return config.enablePerformanceMonitoring;
          case UIFeature.ACCESSIBILITY:
            return config.enableAccessibility;
          case UIFeature.CUSTOM_LAYOUT:
            return config.enableCustomLayout;
          case UIFeature.BATCH_UPDATES:
            return config.enableBatchUpdates;
          case UIFeature.NOTIFICATIONS:
            return config.enableNotifications;
          case UIFeature.ANIMATIONS:
            return config.enableAnimations;
          case UIFeature.VIRTUALIZATION:
            return config.enableVirtualization;
          case UIFeature.INTERACTIVE_COMPONENTS:
            return config.enableInteractiveComponents;
          case UIFeature.TOOLTIPS:
            return config.enableTooltips;
          case UIFeature.TRANSITIONS:
            return config.enableTransitions;
          default:
            return false;
        }
      });

      updateState({ initializationProgress: 30 });

      // 逐个初始化功能
      for (let i = 0; i < featuresToEnable.length; i++) {
        const feature = featuresToEnable[i];
        try {
          await manager.enableFeature(feature as UIFeature);
          updateState({
            initializationProgress: 30 + (i + 1) / featuresToEnable.length * 60
          });
        } catch (error) {
          handleError(error instanceof Error ? error : new Error(String(error)), feature);
        }
      }

      // 启动性能监控
      if (config.enablePerformanceMonitoring) {
        manager.startPerformanceMonitoring();
      }

      updateState({
        isInitialized: true,
        enabledFeatures: new Set(manager.getEnabledFeatures()),
        initializationProgress: 100,
        lastError: null
      });

      // console.log('UI增强功能初始化完成', {
      //   enabledFeatures: Array.from(manager.getEnabledFeatures()),
      //   config
      // });

    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [config, enabledFeatures, manager, updateState, handleError]);

  // 功能控制函数
  const enableFeature = useCallback((feature: UIFeature) => {
    try {
      manager.enableFeature(feature);
      updateState({
        enabledFeatures: new Set(manager.getEnabledFeatures()),
        lastError: null
      });
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), feature);
    }
  }, [manager, updateState, handleError]);

  const disableFeature = useCallback((feature: UIFeature) => {
    try {
      manager.disableFeature(feature);
      updateState({
        enabledFeatures: new Set(manager.getEnabledFeatures())
      });
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), feature);
    }
  }, [manager, updateState, handleError]);

  const toggleFeature = useCallback((feature: UIFeature) => {
    if (manager.isFeatureEnabled(feature)) {
      disableFeature(feature);
    } else {
      enableFeature(feature);
    }
  }, [manager, enableFeature, disableFeature]);

  const isFeatureEnabled = useCallback((feature: UIFeature) => {
    return manager.isFeatureEnabled(feature);
  }, [manager]);

  const updateConfig = useCallback((updates: Partial<UIIntegrationConfig>) => {
    // 这里可以实现配置更新逻辑
    console.log('更新UI集成配置:', updates);
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    return manager.getPerformanceMetrics();
  }, [manager]);

  // 组件挂载时初始化
  useEffect(() => {
    initializeFeatures();
  }, [initializeFeatures]);

  // 定期更新性能指标
  useEffect(() => {
    if (!state.isInitialized || !config.enablePerformanceMonitoring) {
      return;
    }

    const interval = setInterval(() => {
      const metrics = manager.getPerformanceMetrics();
      updateState({
        performanceMetrics: metrics
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isInitialized, config.enablePerformanceMonitoring, manager, updateState]);

  // 上下文值
  const contextValue: UIIntegrationContextType = useMemo(() => ({
    config,
    state,
    manager,
    enableFeature,
    disableFeature,
    toggleFeature,
    isFeatureEnabled,
    updateConfig,
    getPerformanceMetrics
  }), [
    config,
    state,
    manager,
    enableFeature,
    disableFeature,
    toggleFeature,
    isFeatureEnabled,
    updateConfig,
    getPerformanceMetrics
  ]);

  return (
    <UIIntegrationContext.Provider value={contextValue}>
      {children}
    </UIIntegrationContext.Provider>
  );
};

export default UIIntegrationProvider;
