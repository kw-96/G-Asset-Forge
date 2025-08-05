/**
 * Canvas System Validator
 * Provides validation and diagnostic tools for the canvas system
 */
export declare class CanvasSystemValidator {
    /**
     * Validate canvas system readiness
     */
    static validateSystem(): Promise<{
        isReady: boolean;
        issues: string[];
        recommendations: string[];
    }>;
    /**
     * Test canvas creation
     */
    static testCanvasCreation(containerId?: string): Promise<{
        success: boolean;
        error?: string;
        canvasId?: string;
    }>;
    /**
     * Get system diagnostics
     */
    static getDiagnostics(): Promise<{
        environment: {
            userAgent: string;
            platform: string;
            language: string;
            cookieEnabled: boolean;
            onLine: boolean;
        };
        performance: {
            memoryAvailable: boolean;
            memoryUsage?: number;
            timing: boolean;
        };
        canvas: {
            supported: boolean;
            webglSupported: boolean;
            maxTextureSize?: number;
        };
        fabricjs: {
            available: boolean;
            version?: string;
        };
    }>;
    /**
     * Generate diagnostic report
     */
    static generateDiagnosticReport(): Promise<string>;
}
//# sourceMappingURL=CanvasSystemValidator.d.ts.map