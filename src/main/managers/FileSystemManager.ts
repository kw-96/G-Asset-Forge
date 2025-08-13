import * as fs from 'fs-extra';
import * as path from 'path';
import { app } from 'electron';

export class FileSystemManager {
  private readonly userDataPath: string;
  private readonly sharedDrivePath: string | null;

  constructor() {
    this.userDataPath = app.getPath('userData');
    this.sharedDrivePath = this.detectSharedDrive();
    this.initializeDirectories();
  }

  private detectSharedDrive(): string | null {
    // Try to detect shared network drives
    // This is a simplified implementation - in production, this would be configurable
    const possiblePaths = [
      'Z:\\', // Common Windows network drive
      '/Volumes/Shared', // macOS network volume
      '/mnt/shared' // Linux mount point
    ];

    for (const drivePath of possiblePaths) {
      try {
        if (fs.existsSync(drivePath)) {
          return drivePath;
        }
      } catch (error) {
        // Continue checking other paths
      }
    }

    return null;
  }

  private async initializeDirectories(): Promise<void> {
    try {
      // Create local directories
      await fs.ensureDir(path.join(this.userDataPath, 'projects'));
      await fs.ensureDir(path.join(this.userDataPath, 'assets'));
      await fs.ensureDir(path.join(this.userDataPath, 'templates'));
      await fs.ensureDir(path.join(this.userDataPath, 'exports'));

      // Create shared directories if available
      if (this.sharedDrivePath) {
        try {
          await fs.ensureDir(path.join(this.sharedDrivePath, 'g-asset-forge', 'shared-assets'));
          await fs.ensureDir(path.join(this.sharedDrivePath, 'g-asset-forge', 'shared-projects'));
        } catch (error) {
          console.warn('Could not create shared directories:', error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize directories:', error);
    }
  }

  async readFile(filePath: string): Promise<any> {
    try {
      const fullPath = this.resolvePath(filePath);
      const data = await fs.readFile(fullPath, 'utf8');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async writeFile(filePath: string, data: any): Promise<any> {
    try {
      const fullPath = this.resolvePath(filePath);
      await fs.ensureDir(path.dirname(fullPath));
      
      // Try shared drive first, fallback to local
      if (this.isSharedPath(filePath) && this.sharedDrivePath) {
        try {
          await fs.writeFile(fullPath, data, 'utf8');
          return { success: true, path: fullPath, location: 'shared' };
        } catch (error) {
          // Fallback to local storage
          const localPath = this.getLocalFallbackPath(filePath);
          await fs.writeFile(localPath, data, 'utf8');
          return { 
            success: true, 
            path: localPath, 
            location: 'local',
            fallbackUsed: true,
            originalError: (error as Error).message
          };
        }
      } else {
        await fs.writeFile(fullPath, data, 'utf8');
        return { success: true, path: fullPath, location: 'local' };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolvePath(filePath);
      return await fs.pathExists(fullPath);
    } catch (error) {
      return false;
    }
  }

  async createDirectory(dirPath: string): Promise<any> {
    try {
      const fullPath = this.resolvePath(dirPath);
      await fs.ensureDir(fullPath);
      return { success: true, path: fullPath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private resolvePath(filePath: string): string {
    // Handle absolute paths
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    // Handle shared paths
    if (this.isSharedPath(filePath) && this.sharedDrivePath) {
      return path.join(this.sharedDrivePath, 'g-asset-forge', filePath.replace('shared/', ''));
    }

    // Handle local paths
    return path.join(this.userDataPath, filePath);
  }

  private isSharedPath(filePath: string): boolean {
    return filePath.startsWith('shared/') || filePath.includes('/shared/');
  }

  private getLocalFallbackPath(filePath: string): string {
    const relativePath = filePath.replace('shared/', 'local-fallback/');
    return path.join(this.userDataPath, relativePath);
  }

  getSharedDriveStatus(): { available: boolean; path: string | null } {
    return {
      available: this.sharedDrivePath !== null,
      path: this.sharedDrivePath
    };
  }

  getUserDataPath(): string {
    return this.userDataPath;
  }

  // 配置管理方法

  /**
   * 保存配置文件
   */
  async saveConfig(configKey: string, configData: any): Promise<any> {
    try {
      const configDir = path.join(this.userDataPath, 'config');
      await fs.ensureDir(configDir);
      
      const configPath = path.join(configDir, `${configKey}.json`);
      const configString = JSON.stringify(configData, null, 2);
      
      await fs.writeFile(configPath, configString, 'utf8');
      
      return { 
        success: true, 
        path: configPath,
        size: configString.length,
        timestamp: Date.now()
      };
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * 加载配置文件
   */
  async loadConfig(configKey: string): Promise<any> {
    try {
      const configPath = path.join(this.userDataPath, 'config', `${configKey}.json`);
      
      if (!(await fs.pathExists(configPath))) {
        return { 
          success: false, 
          error: 'Configuration file not found' 
        };
      }
      
      const configString = await fs.readFile(configPath, 'utf8');
      const configData = JSON.parse(configString);
      
      return { 
        success: true, 
        data: configData,
        path: configPath,
        size: configString.length,
        lastModified: (await fs.stat(configPath)).mtime.getTime()
      };
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * 检查配置文件是否存在
   */
  async configExists(configKey: string): Promise<boolean> {
    try {
      const configPath = path.join(this.userDataPath, 'config', `${configKey}.json`);
      return await fs.pathExists(configPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * 删除配置文件
   */
  async deleteConfig(configKey: string): Promise<any> {
    try {
      const configPath = path.join(this.userDataPath, 'config', `${configKey}.json`);
      
      if (!(await fs.pathExists(configPath))) {
        return { 
          success: false, 
          error: 'Configuration file not found' 
        };
      }
      
      await fs.remove(configPath);
      
      return { 
        success: true, 
        path: configPath 
      };
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * 列出所有配置文件
   */
  async listConfigs(): Promise<any> {
    try {
      const configDir = path.join(this.userDataPath, 'config');
      
      if (!(await fs.pathExists(configDir))) {
        return { 
          success: true, 
          configs: [] 
        };
      }
      
      const files = await fs.readdir(configDir);
      const configFiles = files.filter(file => file.endsWith('.json'));
      
      const configs = await Promise.all(
        configFiles.map(async (file) => {
          const configPath = path.join(configDir, file);
          const stats = await fs.stat(configPath);
          const configKey = path.basename(file, '.json');
          
          return {
            key: configKey,
            filename: file,
            path: configPath,
            size: stats.size,
            created: stats.birthtime.getTime(),
            modified: stats.mtime.getTime()
          };
        })
      );
      
      return { 
        success: true, 
        configs: configs.sort((a, b) => b.modified - a.modified)
      };
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * 备份配置文件
   */
  async backupConfig(configKey: string): Promise<any> {
    try {
      const configPath = path.join(this.userDataPath, 'config', `${configKey}.json`);
      
      if (!(await fs.pathExists(configPath))) {
        return { 
          success: false, 
          error: 'Configuration file not found' 
        };
      }
      
      const backupDir = path.join(this.userDataPath, 'config', 'backups');
      await fs.ensureDir(backupDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `${configKey}-${timestamp}.json`);
      
      await fs.copy(configPath, backupPath);
      
      return { 
        success: true, 
        backupPath,
        originalPath: configPath
      };
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * 恢复配置文件备份
   */
  async restoreConfigBackup(configKey: string, backupFilename: string): Promise<any> {
    try {
      const backupPath = path.join(this.userDataPath, 'config', 'backups', backupFilename);
      
      if (!(await fs.pathExists(backupPath))) {
        return { 
          success: false, 
          error: 'Backup file not found' 
        };
      }
      
      const configPath = path.join(this.userDataPath, 'config', `${configKey}.json`);
      
      // 备份当前配置
      if (await fs.pathExists(configPath)) {
        await this.backupConfig(configKey);
      }
      
      // 恢复备份
      await fs.copy(backupPath, configPath);
      
      return { 
        success: true, 
        configPath,
        backupPath
      };
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }
}