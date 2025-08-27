import { type IPoint, type ITransformRect } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';
import { type GAssetForgeGraphics } from '../graphics';
import { GuideLineSelection } from './guide_line_selection';
import { type IManualGuideLine, ManualGuideLine } from './manual_guide_line';
import { RefLine } from './ref_line';

/**
 * 辅助线管理器
 * 统一管理自动参考线和手动辅助线
 */
export class GuideLineManager {
  private refLine: RefLine;
  private manualGuideLine: ManualGuideLine;
  private selection: GuideLineSelection;

  constructor(private editor: GAssetForgeEditor) {
    this.refLine = new RefLine(editor);
    this.manualGuideLine = new ManualGuideLine(editor);
    this.selection = new GuideLineSelection(editor);
  }

  /**
   * 获取编辑器实例
   */
  getEditor(): GAssetForgeEditor {
    return this.editor;
  }

  /**
   * 绘制所有辅助线
   */
  draw(ctx: CanvasRenderingContext2D) {
    // 绘制自动参考线
    this.refLine.drawRefLine(ctx);

    // 绘制手动辅助线（传入选中状态）
    const selectedIds = new Set(this.selection.getSelectedIds());
    this.manualGuideLine.draw(ctx, selectedIds);
  }

  /**
   * 清除自动参考线缓存
   */
  clear() {
    this.refLine.clear();
  }

  // === 自动参考线相关方法 ===

  /**
   * 缓存图形参考线
   */
  cacheGraphicsRefLines(options: { excludeItems: GAssetForgeGraphics[] }) {
    this.refLine.cacheGraphicsRefLines(options);
  }

  /**
   * 获取图形吸附偏移
   */
  getGraphicsSnapOffset(targetPoints: IPoint[]): IPoint {
    return this.refLine.getGraphicsSnapOffset(targetPoints);
  }

  /**
   * 获取图形目标点
   */
  static getGraphicsTargetPoints(
    record: Map<string, ITransformRect>,
  ): IPoint[] {
    return RefLine.getGraphicsTargetPoints(record);
  }

  // === 手动辅助线相关方法 ===

  /**
   * 添加手动辅助线
   */
  addManualGuideLine(
    type: 'horizontal' | 'vertical',
    position: number,
  ): string {
    return this.manualGuideLine.add(type, position);
  }

  /**
   * 删除手动辅助线
   */
  removeManualGuideLine(id: string): boolean {
    return this.manualGuideLine.remove(id);
  }

  /**
   * 更新手动辅助线位置
   */
  updateManualGuideLinePosition(id: string, position: number): boolean {
    return this.manualGuideLine.updatePosition(id, position);
  }

  /**
   * 获取所有手动辅助线
   */
  getManualGuideLines(): IManualGuideLine[] {
    return this.manualGuideLine.getAll();
  }

  /**
   * 清除所有手动辅助线
   */
  clearManualGuideLines() {
    this.manualGuideLine.clear();
  }

  /**
   * 开始从标尺拖拽创建辅助线
   */
  startDragGuideLineFromRuler(
    type: 'horizontal' | 'vertical',
    position: number,
  ) {
    this.manualGuideLine.startDragFromRuler(type, position);
  }

  /**
   * 更新拖拽中的辅助线位置
   */
  updateDraggingGuideLine(position: number) {
    this.manualGuideLine.updateDragging(position);
  }

  /**
   * 完成拖拽，创建手动辅助线
   */
  finishDragGuideLine(): string | null {
    return this.manualGuideLine.finishDrag();
  }

  /**
   * 取消拖拽
   */
  cancelDragGuideLine() {
    this.manualGuideLine.cancelDrag();
  }

  /**
   * 检查点击是否在手动辅助线上
   */
  hitTestManualGuideLine(
    point: IPoint,
    tolerance = 5,
  ): IManualGuideLine | null {
    return this.manualGuideLine.hitTest(point, tolerance);
  }

  /**
   * 获取手动辅助线的数量
   */
  getManualGuideLinesCount(): number {
    return this.manualGuideLine.getCount();
  }

  /**
   * 检查是否有手动辅助线
   */
  hasManualGuideLines(): boolean {
    return this.manualGuideLine.hasGuideLines();
  }

  /**
   * 检查是否正在拖拽手动辅助线
   */
  isDraggingManualGuideLine(): boolean {
    return this.manualGuideLine.isDragging();
  }

  /**
   * 获取拖拽中的辅助线类型
   */
  getDraggingGuideLineType(): 'horizontal' | 'vertical' | null {
    return this.manualGuideLine.getDraggingType();
  }

  // === 辅助线选择相关方法 ===

  /**
   * 选中辅助线
   */
  selectGuideLine(id: string) {
    this.selection.select(id);
  }

  /**
   * 取消选中辅助线
   */
  deselectGuideLine(id: string) {
    this.selection.deselect(id);
  }

  /**
   * 清除辅助线选择
   */
  clearGuideLineSelection() {
    this.selection.clear();
  }

  /**
   * 检查辅助线是否选中
   */
  isGuideLineSelected(id: string): boolean {
    return this.selection.isSelected(id);
  }

  /**
   * 获取选中的辅助线ID
   */
  getSelectedGuideLineIds(): string[] {
    return this.selection.getSelectedIds();
  }

  /**
   * 检查是否有选中的辅助线
   */
  hasSelectedGuideLines(): boolean {
    return this.selection.hasSelection();
  }

  /**
   * 删除选中的辅助线
   */
  deleteSelectedGuideLines() {
    this.selection.deleteSelected();
  }

  /**
   * 处理辅助线点击选择
   */
  handleGuideLineClick(point: IPoint, multiSelect = false): boolean {
    return this.selection.handleClick(point, multiSelect);
  }
}
