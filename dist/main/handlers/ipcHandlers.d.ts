import { BrowserWindow } from 'electron';
export declare class IpcHandlers {
    private fileSystemManager;
    private handlers;
    private mainWindow;
    constructor();
    setupHandlers(mainWindow: BrowserWindow | null): void;
    private registerHandler;
    private validateArgs;
    cleanup(): void;
    getHandlerCount(): number;
    hasHandler(channel: string): boolean;
    getChannels(): string[];
}
