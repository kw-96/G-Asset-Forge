/**
 * 应用主容器 - 重构版本，解决useEffect依赖问题
 * 管理应用的整体状态和布局结构，防止无限循环
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from '../../ui/theme/ThemeProvider';
import { GlobalStyles } from '../../ui/styles/GlobalStyles';
import { MainLayout } from '../Layout';
import { WelcomeScreen } from '../Welcome/WelcomeScreen';
import { useAppStore } from '../../stores/appStore';
import { useAppInitialization } from '../../hooks/useAppInitialization';
import { useRenderCounter } from '../../hooks/useRenderCounter';
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
import { LayoutProvider } from '../../contexts/LayoutContext';
import { NotificationProvider } from '../../ui/components/FigmaNotification';
import { PerformancePanel } from '../performance/PerformancePanel';

// 窗口控制 Hook - 使用useCallback稳定化函数引用
const useWindowControl = () => {
  const originalSizeRef = useRef<{ width: number; height: number } | null>(null);

  const setWelcomeMode = useCallback(async () => {
    try {
      console.debug(
        '[window-control] 设置欢迎模式窗口',
        {},
        'useWindowControl'
      );

      // 保存原始窗口大小和设置
      const sizeResult = await window.electronAPI.window.getSize();
      if (sizeResult.success && sizeResult.data) {
        originalSizeRef.current = sizeResult.data;
      }

      // 先移除最小尺寸限制，以便能够缩小到欢迎模式尺寸
      await window.electronAPI.window.removeMinimumSize();
      
      // 设置欢迎页面的固定大小 (480x320)
      await window.electronAPI.window.setSize(480, 320, true);
      await window.electronAPI.window.setResizable(false);
      await window.electronAPI.window.center();
      
      console.info(
        '[window-control] 窗口已设置为欢迎模式: 480x320, 固定大小',
        { width: 480, height: 320 },
        'useWindowControl'
      );
    } catch (error) {
      console.error(
        '[window-control] 设置欢迎模式失败',
        { error: error instanceof Error ? error.message : String(error) },
        'useWindowControl'
      );
    }
  }, []);

  const restoreNormalMode = useCallback(async () => {
    try {
      console.debug(
        '[window-control] 恢复正常模式窗口',
        {},
        'useWindowControl'
      );

      // 恢复窗口可调整大小
      await window.electronAPI.window.setResizable(true);
      
      // 设置正常模式的大小为 1200x800
      await window.electronAPI.window.setSize(1200, 800, true);
      
      // 重新设置最小尺寸限制（确保窗口不会太小）
      await window.electronAPI.window.setMinimumSize(800, 600);
      
      await window.electronAPI.window.center();
      
      console.info(
        '[window-control] 窗口已恢复正常模式',
        { width: 1200, height: 800 },
        'useWindowControl'
      );
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
  width: 100vw;
  height: 100vh;
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

// 开发模式UI增强状态调试组件
// const UIIntegrationDebugInfo: React.FC<{ state: UIIntegrationState }> = ({ state }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   if (!state.isInitialized) {
//     return null;
//   }

//   return (
//     <DebugPanel>
//       <DebugToggle onClick={() => setIsExpanded(!isExpanded)}>
//         🔧 UI增强 ({state.enabledFeatures.size} 功能启用)
//       </DebugToggle>
      
//       {isExpanded && (
//         <DebugContent>
//           <DebugSection>
//             <DebugTitle>启用功能</DebugTitle>
//             <DebugList>
//               {Array.from(state.enabledFeatures).map(feature => (
//                 <DebugItem key={feature}>{feature}</DebugItem>
//               ))}
//             </DebugList>
//           </DebugSection>
          
//           <DebugSection>
//             <DebugTitle>性能指标</DebugTitle>
//             <DebugMetrics>
//               <DebugMetric>FPS: {state.performanceMetrics.fps}</DebugMetric>
//               <DebugMetric>内存: {state.performanceMetrics.memoryUsage}MB</DebugMetric>
//               <DebugMetric>渲染: {state.performanceMetrics.renderTime.toFixed(2)}ms</DebugMetric>
//               <DebugMetric>交互: {state.performanceMetrics.interactionDelay.toFixed(2)}ms</DebugMetric>
//             </DebugMetrics>
//           </DebugSection>
          
//           {state.lastError && (
//             <DebugSection>
//               <DebugTitle>最近错误</DebugTitle>
//               <DebugError>{state.lastError}</DebugError>
//             </DebugSection>
//           )}
//         </DebugContent>
//       )}
//     </DebugPanel>
//   );
// };

// const DebugPanel = styled.div`
//   position: fixed;
//   top: 10px;
//   right: 10px;
//   background: rgba(0, 0, 0, 0.8);
//   color: white;
//   border-radius: 8px;
//   font-family: monospace;
//   font-size: 12px;
//   z-index: 9999;
//   max-width: 300px;
// `;

// const DebugToggle = styled.button`
//   width: 100%;
//   padding: 8px 12px;
//   background: transparent;
//   border: none;
//   color: white;
//   cursor: pointer;
//   text-align: left;
//   font-family: inherit;
//   font-size: inherit;
  
//   &:hover {
//     background: rgba(255, 255, 255, 0.1);
//   }
// `;

// const DebugContent = styled.div`
//   padding: 12px;
//   border-top: 1px solid rgba(255, 255, 255, 0.2);
// `;

// const DebugSection = styled.div`
//   margin-bottom: 12px;
  
//   &:last-child {
//     margin-bottom: 0;
//   }
// `;

// const DebugTitle = styled.div`
//   font-weight: bold;
//   margin-bottom: 4px;
//   color: #ffd700;
// `;

// const DebugList = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 4px;
// `;

// const DebugItem = styled.span`
//   background: rgba(255, 255, 255, 0.1);
//   padding: 2px 6px;
//   border-radius: 4px;
//   font-size: 10px;
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
      console.info(
        '[app-container] 应用初始化完成',
        { isFirstTime },
        'AppContainer'
      );
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
    console.info(
      '[app-container] 欢迎页面完成',
      {},
      'AppContainer'
    );

    setShowWelcome(false);
    restoreNormalMode();
  }, [restoreNormalMode]);

  // 稳定化的重试初始化函数
  const handleRetryInit = useCallback(async () => {
    try {
      console.info(
        '[app-container] 重试应用初始化',
        {},
        'AppContainer'
      );
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
      console.debug(
        '[app-container] 设置欢迎模式',
        { isFirstTime, isDevelopment, hasSetWelcomeMode },
        'AppContainer'
      );

      setWelcomeMode();
      setHasSetWelcomeMode(true);
      setShowWelcome(true);
    } else if (isInitialized && !isFirstTime && !isDevelopment) {
      console.debug(
        '[app-container] 非首次使用且非开发模式，直接进入主界面',
        { isFirstTime, isDevelopment },
        'AppContainer'
      );

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
        return (
          <LoadingScreen>
            正在初始化应用...
          </LoadingScreen>
        );

      case 'welcome':
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
