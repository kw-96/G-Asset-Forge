import { type IPoint } from '@g-asset-forge/geo';

import { type GAssetForgeEditor } from '../editor';

/**
 * 辅助线选择管理器
 */
export class GuideLineSelection {
  private selectedGuideLineIds: Set<string> = new Set();

  constructor(private editor: GAssetForgeEditor) {}

  /**
   * 选中辅助线
   */
  select(id: string) {
    this.selectedGuideLineIds.add(id);
  }

  /**
   * 取消选中辅助线
   */
  deselect(id: string) {
    this.selectedGuideLineIds.delete(id);
  }

  /**
   * 切换选中状态
   */
  toggle(id: string) {
    if (this.selectedGuideLineIds.has(id)) {
      this.deselect(id);
    } else {
      this.select(id);
    }
  }

  /**
   * 清除所有选中
   */
  clear() {
    this.selectedGuideLineIds.clear();
  }

  /**
   * 检查是否选中
   */
  isSelected(id: string): boolean {
    return this.selectedGuideLineIds.has(id);
  }

  /**
   * 获取所有选中的辅助线ID
   */
  getSelectedIds(): string[] {
    return Array.from(this.selectedGuideLineIds);
  }

  /**
   * 获取选中的辅助线数量
   */
  getSelectedCount(): number {
    return this.selectedGuideLineIds.size;
  }

  /**
   * 检查是否有选中的辅助线
   */
  hasSelection(): boolean {
    return this.selectedGuideLineIds.size > 0;
  }

  /**
   * 删除选中的辅助线
   */
  deleteSelected() {
    const selectedIds = this.getSelectedIds();
    for (const id of selectedIds) {
      this.editor.guideLineManager.removeManualGuideLine(id);
    }
    this.clear();
  }

  /**
   * 点击选择辅助线
   */
  handleClick(point: IPoint, multiSelect = false): boolean {
    const guideLine =
      this.editor.guideLineManager.hitTestManualGuideLine(point);

    if (guideLine) {
      if (multiSelect) {
        this.toggle(guideLine.id);
      } else {
        this.clear();
        this.select(guideLine.id);
      }
      return true;
    } else if (!multiSelect) {
      this.clear();
    }

    return false;
  }
}
