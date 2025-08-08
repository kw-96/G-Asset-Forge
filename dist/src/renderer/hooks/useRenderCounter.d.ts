/**
 * 渲染计数Hook
 * 跟踪组件的渲染次数，用于性能监控和调试
 */
export interface UseRenderCounterOptions {
    componentName: string;
    enableLogging?: boolean;
    logProps?: boolean;
    logReason?: boolean;
    maxRenderWarning?: number;
}
export declare function useRenderCounter(options: UseRenderCounterOptions, props?: any, reason?: string): {
    renderCount: number;
    renderInterval: number;
    propsChanged: boolean;
    averageRenderInterval: number;
    isRenderingTooMuch: boolean;
    isRenderingTooFast: boolean;
};
//# sourceMappingURL=useRenderCounter.d.ts.map