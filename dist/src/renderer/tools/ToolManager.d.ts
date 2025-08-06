import BrushTool from './BrushTool';
import CropTool from './CropTool';
/**
 * 工具管理器 - 单例模式管理所有工具实例
 * 确保工具状态在整个应用中保持一致
 */
export declare class ToolManager {
    private static instance;
    private brushTool;
    private cropTool;
    private constructor();
    static getInstance(): ToolManager;
    getBrushTool(): BrushTool;
    getCropTool(): CropTool;
    resetAllTools(): void;
    switchTool(_newTool: string): void;
}
export default ToolManager;
//# sourceMappingURL=ToolManager.d.ts.map