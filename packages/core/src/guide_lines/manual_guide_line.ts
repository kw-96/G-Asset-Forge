import { type IPoint } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import { drawLine } from '../utils';

/**
 * 手动创建的辅助线
 */
export interface IManualGuideLine {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number; // 对于水平线是 y 坐标，对于垂直线是 x 坐标
}

/**
 * 手动辅助线管理器
 */
export class ManualGuideLine {
  /**
   * 手动创建的辅助线
   */
  private manualGuideLines: IManualGuideLine[] = [];

  /**
   * 正在拖拽创建的辅助线
   */
  private draggingGuideLine: IManualGuideLine | null = null;

  constructor(private editor: GAssetForgeEditor) {}

  /**
   * 绘制手动辅助线
   */
  draw(ctx: CanvasRenderingContext2D, selectedIds: Set<string> = new Set()) {
    const viewportBbox = this.editor.viewportManager.getSceneBbox();

    ctx.save();

    for (const guideLine of this.manualGuideLines) {
      const isSelected = selectedIds.has(guideLine.id);

      // 根据选中状态设置样式
      if (isSelected) {
        ctx.strokeStyle = '#0066ff'; // 选中状态使用深蓝色
        ctx.lineWidth = 2;
        ctx.setLineDash([]); // 实线
      } else {
        ctx.strokeStyle = '#0099ff'; // 普通状态使用浅蓝色
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]); // 虚线
      }

      if (guideLine.type === 'vertical') {
        const { x } = this.editor.toViewportPt(guideLine.position, 0);
        drawLine(ctx, x, viewportBbox.minY, x, viewportBbox.maxY);
      } else {
        const { y } = this.editor.toViewportPt(0, guideLine.position);
        drawLine(ctx, viewportBbox.minX, y, viewportBbox.maxX, y);
      }
    }

    // 绘制正在拖拽的辅助线
    if (this.draggingGuideLine) {
      ctx.strokeStyle = '#ff6600'; // 拖拽中的辅助线使用橙色
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]); // 短虚线

      const guideLine = this.draggingGuideLine;
      if (guideLine.type === 'vertical') {
        const { x } = this.editor.toViewportPt(guideLine.position, 0);
        drawLine(ctx, x, viewportBbox.minY, x, viewportBbox.maxY);
      } else {
        const { y } = this.editor.toViewportPt(0, guideLine.position);
        drawLine(ctx, viewportBbox.minX, y, viewportBbox.maxX, y);
      }
    }

    ctx.restore();
  }

  /**
   * 添加手动辅助线
   */
  add(type: 'horizontal' | 'vertical', position: number): string {
    const id = `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const guideLine: IManualGuideLine = { id, type, position };
    this.manualGuideLines.push(guideLine);
    return id;
  }

  /**
   * 删除手动辅助线
   */
  remove(id: string): boolean {
    const index = this.manualGuideLines.findIndex((line) => line.id === id);
    if (index !== -1) {
      this.manualGuideLines.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 更新手动辅助线位置
   */
  updatePosition(id: string, position: number): boolean {
    const guideLine = this.manualGuideLines.find((line) => line.id === id);
    if (guideLine) {
      guideLine.position = position;
      return true;
    }
    return false;
  }

  /**
   * 获取所有手动辅助线
   */
  getAll(): IManualGuideLine[] {
    return [...this.manualGuideLines];
  }

  /**
   * 清除所有手动辅助线
   */
  clear() {
    this.manualGuideLines = [];
  }

  /**
   * 开始从标尺拖拽创建辅助线
   */
  startDragFromRuler(type: 'horizontal' | 'vertical', position: number) {
    const id = `dragging-${Date.now()}`;
    this.draggingGuideLine = { id, type, position };
  }

  /**
   * 更新拖拽中的辅助线位置
   */
  updateDragging(position: number) {
    if (this.draggingGuideLine) {
      this.draggingGuideLine.position = position;
    }
  }

  /**
   * 完成拖拽，创建手动辅助线
   */
  finishDrag(): string | null {
    if (this.draggingGuideLine) {
      const id = this.add(
        this.draggingGuideLine.type,
        this.draggingGuideLine.position,
      );
      this.draggingGuideLine = null;
      return id;
    }
    return null;
  }

  /**
   * 取消拖拽
   */
  cancelDrag() {
    this.draggingGuideLine = null;
  }

  /**
   * 检查点击是否在手动辅助线上
   */
  hitTest(point: IPoint, tolerance = 5): IManualGuideLine | null {
    const toleranceInScene = tolerance / this.editor.viewportManager.getZoom();

    for (const guideLine of this.manualGuideLines) {
      if (guideLine.type === 'vertical') {
        if (Math.abs(point.x - guideLine.position) <= toleranceInScene) {
          return guideLine;
        }
      } else {
        if (Math.abs(point.y - guideLine.position) <= toleranceInScene) {
          return guideLine;
        }
      }
    }
    return null;
  }

  /**
   * 获取手动辅助线的数量
   */
  getCount(): number {
    return this.manualGuideLines.length;
  }

  /**
   * 检查是否有手动辅助线
   */
  hasGuideLines(): boolean {
    return this.manualGuideLines.length > 0;
  }

  /**
   * 检查是否正在拖拽
   */
  isDragging(): boolean {
    return this.draggingGuideLine !== null;
  }

  /**
   * 获取拖拽中的辅助线类型
   */
  getDraggingType(): 'horizontal' | 'vertical' | null {
    return this.draggingGuideLine?.type || null;
  }
}
