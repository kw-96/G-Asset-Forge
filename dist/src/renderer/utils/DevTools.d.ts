export declare class DevTools {
    private static instance;
    private performanceMonitor;
    private debugPanel;
    private isVisible;
    static getInstance(): DevTools;
    constructor();
    private setupKeyboardShortcuts;
    toggleDebugPanel(): void;
    private showDebugPanel;
    private hideDebugPanel;
    private updateDebugPanel;
    private logMemoryUsage;
    start(): void;
    stop(): void;
    logEvent(name: string, data?: any): void;
    mark(name: string): void;
    measure(name: string, startMark: string, endMark?: string): number;
}
//# sourceMappingURL=DevTools.d.ts.map