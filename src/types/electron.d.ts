interface ElectronAPI {
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
    quit: () => void;
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

export { };