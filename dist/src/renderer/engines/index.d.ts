export { SuikaEditor, SuikaCanvasEngine, ViewportManager, ZoomManager, SceneGraph, ToolManager, CommandManager, SuikaMemoryManager, SuikaCanvas, SuikaToolAdapter } from './suika';
export { GAME_ASSET_PRESETS } from './suika/suika-canvas-engine';
export * from './h5-editor';
export { CanvasEngine } from './CanvasEngine';
export { CanvasHealthChecker } from './CanvasHealthChecker';
export { CanvasInitializationChecker } from './CanvasInitializationChecker';
export { CanvasInitializer } from './CanvasInitializer';
export { CanvasSystemValidator } from './CanvasSystemValidator';
export { SimpleCanvasValidator } from './SimpleCanvasValidator';
export { MemoryManager } from './MemoryManager';
export { EventEmitter as SuikaEventEmitter } from './suika/utils/event-emitter';
export declare enum EngineType {
    SUIKA = "suika",
    H5_EDITOR = "h5-editor"
}
export interface IEngineConfig {
    type: EngineType;
    width: number;
    height: number;
    containerElement: HTMLDivElement;
    showPerfMonitor?: boolean;
    userPreference?: Record<string, any>;
    enableGrid?: boolean;
    enableRuler?: boolean;
    backgroundColor?: string;
}
export declare class EngineFactory {
    /**
     * 创建引擎实例
     */
    static createEngine(config: IEngineConfig): Promise<import("./suika").SuikaCanvasEngine | import("./h5-editor").H5EditorCanvasEngine>;
    /**
     * 获取可用的引擎类型
     */
    static getAvailableEngines(): EngineType[];
    /**
     * 检查引擎是否可用
     */
    static isEngineAvailable(type: EngineType): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map