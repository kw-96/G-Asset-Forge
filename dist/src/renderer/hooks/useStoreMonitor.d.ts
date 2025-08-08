/**
 * Store监控Hook
 * 监控AppStore的状态变化，检测潜在的性能问题
 */
export interface UseStoreMonitorOptions {
    enableRenderTracking?: boolean;
    enableStateChangeLogging?: boolean;
    renderThreshold?: number;
    stateChangeThreshold?: number;
    monitorInterval?: number;
}
export interface StoreMonitorStats {
    renderCount: number;
    stateChangeCount: number;
    lastStateChange: number;
    averageRenderInterval: number;
    suspiciousActivity: boolean;
}
export declare function useStoreMonitor(options?: UseStoreMonitorOptions): {
    stats: StoreMonitorStats;
    resetStats: () => void;
    generateReport: () => {
        renderTimes: number[];
        monitoringOptions: {
            enableRenderTracking: boolean;
            enableStateChangeLogging: boolean;
            renderThreshold: number;
            stateChangeThreshold: number;
            monitorInterval: number;
        };
        recommendations: string[];
        renderCount: number;
        stateChangeCount: number;
        lastStateChange: number;
        averageRenderInterval: number;
        suspiciousActivity: boolean;
    };
    checkFieldChangeFrequency: (fieldName: string, timeWindow?: number) => {
        fieldName: string;
        changeCount: number;
        timeWindow: number;
        frequency: number;
    };
    isHealthy: boolean;
    renderFrequency: number;
    hasExcessiveRenders: boolean;
    hasExcessiveStateChanges: boolean;
    hasHighRenderFrequency: boolean;
};
//# sourceMappingURL=useStoreMonitor.d.ts.map