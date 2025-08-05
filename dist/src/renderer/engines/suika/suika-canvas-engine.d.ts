import { SuikaEditor } from './core/editor';
import { SuikaToolAdapter } from './adapter/tool-adapter';
import type { ICanvasEngine } from '../../core/canvas/canvas-manager';
import type { ICanvasConfig, ICanvasState, ICanvasObject, ICanvasLayer, ICanvasSize } from '../../core/canvas/canvas-types';
import { CanvasEngineType } from '../../core/canvas/canvas-manager';
import type { ITool, ToolType, IToolConfig, IToolProperties } from '../../core/tools/tool-types';
export declare const GAME_ASSET_PRESETS: {
    MOBILE_PORTRAIT: {
        width: number;
        height: number;
        name: string;
    };
    MOBILE_LANDSCAPE: {
        width: number;
        height: number;
        name: string;
    };
    IPHONE_X: {
        width: number;
        height: number;
        name: string;
    };
    IPHONE_14: {
        width: number;
        height: number;
        name: string;
    };
    IPAD: {
        width: number;
        height: number;
        name: string;
    };
    IPAD_PRO: {
        width: number;
        height: number;
        name: string;
    };
    ICON_SMALL: {
        width: number;
        height: number;
        name: string;
    };
    ICON_MEDIUM: {
        width: number;
        height: number;
        name: string;
    };
    ICON_LARGE: {
        width: number;
        height: number;
        name: string;
    };
    HD: {
        width: number;
        height: number;
        name: string;
    };
    FULL_HD: {
        width: number;
        height: number;
        name: string;
    };
    QUAD_HD: {
        width: number;
        height: number;
        name: string;
    };
    SQUARE_512: {
        width: number;
        height: number;
        name: string;
    };
    SQUARE_1024: {
        width: number;
        height: number;
        name: string;
    };
    ASPECT_16_9: {
        width: number;
        height: number;
        name: string;
    };
    ASPECT_4_3: {
        width: number;
        height: number;
        name: string;
    };
    ASPECT_3_2: {
        width: number;
        height: number;
        name: string;
    };
};
export interface ISuikaCanvasEngineOptions {
    showPerfMonitor?: boolean;
    userPreference?: Record<string, any>;
    enableGrid?: boolean;
    enableRuler?: boolean;
    backgroundColor?: string;
}
export declare class SuikaCanvasEngine implements ICanvasEngine {
    readonly type = CanvasEngineType.SUIKA;
    private editor;
    private container;
    private options;
    private eventEmitter;
    private isInitialized;
    private layers;
    private activeLayerId;
    private toolAdapter;
    constructor(options?: ISuikaCanvasEngineOptions);
    initialize(container: HTMLElement, config: ICanvasConfig): Promise<void>;
    destroy(): void;
    getState(): ICanvasState;
    setState(state: Partial<ICanvasState>): void;
    addObject(object: ICanvasObject): void;
    removeObject(id: string): void;
    updateObject(id: string, updates: Partial<ICanvasObject>): void;
    selectObjects(ids: string[]): void;
    clearSelection(): void;
    zoom(level: number): void;
    pan(x: number, y: number): void;
    render(): void;
    exportImage(format: 'png' | 'jpg', quality?: number): string;
    getPerformanceInfo(): {
        fps: number;
        frameCount: number;
    };
    getCanvasSize(): ICanvasSize;
    setCanvasSize(size: ICanvasSize): void;
    createLayer(id: string, name: string): ICanvasLayer;
    getLayer(id: string): ICanvasLayer | undefined;
    getLayers(): ICanvasLayer[];
    setActiveLayer(id: string): void;
    getActiveLayer(): ICanvasLayer | undefined;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    private setupEventListeners;
    private createDefaultLayer;
    private convertToSuikaObject;
    getSuikaEditor(): SuikaEditor | null;
    static getPresetSizes(): {
        MOBILE_PORTRAIT: {
            width: number;
            height: number;
            name: string;
        };
        MOBILE_LANDSCAPE: {
            width: number;
            height: number;
            name: string;
        };
        IPHONE_X: {
            width: number;
            height: number;
            name: string;
        };
        IPHONE_14: {
            width: number;
            height: number;
            name: string;
        };
        IPAD: {
            width: number;
            height: number;
            name: string;
        };
        IPAD_PRO: {
            width: number;
            height: number;
            name: string;
        };
        ICON_SMALL: {
            width: number;
            height: number;
            name: string;
        };
        ICON_MEDIUM: {
            width: number;
            height: number;
            name: string;
        };
        ICON_LARGE: {
            width: number;
            height: number;
            name: string;
        };
        HD: {
            width: number;
            height: number;
            name: string;
        };
        FULL_HD: {
            width: number;
            height: number;
            name: string;
        };
        QUAD_HD: {
            width: number;
            height: number;
            name: string;
        };
        SQUARE_512: {
            width: number;
            height: number;
            name: string;
        };
        SQUARE_1024: {
            width: number;
            height: number;
            name: string;
        };
        ASPECT_16_9: {
            width: number;
            height: number;
            name: string;
        };
        ASPECT_4_3: {
            width: number;
            height: number;
            name: string;
        };
        ASPECT_3_2: {
            width: number;
            height: number;
            name: string;
        };
    };
    getToolAdapter(): SuikaToolAdapter | null;
    activateTool(type: ToolType): boolean;
    getActiveTool(): ITool | null;
    getActiveToolType(): ToolType | null;
    getAllToolConfigs(): IToolConfig[];
    getToolConfig(type: ToolType): IToolConfig | undefined;
    setToolProperties(properties: Partial<IToolProperties>): void;
    getToolProperties(): IToolProperties;
    handleMouseDown(event: MouseEvent): void;
    handleMouseMove(event: MouseEvent): void;
    handleMouseUp(event: MouseEvent): void;
    handleKeyDown(event: KeyboardEvent): void;
    handleKeyUp(event: KeyboardEvent): void;
}
//# sourceMappingURL=suika-canvas-engine.d.ts.map