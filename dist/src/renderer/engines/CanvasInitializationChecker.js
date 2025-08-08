import { fabric } from 'fabric';
/**
 * Canvas Initialization Checker
 * Validates system requirements and environment before canvas initialization
 */
export class CanvasInitializationChecker {
    /**
     * Perform comprehensive initialization check
     */
    static async performCheck(containerId) {
        const issues = [];
        const recommendations = [];
        // Check browser support
        const browserSupport = this.checkBrowserSupport();
        this.validateBrowserSupport(browserSupport, issues, recommendations);
        // Check DOM readiness
        if (containerId) {
            this.checkDOMReadiness(containerId, issues, recommendations);
        }
        // Check Fabric.js availability
        this.checkFabricAvailability(issues, recommendations);
        // Check performance API
        this.checkPerformanceAPI(issues, recommendations);
        // Check memory availability
        const availableMemory = this.checkMemoryAvailability();
        this.validateMemoryAvailability(availableMemory, issues, recommendations);
        // Check device capabilities
        this.checkDeviceCapabilities(issues, recommendations);
        const systemInfo = {
            browserSupport,
            fabricVersion: this.getFabricVersion(),
            devicePixelRatio: window.devicePixelRatio || 1,
            availableMemory,
            userAgent: navigator.userAgent
        };
        const isValid = !issues.some(issue => issue.type === 'error');
        return {
            isValid,
            issues,
            recommendations,
            systemInfo
        };
    }
    /**
     * Check browser support for required features
     */
    static checkBrowserSupport() {
        return {
            canvas: this.supportsCanvas(),
            webgl: this.supportsWebGL(),
            performance: this.supportsPerformanceAPI(),
            memory: this.supportsMemoryAPI()
        };
    }
    /**
     * Validate browser support and add issues
     */
    static validateBrowserSupport(support, issues, recommendations) {
        if (!support.canvas) {
            issues.push({
                type: 'error',
                component: 'browser',
                message: 'Canvas API is not supported',
                details: 'HTML5 Canvas is required for the application to function'
            });
            recommendations.push('Please use a modern browser that supports HTML5 Canvas');
        }
        if (!support.webgl) {
            issues.push({
                type: 'warning',
                component: 'browser',
                message: 'WebGL is not supported',
                details: 'Some advanced graphics features may not be available'
            });
            recommendations.push('Enable hardware acceleration for better performance');
        }
        if (!support.performance) {
            issues.push({
                type: 'warning',
                component: 'performance',
                message: 'Performance API is not available',
                details: 'Performance monitoring will be limited'
            });
        }
        if (!support.memory) {
            issues.push({
                type: 'info',
                component: 'memory',
                message: 'Memory API is not available',
                details: 'Memory usage monitoring will not be available'
            });
        }
    }
    /**
     * Check DOM readiness for canvas container
     */
    static checkDOMReadiness(containerId, issues, recommendations) {
        if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
            issues.push({
                type: 'warning',
                component: 'dom',
                message: 'DOM is not ready',
                details: 'Document is still loading'
            });
            recommendations.push('Wait for DOM to be ready before initializing canvas');
        }
        const container = document.getElementById(containerId);
        if (!container) {
            issues.push({
                type: 'error',
                component: 'dom',
                message: `Container element not found: ${containerId}`,
                details: 'The specified container element does not exist in the DOM'
            });
            recommendations.push(`Ensure element with id "${containerId}" exists before initialization`);
            return;
        }
        // Check container dimensions
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            issues.push({
                type: 'warning',
                component: 'dom',
                message: 'Container has zero dimensions',
                details: `Container size: ${rect.width}x${rect.height}`
            });
            recommendations.push('Ensure container has valid dimensions before canvas initialization');
        }
        // Check container visibility
        const style = window.getComputedStyle(container);
        if (style.display === 'none' || style.visibility === 'hidden') {
            issues.push({
                type: 'warning',
                component: 'dom',
                message: 'Container is not visible',
                details: 'Container is hidden or has display: none'
            });
            recommendations.push('Make container visible before canvas initialization');
        }
    }
    /**
     * Check Fabric.js availability
     */
    static checkFabricAvailability(issues, recommendations) {
        if (typeof fabric === 'undefined') {
            issues.push({
                type: 'error',
                component: 'fabric',
                message: 'Fabric.js is not available',
                details: 'Fabric.js library is required for canvas functionality'
            });
            recommendations.push('Ensure Fabric.js is properly loaded before initialization');
            return;
        }
        if (!fabric.Canvas) {
            issues.push({
                type: 'error',
                component: 'fabric',
                message: 'Fabric.Canvas is not available',
                details: 'Fabric.Canvas constructor is missing'
            });
            recommendations.push('Check Fabric.js installation and imports');
        }
        // Check Fabric.js version compatibility
        const version = this.getFabricVersion();
        if (version) {
            const majorVersion = parseInt(version?.split('.')[0] ?? '');
            if (majorVersion < 4) {
                issues.push({
                    type: 'warning',
                    component: 'fabric',
                    message: 'Fabric.js version may be outdated',
                    details: `Current version: ${version}, recommended: 4.x or higher`
                });
                recommendations.push('Consider upgrading to a newer version of Fabric.js');
            }
        }
    }
    /**
     * Check Performance API availability
     */
    static checkPerformanceAPI(issues, recommendations) {
        if (!this.supportsPerformanceAPI()) {
            issues.push({
                type: 'warning',
                component: 'performance',
                message: 'Performance API is not fully supported',
                details: 'Some performance monitoring features will be unavailable'
            });
            recommendations.push('Use a browser with full Performance API support for better monitoring');
        }
        // Check high-resolution time support
        if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
            issues.push({
                type: 'warning',
                component: 'performance',
                message: 'High-resolution time is not available',
                details: 'Performance.now() is not supported'
            });
        }
    }
    /**
     * Check memory availability
     */
    static checkMemoryAvailability() {
        if ('memory' in performance && performance.memory) {
            return performance.memory.jsHeapSizeLimit / (1024 * 1024); // MB
        }
        return null;
    }
    /**
     * Validate memory availability
     */
    static validateMemoryAvailability(availableMemory, issues, recommendations) {
        if (availableMemory === null) {
            issues.push({
                type: 'info',
                component: 'memory',
                message: 'Memory information is not available',
                details: 'Cannot determine available memory'
            });
            return;
        }
        if (availableMemory < 100) {
            issues.push({
                type: 'error',
                component: 'memory',
                message: 'Insufficient memory available',
                details: `Available: ${availableMemory.toFixed(1)}MB, Required: 100MB minimum`
            });
            recommendations.push('Close other applications to free up memory');
        }
        else if (availableMemory < 200) {
            issues.push({
                type: 'warning',
                component: 'memory',
                message: 'Limited memory available',
                details: `Available: ${availableMemory.toFixed(1)}MB, Recommended: 200MB or more`
            });
            recommendations.push('Consider closing other tabs or applications for better performance');
        }
    }
    /**
     * Check device capabilities
     */
    static checkDeviceCapabilities(issues, recommendations) {
        // Check device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 2) {
            issues.push({
                type: 'info',
                component: 'browser',
                message: 'High DPI display detected',
                details: `Device pixel ratio: ${dpr}`
            });
            recommendations.push('High DPI displays may require more memory and processing power');
        }
        // Check for mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            issues.push({
                type: 'info',
                component: 'browser',
                message: 'Mobile device detected',
                details: 'Performance may be limited on mobile devices'
            });
            recommendations.push('Consider using simplified canvas settings on mobile devices');
        }
        // Check for touch support
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (hasTouch) {
            issues.push({
                type: 'info',
                component: 'browser',
                message: 'Touch input detected',
                details: 'Touch interactions are available'
            });
        }
    }
    /**
     * Check if Canvas API is supported
     */
    static supportsCanvas() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        }
        catch {
            return false;
        }
    }
    /**
     * Check if WebGL is supported
     */
    static supportsWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl'));
        }
        catch {
            return false;
        }
    }
    /**
     * Check if Performance API is supported
     */
    static supportsPerformanceAPI() {
        return !!(typeof performance !== 'undefined' &&
            typeof performance.now === 'function' &&
            typeof performance.mark === 'function' &&
            typeof performance.measure === 'function');
    }
    /**
     * Check if Memory API is supported
     */
    static supportsMemoryAPI() {
        return !!(typeof performance !== 'undefined' &&
            'memory' in performance &&
            performance.memory);
    }
    /**
     * Get Fabric.js version
     */
    static getFabricVersion() {
        try {
            return fabric.version || null;
        }
        catch {
            return null;
        }
    }
    /**
     * Generate initialization report
     */
    static generateReport(result) {
        const lines = [];
        lines.push('=== Canvas Initialization Check Report ===');
        lines.push(`Status: ${result.isValid ? 'PASSED' : 'FAILED'}`);
        lines.push('');
        // System Information
        lines.push('System Information:');
        lines.push(`- Browser: ${result.systemInfo.userAgent}`);
        lines.push(`- Device Pixel Ratio: ${result.systemInfo.devicePixelRatio}`);
        lines.push(`- Fabric.js Version: ${result.systemInfo.fabricVersion || 'Unknown'}`);
        lines.push(`- Available Memory: ${result.systemInfo.availableMemory ? result.systemInfo.availableMemory.toFixed(1) + 'MB' : 'Unknown'}`);
        lines.push('');
        // Browser Support
        lines.push('Browser Support:');
        lines.push(`- Canvas: ${result.systemInfo.browserSupport.canvas ? '✓' : '✗'}`);
        lines.push(`- WebGL: ${result.systemInfo.browserSupport.webgl ? '✓' : '✗'}`);
        lines.push(`- Performance API: ${result.systemInfo.browserSupport.performance ? '✓' : '✗'}`);
        lines.push(`- Memory API: ${result.systemInfo.browserSupport.memory ? '✓' : '✗'}`);
        lines.push('');
        // Issues
        if (result.issues.length > 0) {
            lines.push('Issues Found:');
            result.issues.forEach((issue, index) => {
                const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
                lines.push(`${index + 1}. ${icon} [${issue.component.toUpperCase()}] ${issue.message}`);
                if (issue.details) {
                    lines.push(`   Details: ${issue.details}`);
                }
            });
            lines.push('');
        }
        // Recommendations
        if (result.recommendations.length > 0) {
            lines.push('Recommendations:');
            result.recommendations.forEach((rec, index) => {
                lines.push(`${index + 1}. ${rec}`);
            });
        }
        return lines.join('\n');
    }
}
//# sourceMappingURL=CanvasInitializationChecker.js.map