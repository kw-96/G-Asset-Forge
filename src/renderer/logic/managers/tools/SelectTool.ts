/**
 * 选择工具 - 提供元素选择、移动、变换功能
 * @description 支持单选、多选、框选、变换等操作
 * @author 开发团队
 */
import { type CanvasElement } from '../../../../interfaces/types/canvas';
import { UnifiedPerformanceMonitor } from '../../utils/performance/UnifiedPerformanceMonitor';

/**
 * 选择模式枚举
 */
export enum SelectionMode {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  BOX = 'box',
}

/**
 * 变换手柄类型
 */
export type TransformHandleType = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w' | 'rotate';

/**
 * 变换手柄接口
 */
export interface TransformHandle {
  x: number;
  y: number;
  type: TransformHandleType;
  cursor: string;
}

/**
 * 选择区域接口
 */
export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 变换状态接口
 */
export interface TransformState {
  isTransforming: boolean;
  handleType: TransformHandleType | null;
  startPoint: { x: number; y: number } | null;
  originalBounds: SelectionBox | null;
  originalElements: CanvasElement[];
}

/**
 * 选择工具设置接口
 */
export interface SelectToolSettings {
  selectionMode: SelectionMode;
  showBounds: boolean;
  showHandles: boolean;
  snapToGrid: boolean;
  gridSize: number;
  multiSelectKey: 'ctrl' | 'shift' | 'cmd';
  enableRotation: boolean;
  constrainProportions: boolean;
}

/**
 * 选择工具类
 * @description 提供完整的选择和变换功能
 */
export class SelectTool {
  private selectedElements: Set<string> = new Set();
  private selectionBox: SelectionBox | null = null;
  private isBoxSelecting = false;
  private transformState: TransformState = {
    isTransforming: false,
    handleType: null,
    startPoint: null,
    originalBounds: null,
    originalElements: [],
  };

  private settings: SelectToolSettings = {
    selectionMode: SelectionMode.SINGLE,
    showBounds: true,
    showHandles: true,
    snapToGrid: false,
    gridSize: 10,
    multiSelectKey: 'ctrl',
    enableRotation: true,
    constrainProportions: false,
  };

  private allElements: Map<string, CanvasElement> = new Map();

  constructor(initialSettings?: Partial<SelectToolSettings>) {
    if (initialSettings) {
      this.settings = { ...this.settings, ...initialSettings };
    }
  }

  /**
   * 更新所有元素引用
   */
  updateElements(elements: CanvasElement[]): void {
    this.allElements.clear();
    elements.forEach(element => {
      this.allElements.set(element.id, element);
    });
  }

  /**
   * 选择元素
   */
  selectElement(elementId: string, addToSelection = false): void {
    const startTime = performance.now();

    if (!addToSelection || this.settings.selectionMode === SelectionMode.SINGLE) {
      this.selectedElements.clear();
    }

    this.selectedElements.add(elementId);

    console.debug('[select-tool] 选择元素', {
      elementId,
      addToSelection,
      totalSelected: this.selectedElements.size,
    });

    UnifiedPerformanceMonitor.recordMetric('select-element', performance.now() - startTime);
  }

  /**
   * 取消选择元素
   */
  deselectElement(elementId: string): void {
    this.selectedElements.delete(elementId);
    console.debug('[select-tool] 取消选择元素', { elementId });
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    const count = this.selectedElements.size;
    this.selectedElements.clear();
    this.selectionBox = null;
    this.resetTransformState();

    console.debug('[select-tool] 清除选择', { previousCount: count });
  }

  /**
   * 开始框选
   */
  startBoxSelection(x: number, y: number): void {
    this.isBoxSelecting = true;
    this.selectionBox = { x, y, width: 0, height: 0 };

    if (this.settings.selectionMode !== SelectionMode.MULTIPLE) {
      this.selectedElements.clear();
    }

    console.debug('[select-tool] 开始框选', { startPoint: { x, y } });
  }

  /**
   * 更新框选区域
   */
  updateBoxSelection(x: number, y: number): void {
    if (!this.isBoxSelecting || !this.selectionBox) return;

    const startTime = performance.now();

    const startX = this.selectionBox.x;
    const startY = this.selectionBox.y;

    this.selectionBox = {
      x: Math.min(startX, x),
      y: Math.min(startY, y),
      width: Math.abs(x - startX),
      height: Math.abs(y - startY),
    };

    // 检查哪些元素在选择框内
    this.updateBoxSelectionElements();

    UnifiedPerformanceMonitor.recordMetric('box-selection-update', performance.now() - startTime);
  }

  /**
   * 结束框选
   */
  endBoxSelection(): void {
    if (!this.isBoxSelecting) return;

    this.isBoxSelecting = false;
    
    console.info('[select-tool] 结束框选', {
      selectionBox: this.selectionBox,
      selectedCount: this.selectedElements.size,
    });
  }

  /**
   * 开始变换操作
   */
  startTransform(x: number, y: number, handleType: TransformHandleType): void {
    if (this.selectedElements.size === 0) return;

    const startTime = performance.now();
    UnifiedPerformanceMonitor.markStart('transform-start', startTime);

    const selectedElementsArray = this.getSelectedElements();
    const bounds = this.calculateSelectionBounds(selectedElementsArray);

    this.transformState = {
      isTransforming: true,
      handleType,
      startPoint: { x, y },
      originalBounds: bounds,
      originalElements: selectedElementsArray.map(el => ({ ...el })),
    };

    console.debug('[select-tool] 开始变换', {
      handleType,
      startPoint: { x, y },
      selectedCount: this.selectedElements.size,
    });

    UnifiedPerformanceMonitor.markEnd('transform-start', startTime);
  }

  /**
   * 继续变换操作
   */
  continueTransform(x: number, y: number): CanvasElement[] {
    if (!this.transformState.isTransforming || !this.transformState.startPoint || !this.transformState.originalBounds) {
      return [];
    }

    const startTime = performance.now();

    const deltaX = x - this.transformState.startPoint.x;
    const deltaY = y - this.transformState.startPoint.y;

    const transformedElements = this.applyTransform(deltaX, deltaY);

    UnifiedPerformanceMonitor.recordMetric('transform-continue', performance.now() - startTime);
    return transformedElements;
  }

  /**
   * 结束变换操作
   */
  endTransform(): CanvasElement[] {
    if (!this.transformState.isTransforming) return [];

    const transformedElements = this.transformState.originalElements.map(el => ({ ...el }));
    this.resetTransformState();

    console.debug('[select-tool] 结束变换', {
      transformedCount: transformedElements.length,
    });

    return transformedElements;
  }

  /**
   * 取消变换操作
   */
  cancelTransform(): void {
    if (!this.transformState.isTransforming) return;

    console.debug('[select-tool] 取消变换');
    this.resetTransformState();
  }

  /**
   * 移动选中的元素
   */
  moveSelectedElements(deltaX: number, deltaY: number): CanvasElement[] {
    const selectedElements = this.getSelectedElements();
    if (selectedElements.length === 0) return [];

    const startTime = performance.now();

    const movedElements = selectedElements.map(element => ({
      ...element,
      transform: {
        ...element.transform,
        x: this.snapToGrid(element.transform.x + deltaX),
        y: this.snapToGrid(element.transform.y + deltaY),
      },
    }));

    UnifiedPerformanceMonitor.recordMetric('move-elements', performance.now() - startTime);
    return movedElements;
  }

  /**
   * 获取选中的元素
   */
  getSelectedElements(): CanvasElement[] {
    return Array.from(this.selectedElements)
      .map(id => this.allElements.get(id))
      .filter((element): element is CanvasElement => element !== undefined);
  }

  /**
   * 获取选中元素的ID列表
   */
  getSelectedElementIds(): string[] {
    return Array.from(this.selectedElements);
  }

  /**
   * 检查元素是否被选中
   */
  isElementSelected(elementId: string): boolean {
    return this.selectedElements.has(elementId);
  }

  /**
   * 获取选择边界
   */
  getSelectionBounds(): SelectionBox | null {
    const selectedElements = this.getSelectedElements();
    if (selectedElements.length === 0) return null;

    return this.calculateSelectionBounds(selectedElements);
  }

  /**
   * 获取变换手柄
   */
  getTransformHandles(): TransformHandle[] {
    const bounds = this.getSelectionBounds();
    if (!bounds || !this.settings.showHandles) return [];

    const handles: TransformHandle[] = [
      // 角落手柄
      { x: bounds.x, y: bounds.y, type: 'nw', cursor: 'nw-resize' },
      { x: bounds.x + bounds.width, y: bounds.y, type: 'ne', cursor: 'ne-resize' },
      { x: bounds.x, y: bounds.y + bounds.height, type: 'sw', cursor: 'sw-resize' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'se', cursor: 'se-resize' },
      // 边缘手柄
      { x: bounds.x + bounds.width / 2, y: bounds.y, type: 'n', cursor: 'n-resize' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, type: 'e', cursor: 'e-resize' },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, type: 's', cursor: 's-resize' },
      { x: bounds.x, y: bounds.y + bounds.height / 2, type: 'w', cursor: 'w-resize' },
    ];

    // 旋转手柄
    if (this.settings.enableRotation) {
      handles.push({
        x: bounds.x + bounds.width / 2,
        y: bounds.y - 20,
        type: 'rotate',
        cursor: 'grab',
      });
    }

    return handles;
  }

  /**
   * 更新设置
   */
  updateSettings(newSettings: Partial<SelectToolSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.debug('[select-tool] 更新设置', {
      updatedKeys: Object.keys(newSettings),
      newSettings: this.settings,
    });
  }

  /**
   * 获取设置
   */
  getSettings(): SelectToolSettings {
    return { ...this.settings };
  }

  /**
   * 获取工具状态
   */
  getToolState() {
    return {
      selectedCount: this.selectedElements.size,
      selectedElementIds: Array.from(this.selectedElements),
      isBoxSelecting: this.isBoxSelecting,
      selectionBox: this.selectionBox,
      isTransforming: this.transformState.isTransforming,
      transformHandleType: this.transformState.handleType,
      settings: this.settings,
    };
  }

  // 私有方法

  /**
   * 更新框选中的元素
   */
  private updateBoxSelectionElements(): void {
    if (!this.selectionBox) return;

    const elementsInBox = Array.from(this.allElements.values()).filter(element =>
      this.isElementInBox(element, this.selectionBox!)
    );

    // 根据选择模式更新选择
    if (this.settings.selectionMode === SelectionMode.MULTIPLE) {
      elementsInBox.forEach(element => this.selectedElements.add(element.id));
    } else {
      this.selectedElements.clear();
      elementsInBox.forEach(element => this.selectedElements.add(element.id));
    }
  }

  /**
   * 检查元素是否在选择框内
   */
  private isElementInBox(element: CanvasElement, box: SelectionBox): boolean {
    return (
      element.transform.x < box.x + box.width &&
      element.transform.x + element.transform.width > box.x &&
      element.transform.y < box.y + box.height &&
      element.transform.y + element.transform.height > box.y
    );
  }

  /**
   * 计算选择边界
   */
  private calculateSelectionBounds(elements: CanvasElement[]): SelectionBox {
    if (elements.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = elements.flatMap(el => [el.transform.x, el.transform.x + el.transform.width]);
    const ys = elements.flatMap(el => [el.transform.y, el.transform.y + el.transform.height]);

    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * 应用变换
   */
  private applyTransform(deltaX: number, deltaY: number): CanvasElement[] {
    if (!this.transformState.originalElements || !this.transformState.handleType) {
      return [];
    }

    const handleType = this.transformState.handleType;
    const elements = this.transformState.originalElements;

    return elements.map(element => {
      let newElement = { ...element };

      switch (handleType) {
        case 'nw':
          newElement.transform.x = this.snapToGrid(element.transform.x + deltaX);
          newElement.transform.y = this.snapToGrid(element.transform.y + deltaY);
          newElement.transform.width = Math.max(10, element.transform.width - deltaX);
          newElement.transform.height = Math.max(10, element.transform.height - deltaY);
          break;
        case 'ne':
          newElement.transform.y = this.snapToGrid(element.transform.y + deltaY);
          newElement.transform.width = Math.max(10, element.transform.width + deltaX);
          newElement.transform.height = Math.max(10, element.transform.height - deltaY);
          break;
        case 'sw':
          newElement.transform.x = this.snapToGrid(element.transform.x + deltaX);
          newElement.transform.width = Math.max(10, element.transform.width - deltaX);
          newElement.transform.height = Math.max(10, element.transform.height + deltaY);
          break;
        case 'se':
          newElement.transform.width = Math.max(10, element.transform.width + deltaX);
          newElement.transform.height = Math.max(10, element.transform.height + deltaY);
          break;
        case 'n':
          newElement.transform.y = this.snapToGrid(element.transform.y + deltaY);
          newElement.transform.height = Math.max(10, element.transform.height - deltaY);
          break;
        case 'e':
          newElement.transform.width = Math.max(10, element.transform.width + deltaX);
          break;
        case 's':
          newElement.transform.height = Math.max(10, element.transform.height + deltaY);
          break;
        case 'w':
          newElement.transform.x = this.snapToGrid(element.transform.x + deltaX);
          newElement.transform.width = Math.max(10, element.transform.width - deltaX);
          break;
        case 'rotate':
          // 旋转逻辑（简化实现）
          // 实际实现需要更复杂的旋转计算
          break;
      }

      // 应用比例约束
      if (this.settings.constrainProportions && ['nw', 'ne', 'sw', 'se'].includes(handleType)) {
        const aspectRatio = element.transform.width / element.transform.height;
        if (handleType === 'se' || handleType === 'nw') {
          newElement.transform.height = newElement.transform.width / aspectRatio;
        } else {
          newElement.transform.width = newElement.transform.height * aspectRatio;
        }
      }

      return newElement;
    });
  }

  /**
   * 重置变换状态
   */
  private resetTransformState(): void {
    this.transformState = {
      isTransforming: false,
      handleType: null,
      startPoint: null,
      originalBounds: null,
      originalElements: [],
    };
  }

  /**
   * 网格对齐
   */
  private snapToGrid(value: number): number {
    if (!this.settings.snapToGrid) return value;
    return Math.round(value / this.settings.gridSize) * this.settings.gridSize;
  }
}

export default SelectTool;