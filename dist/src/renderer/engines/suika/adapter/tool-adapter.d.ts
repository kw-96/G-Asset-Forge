import { ITool, ToolType, IToolConfig, IToolProperties } from '../../../core/tools/tool-types';
import { SuikaEditor } from '../core/editor';
/**
 * Suika工具适配器
 * 将Suika的工具系统适配到我们的工具接口
 */
export declare class SuikaToolAdapter {
    private activeTool;
    private toolProperties;
    constructor(_editor: SuikaEditor);
    /**
     * 设置可用的工具
     */
    /**
     * 激活工具
     */
    activateTool(type: ToolType): boolean;
    /**
     * 停用当前工具
     */
    deactivateTool(): void;
    /**
     * 获取当前活动工具
     */
    getActiveTool(): ITool | null;
    /**
     * 获取当前活动工具类型
     */
    getActiveToolType(): ToolType | null;
    /**
     * 获取所有可用工具配置
     */
    getAllToolConfigs(): IToolConfig[];
    /**
     * 获取工具配置
     */
    getToolConfig(type: ToolType): IToolConfig | undefined;
    /**
     * 设置工具属性
     */
    setToolProperties(properties: Partial<IToolProperties>): void;
    /**
     * 获取工具属性
     */
    getToolProperties(): IToolProperties;
    /**
     * 处理鼠标事件
     */
    handleMouseDown(_event: MouseEvent): void;
    handleMouseMove(_event: MouseEvent): void;
    handleMouseUp(_event: MouseEvent): void;
    /**
     * 处理键盘事件
     */
    handleKeyDown(event: KeyboardEvent): void;
    handleKeyUp(_event: KeyboardEvent): void;
    /**
     * 渲染工具
     */
    render(_ctx: CanvasRenderingContext2D): void;
    /**
     * 创建工具包装器
     */
    private createToolWrapper;
    /**
     * 将DOM事件转换为PointerEvent
     * TODO: 当实现事件处理逻辑时会用到此方法
     */
    /**
     * 处理快捷键
     */
    private handleShortcut;
    /**
     * 将属性同步到Suika编辑器
     */
    private syncPropertiesToSuika;
    /**
     * 销毁适配器
     */
    destroy(): void;
}
//# sourceMappingURL=tool-adapter.d.ts.map