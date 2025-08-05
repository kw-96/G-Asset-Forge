import { BrowserWindow } from 'electron';
export declare class WindowManager {
    private windows;
    createMainWindow(): BrowserWindow;
    getWindow(windowId: string): BrowserWindow | undefined;
    closeWindow(windowId: string): void;
    closeAllWindows(): void;
    focusWindow(windowId: string): void;
}
//# sourceMappingURL=WindowManager.d.ts.map