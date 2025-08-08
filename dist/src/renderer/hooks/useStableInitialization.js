/**
 * 稳定的初始化状态管理Hook
 * 防止初始化相关的useEffect依赖问题
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { reactLoopFixToolkit } from '../utils/ReactLoopFix';
export function useStableInitialization(options = {}) {
    const { enableAutoInit = true, onInitialized, onError } = options;
    // 从store获取状态和方法
    const store = useAppStore();
    const { initializeAppOnce } = store;
    // 本地状态管理
    const [state, setState] = useState({
        isInitialized: store.isInitialized,
        isInitializing: store.isInitializing,
        initializationError: store.initializationError,
        hasAttemptedInit: false,
    });
    // 使用ref来避免闭包问题
    const callbacksRef = useRef({ onInitialized, onError });
    callbacksRef.current = { onInitialized, onError };
    // 稳定的初始化函数
    const performInitialization = useCallback(async () => {
        if (state.hasAttemptedInit || state.isInitialized || state.isInitializing) {
            return;
        }
        try {
            setState(prev => ({ ...prev, isInitializing: true, hasAttemptedInit: true }));
            reactLoopFixToolkit.debugLogger.info('stable-init', '开始稳定初始化', { enableAutoInit }, 'useStableInitialization');
            await initializeAppOnce();
            setState(prev => ({
                ...prev,
                isInitialized: true,
                isInitializing: false,
                initializationError: null,
            }));
            if (callbacksRef.current.onInitialized) {
                callbacksRef.current.onInitialized();
            }
            reactLoopFixToolkit.debugLogger.info('stable-init', '稳定初始化完成', {}, 'useStableInitialization');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setState(prev => ({
                ...prev,
                isInitializing: false,
                initializationError: errorMessage,
            }));
            if (callbacksRef.current.onError) {
                callbacksRef.current.onError(error instanceof Error ? error : new Error(String(error)));
            }
            reactLoopFixToolkit.debugLogger.error('stable-init', '稳定初始化失败', { error: errorMessage }, 'useStableInitialization');
            throw error;
        }
    }, [initializeAppOnce, state.hasAttemptedInit, state.isInitialized, state.isInitializing]);
    // 自动初始化effect - 依赖最小化
    useEffect(() => {
        if (enableAutoInit && !state.hasAttemptedInit && !state.isInitialized && !state.isInitializing) {
            performInitialization();
        }
    }, [enableAutoInit, performInitialization, state.hasAttemptedInit, state.isInitialized, state.isInitializing]);
    // 同步store状态到本地状态
    useEffect(() => {
        setState(prev => ({
            ...prev,
            isInitialized: store.isInitialized,
            isInitializing: store.isInitializing,
            initializationError: store.initializationError,
        }));
    }, [store.isInitialized, store.isInitializing, store.initializationError]);
    // 手动初始化方法
    const manualInit = useCallback(async () => {
        if (state.isInitialized || state.isInitializing) {
            reactLoopFixToolkit.debugLogger.warn('stable-init', '尝试手动初始化已初始化的应用', { isInitialized: state.isInitialized, isInitializing: state.isInitializing }, 'useStableInitialization');
            return;
        }
        await performInitialization();
    }, [performInitialization, state.isInitialized, state.isInitializing]);
    // 重置初始化状态
    const resetInitialization = useCallback(() => {
        setState({
            isInitialized: false,
            isInitializing: false,
            initializationError: null,
            hasAttemptedInit: false,
        });
        reactLoopFixToolkit.debugLogger.info('stable-init', '重置初始化状态', {}, 'useStableInitialization');
    }, []);
    return {
        // 状态
        ...state,
        // 方法
        manualInit,
        resetInitialization,
        // 计算属性
        canInitialize: !state.isInitialized && !state.isInitializing,
        hasError: !!state.initializationError,
    };
}
//# sourceMappingURL=useStableInitialization.js.map