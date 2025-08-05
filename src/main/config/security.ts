/**
 * 应用程序安全配置
 * 基于Electron最新安全最佳实践
 */

export const SecurityConfig = {
  /**
   * 内容安全策略配置
   * 遵循 Electron 安全指南和 CSP 最佳实践
   */
  CSP: {
    // 开发环境CSP - 允许webpack-dev-server热重载但限制到特定端口
    development: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3000 ws://localhost:3000; style-src 'self' 'unsafe-inline' http://localhost:3000; img-src 'self' data: blob: http://localhost:3000; font-src 'self' data: http://localhost:3000; connect-src 'self' http://localhost:3000 ws://localhost:3000 wss://localhost:3000; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
    // 生产环境CSP - 放宽限制以确保正常运行
    production: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
  },

  /**
   * Web安全配置
   */
  webSecurity: {
    nodeIntegration: false,
    contextIsolation: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
    sandbox: false,
    disableBlinkFeatures: 'Auxclick',
    spellcheck: false, // 简化配置
    nodeIntegrationInSubFrames: false,
    nodeIntegrationInWorker: false,
    webgl: true, // 启用webgl以支持图形处理
    enableRemoteModule: false
  },

  /**
   * 额外的安全Headers
   */
  securityHeaders: {
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },

  /**
   * 获取当前环境的CSP策略
   */
  getCurrentCSP(): string {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? this.CSP.development : this.CSP.production;
  },

  /**
   * 获取所有安全headers
   */
  getAllSecurityHeaders() {
    return {
      'Content-Security-Policy': this.getCurrentCSP(),
      ...this.securityHeaders
    };
  },

  /**
   * 验证URL是否安全
   */
  isSafeUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedProtocols = ['https:', 'http:', 'file:', 'data:', 'blob:'];
      
      if (process.env.NODE_ENV === 'development') {
        if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
          return true;
        }
        if (url.startsWith('devtools://') || url.startsWith('chrome-extension://')) {
          return true;
        }
      }
      
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
};