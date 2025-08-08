/**
 * 渲染计数Hook
 * 跟踪组件的渲染次数，用于性能监控和调试
 */
import { useRef, useEffect } from 'react';
import { reactLoopFixToolkit } from '../utils/ReactLoopFix';
export function useRenderCounter(options, props, reason) {
    const { componentName, enableLogging = true, logProps = false, logReason = true, maxRenderWarning = 20, } = options;
    const renderCountRef = useRef(0);
    const lastPropsRef = useRef(props);
    const renderTimesRef = useRef([]);
    // 增加渲染计数
    renderCountRef.current += 1;
    const currentRenderCount = renderCountRef.current;
    // 记录渲染时间
    const now = Date.now();
    renderTimesRef.current.push(now);
    // 只保留最近10次渲染时间
    if (renderTimesRef.current.length > 10) {
        renderTimesRef.current = renderTimesRef.current.slice(-10);
    }
    // 计算渲染间隔
    const renderInterval = renderTimesRef.current.length > 1
        ? now - (renderTimesRef.current[renderTimesRef.current.length - 2] || 0)
        : 0;
    // 检测props变化
    const propsChanged = JSON.stringify(props) !== JSON.stringify(lastPropsRef.current);
    lastPropsRef.current = props;
    // 记录渲染日志
    useEffect(() => {
        if (enableLogging) {
            const logData = {
                renderCount: currentRenderCount,
                renderInterval,
                propsChanged,
            };
            if (logProps && props) {
                logData.props = props;
            }
            if (logReason && reason) {
                logData.reason = reason;
            }
            reactLoopFixToolkit.debugLogger.logRender(componentName, currentRenderCount, logData, reason);
        }
        // 检查是否渲染过多
        if (currentRenderCount > maxRenderWarning) {
            reactLoopFixToolkit.debugLogger.warn('render-counter', `${componentName} 渲染次数过多: ${currentRenderCount}`, {
                renderCount: currentRenderCount,
                maxWarning: maxRenderWarning,
                averageInterval: renderTimesRef.current.length > 1
                    ? (now - (renderTimesRef.current[0] || 0)) / (renderTimesRef.current.length - 1)
                    : 0,
            }, componentName);
        }
        // 检查渲染频率是否过高
        if (renderInterval > 0 && renderInterval < 16) {
            reactLoopFixToolkit.debugLogger.warn('render-counter', `${componentName} 渲染频率过高: ${renderInterval}ms`, {
                renderInterval,
                renderCount: currentRenderCount,
            }, componentName);
        }
    });
    // 返回渲染统计信息
    return {
        renderCount: currentRenderCount,
        renderInterval,
        propsChanged,
        averageRenderInterval: renderTimesRef.current.length > 1
            ? (now - (renderTimesRef.current[0] || 0)) / (renderTimesRef.current.length - 1)
            : 0,
        isRenderingTooMuch: currentRenderCount > maxRenderWarning,
        isRenderingTooFast: renderInterval > 0 && renderInterval < 16,
    };
}
//# sourceMappingURL=useRenderCounter.js.map