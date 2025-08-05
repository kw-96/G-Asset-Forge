/**
 * Simple Canvas Validator
 * Provides basic validation without complex type dependencies
 */
export declare class SimpleCanvasValidator {
    /**
     * Check if canvas is supported
     */
    static isCanvasSupported(): boolean;
    /**
     * Check if WebGL is supported
     */
    static isWebGLSupported(): boolean;
    /**
     * Check if Performance API is available
     */
    static isPerformanceAPIAvailable(): boolean;
    /**
     * Check if Memory API is available
     */
    static isMemoryAPIAvailable(): boolean;
    /**
     * Check if Fabric.js is available
     */
    static isFabricJSAvailable(): Promise<boolean>;
    /**
     * Get basic system info
     */
    static getBasicSystemInfo(): {
        canvas: boolean;
        webgl: boolean;
        performance: boolean;
        memory: boolean;
        userAgent: string;
    };
    /**
     * Validate basic requirements
     */
    static validateBasicRequirements(): Promise<{
        isValid: boolean;
        issues: string[];
    }>;
    /**
     * Generate simple report
     */
    static generateSimpleReport(): Promise<string>;
}
//# sourceMappingURL=SimpleCanvasValidator.d.ts.map