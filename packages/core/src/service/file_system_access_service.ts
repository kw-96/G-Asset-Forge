/**
 * 文件系统访问服务 - 支持多环境文件系统访问
 * 支持 Chrome/Edge（File System Access API）、Firefox/Safari（下载模式）、Electron（原生文件系统）
 */

// 使用全局类型声明
export class FileSystemAccessService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private readonly PERMISSION_STORAGE_KEY =
    'g-asset-forge-file-system-permission';

  /**
   * 请求文件系统访问权限
   * @returns Promise<boolean> 是否成功获取权限
   */
  async requestSavePermission(): Promise<boolean> {
    // 检查浏览器支持
    if (this.isSupported()) {
      try {
        // 使用 Downloads 作为默认目录，用户更熟悉
        this.directoryHandle = await window.showDirectoryPicker!({
          mode: 'readwrite',
          startIn: 'downloads', // 改为 downloads，用户更熟悉
        });

        // 保存权限信息到本地存储
        this.savePermissionInfo(this.directoryHandle);

        return true;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('用户取消了目录选择，将使用下载模式');
        } else {
          console.warn('获取文件系统权限失败，降级到下载模式:', error);
        }
        return false;
      }
    }

    // 不支持的浏览器直接返回false，使用降级方案
    return false;
  }

  /**
   * 保存文件到指定位置
   * @param filename 文件名
   * @param blob 文件内容
   * @returns Promise<void>
   */
  async saveFile(filename: string, blob: Blob): Promise<void> {
    if (this.isElectron()) {
      // 使用 Electron 的原生文件系统 API
      await this.saveFileElectron(filename, blob);
    } else if (this.directoryHandle) {
      // 使用File System Access API（Chrome/Edge）
      await this.saveToDirectory(filename, blob);
    } else {
      // 降级到传统下载方式（Firefox/Safari/其他）
      this.downloadFile(filename, blob);
    }
  }

  /**
   * 获取或创建 G-Asset Forge 子目录
   * @returns Promise<FileSystemDirectoryHandle> G-Asset Forge 目录句柄
   */
  private async getOrCreateGAssetForgeDirectory(): Promise<FileSystemDirectoryHandle> {
    if (!this.directoryHandle) {
      throw new Error('未获取到目录访问权限');
    }

    try {
      // 尝试获取 G-Asset Forge 子目录，如果不存在则创建
      const gafDirectory = await this.directoryHandle.getDirectoryHandle(
        'G-Asset Forge',
        {
          create: true,
        },
      );
      return gafDirectory;
    } catch (error) {
      console.warn('无法创建 G-Asset Forge 子目录，将使用主目录:', error);
      // 如果无法创建子目录，降级到使用主目录
      return this.directoryHandle;
    }
  }

  /**
   * 保存文件到已授权的目录
   * @param filename 文件名
   * @param blob 文件内容
   * @returns Promise<void>
   */
  private async saveToDirectory(filename: string, blob: Blob): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('未获取到目录访问权限');
    }

    // 获取或创建 G-Asset Forge 子目录
    const targetDirectory = await this.getOrCreateGAssetForgeDirectory();

    const fileHandle = await targetDirectory.getFileHandle(filename, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  /**
   * 通过 Electron 保存文件
   * @param filename 文件名
   * @param blob 文件内容
   * @returns Promise<void>
   */
  private async saveFileElectron(filename: string, blob: Blob): Promise<void> {
    // 通过 Electron 的 IPC 调用主进程保存文件
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 调用预加载脚本中定义的文件保存方法
    if (window.electronAPI && window.electronAPI.saveFile) {
      const result = await window.electronAPI.saveFile(filename, uint8Array);

      if (!result.success) {
        throw new Error(result.error || '文件保存失败');
      }
    } else {
      throw new Error('Electron API 不可用');
    }
  }

  /**
   * 使用传统下载方式保存文件
   * @param filename 文件名
   * @param blob 文件内容
   */
  private downloadFile(filename: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 检查浏览器是否支持 File System Access API
   * @returns boolean 是否支持
   */
  isSupported(): boolean {
    return (
      'showDirectoryPicker' in window &&
      window.showDirectoryPicker !== undefined
    );
  }

  /**
   * 检查是否在 Electron 环境中
   * @returns boolean 是否在 Electron 环境
   */
  isElectron(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.process !== 'undefined' &&
      window.process.type === 'renderer'
    );
  }

  /**
   * 获取当前导出方式
   * @returns 'electron' | 'directory' | 'download' 导出方式
   */
  getExportMethod(): 'electron' | 'directory' | 'download' {
    if (this.isElectron()) {
      return 'electron';
    } else if (this.isSupported() && this.directoryHandle) {
      return 'directory';
    } else {
      return 'download';
    }
  }

  /**
   * 获取浏览器信息
   * @returns string 浏览器信息
   */
  getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    const isElectron = this.isElectron();
    return isElectron ? `Electron-${userAgent}` : userAgent;
  }

  /**
   * 检查是否有目录访问权限
   * @returns boolean 是否有权限
   */
  hasDirectoryAccess(): boolean {
    return this.directoryHandle !== null;
  }

  /**
   * 清除目录访问权限
   */
  clearDirectoryAccess(): void {
    this.directoryHandle = null;
    this.clearPermissionInfo();
  }

  /**
   * 检查权限是否仍然有效
   * @returns Promise<boolean> 权限是否有效
   */
  async verifyPermission(): Promise<boolean> {
    // 简化权限验证：只检查是否有权限句柄
    // 页面刷新后权限句柄会丢失，这是浏览器的安全限制
    return this.directoryHandle !== null;
  }

  /**
   * 保存权限信息到本地存储
   * @param directoryHandle 目录句柄
   */
  private savePermissionInfo(directoryHandle: FileSystemDirectoryHandle): void {
    try {
      const permissionInfo = {
        directoryName: directoryHandle.name,
        timestamp: Date.now(),
        // 注意：不能直接序列化 FileSystemDirectoryHandle，只能保存元信息
        hasPermission: true,
      };

      localStorage.setItem(
        this.PERMISSION_STORAGE_KEY,
        JSON.stringify(permissionInfo),
      );
    } catch (error) {
      console.warn('保存权限信息失败:', error);
    }
  }

  /**
   * 从本地存储恢复权限信息
   * @returns Promise<boolean> 是否成功恢复权限
   */
  async restorePermission(): Promise<boolean> {
    try {
      const stored = localStorage.getItem(this.PERMISSION_STORAGE_KEY);
      if (!stored) {
        return false;
      }

      const permissionInfo = JSON.parse(stored);

      // 检查权限信息是否过期（24小时）
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24小时
      if (now - permissionInfo.timestamp > maxAge) {
        this.clearPermissionInfo();
        return false;
      }

      // 尝试恢复权限
      if (permissionInfo.hasPermission && this.isSupported()) {
        // 注意：File System Access API 不允许直接恢复权限句柄
        // 需要用户重新选择目录，但我们可以提供更好的用户体验
        return false; // 需要用户重新授权
      }

      return false;
    } catch (error) {
      console.warn('恢复权限信息失败:', error);
      this.clearPermissionInfo();
      return false;
    }
  }

  /**
   * 清除本地存储的权限信息
   */
  private clearPermissionInfo(): void {
    try {
      localStorage.removeItem(this.PERMISSION_STORAGE_KEY);
    } catch (error) {
      console.warn('清除权限信息失败:', error);
    }
  }

  /**
   * 获取权限恢复提示信息
   * @returns string 提示信息
   */
  getPermissionRestoreHint(): string | null {
    try {
      const stored = localStorage.getItem(this.PERMISSION_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const permissionInfo = JSON.parse(stored);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24小时

      if (now - permissionInfo.timestamp <= maxAge) {
        return `检测到之前已授权访问 "${permissionInfo.directoryName}" 目录，请重新选择相同目录以恢复权限`;
      }

      return null;
    } catch (error) {
      console.warn('获取权限恢复提示失败:', error);
      return null;
    }
  }

  /**
   * 获取支持的功能列表
   * @returns object 支持的功能
   */
  getSupportedFeatures(): {
    fileSystemAccess: boolean;
    electron: boolean;
    download: boolean;
  } {
    return {
      fileSystemAccess: this.isSupported(),
      electron: this.isElectron(),
      download: true, // 所有浏览器都支持下载
    };
  }

  /**
   * 获取默认保存目录（仅 Electron 环境）
   * @returns Promise<string | null> 默认目录路径
   */
  async getDefaultDirectory(): Promise<string | null> {
    if (
      this.isElectron() &&
      window.electronAPI &&
      window.electronAPI.getDefaultDirectory
    ) {
      try {
        const result = await window.electronAPI.getDefaultDirectory();
        if (result.success) {
          return result.directory || null;
        }
      } catch (error) {
        console.warn('获取默认目录失败:', error);
      }
    }
    return null;
  }

  /**
   * 使用保存对话框保存文件（仅 Electron 环境）
   * @param filename 文件名
   * @param blob 文件内容
   * @returns Promise<void>
   */
  async saveFileWithDialog(filename: string, blob: Blob): Promise<void> {
    if (
      !this.isElectron() ||
      !window.electronAPI ||
      !window.electronAPI.saveFileDialog
    ) {
      throw new Error('保存对话框仅在 Electron 环境中可用');
    }

    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const result = await window.electronAPI.saveFileDialog(
      filename,
      uint8Array,
    );

    if (!result.success) {
      throw new Error(result.error || '文件保存失败');
    }
  }

  /**
   * 读取文件内容
   * @param filename 文件名
   * @returns Promise<string | null> 文件内容，失败时返回 null
   */
  async readFile(filename: string): Promise<string | null> {
    try {
      if (this.isElectron()) {
        // 使用 Electron 的原生文件系统 API
        return await this.readFileElectron(filename);
      } else if (this.directoryHandle) {
        // 使用File System Access API（Chrome/Edge）
        return await this.readFromDirectory(filename);
      } else {
        // 传统下载模式不支持读取文件
        console.warn('传统下载模式不支持读取文件');
        return null;
      }
    } catch (error) {
      console.error('读取文件失败:', error);
      return null;
    }
  }

  /**
   * 删除文件
   * @param filename 文件名
   * @returns Promise<boolean> 删除是否成功
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      if (this.isElectron()) {
        // 使用 Electron 的原生文件系统 API
        return await this.deleteFileElectron(filename);
      } else if (this.directoryHandle) {
        // 使用File System Access API（Chrome/Edge）
        await this.deleteFromDirectory(filename);
        return true;
      } else {
        // 传统下载模式不支持删除文件
        console.warn('传统下载模式不支持删除文件');
        return false;
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  /**
   * 通过 Electron 读取文件
   * @param filename 文件名
   * @returns Promise<string | null> 文件内容
   */
  private async readFileElectron(filename: string): Promise<string | null> {
    if (window.electronAPI && window.electronAPI.readFile) {
      const result = await window.electronAPI.readFile(filename);
      if (result.success) {
        return result.content || null;
      } else {
        console.error('Electron 读取文件失败:', result.error);
        return null;
      }
    } else {
      throw new Error('Electron API 不可用');
    }
  }

  /**
   * 从已授权的目录读取文件
   * @param filename 文件名
   * @returns Promise<string | null> 文件内容
   */
  private async readFromDirectory(filename: string): Promise<string | null> {
    if (!this.directoryHandle) {
      throw new Error('未获取到目录访问权限');
    }

    try {
      // 获取或创建 G-Asset Forge 子目录
      const targetDirectory = await this.getOrCreateGAssetForgeDirectory();

      const fileHandle = await targetDirectory.getFileHandle(filename);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      // 如果是文件不存在的错误，静默处理；其他错误记录日志
      if (!(error instanceof Error && error.name === 'NotFoundError')) {
        console.error('从目录读取文件失败:', error);
      }
      return null;
    }
  }

  /**
   * 通过 Electron 删除文件
   * @param filename 文件名
   * @returns Promise<boolean> 删除是否成功
   */
  private async deleteFileElectron(filename: string): Promise<boolean> {
    if (window.electronAPI && window.electronAPI.deleteFile) {
      const result = await window.electronAPI.deleteFile(filename);
      return result.success;
    } else {
      throw new Error('Electron API 不可用');
    }
  }

  /**
   * 从已授权的目录删除文件
   * @param filename 文件名
   * @returns Promise<void>
   */
  private async deleteFromDirectory(filename: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('未获取到目录访问权限');
    }

    try {
      // 获取或创建 G-Asset Forge 子目录
      const targetDirectory = await this.getOrCreateGAssetForgeDirectory();

      await targetDirectory.removeEntry(filename);
    } catch (error) {
      console.error('从目录删除文件失败:', error);
      throw error;
    }
  }
}
