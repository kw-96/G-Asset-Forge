import { TypedEventEmitter } from '../../utils/TypedEventEmitter';
import type { ITool, ToolType, IToolConfig, IToolProperties } from './tool-types';
import type { SuikaToolAdapter } from '../../engines/suika/adapter/tool-adapter';
export interface IToolManagerEvents extends Record<string, (...args: any[]) => void> {
    toolChanged(tool: ITool): void;
    propertiesChanged(properties: IToolProperties): void;
}
export declare class ToolManager extends TypedEventEmitter<IToolManagerEvents> {
    private tools;
    private activeTool;
    private properties;
    private suikaToolAdapter;
    constructor();
    /**
     * 设置Suika工具适配器
     */
    setSuikaToolAdapter(adapter: SuikaToolAdapter): void;
    registerTool(tool: ITool): void;
    unregisterTool(type: ToolType): void;
    activateTool(type: ToolType): boolean;
    deactivateTool(): void;
    getActiveTool(): ITool | null;
    getActiveToolType(): ToolType | null;
    getAllTools(): ITool[];
    getToolConfigs(): IToolConfig[];
    setProperties(properties: Partial<IToolProperties>): void;
    getProperties(): IToolProperties;
    getProperty<T = any>(key: string): T | undefined;
    setProperty(key: string, value: unknown): void;
    handleMouseDown(event: MouseEvent): void;
    handleMouseMove(event: MouseEvent): void;
    handleMouseUp(event: MouseEvent): void;
    handleKeyDown(event: KeyboardEvent): void;
    handleKeyUp(event: KeyboardEvent): void;
    render(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=tool-manager.d.ts.map