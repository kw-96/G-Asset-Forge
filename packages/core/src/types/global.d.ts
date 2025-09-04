/**
 * 全局类型声明
 */

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
      startIn?:
        | 'desktop'
        | 'documents'
        | 'downloads'
        | 'music'
        | 'pictures'
        | 'videos';
    }) => Promise<FileSystemDirectoryHandle>;

    electronAPI?: {
      windowControl?: {
        minimize: () => void;
        maximize: () => void;
        restore: () => void;
        close: () => void;
        isMaximized: () => Promise<any>;
        onMaximizeChange: (
          callback: (value: boolean) => void,
        ) => (() => void) | void;
        resize: (
          width: number,
          height: number,
          resizable?: boolean,
        ) => Promise<any>;
      };
      saveFile?: (
        filename: string,
        data: Uint8Array,
        directory?: string,
      ) => Promise<{
        success: boolean;
        filePath?: string;
        directory?: string;
        error?: string;
      }>;
      saveFileDialog?: (
        filename: string,
        data: Uint8Array,
      ) => Promise<{
        success: boolean;
        filePath?: string;
        error?: string;
      }>;
      getDefaultDirectory?: () => Promise<{
        success: boolean;
        directory?: string;
        error?: string;
      }>;
      readFile?: (filename: string) => Promise<{
        success: boolean;
        content?: string;
        error?: string;
      }>;
      deleteFile?: (filename: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
    };

    process?: {
      type: 'renderer' | 'main';
    };
  }

  interface FileSystemDirectoryHandle {
    getFileHandle(
      name: string,
      options?: { create?: boolean },
    ): Promise<FileSystemFileHandle>;
  }

  interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemWritableFileStream {
    write(data: any): Promise<void>;
    close(): Promise<void>;
  }
}

export {};
