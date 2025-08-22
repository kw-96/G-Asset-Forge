/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// 网络驱动器管理器
import { EventEmitter } from '../../engines/suika/utils/event-emitter';
import path from 'path-browserify';

export interface INetworkDriveConfig {
  id: string;
  name: string;
  path: string;
  type: 'smb' | 'nfs' | 'local' | 'mapped';
  enabled: boolean;
  priority: number; // 优先级，数字越小优先级越高
  credentials?: {
    username?: string;
    password?: string;
    domain?: string;
  };
  options?: {
    timeout?: number;
    retryCount?: number;
    autoReconnect?: boolean;
  };
}

export interface IStorageLocation {
  id: string;
  name: string;
  path: string;
  type: 'local' | 'network';
  available: boolean;
  freeSpace?: number;
  totalSpace?: number;
  lastChecked: Date;
  error?: string;
}

export interface INetworkDriveManagerEvents extends Record<string, (...args: any[]) => void> {
  driveConnected(driveId: string): void;
  driveDisconnected(driveId: string): void;
  driveError(driveId: string, error: string): void;
  storageLocationUpdated(location: IStorageLocation): void;
  fallbackActivated(originalPath: string, fallbackPath: string): void;
}

/**
 * 网络驱动器管理器
 * 负责管理网络驱动器连接、本地存储回退和文件权限检查
 */
export class NetworkDriveManager {
  private emitter = new EventEmitter<INetworkDriveManagerEvents>();
  private drives: Map<string, INetworkDriveConfig> = new Map();
  private storageLocations: Map<string, IStorageLocation> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthCheckIntervalMs = 30000; // 30秒检查一次
  private localFallbackPath: string;

  constructor(localFallbackPath?: string) {
    this.localFallbackPath = localFallbackPath || 'G-Asset-Forge';
    // 异步初始化，避免在禁用 nodeIntegration 的渲染进程中直接访问 Node API
    void this.initializeLocalFallback();
    void this.loadConfiguration();
    this.startHealthCheck();
  }

  /**
   * 初始化本地回退目录
   */
  private async initializeLocalFallback(): Promise<void> {
    try {
      await window.electronAPI.fs.createDirectory(this.localFallbackPath);
      await window.electronAPI.fs.createDirectory(path.join(this.localFallbackPath, 'projects'));
      await window.electronAPI.fs.createDirectory(path.join(this.localFallbackPath, 'assets'));
      await window.electronAPI.fs.createDirectory(path.join(this.localFallbackPath, 'temp'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('初始化本地回退目录失败:', error);
    }
  }

  /**
   * 加载配置
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const result = await window.electronAPI.config?.load('network-drives');
      if (result.success && result.data && Array.isArray(result.data.drives)) {
        (result.data.drives as INetworkDriveConfig[]).forEach((drive) => {
          this.drives.set(drive.id, drive);
        });
        return;
      }
      // 创建默认配置
      this.createDefaultConfiguration();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('加载网络驱动器配置失败:', error);
      this.createDefaultConfiguration();
    }
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfiguration(): void {
    // 添加本地存储位置
    const localDrive: INetworkDriveConfig = {
      id: 'local',
      name: '本地存储',
      path: this.localFallbackPath,
      type: 'local',
      enabled: true,
      priority: 999, // 最低优先级，作为回退
      options: {
        timeout: 5000,
        retryCount: 3,
        autoReconnect: true
      }
    };

    this.drives.set(localDrive.id, localDrive);
    this.saveConfiguration();
  }

  /**
   * 保存配置
   */
  private async saveConfiguration(): Promise<void> {
    try {
      const config = {
        drives: Array.from(this.drives.values()),
        lastUpdated: new Date().toISOString()
      };
      await window.electronAPI.config?.save('network-drives', config);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('保存网络驱动器配置失败:', error);
    }
  }

  /**
   * 添加网络驱动器
   */
  async addNetworkDrive(config: Omit<INetworkDriveConfig, 'id'>): Promise<string> {
    const id = `drive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const driveConfig: INetworkDriveConfig = {
      id,
      ...config
    };

    this.drives.set(id, driveConfig);
    await this.saveConfiguration();

    // 立即检查驱动器状态
    await this.checkDriveHealth(id);

    return id;
  }

  /**
   * 移除网络驱动器
   */
  removeNetworkDrive(driveId: string): boolean {
    if (driveId === 'local') {
      return false; // 不能移除本地存储
    }

    const removed = this.drives.delete(driveId);
    if (removed) {
      this.storageLocations.delete(driveId);
      void this.saveConfiguration();
    }
    return removed;
  }

  /**
   * 更新网络驱动器配置
   */
  updateNetworkDrive(driveId: string, updates: Partial<INetworkDriveConfig>): boolean {
    const drive = this.drives.get(driveId);
    if (!drive) {
      return false;
    }

    const updatedDrive = { ...drive, ...updates, id: driveId };
    this.drives.set(driveId, updatedDrive);
    void this.saveConfiguration();

    // 重新检查驱动器状态
    this.checkDriveHealth(driveId);

    return true;
  }

  /**
   * 获取所有驱动器配置
   */
  getAllDrives(): INetworkDriveConfig[] {
    return Array.from(this.drives.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * 获取可用的存储位置
   */
  getAvailableStorageLocations(): IStorageLocation[] {
    return Array.from(this.storageLocations.values())
      .filter(location => location.available)
      .sort((a, b) => {
        const driveA = this.drives.get(a.id);
        const driveB = this.drives.get(b.id);
        return (driveA?.priority || 999) - (driveB?.priority || 999);
      });
  }

  /**
   * 获取最佳存储位置
   */
  getBestStorageLocation(): IStorageLocation | null {
    const available = this.getAvailableStorageLocations();
    return available[0] ?? null;
  }

  /**
   * 检查路径是否可访问
   */
  async checkPathAccess(filePath: string): Promise<{
    accessible: boolean;
    readable: boolean;
    writable: boolean;
    error?: string;
  }> {
    try {
      // 检查路径是否存在
      const exists = await window.electronAPI.fs.exists(filePath);
      if (!exists) {
        return {
          accessible: false,
          readable: false,
          writable: false,
          error: '路径不存在'
        };
      }

      // 在渲染进程中无法直接进行权限探测，采用保守策略：存在即认为可读
      const readable = true;
      // 通过尝试创建子目录判断可写性（不创建实际文件，尽量避免副作用）
      let writable = false;
      try {
        await window.electronAPI.fs.createDirectory(path.join(filePath, '.write-test'));
        writable = true;
      } catch {
        writable = false;
      }

      return {
        accessible: true,
        readable,
        writable
      };
    } catch (error) {
      const msg = (error instanceof Error) ? error.message : String(error);
      return {
        accessible: false,
        readable: false,
        writable: false,
        error: msg
      };
    }
  }

  /**
   * 获取安全的文件路径
   */
  async getSafeFilePath(preferredPath: string, fileName: string): Promise<string> {
    // 首先尝试首选路径
    const fullPreferredPath = path.join(preferredPath, fileName);
    const preferredAccess = await this.checkPathAccess(path.dirname(fullPreferredPath));
    
    if (preferredAccess.accessible && preferredAccess.writable) {
      return fullPreferredPath;
    }

    // 尝试可用的存储位置
    const availableLocations = this.getAvailableStorageLocations();
    
    for (const location of availableLocations) {
      const testPath = path.join(location.path, fileName);
      const access = await this.checkPathAccess(path.dirname(testPath));
      
      if (access.accessible && access.writable) {
        // 如果使用了回退路径，发出事件
        if (location.path !== preferredPath) {
          this.emitter.emit('fallbackActivated', preferredPath, location.path);
        }
        return testPath;
      }
    }

    // 最后回退到本地路径
    const fallbackPath = path.join(this.localFallbackPath, fileName);
    this.emitter.emit('fallbackActivated', preferredPath, this.localFallbackPath);
    return fallbackPath;
  }

  /**
   * 复制文件到安全位置
   */
  async copyToSafeLocation(sourcePath: string, targetDir: string, fileName?: string): Promise<string> {
    const finalFileName = fileName || path.basename(sourcePath);
    const safePath = await this.getSafeFilePath(targetDir, finalFileName);
    
    try {
      await window.electronAPI.fs.createDirectory(path.dirname(safePath));
      // 由于未暴露通用 copy 通道，这里退化为读取+写入（较大文件可能影响性能）
      const readResult = await window.electronAPI.fs.readFile(sourcePath);
      if (!readResult.success || typeof readResult.data !== 'string') {
        throw new Error(readResult.error || '读取源文件失败');
      }
      const writeResult = await window.electronAPI.fs.writeFile(safePath, readResult.data);
      if (!writeResult.success) {
        throw new Error(writeResult.error || '写入目标文件失败');
      }
      return safePath;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('复制文件到安全位置失败:', error);
      const msg = (error instanceof Error) ? error.message : String(error);
      throw new Error(`复制文件失败: ${msg}`);
    }
  }

  /**
   * 检查驱动器健康状态
   */
  private async checkDriveHealth(driveId: string): Promise<void> {
    const drive = this.drives.get(driveId);
    if (!drive || !drive.enabled) {
      return;
    }

    const location: IStorageLocation = {
      id: driveId,
      name: drive.name,
      path: drive.path,
      type: drive.type === 'local' ? 'local' : 'network',
      available: false,
      lastChecked: new Date()
    };

    try {
      // 检查路径访问权限
      const access = await this.checkPathAccess(drive.path);
      location.available = access.accessible && access.readable;

      if (location.available) {
        // 获取磁盘空间信息
        try {
          // 简化处理：跳过 Node 层 stat 检查，仅尝试获取磁盘空间
          try {
            const diskUsage = await this.getDiskUsage(drive.path);
            location.freeSpace = diskUsage.free;
            location.totalSpace = diskUsage.total;
          } catch {
            // 忽略磁盘空间获取失败
          }
        } catch (error) {
          location.available = false;
          location.error = (error instanceof Error) ? error.message : String(error);
        }
      } else {
        location.error = access.error || '无法访问驱动器';
      }

      // 更新存储位置状态
      const previousLocation = this.storageLocations.get(driveId);
      this.storageLocations.set(driveId, location);

      // 发出状态变化事件
      if (previousLocation) {
        if (previousLocation.available !== location.available) {
          if (location.available) {
            this.emitter.emit('driveConnected', driveId);
          } else {
            this.emitter.emit('driveDisconnected', driveId);
          }
        }
      }

      if (!location.available && location.error) {
        this.emitter.emit('driveError', driveId, location.error);
      }

      this.emitter.emit('storageLocationUpdated', location);

    } catch (error) {
      location.available = false;
      const msg = (error instanceof Error) ? error.message : String(error);
      location.error = msg;
      this.storageLocations.set(driveId, location);
      this.emitter.emit('driveError', driveId, msg);
      this.emitter.emit('storageLocationUpdated', location);
    }
  }

  /**
   * 获取磁盘使用情况
   */
  private async getDiskUsage(drivePath: string): Promise<{ free: number; total: number }> {
    void drivePath;
    // 这里应该使用系统API获取磁盘空间
    // 由于Node.js没有内置的磁盘空间API，这里返回模拟数据
    // 在实际实现中，可以使用第三方库如 'check-disk-space'
    return {
      free: 1024 * 1024 * 1024 * 10, // 10GB
      total: 1024 * 1024 * 1024 * 100 // 100GB
    };
  }

  /**
   * 开始健康检查
   */
  private startHealthCheck(): void {
    // 立即执行一次检查
    this.performHealthCheck();

    // 设置定期检查
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckIntervalMs);
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<void> {
    const drives = Array.from(this.drives.keys());
    const checkPromises = drives.map(driveId => this.checkDriveHealth(driveId));
    
    try {
      await Promise.allSettled(checkPromises);
    } catch (error) {
      console.error('健康检查失败:', error);
    }
  }

  /**
   * 测试网络驱动器连接
   */
  async testDriveConnection(driveConfig: INetworkDriveConfig): Promise<{
    success: boolean;
    error?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const access = await this.checkPathAccess(driveConfig.path);
      const responseTime = Date.now() - startTime;
      
      return {
        success: access.accessible && access.readable,
        ...(access.error ? { error: access.error } : {}),
        responseTime
      };
    } catch (error) {
      const msg = (error instanceof Error) ? error.message : String(error);
      return {
        success: false,
        error: msg,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * 获取网络驱动器统计信息
   */
  getNetworkDriveStats(): {
    totalDrives: number;
    availableDrives: number;
    networkDrives: number;
    localDrives: number;
    lastHealthCheck: Date | null;
  } {
    const drives = Array.from(this.drives.values());
    const locations = Array.from(this.storageLocations.values());
    
    return {
      totalDrives: drives.length,
      availableDrives: locations.filter(l => l.available).length,
      networkDrives: drives.filter(d => d.type !== 'local').length,
      localDrives: drives.filter(d => d.type === 'local').length,
      lastHealthCheck: locations.length > 0 ? 
        new Date(Math.max(...locations.map(l => l.lastChecked.getTime()))) : null
    };
  }

  /**
   * 设置健康检查间隔
   */
  setHealthCheckInterval(intervalMs: number): void {
    this.healthCheckIntervalMs = intervalMs;
    
    if (this.healthCheckInterval) {
      this.stopHealthCheck();
      this.startHealthCheck();
    }
  }

  /**
   * 强制刷新所有驱动器状态
   */
  async refreshAllDrives(): Promise<void> {
    await this.performHealthCheck();
  }

  /**
   * 事件管理
   */
  on<T extends keyof INetworkDriveManagerEvents>(eventName: T, listener: INetworkDriveManagerEvents[T]): void {
    this.emitter.on(eventName, listener);
  }

  off<T extends keyof INetworkDriveManagerEvents>(eventName: T, listener: INetworkDriveManagerEvents[T]): void {
    this.emitter.off(eventName, listener);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopHealthCheck();
    this.emitter.removeAllListeners();
  }
}