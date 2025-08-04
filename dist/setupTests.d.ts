declare const mockElectronAPI: {
    fs: {
        readFile: jest.Mock<any, any, any>;
        writeFile: jest.Mock<any, any, any>;
        exists: jest.Mock<any, any, any>;
        createDirectory: jest.Mock<any, any, any>;
    };
    window: {
        minimize: jest.Mock<any, any, any>;
        maximize: jest.Mock<any, any, any>;
        close: jest.Mock<any, any, any>;
        onMaximized: jest.Mock<any, any, any>;
        onUnmaximized: jest.Mock<any, any, any>;
        onEnterFullScreen: jest.Mock<any, any, any>;
        onLeaveFullScreen: jest.Mock<any, any, any>;
    };
    app: {
        getVersion: jest.Mock<any, any, any>;
        getPlatform: jest.Mock<any, any, any>;
    };
    menu: {
        onNewProject: jest.Mock<any, any, any>;
        onOpenProject: jest.Mock<any, any, any>;
        onSaveProject: jest.Mock<any, any, any>;
        onExport: jest.Mock<any, any, any>;
        onUndo: jest.Mock<any, any, any>;
        onRedo: jest.Mock<any, any, any>;
        onZoomIn: jest.Mock<any, any, any>;
        onZoomOut: jest.Mock<any, any, any>;
        onFitToScreen: jest.Mock<any, any, any>;
    };
    removeAllListeners: jest.Mock<any, any, any>;
};
declare const originalWarn: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
