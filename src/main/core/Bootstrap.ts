/**
 * 应用引导启动器 - 负责应用启动前的初始化工作
 * @description 处理应用启动前的配置、环境检查、路径设置等工作
 * @author 开发团队
 */
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../utils/logger';
import type { ApplicationConfig } from './Application';

/**
 * 引导配置接口
 */
export interface BootstrapConfig {
  appName: string;
  appVersion: string;
  userDataPath?: string;
  logPath?: string;
  preloadScript?: string;
  enableSingleInstance: boolean;
  enableProtocolHandler: boolean;
  protocolName?: string;
  enableHardwareAcceleration: boolean;
  enableSandbox: boolean;
}

/**
 * 默认引导配置
 */
const DEFAULT_BOOTSTRAP_CONFIG: BootstrapConfig = {
  appName: 'G-Asset Forge',
  appVersion: '1.0.0',
  enableSingleInstance: true,
  enableProtocolHandler: false,
  protocolName: 'g-asset-forge',
  enableHardwareAcceleration: true,
  enableSandbox: false,
};

/**
 * 引导启动器类
 * @description 负责应用启动前的所有初始化工作
 */
export class Bootstrap {
  private config: BootstrapConfig;
  private isInitialized = false;
  private preloadPath: string;
  private rendererPath: string;

  constructor(config: Partial<BootstrapConfig> = {}) {
    this.config = { ...DEFAULT_BOOTSTRAP_CONFIG, ...config };
    this.preloadPath = '';
    this.rendererPath = '';
  }

  /**
   * 初始化引导程序
   */
  public async initialize(appConfig: ApplicationConfig): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[bootstrap] 引导程序已经初始化');
      return;
    }

    try {
      logger.info('[bootstrap] 开始引导程序初始化');

      // 设置应用基本信息
      this.setupAppInfo();

      // 检查运行环境
      this.checkEnvironment();

      // 设置应用路径
      this.setupPaths();

      // 配置应用选项
      this.configureAppOptions(appConfig);

      // 设置单实例锁
      if (this.config.enableSingleInstance) {
        this.setupSingleInstance();
      }

      // 设置协议处理器
      if (this.config.enableProtocolHandler && this.config.protocolName) {
        this.setupProtocolHandler();
      }

      // 验证关键文件
      await this.validateCriticalFiles();

      this.isInitialized = true;
      logger.info('[bootstrap] 引导程序初始化完成');

    } catch (error) {
      logger.error('[bootstrap] 引导程序初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取预加载脚本路径
   */
  public getPreloadPath(): string {
    return this.preloadPath;
  }

  /**
   * 获取渲染进程路径
   */
  public getRendererPath(): string {
    return this.rendererPath;
  }

  /**
   * 获取应用路径信息
   */
  public getPathInfo() {
    return {
      appPath: app.getAppPath(),
      userDataPath: app.getPath('userData'),
      tempPath: app.getPath('temp'),
      logsPath: app.getPath('logs'),
      documentsPath: app.getPath('documents'),
      downloadsPath: app.getPath('downloads'),
      preloadPath: this.preloadPath,
      rendererPath: this.rendererPath,
    };
  }

  /**
   * 获取系统信息
   */
  public getSystemInfo() {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      v8Version: process.versions.v8,
      isPackaged: app.isPackaged,
      isDevelopment: process.env['NODE_ENV'] === 'development',
      appVersion: app.getVersion(),
      appName: app.getName(),
    };
  }

  /**
   * 检查应用完整性
   */
  public async checkIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // 检查预加载脚本
      if (!fs.existsSync(this.preloadPath)) {
        issues.push(`预加载脚本不存在: ${this.preloadPath}`);
      }

      // 检查渲染进程文件
      if (!fs.existsSync(this.rendererPath)) {
        issues.push(`渲染进程文件不存在: ${this.rendererPath}`);
      }

      // 检查用户数据目录权限
      const userDataPath = app.getPath('userData');
      try {
        fs.accessSync(userDataPath, fs.constants.W_OK);
      } catch {
        issues.push(`用户数据目录无写入权限: ${userDataPath}`);
      }

      // 检查临时目录权限
      const tempPath = app.getPath('temp');
      try {
        fs.accessSync(tempPath, fs.constants.W_OK);
      } catch {
        issues.push(`临时目录无写入权限: ${tempPath}`);
      }

    } catch (error) {
      issues.push(`完整性检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  // 私有方法

  /**
   * 设置应用基本信息
   */
  private setupAppInfo(): void {
    if (this.config.appName) {
      app.setName(this.config.appName);
    }
    
    // 设置应用版本（如果可能）
    try {
      const packageJson = require(path.join(app.getAppPath(), 'package.json'));
      if (packageJson.version) {
        this.config.appVersion = packageJson.version;
      }
    } catch {
      // 忽略错误，使用默认版本
    }

    logger.info('[bootstrap] 应用信息设置完成', {
      name: this.config.appName || 'Unknown',
      version: this.config.appVersion || 'Unknown',
    });
  }

  /**
   * 检查运行环境
   */
  private checkEnvironment(): void {
    const systemInfo = this.getSystemInfo();
    
    logger.info('[bootstrap] 系统环境信息', systemInfo);

    // 检查Node.js版本
    const nodeVersion = process.version || '16.0.0';
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0] || '16');
    if (majorVersion < 16) {
      logger.warn('[bootstrap] Node.js版本过低，建议使用16.x或更高版本');
    }

    // 检查平台支持
    const supportedPlatforms = ['win32', 'darwin', 'linux'];
    if (!supportedPlatforms.includes(process.platform)) {
      logger.warn(`[bootstrap] 不支持的平台: ${process.platform}`);
    }

    // 检查架构支持
    const supportedArchs = ['x64', 'arm64'];
    if (!supportedArchs.includes(process.arch)) {
      logger.warn(`[bootstrap] 不支持的架构: ${process.arch}`);
    }
  }

  /**
   * 设置应用路径
   */
  private setupPaths(): void {
    const appPath = app.getAppPath();
    const isDev = process.env['NODE_ENV'] === 'development';

    // 设置预加载脚本路径
    this.preloadPath = path.join(appPath, isDev ? 'src/main/preload.ts' : 'main/preload.js');
    
    // 设置渲染进程路径
    this.rendererPath = path.join(appPath, isDev ? 'src/renderer/index.html' : 'renderer/index.html');

    // 设置用户数据路径
    if (this.config.userDataPath) {
      app.setPath('userData', this.config.userDataPath);
    }

    // 设置日志路径
    if (this.config.logPath) {
      app.setPath('logs', this.config.logPath);
    }

    // 确保关键目录存在
    this.ensureDirectories();

    logger.info('[bootstrap] 应用路径设置完成', this.getPathInfo());
  }

  /**
   * 确保关键目录存在
   */
  private ensureDirectories(): void {
    const directories = [
      app.getPath('userData'),
      app.getPath('logs'),
      path.join(app.getPath('userData'), 'projects'),
      path.join(app.getPath('userData'), 'assets'),
      path.join(app.getPath('userData'), 'cache'),
    ];

    directories.forEach(dir => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          logger.debug(`[bootstrap] 创建目录: ${dir}`);
        }
      } catch (error) {
        logger.error(`[bootstrap] 创建目录失败: ${dir}`, error);
      }
    });
  }

  /**
   * 配置应用选项
   */
  private configureAppOptions(appConfig: ApplicationConfig): void {
    // 配置硬件加速
    if (!this.config.enableHardwareAcceleration) {
      app.disableHardwareAcceleration();
      logger.info('[bootstrap] 已禁用硬件加速');
    }

    // 配置沙盒模式
    if (this.config.enableSandbox) {
      app.enableSandbox();
      logger.info('[bootstrap] 已启用沙盒模式');
    }

    // 设置应用用户模型ID（Windows）
    if (process.platform === 'win32' && this.config.appName) {
      app.setAppUserModelId(`com.gassetforge.${this.config.appName.toLowerCase().replace(/\s+/g, '')}`);
    }

    // 配置命令行开关
    if (appConfig.isDevelopment) {
      app.commandLine.appendSwitch('disable-web-security');
      app.commandLine.appendSwitch('allow-running-insecure-content');
    }

    logger.info('[bootstrap] 应用选项配置完成');
  }

  /**
   * 设置单实例锁
   */
  private setupSingleInstance(): void {
    const gotTheLock = app.requestSingleInstanceLock();
    
    if (!gotTheLock) {
      logger.warn('[bootstrap] 应用已在运行，退出当前实例');
      app.quit();
      return;
    }

    logger.info('[bootstrap] 单实例锁设置完成');
  }

  /**
   * 设置协议处理器
   */
  private setupProtocolHandler(): void {
    if (!this.config.protocolName) return;

    const result = app.setAsDefaultProtocolClient(this.config.protocolName);
    logger.info(`[bootstrap] 协议处理器设置: ${this.config.protocolName}`, result ? '成功' : '失败');
  }

  /**
   * 验证关键文件
   */
  private async validateCriticalFiles(): Promise<void> {
    const filesToCheck = [
      { path: this.preloadPath, name: '预加载脚本' },
      { path: this.rendererPath, name: '渲染进程文件' },
    ];

    for (const file of filesToCheck) {
      if (!fs.existsSync(file.path)) {
        throw new Error(`关键文件不存在: ${file.name} (${file.path})`);
      }
    }

    logger.info('[bootstrap] 关键文件验证完成');
  }
}