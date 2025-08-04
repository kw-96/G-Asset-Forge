export interface ElectronAPI {
    fs: {
        readFile: (filePath: string) => Promise<{
            success: boolean;
            data?: string;
            error?: string;
        }>;
        writeFile: (filePath: string, data: any) => Promise<{
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
        onMaximized: (callback: () => void) => void;
        onUnmaximized: (callback: () => void) => void;
        onEnterFullScreen: (callback: () => void) => void;
        onLeaveFullScreen: (callback: () => void) => void;
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
}
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
