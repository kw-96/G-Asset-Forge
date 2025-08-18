/**
 * 应用主容器 - 应用程序的核心容器组件
 * @description 管理应用的整体状态和布局结构，处理初始化流程、主题提供、错误边界等核心功能
 * @author 开发团队
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { MainLayout } from '../../components/templates/Layout/MainLayout';
import { canvasEvents } from '../../../logic/utils/events/canvasEvents';
import { WelcomeScreen } from '../Welcome/WelcomeScreen';
import { useAppStore } from '../../../stores/appStore';
import { useAppInitialization } from '../../../hooks/useAppInitialization';
import { useRenderCounter } from '../../../hooks/useRenderCounter';
// 已移除ReactLoopFix依赖
import {
  UIIntegrationProvider,
  UIEnhancementErrorBoundary,
  // UIIntegrationTest,
  UIFeature,
  type UIIntegrationConfig,
  // type UIIntegrationState
} from '../UIIntegration';
// 已移除临时调试工具的导入
import { LayoutProvider } from '../../../logic/contexts/LayoutContext';
import { NotificationProvider } from '../../components/organisms/Figma/FigmaNotification';
import { PerformancePanel } from '../performance/PerformancePanel';

/**
 * 窗口控制Hook - 管理应用窗口的大小和模式切换
 * @description 提供欢迎模式和正常模式的窗口控制功能，使用useCallback稳定化函数引用
 * @returns 窗口控制方法对象
 */
const useWindowControl = () => {
  const originalSizeRef = useRef<{ width: number; height: number } | null>(null);

  /**
   * 设置欢迎模式窗口
   * @description 将窗口设置为欢迎页面的固定大小(480x320)，不可调整大小
   */
  const setWelcomeMode = useCallback(async () => {
    try {
      // 保存原始窗口大小和设置
      const sizeResult = await window.electronAPI.window.getSize();
      if (sizeResult.success && sizeResult.data) {
        originalSizeRef.current = sizeResult.data;
      }

      // 先移除最小尺寸限制，以便能够缩小到欢迎模式尺寸
      // await window.electronAPI.window.removeMinimumSize();

      // 设置欢迎页面的固定大小 (480x320)
      await window.electronAPI.window.setSize(480, 320, true);
      await window.electronAPI.window.setResizable(false);
      await window.electronAPI.window.center();

    } catch (error) {
      console.error(
        '[window-control] 设置欢迎模式失败',
        { error: error instanceof Error ? error.message : String(error) },
        'useWindowControl'
      );
    }
  }, []);

  /**
   * 恢复正常模式窗口
   * @description 将窗口恢复为正常工作模式的大小(1200x800)，可调整大小
   */
  const restoreNormalMode = useCallback(async () => {
    try {
      // 恢复窗口可调整大小
      await window.electronAPI.window.setResizable(true);

      // 设置正常模式的大小为 1200x800
      await window.electronAPI.window.setSize(1200, 800, true);

      // 重新设置最小尺寸限制（确保窗口不会太小）
      await window.electronAPI.window.setMinimumSize(480, 320);

      await window.electronAPI.window.center();

    } catch (error) {
      console.error(
        '[window-control] 恢复正常模式失败',
        { error: error instanceof Error ? error.message : String(error) },
        'useWindowControl'
      );
    }
  }, []);

  return useMemo(() => ({ setWelcomeMode, restoreNormalMode }), [setWelcomeMode, restoreNormalMode]);
};


const AppWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
`;

const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
`;

const ErrorScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.error || '#ff6b6b'};
  text-align: center;
  padding: 20px;

  h2 {
    margin-bottom: 16px;
    font-size: 24px;
  }

  p {
    margin-bottom: 16px;
    font-size: 14px;
    opacity: 0.8;
  }
`;

const RetryButton = styled.button`
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary || '#3b82f6'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: translateY(1px);
  }
`;

// 调试组件已移除，仅保留 DevTools
// `;

// const DebugMetrics = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 4px;
// `;

// const DebugMetric = styled.div`
//   background: rgba(255, 255, 255, 0.1);
//   padding: 4px 6px;
//   border-radius: 4px;
//   font-size: 10px;
// `;

// const DebugError = styled.div`
//   background: rgba(255, 0, 0, 0.2);
//   padding: 6px;
//   border-radius: 4px;
//   font-size: 10px;
//   color: #ffcccc;
//   word-break: break-word;
// `;

/**
 * 应用主容器组件
 * @description 应用程序的根容器，管理主题、初始化状态、窗口模式和UI增强功能
 * @returns React函数组件
 * @example
 * <AppContainer />
 */
export const AppContainer: React.FC = () => {
  // 从store获取状态，但不直接使用initializeApp
  const { isFirstTime } = useAppStore();

  // 本地状态管理
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasSetWelcomeMode, setHasSetWelcomeMode] = useState(false);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);

  // UI增强功能配置
  const uiIntegrationConfig = useMemo<UIIntegrationConfig>(() => ({
    enablePerformanceMonitoring: true,
    enableAccessibility: true,
    enableCustomLayout: true,
    enableBatchUpdates: true,
    enableNotifications: true,
    autoOptimizePerformance: true,
    enableAnimations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    enableVirtualization: true,
    enableInteractiveComponents: true,
    enableTooltips: true,
    enableTransitions: true,
    performanceMode: 'auto',
    debugMode: process.env['NODE_ENV'] === 'development'
  }), []);

  // UI增强功能状态
  // const [uiIntegrationState, setUIIntegrationState] = useState<UIIntegrationState | null>(null);

  // 窗口控制
  const { setWelcomeMode, restoreNormalMode } = useWindowControl();

  // 使用优化的初始化Hook
  const {
    isInitialized,
    isInitializing,
    initializationError,
    hasError,
    manualInit,
  } = useAppInitialization({
    enableAutoInit: true,
    onInitialized: useCallback(() => {
      // 确保显示欢迎页或主界面
      const isDevelopment = process.env['NODE_ENV'] === 'development';
      if (isFirstTime || isDevelopment) {
        setShowWelcome(true);
      }
    }, [isFirstTime]),
    onError: useCallback((error: Error) => {
      console.error(
        '[app-container] 应用初始化失败',
        { error: error.message },
        'AppContainer'
      );
    }, []),
  });

  // 稳定化的欢迎完成处理函数
  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false);
    restoreNormalMode();
  }, [restoreNormalMode]);

  // 稳定化的重试初始化函数
  const handleRetryInit = useCallback(async () => {
    try {
      await manualInit();
    } catch (error) {
      console.error(
        '[app-container] 重试初始化失败',
        { error: error instanceof Error ? error.message : String(error) },
        'AppContainer'
      );
    }
  }, [manualInit]);

  // // UI增强功能状态变化处理
  // const handleUIIntegrationStateChange = useCallback((state: UIIntegrationState) => {
  //   setUIIntegrationState(state);

  //   console.debug(
  //     '[app-container] UI增强功能状态变化',
  //     {
  //       isInitialized: state.isInitialized,
  //       enabledFeatures: Array.from(state.enabledFeatures),
  //       performanceMetrics: state.performanceMetrics,
  //       lastError: state.lastError
  //     },
  //     'AppContainer'
  //   );
  // }, []);

  // UI增强功能错误处理
  const handleUIIntegrationError = useCallback((error: Error, errorInfo?: React.ErrorInfo, feature?: UIFeature) => {
    console.error(
      '[app-container] UI增强功能错误',
      {
        error: error.message,
        feature,
        stack: error.stack,
        componentStack: errorInfo?.componentStack
      },
      'AppContainer'
    );

    // 在开发模式下显示更详细的错误信息
    if (process.env['NODE_ENV'] === 'development') {
      console.error('UI增强功能错误详情:', {
        error,
        errorInfo,
        feature,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // // UI增强功能恢复处理
  // const handleUIIntegrationRecover = useCallback((feature?: UIFeature) => {
  //   console.info(
  //     '[app-container] UI增强功能已恢复',
  //     { feature },
  //     'AppContainer'
  //   );
  // }, []);

  // 分离的窗口模式设置逻辑 - 首次使用或开发模式时显示欢迎界面
  useEffect(() => {
    const isDevelopment = process.env['NODE_ENV'] === 'development';

    if (isInitialized && (isFirstTime || isDevelopment) && !hasSetWelcomeMode) {
      setWelcomeMode();
      setHasSetWelcomeMode(true);
      setShowWelcome(true);
    } else if (isInitialized && !isFirstTime && !isDevelopment) {
      setShowWelcome(false);
    }
  }, [isInitialized, isFirstTime, hasSetWelcomeMode, setWelcomeMode]);

  // 计算渲染状态 - 使用useMemo优化
  const renderState = useMemo(() => {
    const isDevelopment = process.env['NODE_ENV'] === 'development';

    if (hasError) {
      return 'error';
    }
    if (isInitializing) {
      return 'loading';
    }
    if (!isInitialized) {
      return 'loading';
    }
    // 首次使用或开发模式下显示欢迎界面
    if (showWelcome && (isFirstTime || isDevelopment)) {
      return 'welcome';
    }
    return 'main';
  }, [hasError, isInitializing, isInitialized, showWelcome, isFirstTime]);

  // 使用渲染计数Hook
  useRenderCounter(
    {
      componentName: 'AppContainer',
      enableLogging: process.env['NODE_ENV'] === 'development',
      logProps: true,
      maxRenderWarning: 15,
    },
    { renderState, isInitialized, isFirstTime, showWelcome },
    `render state: ${renderState}`
  );

  // 渲染内容
  const renderContent = () => {
    switch (renderState) {
      case 'error':
        return (
          <ErrorScreen>
            <h2>应用初始化失败</h2>
            <p>{initializationError}</p>
            <RetryButton onClick={handleRetryInit}>
              重试
            </RetryButton>
          </ErrorScreen>
        );

      case 'loading':
        // 确保加载时窗口固定为 480x320
        setWelcomeMode();
        return (
          <LoadingScreen>
            正在初始化应用...
          </LoadingScreen>
        );

      case 'welcome':
        // 欢迎页固定为 480x320
        setWelcomeMode();
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;

      case 'main':
        return <MainLayout />;

      default:
        return (
          <LoadingScreen>
            加载中...
          </LoadingScreen>
        );
    }
  };

  // 订阅主菜单的标尺/辅助线显隐事件并转发到画布
  useEffect(() => {
    const offToggleRuler = (window as any).electronAPI?.menu?.onToggleRuler?.(() => {
      canvasEvents.emit('toggleRuler', () => {});
    });
    const offToggleGuides = (window as any).electronAPI?.menu?.onToggleGuides?.(() => {
      canvasEvents.emit('toggleGuides', () => {});
    });
    return () => {
      if (typeof offToggleRuler === 'function') offToggleRuler();
      if (typeof offToggleGuides === 'function') offToggleGuides();
    };
  }, []);

  return (
    <ThemeProvider>
      <GlobalStyles />
      <NotificationProvider>
        <UIEnhancementErrorBoundary
          onError={handleUIIntegrationError}
          // onRecover={handleUIIntegrationRecover}
          maxRetries={3}
          enableAutoRecovery={true}
        >
          <UIIntegrationProvider
            config={uiIntegrationConfig}
            // onStateChange={handleUIIntegrationStateChange}
            onError={handleUIIntegrationError}
          >
            <LayoutProvider>
              <AppWrapper data-testid="app-container">
                {renderContent()}

                {/* 性能监控面板 - 仅在主界面显示 */}
                {renderState === 'main' && (
                  <PerformancePanel
                    isVisible={showPerformancePanel}
                    onToggle={() => setShowPerformancePanel(!showPerformancePanel)}
                  />
                )}

                {/* 隐藏右上角UI增强调试信息 */}
              </AppWrapper>
            </LayoutProvider>
          </UIIntegrationProvider>
        </UIEnhancementErrorBoundary>
      </NotificationProvider>
    </ThemeProvider>
  );
};
