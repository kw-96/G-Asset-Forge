/**
 * 应用程序安全配置
 * 基于Electron最新安全最佳实践
 */
export declare const SecurityConfig: {
    /**
     * 内容安全策略配置
     * 遵循 Electron 安全指南和 CSP 最佳实践
     */
    CSP: {
        development: string;
        production: string;
    };
    /**
     * Web安全配置
     */
    webSecurity: {
        nodeIntegration: boolean;
        contextIsolation: boolean;
        webSecurity: boolean;
        allowRunningInsecureContent: boolean;
        experimentalFeatures: boolean;
        sandbox: boolean;
        disableBlinkFeatures: string;
        spellcheck: boolean;
        nodeIntegrationInSubFrames: boolean;
        nodeIntegrationInWorker: boolean;
        webgl: boolean;
        enableRemoteModule: boolean;
    };
    /**
     * 额外的安全Headers
     */
    securityHeaders: {
        'X-Frame-Options': string;
        'X-XSS-Protection': string;
        'X-Content-Type-Options': string;
        'Referrer-Policy': string;
    };
    /**
     * 获取当前环境的CSP策略
     */
    getCurrentCSP(): string;
    /**
     * 获取所有安全headers
     */
    getAllSecurityHeaders(): {
        'X-Frame-Options': string;
        'X-XSS-Protection': string;
        'X-Content-Type-Options': string;
        'Referrer-Policy': string;
        'Content-Security-Policy': string;
    };
    /**
     * 验证URL是否安全
     */
    isSafeUrl(url: string): boolean;
};
