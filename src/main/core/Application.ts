/**
 * 应用程序核心类 - 管理Electron应用的整个生命周期
 * @description 负责应用初始化、窗口创建、服务管理和资源清理
 * @author 开发团队
 */
import { app, BrowserWindow } from 'electron';
import { Lifecycle } from './Lifecycle';
import { Bootstrap } from './Bootstrap';
import { WindowManager } from '../managers/WindowManager';
import { SecurityManager } from '../managers/SecurityManager';
import { MenuManager } from '../managers/MenuManager';
import { IPCService } from '../services/IPCService';
import { loggingService, fileService } from '../services';
import { SecureIPCHandlers } from '../handlers/SecureIPCHandlers';

/**
 * 应用程序配置接口
 */
export interface ApplicationConfig {
  isDevelopment: boolean;
  enableDevTools: boolean;
  enableLogging: boolean;
  enableSecurity: boolean;
  windowConfig: {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
  };
}

/**
 * 默认应用程序配置
 */
const DEFAULT_CONFIG: ApplicationConfig = {
  isDevelopment: process.env['NODE_ENV'] === 'development',
  enableDevTools: process.env['NODE_ENV'] === 'development',
  enableLogging: true,
  enableSecurity: true,
  windowConfig: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
  },
};

/**
 * 应用程序主类
 * @description 统一管理Electron应用的生命周期和核心服务
 */
export class Application {
  private static instance: Application | null = null;
  private config: ApplicationConfig;
  private isInitialized = false;
  private isShuttingDown = false;

  // 核心组件
  private lifecycle: Lifecycle;
  private bootstrap: Bootstrap;
  
  // 管理器
  private windowManager: WindowManager;
  private securityManager: SecurityManager;
  private menuManager: MenuManager;
  
  // 服务
  private ipcService: IPCService;
  private secureIPCHandlers: SecureIPCHandlers;

  // 主窗口引用
  private mainWindow: BrowserWindow | null = null;

  // DevTools 统一封装
  private openDevTools(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    const wc = this.mainWindow.webContents;
    if (!wc.isDevToolsOpened()) {
      wc.openDevTools();
    }
  }

  private closeDevTools(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    const wc = this.mainWindow.webContents;
    if (wc.isDevToolsOpened()) {
      wc.closeDevTools();
    }
  }

  private toggleDevTools(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    const wc = this.mainWindow.webContents;
    if (wc.isDevToolsOpened()) {
      this.closeDevTools();
    } else {
      this.openDevTools();
    }
  }

  private constructor(config: Partial<ApplicationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // 初始化核心组件
    this.lifecycle = new Lifecycle();
    this.bootstrap = new Bootstrap();
    
    // 初始化管理器
    this.windowManager = new WindowManager();
    this.securityManager = new SecurityManager();
    this.menuManager = new MenuManager();
    
    // 初始化服务
    this.ipcService = new IPCService();
    this.secureIPCHandlers = new SecureIPCHandlers(this.securityManager);
  }

  /**
   * 获取应用程序单例实例
   */
  public static getInstance(config?: Partial<ApplicationConfig>): Application {
    if (!Application.instance) {
      Application.instance = new Application(config);
    }
    return Application.instance;
  }

  /**
   * 启动应用程序
   */
  public async start(): Promise<void> {
    if (this.isInitialized) {
      loggingService.warn('[application] 应用程序已经初始化');
      return;
    }

    try {
      loggingService.info('[application] 开始启动应用程序');

      // 引导启动
      await this.bootstrap.initialize(this.config);

      // 设置生命周期事件
      this.setupLifecycleEvents();

      // 等待应用就绪
      await app.whenReady();

      // 初始化核心服务
      await this.initializeServices();

      // 创建主窗口
      await this.createMainWindow();

      // 设置应用菜单
      this.setupApplicationMenu();

      this.isInitialized = true;
      loggingService.info('[application] 应用程序启动完成');

    } catch (error) {
      loggingService.error('[application] 应用程序启动失败', error);
      throw error;
    }
  }

  /**
   * 停止应用程序
   */
  public async stop(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    loggingService.info('[application] 开始关闭应用程序');

    try {
      // 清理服务
      await this.cleanupServices();

      // 清理管理器
      this.cleanupManagers();

      // 清理窗口
      this.cleanupWindows();

      loggingService.info('[application] 应用程序关闭完成');
    } catch (error) {
      loggingService.error('[application] 应用程序关闭时发生错误', error);
    }
  }

  /**
   * 获取主窗口
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * 获取应用程序配置
   */
  public getConfig(): ApplicationConfig {
    return { ...this.config };
  }

  /**
   * 检查应用程序是否已初始化
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 获取应用程序状态
   */
  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      isShuttingDown: this.isShuttingDown,
      hasMainWindow: this.mainWindow !== null,
      windowCount: BrowserWindow.getAllWindows().length,
      config: this.config,
    };
  }

  // 私有方法

  /**
   * 设置生命周期事件
   */
  private setupLifecycleEvents(): void {
    // 应用激活事件
    this.lifecycle.onActivate(async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    // 所有窗口关闭事件
    this.lifecycle.onWindowAllClosed(async () => {
      await this.stop();
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // 应用退出前事件
    this.lifecycle.onBeforeQuit(async () => {
      await this.stop();
    });

    // 应用退出事件
    this.lifecycle.onWillQuit(async (event) => {
      if (!this.isShuttingDown) {
        event.preventDefault();
        await this.stop();
        app.quit();
      }
    });
  }

  /**
   * 初始化核心服务
   */
  private async initializeServices(): Promise<void> {
    loggingService.info('[application] 初始化核心服务');

    // 初始化日志服务
    if (this.config.enableLogging) {
      await loggingService.initialize();
    }

    // 初始化文件服务
    await fileService.initialize();

    // 初始化安全管理器
    if (this.config.enableSecurity) {
      await this.securityManager.initialize();
    }

    // 初始化IPC服务
    await this.ipcService.initialize();

    // 注册安全IPC路由
    const secureRoutes = this.secureIPCHandlers.registerSecureRoutes();
    this.ipcService.registerRoutes(secureRoutes);

    loggingService.info('[application] 核心服务初始化完成');
  }

  /**
   * 创建主窗口
   */
  private async createMainWindow(): Promise<void> {
    loggingService.info('[application] 创建主窗口');

    try {
      this.mainWindow = await this.windowManager.createMainWindow({
        width: this.config.windowConfig.width,
        height: this.config.windowConfig.height,
        minWidth: this.config.windowConfig.minWidth,
        minHeight: this.config.windowConfig.minHeight,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          preload: this.bootstrap.getPreloadPath(),
        },
      });

      // 设置窗口事件
      this.setupWindowEvents();

      // 设置IPC处理器
      this.ipcService.setupHandlers(this.mainWindow);

      // 开发环境下打开开发者工具（确保打开，不会误关）
      if (this.config.enableDevTools) {
        this.openDevTools();
      }

      loggingService.info('[application] 主窗口创建完成');
    } catch (error) {
      loggingService.error('[application] 创建主窗口失败', error);
      throw error;
    }
  }

  /**
   * 设置窗口事件
   */
  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    this.mainWindow.on('closed', () => {
      loggingService.info('[application] 主窗口已关闭');
      this.mainWindow = null;
    });

    this.mainWindow.on('focus', () => {
      loggingService.debug('[application] 主窗口获得焦点');
    });

    this.mainWindow.on('blur', () => {
      loggingService.debug('[application] 主窗口失去焦点');
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      loggingService.info('[application] 渲染进程加载完成');
    });

    this.mainWindow.webContents.on('crashed', (_event, killed) => {
      loggingService.error('[application] 渲染进程崩溃', { killed });
      // 可以在这里实现崩溃恢复逻辑
    });
  }

  /**
   * 设置应用菜单
   */
  private setupApplicationMenu(): void {
    if (!this.mainWindow) return;

    this.menuManager.createApplicationMenu({
      onNewProject: () => this.mainWindow?.webContents.send('menu:new-project'),
      onOpenProject: () => this.mainWindow?.webContents.send('menu:open-project'),
      onSaveProject: () => this.mainWindow?.webContents.send('menu:save-project'),
      onExport: () => this.mainWindow?.webContents.send('menu:export'),
      onUndo: () => this.mainWindow?.webContents.send('menu:undo'),
      onRedo: () => this.mainWindow?.webContents.send('menu:redo'),
      onCut: () => this.mainWindow?.webContents.send('menu:cut'),
      onCopy: () => this.mainWindow?.webContents.send('menu:copy'),
      onPaste: () => this.mainWindow?.webContents.send('menu:paste'),
      onToggleRuler: () => this.mainWindow?.webContents.send('menu:toggle-ruler'),
      onToggleGuides: () => this.mainWindow?.webContents.send('menu:toggle-guides'),
      onZoomIn: () => this.mainWindow?.webContents.send('menu:zoom-in'),
      onZoomOut: () => this.mainWindow?.webContents.send('menu:zoom-out'),
      onFitToScreen: () => this.mainWindow?.webContents.send('menu:fit-to-screen'),
      onToggleDevTools: () => this.toggleDevTools(),
      onQuit: () => app.quit(),
    });
  }

  /**
   * 清理服务
   */
  private async cleanupServices(): Promise<void> {
    loggingService.info('[application] 清理服务');

    try {
      this.secureIPCHandlers.cleanup();
      await this.ipcService.cleanup();
      await fileService.cleanup();
      await loggingService.cleanup();
    } catch (error) {
      loggingService.error('[application] 清理服务时发生错误', error);
    }
  }

  /**
   * 清理管理器
   */
  private cleanupManagers(): void {
    loggingService.info('[application] 清理管理器');

    try {
      this.securityManager.cleanup();
      this.menuManager.cleanup();
    } catch (error) {
      loggingService.error('[application] 清理管理器时发生错误', error);
    }
  }

  /**
   * 清理窗口
   */
  private cleanupWindows(): void {
    loggingService.info('[application] 清理窗口');

    try {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.removeAllListeners();
        this.mainWindow.close();
        this.mainWindow = null;
      }

      // 关闭所有窗口
      BrowserWindow.getAllWindows().forEach(window => {
        if (!window.isDestroyed()) {
          window.removeAllListeners();
          window.close();
        }
      });
    } catch (error) {
      loggingService.error('[application] 清理窗口时发生错误', error);
    }
  }
}