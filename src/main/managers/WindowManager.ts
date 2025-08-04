import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();

  createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    const mainWindow = new BrowserWindow({
      width: Math.min(1400, width * 0.9),
      height: Math.min(900, height * 0.9),
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      show: false, // Don't show until ready
      icon: process.platform === 'win32' 
        ? path.join(__dirname, '../../assets/icon.ico')
        : path.join(__dirname, '../../assets/icon.png')
    });

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      
      // Center the window
      mainWindow.center();
    });

    // Handle window state changes
    mainWindow.on('maximize', () => {
      mainWindow.webContents.send('window:maximized');
    });

    mainWindow.on('unmaximize', () => {
      mainWindow.webContents.send('window:unmaximized');
    });

    mainWindow.on('enter-full-screen', () => {
      mainWindow.webContents.send('window:enter-full-screen');
    });

    mainWindow.on('leave-full-screen', () => {
      mainWindow.webContents.send('window:leave-full-screen');
    });

    // Store window reference
    this.windows.set('main', mainWindow);

    return mainWindow;
  }

  getWindow(windowId: string): BrowserWindow | undefined {
    return this.windows.get(windowId);
  }

  closeWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      window.close();
      this.windows.delete(windowId);
    }
  }

  closeAllWindows(): void {
    this.windows.forEach((window, windowId) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.windows.clear();
  }

  focusWindow(windowId: string): void {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
    }
  }
}