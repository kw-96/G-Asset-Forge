import BrushTool from './BrushTool';
import CropTool from './CropTool';
import { getToolDefaults } from './toolConfig';
/**
 * 工具管理器 - 单例模式管理所有工具实例
 * 确保工具状态在整个应用中保持一致
 */
export class ToolManager {
    constructor() {
        this.brushTool = new BrushTool(getToolDefaults('brush'));
        this.cropTool = new CropTool(getToolDefaults('crop'));
    }
    static getInstance() {
        if (!ToolManager.instance) {
            ToolManager.instance = new ToolManager();
        }
        return ToolManager.instance;
    }
    getBrushTool() {
        return this.brushTool;
    }
    getCropTool() {
        return this.cropTool;
    }
    // 重置所有工具状态
    resetAllTools() {
        this.brushTool.cancelDrawing();
        this.cropTool.cancelCrop();
    }
    // 切换工具时的清理
    switchTool(_newTool) {
        // 取消当前活动的工具操作
        if (this.brushTool.drawing) {
            this.brushTool.cancelDrawing();
        }
        if (this.cropTool.active) {
            this.cropTool.cancelCrop();
        }
    }
}
export default ToolManager;
//# sourceMappingURL=ToolManager.js.map