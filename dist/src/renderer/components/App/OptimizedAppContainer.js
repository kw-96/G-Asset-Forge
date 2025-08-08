import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 优化后的应用主容器
 * 使用新的初始化管理和状态验证功能
 */
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from '../../ui/theme/ThemeProvider';
import { GlobalStyles } from '../../ui/styles/GlobalStyles';
import { MainLayout } from '../Layout/MainLayout';
import { WelcomeScreen } from '../Welcome/WelcomeScreen';
import { useAppInitialization } from '../../hooks/useAppInitialization';
import { useBatchUpdate } from '../../hooks/useBatchUpdate';
import { useStoreMonitor } from '../../hooks/useStoreMonitor';
import { useAppStore } from '../../stores/appStore';
import { reactLoopFixToolkit } from '../../utils/ReactLoopFix';
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
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: 20px;
`;
const RetryButton = styled.button `
  margin-top: 16px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;
export const OptimizedAppContainer = () => {
    const { isFirstTime } = useAppStore();
    const [showWelcome, setShowWelcome] = useState(true);
    // 使用优化的初始化Hook
    const { isInitializing, initializationError, hasError, manualInit, } = useAppInitialization({
        enableAutoInit: true,
        onInitialized: useCallback(() => {
            reactLoopFixToolkit.debugLogger.info('app-container', '应用初始化完成回调', { isFirstTime }, 'OptimizedAppContainer');
            // 如果不是首次使用，直接进入主界面
            if (!isFirstTime) {
                setShowWelcome(false);
            }
        }, [isFirstTime]),
        onError: useCallback((error) => {
            reactLoopFixToolkit.debugLogger.error('app-container', '应用初始化失败', { error: error.message }, 'OptimizedAppContainer');
        }, []),
    });
    // 使用批量更新Hook
    const { updateNavigation } = useBatchUpdate({
        debounceMs: 16,
        enableLogging: process.env['NODE_ENV'] === 'development',
    });
    // 使用Store监控Hook（仅在开发环境）
    const storeMonitor = useStoreMonitor({
        enableRenderTracking: process.env['NODE_ENV'] === 'development',
        enableStateChangeLogging: process.env['NODE_ENV'] === 'development',
        renderThreshold: 20,
        stateChangeThreshold: 50,
    });
    // 欢迎页面完成处理
    const handleWelcomeComplete = useCallback(() => {
        reactLoopFixToolkit.debugLogger.info('app-container', '欢迎页面完成', { renderCount: storeMonitor.stats.renderCount }, 'OptimizedAppContainer');
        // 使用批量更新来更新导航状态
        updateNavigation({
            isFirstTime: false,
        });
        setShowWelcome(false);
    }, [updateNavigation, storeMonitor.stats.renderCount]);
    // 重试初始化
    const handleRetryInit = useCallback(async () => {
        try {
            await manualInit();
        }
        catch (error) {
            console.error('重试初始化失败:', error);
        }
    }, [manualInit]);
    // 开发环境下显示性能警告
    React.useEffect(() => {
        if (process.env['NODE_ENV'] === 'development' && storeMonitor.stats.suspiciousActivity) {
            console.warn('🚨 检测到可疑的Store活动:', storeMonitor.generateReport());
        }
    }, [storeMonitor.stats.suspiciousActivity, storeMonitor]);
    // 渲染加载状态
    if (isInitializing) {
        return (_jsxs(ThemeProvider, { children: [_jsx(GlobalStyles, {}), _jsx(AppWrapper, { children: _jsx(LoadingScreen, { children: "\u6B63\u5728\u521D\u59CB\u5316\u5E94\u7528..." }) })] }));
    }
    // 渲染错误状态
    if (hasError) {
        return (_jsxs(ThemeProvider, { children: [_jsx(GlobalStyles, {}), _jsx(AppWrapper, { children: _jsxs(ErrorScreen, { children: [_jsx("h2", { children: "\u5E94\u7528\u521D\u59CB\u5316\u5931\u8D25" }), _jsx("p", { children: initializationError }), _jsx(RetryButton, { onClick: handleRetryInit, children: "\u91CD\u8BD5" })] }) })] }));
    }
    // 渲染欢迎页面或主应用
    return (_jsxs(ThemeProvider, { children: [_jsx(GlobalStyles, {}), _jsxs(AppWrapper, { children: [showWelcome && isFirstTime ? (_jsx(WelcomeScreen, { onComplete: handleWelcomeComplete })) : (_jsx(MainLayout, {})), process.env['NODE_ENV'] === 'development' && (_jsxs("div", { style: {
                            position: 'fixed',
                            top: 10,
                            right: 10,
                            background: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            zIndex: 9999,
                            fontFamily: 'monospace',
                        }, children: [_jsxs("div", { children: ["\u6E32\u67D3: ", storeMonitor.stats.renderCount] }), _jsxs("div", { children: ["\u72B6\u6001\u53D8\u5316: ", storeMonitor.stats.stateChangeCount] }), _jsxs("div", { children: ["\u5E73\u5747\u95F4\u9694: ", storeMonitor.stats.averageRenderInterval.toFixed(1), "ms"] }), storeMonitor.stats.suspiciousActivity && (_jsx("div", { style: { color: '#ff6b6b' }, children: "\u26A0\uFE0F \u53EF\u7591\u6D3B\u52A8" }))] }))] })] }));
};
//# sourceMappingURL=OptimizedAppContainer.js.map