/**
 * 裁剪工具 - 提供图像和元素裁剪功能
 * @description 支持自由裁剪、固定比例裁剪、智能裁剪等功能
 * @author 开发团队
 */

import { type CanvasElement } from '../../../../interfaces/types/canvas';
import { UnifiedPerformanceMonitor } from '../../utils/performance/UnifiedPerformanceMonitor';

/**
 * 裁剪区域接口
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 裁剪设置接口
 */
export interface CropSettings {
  aspectRatio?: number;
  maintainAspectRatio: boolean;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  snapToGrid: boolean;
  gridSize: number;
  showGuides: boolean;
  previewMode: boolean;
}

/**
 * 裁剪手柄类型
 */
export type CropHandleType = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w' | 'move';

/**
 * 裁剪手柄接口
 */
export interface CropHandle {
  x: number;
  y: number;
  type: CropHandleType;
  cursor: string;
}

/**
 * 裁剪历史记录接口
 */
export interface CropHistory {
  id: string;
  elementId: string;
  originalArea: CropArea;
  cropArea: CropArea;
  timestamp: number;
}

/**
 * 裁剪工具类
 * @description 提供完整的裁剪功能，支持多种裁剪模式和约束
 */
export class CropTool {
  private targetElement: CanvasElement | null = null;
  private cropArea: CropArea | null = null;
  private isActive = false;
  private isDragging = false;
  private dragHandle: CropHandleType | null = null;
  private dragStartPoint: { x: number; y: number } | null = null;
  private originalCropArea: CropArea | null = null;
  private history: CropHistory[] = [];
  private maxHistorySize = 20;

  private settings: CropSettings = {
    maintainAspectRatio: false,
    minWidth: 10,
    minHeight: 10,
    snapToGrid: false,
    gridSize: 10,
    showGuides: true,
    previewMode: false,
  };

  constructor(initialSettings?: Partial<CropSettings>) {
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }
  }

  /**
   * 开始裁剪模式
   */
  startCrop(element: CanvasElement): void {
    const startTime = performance.now();
    UnifiedPerformanceMonitor.markStart('crop-start', startTime);

    this.targetElement = element;
    this.isActive = true;

    // 初始化裁剪区域为整个元素
    this.cropArea = {
      x: 0,
      y: 0,
      width: element.transform.width,
      height: element.transform.height,
    };

    this.originalCropArea = { ...this.cropArea };

    console.info('[crop-tool] 开始裁剪', {
      elementId: element.id,
      elementSize: { width: element.transform.width, height: element.transform.height },
    });

    UnifiedPerformanceMonitor.markEnd('crop-start', startTime);
  }

  /**
   * 开始拖拽操作
   */
  startDrag(x: number, y: number, handleType: CropHandleType): void {
    if (!this.isActive || !this.cropArea || !this.targetElement) return;

    this.isDragging = true;
    this.dragHandle = handleType;
    this.dragStartPoint = { x, y };
    this.originalCropArea = { ...this.cropArea };

    console.debug('[crop-tool] 开始拖拽', { handleType, startPoint: { x, y } });
  }

  /**
   * 继续拖拽操作
   */
  continueDrag(x: number, y: number): void {
    if (!this.isDragging || !this.dragStartPoint || !this.originalCropArea || !this.targetElement) {
      return;
    }

    const startTime = performance.now();

    const deltaX = x - this.dragStartPoint.x;
    const deltaY = y - this.dragStartPoint.y;

    let newArea = { ...this.originalCropArea };

    // 根据拖拽手柄类型更新裁剪区域
    switch (this.dragHandle) {
      case 'move':
        newArea.x = this.originalCropArea.x + deltaX;
        newArea.y = this.originalCropArea.y + deltaY;
        break;
      case 'nw':
        newArea.x = this.originalCropArea.x + deltaX;
        newArea.y = this.originalCropArea.y + deltaY;
        newArea.width = this.originalCropArea.width - deltaX;
        newArea.height = this.originalCropArea.height - deltaY;
        break;
      case 'ne':
        newArea.y = this.originalCropArea.y + deltaY;
        newArea.width = this.originalCropArea.width + deltaX;
        newArea.height = this.originalCropArea.height - deltaY;
        break;
      case 'sw':
        newArea.x = this.originalCropArea.x + deltaX;
        newArea.width = this.originalCropArea.width - deltaX;
        newArea.height = this.originalCropArea.height + deltaY;
        break;
      case 'se':
        newArea.width = this.originalCropArea.width + deltaX;
        newArea.height = this.originalCropArea.height + deltaY;
        break;
      case 'n':
        newArea.y = this.originalCropArea.y + deltaY;
        newArea.height = this.originalCropArea.height - deltaY;
        break;
      case 'e':
        newArea.width = this.originalCropArea.width + deltaX;
        break;
      case 's':
        newArea.height = this.originalCropArea.height + deltaY;
        break;
      case 'w':
        newArea.x = this.originalCropArea.x + deltaX;
        newArea.width = this.originalCropArea.width - deltaX;
        break;
    }

    // 应用约束和验证
    this.updateCropArea(newArea);

    UnifiedPerformanceMonitor.recordMetric('crop-drag-update', performance.now() - startTime);
  }

  /**
   * 结束拖拽操作
   */
  endDrag(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.dragHandle = null;
    this.dragStartPoint = null;
    this.originalCropArea = null;

    console.debug('[crop-tool] 结束拖拽');
  }

  /**
   * 更新裁剪区域
   */
  updateCropArea(area: Partial<CropArea>): void {
    if (!this.cropArea || !this.targetElement) return;

    const startTime = performance.now();

    let newArea = { ...this.cropArea, ...area };

    // 应用最小尺寸限制
    newArea.width = Math.max(this.settings.minWidth, newArea.width);
    newArea.height = Math.max(this.settings.minHeight, newArea.height);

    // 应用最大尺寸限制
    if (this.settings.maxWidth) {
      newArea.width = Math.min(this.settings.maxWidth, newArea.width);
    }
    if (this.settings.maxHeight) {
      newArea.height = Math.min(this.settings.maxHeight, newArea.height);
    }

    // 应用宽高比约束
    if (this.settings.maintainAspectRatio && typeof this.settings.aspectRatio === 'number') {
      const ratio = this.settings.aspectRatio;
      if (Math.abs(newArea.width / newArea.height - ratio) > 0.01) {
        // 根据拖拽方向决定调整哪个维度
        if (this.dragHandle && ['e', 'w', 'ne', 'nw', 'se', 'sw'].includes(this.dragHandle)) {
          newArea.height = newArea.width / ratio;
        } else {
          newArea.width = newArea.height * ratio;
        }
      }
    }

    // 应用网格对齐
    if (this.settings.snapToGrid) {
      const grid = this.settings.gridSize;
      newArea.x = Math.round(newArea.x / grid) * grid;
      newArea.y = Math.round(newArea.y / grid) * grid;
      newArea.width = Math.round(newArea.width / grid) * grid;
      newArea.height = Math.round(newArea.height / grid) * grid;
    }

    // 确保裁剪区域在元素边界内
    newArea.x = Math.max(0, Math.min(newArea.x, this.targetElement.transform.width - newArea.width));
    newArea.y = Math.max(0, Math.min(newArea.y, this.targetElement.transform.height - newArea.y));
    newArea.width = Math.min(newArea.width, this.targetElement.transform.width - newArea.x);
    newArea.height = Math.min(newArea.height, this.targetElement.transform.height - newArea.y);

    this.cropArea = newArea;

    UnifiedPerformanceMonitor.recordMetric('crop-area-update', performance.now() - startTime);
  }

  /**
   * 设置预设宽高比
   */
  setAspectRatio(ratio: number | null): void {
    if (ratio !== null) {
      this.settings.aspectRatio = ratio;
      this.settings.maintainAspectRatio = true;
    } else {
      delete this.settings.aspectRatio;
      this.settings.maintainAspectRatio = false;
    }

    // 如果有活动的裁剪区域，重新计算
    if (this.cropArea && ratio) {
      this.updateCropArea({
        height: this.cropArea.width / ratio,
      });
    }

    console.debug('[crop-tool] 设置宽高比', { ratio, maintainAspectRatio: this.settings.maintainAspectRatio });
  }

  /**
   * 应用裁剪
   */
  applyCrop(): CanvasElement | null {
    if (!this.targetElement || !this.cropArea) return null;

    const startTime = performance.now();
    UnifiedPerformanceMonitor.markStart('crop-apply', startTime);

    // 添加到历史记录
    this.addToHistory();

    // 创建裁剪后的新元素
    const croppedElement: CanvasElement = {
      ...this.targetElement,
      id: `${this.targetElement.id}_cropped_${Date.now()}`,
      name: `${this.targetElement.name} (已裁剪)`,
      transform: {
        x: this.targetElement.transform.x + this.cropArea.x,
        y: this.targetElement.transform.y + this.cropArea.y,
        width: this.cropArea.width,
        height: this.cropArea.height,
      },
      // 如果是图片元素，需要调整图片的显示区域
      ...(this.targetElement.type === 'image' && this.targetElement.imageData && {
        imageData: {
          ...this.targetElement.imageData,
          cropArea: this.cropArea,
        },
      }),
    };

    console.info('[crop-tool] 应用裁剪', {
      originalId: this.targetElement.id,
      croppedId: croppedElement.id,
      cropArea: this.cropArea,
    });

    this.cancelCrop();
    UnifiedPerformanceMonitor.markEnd('crop-apply', startTime);
    return croppedElement;
  }

  /**
   * 取消裁剪
   */
  cancelCrop(): void {
    if (this.targetElement) {
      console.info('[crop-tool] 取消裁剪', { elementId: this.targetElement.id });
    }

    this.targetElement = null;
    this.cropArea = null;
    this.isActive = false;
    this.isDragging = false;
    this.dragHandle = null;
    this.dragStartPoint = null;
    this.originalCropArea = null;
  }

  /**
   * 重置裁剪区域
   */
  resetCropArea(): void {
    if (!this.targetElement) return;

    this.cropArea = {
      x: 0,
      y: 0,
      width: this.targetElement.transform.width,
      height: this.targetElement.transform.height,
    };

    console.debug('[crop-tool] 重置裁剪区域');
  }

  /**
   * 获取当前裁剪区域
   */
  getCropArea(): CropArea | null {
    return this.cropArea ? { ...this.cropArea } : null;
  }

  /**
   * 获取目标元素
   */
  getTargetElement(): CanvasElement | null {
    return this.targetElement;
  }

  /**
   * 更新设置
   */
  updateSettings(newSettings: Partial<CropSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.debug('[crop-tool] 更新设置', { 
      updatedKeys: Object.keys(newSettings),
      newSettings: this.settings 
    });
  }

  /**
   * 获取设置
   */
  getSettings(): CropSettings {
    return { ...this.settings };
  }

  /**
   * 检查是否处于活动状态
   */
  get active(): boolean {
    return this.isActive;
  }

  /**
   * 检查是否正在拖拽
   */
  get dragging(): boolean {
    return this.isDragging;
  }

  /**
   * 获取裁剪手柄位置
   */
  getCropHandles(): CropHandle[] {
    if (!this.cropArea || !this.targetElement) return [];

    const { x, y, width, height } = this.cropArea;
    const elementX = this.targetElement.transform.x;
    const elementY = this.targetElement.transform.y;

    return [
      // 角落手柄
      { x: elementX + x, y: elementY + y, type: 'nw', cursor: 'nw-resize' },
      { x: elementX + x + width, y: elementY + y, type: 'ne', cursor: 'ne-resize' },
      { x: elementX + x, y: elementY + y + height, type: 'sw', cursor: 'sw-resize' },
      { x: elementX + x + width, y: elementY + y + height, type: 'se', cursor: 'se-resize' },
      // 边缘手柄
      { x: elementX + x + width / 2, y: elementY + y, type: 'n', cursor: 'n-resize' },
      { x: elementX + x + width, y: elementY + y + height / 2, type: 'e', cursor: 'e-resize' },
      { x: elementX + x + width / 2, y: elementY + y + height, type: 's', cursor: 's-resize' },
      { x: elementX + x, y: elementY + y + height / 2, type: 'w', cursor: 'w-resize' },
    ];
  }

  /**
   * 获取裁剪统计信息
   */
  getCropStats() {
    return {
      isActive: this.isActive,
      isDragging: this.isDragging,
      targetElement: this.targetElement ? {
        id: this.targetElement.id,
        size: { width: this.targetElement.transform.width, height: this.targetElement.transform.height },
      } : null,
      cropArea: this.cropArea,
      settings: this.settings,
      historySize: this.history.length,
    };
  }

  /**
   * 获取裁剪历史
   */
  getCropHistory(): CropHistory[] {
    return [...this.history];
  }

  /**
   * 清除裁剪历史
   */
  clearHistory(): void {
    this.history = [];
    console.debug('[crop-tool] 清除裁剪历史');
  }

  // 私有方法

  /**
   * 添加到历史记录
   */
  private addToHistory(): void {
    if (!this.targetElement || !this.cropArea) return;

    const historyItem: CropHistory = {
      id: `crop_${Date.now()}`,
      elementId: this.targetElement.id,
      originalArea: {
        x: 0,
        y: 0,
        width: this.targetElement.transform.width,
        height: this.targetElement.transform.height,
      },
      cropArea: { ...this.cropArea },
      timestamp: Date.now(),
    };

    this.history.push(historyItem);

    // 限制历史记录数量
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * 常用宽高比预设
   */
  static readonly ASPECT_RATIOS = {
    FREE: null,
    SQUARE: 1,
    LANDSCAPE_16_9: 16 / 9,
    LANDSCAPE_4_3: 4 / 3,
    LANDSCAPE_3_2: 3 / 2,
    PORTRAIT_9_16: 9 / 16,
    PORTRAIT_3_4: 3 / 4,
    PORTRAIT_2_3: 2 / 3,
    GOLDEN_RATIO: 1.618,
  } as const;
}

export default CropTool;