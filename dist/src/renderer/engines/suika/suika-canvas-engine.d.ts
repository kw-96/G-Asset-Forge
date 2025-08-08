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
    /**
     * 设置缩放级别 - 支持10%-500%缩放范围和60fps性能优化
     */
    zoom(level: number, centerPoint?: {
        x: number;
        y: number;
    }): void;
    /**
     * 平移画布 - 支持无限制平移功能，支持平滑的增量移动
     */
    pan(deltaX: number, deltaY: number, smooth?: boolean): void;
    /**
     * 适应内容功能 - 自动调整到所有对象的最佳查看尺寸
     */
    fitToContent(padding?: number): void;
    /**
     * 适应屏幕功能
     */
    fitToScreen(): void;
    /**
     * 重置视图到默认状态
     */
    resetView(): void;
    /**
     * 获取当前视口信息
     */
    getViewportInfo(): {
        x: number;
        y: number;
        zoom: number;
        width: number;
        height: number;
    };
    /**
     * 设置视口信息
     */
    setViewportInfo(viewportInfo: {
        x?: number;
        y?: number;
        zoom?: number;
    }): void;
    /**
     * 智能网格系统
     */
    enableGrid(enabled: boolean, gridSize?: number): void;
    /**
     * 参考线对齐功能
     */
    addGuide(type: 'horizontal' | 'vertical', position: number): string;
    /**
     * 移除参考线
     */
    removeGuide(guideId: string): void;
    /**
     * 视口边界检测
     */
    isPointInViewport(worldX: number, worldY: number): boolean;
    /**
     * 内容定位功能
     */
    getVisibleObjects(): any[];
    /**
     * 检查矩形是否与视口相交
     */
    private isRectIntersectingViewport;
    /**
     * 坐标转换：屏幕坐标到世界坐标
     */
    screenToWorld(screenX: number, screenY: number): {
        x: number;
        y: number;
    };
    /**
     * 坐标转换：世界坐标到屏幕坐标
     */
    worldToScreen(worldX: number, worldY: number): {
        x: number;
        y: number;
    };
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