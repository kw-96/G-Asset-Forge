import { type IPoint } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import { type IBaseTool } from './type';

/**
 * 标尺辅助线拖拽工具
 */
export class RulerGuideTool implements IBaseTool {
  private isDragging = false;
  private dragType: 'horizontal' | 'vertical' | null = null;

  constructor(private editor: GAssetForgeEditor) {}

  onActive() {
    // noop
  }

  onInactive() {
    this.cancelDrag();
  }

  /**
   * 检查是否在标尺区域开始拖拽
   */
  checkRulerDragStart(point: IPoint): boolean {
    if (!this.editor.setting.get('enableRuler')) {
      return false;
    }

    const rulerWidth = this.editor.setting.get('rulerWidth');

    // 检查是否在水平标尺区域（顶部）
    if (point.x > rulerWidth && point.y <= rulerWidth) {
      this.startDrag('horizontal', point);
      return true;
    }

    // 检查是否在垂直标尺区域（左侧）
    if (point.x <= rulerWidth && point.y > rulerWidth) {
      this.startDrag('vertical', point);
      return true;
    }

    return false;
  }

  private startDrag(type: 'horizontal' | 'vertical', point: IPoint) {
    this.isDragging = true;
    this.dragType = type;

    const scenePoint = this.editor.toScenePt(point.x, point.y);
    const position = type === 'horizontal' ? scenePoint.y : scenePoint.x;

    this.editor.guideLineManager.startDragGuideLineFromRuler(type, position);
    this.editor.setCursor(type === 'horizontal' ? 'move-ns' : 'move-ew');
  }

  onStart(e: PointerEvent) {
    const point = this.editor.getCursorXY(e);
    return this.checkRulerDragStart(point);
  }

  onDrag(e: PointerEvent) {
    if (!this.isDragging || !this.dragType) {
      return;
    }

    const point = this.editor.getCursorXY(e);
    const scenePoint = this.editor.toScenePt(point.x, point.y);
    const position =
      this.dragType === 'horizontal' ? scenePoint.y : scenePoint.x;

    this.editor.guideLineManager.updateDraggingGuideLine(position);
    this.editor.render();
  }

  onEnd(e: PointerEvent, isDragHappened: boolean) {
    if (!this.isDragging) {
      return;
    }

    if (isDragHappened) {
      // 检查是否拖拽到画布区域外，如果是则取消创建
      const point = this.editor.getCursorXY(e);
      const rulerWidth = this.editor.setting.get('rulerWidth');

      const isInCanvasArea = point.x > rulerWidth && point.y > rulerWidth;

      if (isInCanvasArea) {
        // 创建辅助线
        this.editor.guideLineManager.finishDragGuideLine();
      } else {
        // 取消创建
        this.editor.guideLineManager.cancelDragGuideLine();
      }
    } else {
      this.editor.guideLineManager.cancelDragGuideLine();
    }

    this.cancelDrag();
    this.editor.render();
  }

  afterEnd() {
    // noop
  }

  onShiftToggle() {
    // noop
  }

  private cancelDrag() {
    if (this.isDragging) {
      this.editor.guideLineManager.cancelDragGuideLine();
      this.isDragging = false;
      this.dragType = null;
      this.editor.setCursor('default');
    }
  }

  getIsDragging(): boolean {
    return this.isDragging;
  }

  getDragType(): 'horizontal' | 'vertical' | null {
    return this.dragType;
  }
}
