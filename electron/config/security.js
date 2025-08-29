/**
 * 安全配置 - 定义应用的安全策略和设置
 * @description 包含 webSecurity、CSP、权限控制等安全相关配置
 * @author 开发团队
 */

const SecurityConfig = {
  webSecurity: {
    nodeIntegration: false, // 禁用 Node.js 集成
    contextIsolation: true, // 启用上下文隔离
    enableRemoteModule: false, // 禁用远程模块
    allowRunningInsecureContent: false, // 禁止运行不安全内容
    webSecurity: true, // 启用 web 安全
    experimentalFeatures: false, // 禁用实验性功能
    // 内容安全策略
    webPreferences: {
      // 禁用危险的 API
      enableWebSQL: false,
      // 启用沙箱以提高安全性
      sandbox: true,
      // 启用 web 安全
      webSecurity: true,
    },
  },

  // 内容安全策略
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'http://localhost:*'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  // 权限控制
  permissions: {
    // 允许的权限
    allowed: ['notifications', 'fullscreen', 'display-capture'],
    // 禁止的权限
    denied: [
      'geolocation',
      'microphone',
      'camera',
      'midi',
      'usb',
      'serial',
      'bluetooth',
    ],
  },
};

module.exports = { SecurityConfig };
