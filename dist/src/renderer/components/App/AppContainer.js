import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 应用主容器 - 重构版本，解决useEffect依赖问题
 * 管理应用的整体状态和布局结构，防止无限循环
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from '../../ui/theme/ThemeProvider';
import { GlobalStyles } from '../../ui/styles/GlobalStyles';
import { MainLayout } from '../Layout/MainLayout';
import { WelcomeScreen } from '../Welcome/WelcomeScreen';
import { useAppStore } from '../../stores/appStore';
import { useAppInitialization } from '../../hooks/useAppInitialization';
import { useRenderCounter } from '../../hooks/useRenderCounter';
import { reactLoopFixToolkit } from '../../utils/ReactLoopFix';
// 窗口控制 Hook - 使用useCallback稳定化函数引用
const useWindowControl = () => {
    const originalSizeRef = useRef(null);
    const setWelcomeMode = useCallback(async () => {
        try {
            reactLoopFixToolkit.debugLogger.debug('window-control', '设置欢迎模式窗口', {}, 'useWindowControl');
            // 保存原始窗口大小和设置
            const sizeResult = await window.electronAPI.window.getSize();
            if (sizeResult.success && sizeResult.data) {
                originalSizeRef.current = sizeResult.data;
            }
            // 设置欢迎页面的固定大小 (600x450)
            await window.electronAPI.window.setSize(600, 450, true);
            await window.electronAPI.window.setResizable(false);
            await window.electronAPI.window.center();
            reactLoopFixToolkit.debugLogger.info('window-control', '窗口已设置为欢迎模式: 600x450, 固定大小', { width: 600, height: 450 }, 'useWindowControl');
        }
        catch (error) {
            reactLoopFixToolkit.debugLogger.error('window-control', '设置欢迎模式失败', { error: error instanceof Error ? error.message : String(error) }, 'useWindowControl');
        }
    }, []);
    const restoreNormalMode = useCallback(async () => {
        try {
            reactLoopFixToolkit.debugLogger.debug('window-control', '恢复正常模式窗口', {}, 'useWindowControl');
            // 恢复窗口可调整大小
            await window.electronAPI.window.setResizable(true);
            // 恢复原始大小（如果有的话）
            if (originalSizeRef.current) {
                await window.electronAPI.window.setSize(originalSizeRef.current.width, originalSizeRef.current.height, true);
            }
            else {
                // 默认主界面大小
                await window.electronAPI.window.setSize(1200, 800, true);
            }
            await window.electronAPI.window.center();
            reactLoopFixToolkit.debugLogger.info('window-control', '窗口已恢复正常模式', {
                width: originalSizeRef.current?.width || 1200,
                height: originalSizeRef.current?.height || 800
            }, 'useWindowControl');
        }
        catch (error) {
            reactLoopFixToolkit.debugLogger.error('window-control', '恢复正常模式失败', { error: error instanceof Error ? error.message : String(error) }, 'useWindowControl');
        }
    }, []);
    return useMemo(() => ({ setWelcomeMode, restoreNormalMode }), [setWelcomeMode, restoreNormalMode]);
};
const AppWrapper = styled.div `
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
`;
const LoadingScreen = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
`;
const ErrorScreen = styled.div `
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
const RetryButton = styled.button `
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
export const AppContainer = () => {
    // 从store获取状态，但不直接使用initializeApp
    const { isFirstTime } = useAppStore();
    // 本地状态管理
    const [showWelcome, setShowWelcome] = useState(true);
    const [hasSetWelcomeMode, setHasSetWelcomeMode] = useState(false);
    // 窗口控制
    const { setWelcomeMode, restoreNormalMode } = useWindowControl();
    // 使用优化的初始化Hook
    const { isInitialized, isInitializing, initializationError, hasError, manualInit, } = useAppInitialization({
        enableAutoInit: true,
        onInitialized: useCallback(() => {
            reactLoopFixToolkit.debugLogger.info('app-container', '应用初始化完成', { isFirstTime }, 'AppContainer');
        }, [isFirstTime]),
        onError: useCallback((error) => {
            reactLoopFixToolkit.debugLogger.error('app-container', '应用初始化失败', { error: error.message }, 'AppContainer');
        }, []),
    });
    // 稳定化的欢迎完成处理函数
    const handleWelcomeComplete = useCallback(() => {
        reactLoopFixToolkit.debugLogger.info('app-container', '欢迎页面完成', {}, 'AppContainer');
        setShowWelcome(false);
        restoreNormalMode();
    }, [restoreNormalMode]);
    // 稳定化的重试初始化函数
    const handleRetryInit = useCallback(async () => {
        try {
            reactLoopFixToolkit.debugLogger.info('app-container', '重试应用初始化', {}, 'AppContainer');
            await manualInit();
        }
        catch (error) {
            reactLoopFixToolkit.debugLogger.error('app-container', '重试初始化失败', { error: error instanceof Error ? error.message : String(error) }, 'AppContainer');
        }
    }, [manualInit]);
    // 分离的窗口模式设置逻辑 - 只在初始化完成且是首次使用时执行一次
    useEffect(() => {
        if (isInitialized && isFirstTime && !hasSetWelcomeMode) {
            reactLoopFixToolkit.debugLogger.debug('app-container', '设置首次使用的欢迎模式', { isFirstTime, hasSetWelcomeMode }, 'AppContainer');
            setWelcomeMode();
            setHasSetWelcomeMode(true);
            setShowWelcome(true);
        }
        else if (isInitialized && !isFirstTime) {
            reactLoopFixToolkit.debugLogger.debug('app-container', '非首次使用，直接进入主界面', { isFirstTime }, 'AppContainer');
            setShowWelcome(false);
        }
    }, [isInitialized, isFirstTime, hasSetWelcomeMode, setWelcomeMode]);
    // 计算渲染状态 - 使用useMemo优化
    const renderState = useMemo(() => {
        if (hasError) {
            return 'error';
        }
        if (isInitializing) {
            return 'loading';
        }
        if (!isInitialized) {
            return 'loading';
        }
        if (showWelcome && isFirstTime) {
            return 'welcome';
        }
        return 'main';
    }, [hasError, isInitializing, isInitialized, showWelcome, isFirstTime]);
    // 使用渲染计数Hook
    useRenderCounter({
        componentName: 'AppContainer',
        enableLogging: process.env['NODE_ENV'] === 'development',
        logProps: true,
        maxRenderWarning: 15,
    }, { renderState, isInitialized, isFirstTime, showWelcome }, `render state: ${renderState}`);
    // 渲染内容
    const renderContent = () => {
        switch (renderState) {
            case 'error':
                return (_jsxs(ErrorScreen, { children: [_jsx("h2", { children: "\u5E94\u7528\u521D\u59CB\u5316\u5931\u8D25" }), _jsx("p", { children: initializationError }), _jsx(RetryButton, { onClick: handleRetryInit, children: "\u91CD\u8BD5" })] }));
            case 'loading':
                return (_jsx(LoadingScreen, { children: "\u6B63\u5728\u521D\u59CB\u5316\u5E94\u7528..." }));
            case 'welcome':
                return _jsx(WelcomeScreen, { onComplete: handleWelcomeComplete });
            case 'main':
                return _jsx(MainLayout, {});
            default:
                return (_jsx(LoadingScreen, { children: "\u52A0\u8F7D\u4E2D..." }));
        }
    };
    return (_jsxs(ThemeProvider, { children: [_jsx(GlobalStyles, {}), _jsx(AppWrapper, { children: renderContent() })] }));
};
//# sourceMappingURL=AppContainer.js.map