export interface ElectronAPI {
    fs: {
        readFile: (filePath: string) => Promise<{
            success: boolean;
            data?: string;
            error?: string;
        }>;
        writeFile: (filePath: string, data: unknown) => Promise<{
            success: boolean;
            path?: string;
            error?: string;
        }>;
        exists: (filePath: string) => Promise<boolean>;
        createDirectory: (dirPath: string) => Promise<{
            success: boolean;
            path?: string;
            error?: string;
        }>;
    };
    window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        isMaximized: () => Promise<{
            success: boolean;
            data?: boolean;
            error?: string;
        }>;
        getSize: () => Promise<{
            success: boolean;
            data?: {
                width: number;
                height: number;
            };
            error?: string;
        }>;
        setSize: (width: number, height: number, animate?: boolean) => Promise<{
            success: boolean;
            error?: string;
        }>;
        setResizable: (resizable: boolean) => Promise<{
            success: boolean;
            error?: string;
        }>;
        center: () => Promise<{
            success: boolean;
            error?: string;
        }>;
        onMaximized: (callback: () => void) => void;
        onUnmaximized: (callback: () => void) => void;
        onEnterFullScreen: (callback: () => void) => void;
        onLeaveFullScreen: (callback: () => void) => void;
    };
    windowControl: {
        minimize: () => Promise<{
            success: boolean;
            data?: any;
            error?: string;
        }>;
        maximize: () => Promise<{
            success: boolean;
            data?: any;
            error?: string;
        }>;
        restore: () => Promise<{
            success: boolean;
            data?: any;
            error?: string;
        }>;
        close: () => Promise<{
            success: boolean;
            data?: any;
            error?: string;
        }>;
        isMaximized: () => Promise<{
            success: boolean;
            data?: boolean;
            error?: string;
        }>;
        onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
        removeMaximizeChangeListener: (callback: (isMaximized: boolean) => void) => void;
    };
    app: {
        getVersion: () => Promise<string>;
        getPlatform: () => Promise<string>;
    };
    menu: {
        onNewProject: (callback: () => void) => void;
        onOpenProject: (callback: () => void) => void;
        onSaveProject: (callback: () => void) => void;
        onExport: (callback: () => void) => void;
        onUndo: (callback: () => void) => void;
        onRedo: (callback: () => void) => void;
        onZoomIn: (callback: () => void) => void;
        onZoomOut: (callback: () => void) => void;
        onFitToScreen: (callback: () => void) => void;
    };
    removeAllListeners: (channel: string) => void;
    healthCheck: () => Promise<{
        success: boolean;
        timestamp?: number;
        message?: string;
    }>;
}
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
//# sourceMappingURL=preload.d.ts.map