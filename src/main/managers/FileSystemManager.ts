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
}