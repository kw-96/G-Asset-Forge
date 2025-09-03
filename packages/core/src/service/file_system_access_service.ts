/**
 * 文件系统访问服务 - 支持多环境文件系统访问
 * 支持 Chrome/Edge（File System Access API）、Firefox/Safari（下载模式）、Electron（原生文件系统）
 */

// 使用全局类型声明
export class FileSystemAccessService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  /**
   * 请求文件系统访问权限
   * @returns Promise<boolean> 是否成功获取权限
   */
  async requestSavePermission(): Promise<boolean> {
    // 检查浏览器支持
    if (this.isSupported()) {
      try {
        this.directoryHandle = await window.showDirectoryPicker!({
          mode: 'readwrite',
          startIn: 'documents',
        });
        return true;
      } catch (error) {
        console.warn('用户取消或浏览器不支持，降级到下载模式');
        return false;
      }
    }

    // 不支持的浏览器直接返回false，使用降级方案
    console.info('浏览器不支持File System Access API，使用下载模式');
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
   * 保存文件到已授权的目录
   * @param filename 文件名
   * @param blob 文件内容
   * @returns Promise<void>
   */
  private async saveToDirectory(filename: string, blob: Blob): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('未获取到目录访问权限');
    }

    const fileHandle = await this.directoryHandle.getFileHandle(filename, {
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

      console.log(`Electron 文件保存成功: ${result.filePath}`);
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

    console.log(`文件保存成功: ${result.filePath}`);
  }
}
