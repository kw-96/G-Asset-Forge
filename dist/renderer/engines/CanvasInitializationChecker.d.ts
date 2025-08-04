export interface InitializationCheckResult {
    isValid: boolean;
    issues: InitializationIssue[];
    recommendations: string[];
    systemInfo: SystemInfo;
}
export interface InitializationIssue {
    type: 'error' | 'warning' | 'info';
    component: 'dom' | 'fabric' | 'performance' | 'memory' | 'browser';
    message: string;
    details?: string;
}
export interface SystemInfo {
    browserSupport: {
        canvas: boolean;
        webgl: boolean;
        performance: boolean;
        memory: boolean;
    };
    fabricVersion: string | null;
    devicePixelRatio: number;
    availableMemory: number | null;
    userAgent: string;
}
/**
 * Canvas Initialization Checker
 * Validates system requirements and environment before canvas initialization
 */
export declare class CanvasInitializationChecker {
    /**
     * Perform comprehensive initialization check
     */
    static performCheck(containerId?: string): Promise<InitializationCheckResult>;
    /**
     * Check browser support for required features
     */
    private static checkBrowserSupport;
    /**
     * Validate browser support and add issues
     */
    private static validateBrowserSupport;
    /**
     * Check DOM readiness for canvas container
     */
    private static checkDOMReadiness;
    /**
     * Check Fabric.js availability
     */
    private static checkFabricAvailability;
    /**
     * Check Performance API availability
     */
    private static checkPerformanceAPI;
    /**
     * Check memory availability
     */
    private static checkMemoryAvailability;
    /**
     * Validate memory availability
     */
    private static validateMemoryAvailability;
    /**
     * Check device capabilities
     */
    private static checkDeviceCapabilities;
    /**
     * Check if Canvas API is supported
     */
    private static supportsCanvas;
    /**
     * Check if WebGL is supported
     */
    private static supportsWebGL;
    /**
     * Check if Performance API is supported
     */
    private static supportsPerformanceAPI;
    /**
     * Check if Memory API is supported
     */
    private static supportsMemoryAPI;
    /**
     * Get Fabric.js version
     */
    private static getFabricVersion;
    /**
     * Generate initialization report
     */
    static generateReport(result: InitializationCheckResult): string;
}
