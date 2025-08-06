import BrushTool from './BrushTool';
import CropTool from './CropTool';
import { getToolDefaults } from './toolConfig';

/**
 * 工具管理器 - 单例模式管理所有工具实例
 * 确保工具状态在整个应用中保持一致
 */
export class ToolManager {
  private static instance: ToolManager;
  
  private brushTool: BrushTool;
  private cropTool: CropTool;

  private constructor() {
    this.brushTool = new BrushTool(getToolDefaults('brush') as any);
    this.cropTool = new CropTool(getToolDefaults('crop') as any);
  }

  public static getInstance(): ToolManager {
    if (!ToolManager.instance) {
      ToolManager.instance = new ToolManager();
    }
    return ToolManager.instance;
  }

  public getBrushTool(): BrushTool {
    return this.brushTool;
  }

  public getCropTool(): CropTool {
    return this.cropTool;
  }

  // 重置所有工具状态
  public resetAllTools(): void {
    this.brushTool.cancelDrawing();
    this.cropTool.cancelCrop();
  }

  // 切换工具时的清理
  public switchTool(_newTool: string): void {
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