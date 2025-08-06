import { CanvasElement } from '../types/canvas';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropSettings {
  aspectRatio?: number; // 宽高比，如 16/9, 4/3 等
  maintainAspectRatio: boolean;
  minWidth: number;
  minHeight: number;
}

export class CropTool {
  private targetElement: CanvasElement | null = null;
  private cropArea: CropArea | null = null;
  private isActive = false;
  private settings: CropSettings = {
    maintainAspectRatio: false,
    minWidth: 10,
    minHeight: 10
  };

  constructor(initialSettings?: Partial<CropSettings>) {
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }
  }

  // 开始裁剪模式
  startCrop(element: CanvasElement): void {
    this.targetElement = element;
    this.isActive = true;
    
    // 初始化裁剪区域为整个元素
    this.cropArea = {
      x: 0,
      y: 0,
      width: element.width,
      height: element.height
    };
  }

  // 更新裁剪区域
  updateCropArea(area: Partial<CropArea>): void {
    if (!this.cropArea || !this.targetElement) return;

    let newArea = { ...this.cropArea, ...area };

    // 应用最小尺寸限制
    newArea.width = Math.max(this.settings.minWidth, newArea.width);
    newArea.height = Math.max(this.settings.minHeight, newArea.height);

    // 应用宽高比约束
    if (this.settings.maintainAspectRatio && typeof this.settings.aspectRatio === 'number') {
      const ratio = this.settings.aspectRatio;
      if (newArea.width / newArea.height !== ratio) {
        // 根据宽度调整高度
        newArea.height = newArea.width / ratio;
      }
    }

    // 确保裁剪区域在元素边界内
    newArea.x = Math.max(0, Math.min(newArea.x, this.targetElement.width - newArea.width));
    newArea.y = Math.max(0, Math.min(newArea.y, this.targetElement.height - newArea.height));
    newArea.width = Math.min(newArea.width, this.targetElement.width - newArea.x);
    newArea.height = Math.min(newArea.height, this.targetElement.height - newArea.y);

    this.cropArea = newArea;
  }

  // 设置预设宽高比
  setAspectRatio(ratio: number | null): void {
    if (ratio !== null) {
      this.settings.aspectRatio = ratio;
    } else {
      delete this.settings.aspectRatio;
    }
    this.settings.maintainAspectRatio = ratio !== null;

    // 如果有活动的裁剪区域，重新计算
    if (this.cropArea && ratio) {
      this.updateCropArea({
        height: this.cropArea.width / ratio
      });
    }
  }

  // 应用裁剪
  applyCrop(): CanvasElement | null {
    if (!this.targetElement || !this.cropArea) return null;

    // 创建裁剪后的新元素
    const croppedElement: CanvasElement = {
      ...this.targetElement,
      id: `${this.targetElement.id}_cropped_${Date.now()}`,
      name: `${this.targetElement.name} (Cropped)`,
      x: this.targetElement.x + this.cropArea.x,
      y: this.targetElement.y + this.cropArea.y,
      width: this.cropArea.width,
      height: this.cropArea.height,
      // 如果是图片元素，需要调整图片的显示区域
      ...(this.targetElement.type === 'image' && this.targetElement.imageData && {
        imageData: {
          src: this.targetElement.imageData.src || '',
          originalWidth: this.targetElement.imageData.originalWidth || 0,
          originalHeight: this.targetElement.imageData.originalHeight || 0,
          cropArea: this.cropArea
        }
      })
    };

    this.cancelCrop();
    return croppedElement;
  }

  // 取消裁剪
  cancelCrop(): void {
    this.targetElement = null;
    this.cropArea = null;
    this.isActive = false;
  }

  // 获取当前裁剪区域
  getCropArea(): CropArea | null {
    return this.cropArea ? { ...this.cropArea } : null;
  }

  // 获取目标元素
  getTargetElement(): CanvasElement | null {
    return this.targetElement;
  }

  // 更新设置
  updateSettings(newSettings: Partial<CropSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // 获取设置
  getSettings(): CropSettings {
    return { ...this.settings };
  }

  // 检查是否处于活动状态
  get active(): boolean {
    return this.isActive;
  }

  // 获取裁剪手柄位置
  getCropHandles(): Array<{ x: number; y: number; type: string }> {
    if (!this.cropArea || !this.targetElement) return [];

    const { x, y, width, height } = this.cropArea;
    const elementX = this.targetElement.x;
    const elementY = this.targetElement.y;

    return [
      // 角落手柄
      { x: elementX + x, y: elementY + y, type: 'nw' },
      { x: elementX + x + width, y: elementY + y, type: 'ne' },
      { x: elementX + x, y: elementY + y + height, type: 'sw' },
      { x: elementX + x + width, y: elementY + y + height, type: 'se' },
      // 边缘手柄
      { x: elementX + x + width / 2, y: elementY + y, type: 'n' },
      { x: elementX + x + width, y: elementY + y + height / 2, type: 'e' },
      { x: elementX + x + width / 2, y: elementY + y + height, type: 's' },
      { x: elementX + x, y: elementY + y + height / 2, type: 'w' }
    ];
  }

  // 常用宽高比预设
  static readonly ASPECT_RATIOS = {
    FREE: null,
    SQUARE: 1,
    LANDSCAPE_16_9: 16 / 9,
    LANDSCAPE_4_3: 4 / 3,
    LANDSCAPE_3_2: 3 / 2,
    PORTRAIT_9_16: 9 / 16,
    PORTRAIT_3_4: 3 / 4,
    PORTRAIT_2_3: 2 / 3
  };
}

export default CropTool;