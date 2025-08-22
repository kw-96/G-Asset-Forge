/**
 * 图层管理器 - 管理Suika画布图层的创建、删除、排序等操作
 * @description 基于Suika引擎的图层管理，提供完整的图层生命周期管理
 * @author 开发团队
 */

// 替换Node.js的EventEmitter为浏览器兼容的实现
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function) {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

import type { SuikaEditor } from '../../engines/suika';
import type { SuikaGraphics } from '../../engines/suika/core/graphics';

export interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  parentId: string | undefined;
  children: Layer[] | undefined;
  zIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayerManagerEvents {
  layerAdded: (layer: Layer) => void;
  layerRemoved: (layerId: string) => void;
  layerRenamed: (layerId: string, newName: string) => void;
  layerVisibilityChanged: (layerId: string, visible: boolean) => void;
  layerLockChanged: (layerId: string, locked: boolean) => void;
  layerSelected: (layerIds: string[]) => void;
  layerReordered: (layerIds: string[]) => void;
  layerOpacityChanged: (layerId: string, opacity: number) => void;
}

/**
 * 图层管理器类
 * @description 管理Suika编辑器中的图层，包括选择、可见性、锁定、重命名等功能
 */
export class LayerManager extends EventEmitter {
  private suikaEditor: SuikaEditor | null = null;
  private selectedLayerIds: Set<string> = new Set();

  constructor() {
    super();
  }

  /**
   * 设置Suika编辑器实例
   * @param editor Suika编辑器实例
   */
  setSuikaEditor(editor: SuikaEditor | null) {
    if (this.suikaEditor) {
      // 清理之前的事件监听
      this.suikaEditor.selectedElements.off('itemsChange', this.handleSelectionChange);
      this.suikaEditor.sceneGraph.off('render', this.handleSceneGraphChange);
      this.suikaEditor.commandManager.off('change', this.handleCommandChange);
    }

    this.suikaEditor = editor;

    if (editor) {
      // 监听选择变化事件
      editor.selectedElements.on('itemsChange', this.handleSelectionChange);
      
      // 监听场景图变化事件（新增、删除图层）
      editor.sceneGraph.on('render', this.handleSceneGraphChange);
      
      // 监听命令变化事件（撤销、重做等操作）
      editor.commandManager.on('change', this.handleCommandChange);
      
      // 同步当前选择状态
      this.syncSelectionFromSuika();
    }
  }

  /**
   * 处理选择变化事件
   */
  private handleSelectionChange = () => {
    this.syncSelectionFromSuika();
  };

  /**
   * 处理场景图变化事件
   */
  private handleSceneGraphChange = () => {
    // 场景图发生变化时，通知图层列表更新
    this.emit('layerAdded', {} as any); // 触发图层列表刷新
  };

  /**
   * 处理命令变化事件
   */
  private handleCommandChange = () => {
    // 命令执行后，图层可能发生变化，通知更新
    this.emit('layerAdded', {} as any); // 触发图层列表刷新
  };

  /**
   * 强制刷新图层列表
   */
  refreshLayers() {
    this.emit('layerAdded', {} as any);
    console.log('[LayerManager] 强制刷新图层列表');
  }

  /**
   * 从Suika同步选择状态
   */
  private syncSelectionFromSuika() {
    if (!this.suikaEditor) return;

    const selectedItems = this.suikaEditor.selectedElements.getItems();
    const newSelectedIds = new Set(selectedItems.map(item => item.attrs.id));

    // 检查选择是否有变化
    const hasChanged = newSelectedIds.size !== this.selectedLayerIds.size ||
      Array.from(newSelectedIds).some(id => !this.selectedLayerIds.has(id));

    if (hasChanged) {
      this.selectedLayerIds = newSelectedIds;
      this.emit('layerSelected', Array.from(newSelectedIds));
    }
  }

  /**
   * 获取当前页面的所有图层
   * @returns 图层列表
   */
  getLayers(): Layer[] {
    if (!this.suikaEditor) return [];

    try {
      const currentCanvas = this.suikaEditor.doc.getCurrentCanvas();
      if (!currentCanvas) return [];

      const children = currentCanvas.getChildren();
      const layers = this.buildLayerTree(children);
      
      return layers;
    } catch (error) {
      console.error('[LayerManager] 获取图层列表失败:', error);
      return [];
    }
  }

  /**
   * 构建图层树结构
   * @param graphics Suika图形对象数组
   * @returns 图层数组
   */
  private buildLayerTree(graphics: SuikaGraphics[]): Layer[] {
    return graphics
      .filter(graphic => !graphic.isDeleted())
      .map((graphic, index) => this.graphicToLayer(graphic, index))
      .reverse(); // Suika的渲染顺序是从后往前，UI显示需要反转
  }

  /**
   * 将Suika图形对象转换为图层对象
   * @param graphic Suika图形对象
   * @param index 索引
   * @returns 图层对象
   */
  private graphicToLayer(graphic: SuikaGraphics, index: number): Layer {
    const attrs = graphic.attrs;
    const children = graphic.getChildren();

    return {
      id: attrs.id,
      name: attrs.objectName || this.getDefaultLayerName(graphic.type),
      type: graphic.type,
      visible: graphic.isVisible(),
      locked: attrs.lock || false,
      opacity: attrs.opacity || 1,
      parentId: graphic.getParent()?.attrs.id,
      children: children.length > 0 ? this.buildLayerTree(children) : undefined,
      zIndex: index,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 获取默认图层名称
   * @param type 图层类型
   * @returns 默认名称
   */
  private getDefaultLayerName(type: string): string {
    const typeNames: Record<string, string> = {
      'rect': '矩形',
      'ellipse': '椭圆',
      'line': '线条',
      'text': '文本',
      'path': '路径',
      'image': '图片',
      'group': '组',
      'frame': '画板',
      'regularPolygon': '多边形',
      'star': '星形',
    };
    return typeNames[type] || '图层';
  }

  /**
   * 根据ID获取图层
   * @param layerId 图层ID
   * @returns 图层对象或null
   */
  getLayerById(layerId: string): Layer | null {
    if (!this.suikaEditor) return null;

    const graphic = this.suikaEditor.doc.getGraphicsById(layerId);
    if (!graphic || graphic.isDeleted()) return null;

    return this.graphicToLayer(graphic, 0);
  }

  /**
   * 获取选中的图层
   * @returns 选中的图层ID数组
   */
  getSelectedLayerIds(): string[] {
    return Array.from(this.selectedLayerIds);
  }

  /**
   * 选择图层
   * @param layerIds 要选择的图层ID数组
   * @param addToSelection 是否添加到现有选择
   */
  selectLayers(layerIds: string[], addToSelection: boolean = false) {
    if (!this.suikaEditor) return;

    try {
      const graphics = layerIds
        .map(id => this.suikaEditor!.doc.getGraphicsById(id))
        .filter(graphic => graphic && !graphic.isDeleted()) as SuikaGraphics[];

      if (addToSelection) {
        // 添加到现有选择
        const currentSelection = this.suikaEditor.selectedElements.getItems();
        const allGraphics = [...currentSelection, ...graphics];
        this.suikaEditor.selectedElements.setItems(allGraphics);
      } else {
        // 替换选择
        this.suikaEditor.selectedElements.setItems(graphics);
      }

    } catch (error) {
      console.error('[LayerManager] 选择图层失败:', error);
    }
  }

  /**
   * 清除选择
   */
  clearSelection() {
    if (!this.suikaEditor) return;

    this.suikaEditor.selectedElements.clear();
    console.log('[LayerManager] 清除选择');
  }

  /**
   * 切换图层可见性
   * @param layerId 图层ID
   * @returns 新的可见性状态
   */
  toggleLayerVisibility(layerId: string): boolean | null {
    if (!this.suikaEditor) return null;

    const graphic = this.suikaEditor.doc.getGraphicsById(layerId);
    if (!graphic || graphic.isDeleted()) return null;

    try {
      const newVisible = !graphic.isVisible();
      graphic.updateAttrs({ visible: newVisible });
      
      this.suikaEditor.render();
      this.emit('layerVisibilityChanged', layerId, newVisible);

      return newVisible;
    } catch (error) {
      console.error('[LayerManager] 切换图层可见性失败:', error);
      return null;
    }
  }

  /**
   * 设置图层可见性
   * @param layerId 图层ID
   * @param visible 可见性
   */
  setLayerVisibility(layerId: string, visible: boolean) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(layerId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      graphic.updateAttrs({ visible });
      this.suikaEditor.render();
      this.emit('layerVisibilityChanged', layerId, visible);

    } catch (error) {
      console.error('[LayerManager] 设置图层可见性失败:', error);
    }
  }

  /**
   * 切换图层锁定状态
   * @param layerId 图层ID
   * @returns 新的锁定状态
   */
  toggleLayerLock(layerId: string): boolean | null {
    if (!this.suikaEditor) return null;

    const graphic = this.suikaEditor.doc.getGraphicsById(layerId);
    if (!graphic || graphic.isDeleted()) return null;

    try {
      const newLocked = !(graphic.attrs.lock || false);
      graphic.updateAttrs({ lock: newLocked });
      
      this.suikaEditor.render();
      this.emit('layerLockChanged', layerId, newLocked);

      return newLocked;
    } catch (error) {
      console.error('[LayerManager] 切换图层锁定失败:', error);
      return null;
    }
  }

  /**
   * 设置图层锁定状态
   * @param layerId 图层ID
   * @param locked 锁定状态
   */
  setLayerLock(layerId: string, locked: boolean) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(layerId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      graphic.updateAttrs({ lock: locked });
      this.suikaEditor.render();
      this.emit('layerLockChanged', layerId, locked);

    } catch (error) {
      console.error('[LayerManager] 设置图层锁定失败:', error);
    }
  }

  /**
   * 重命名图层
   * @param layerId 图层ID
   * @param newName 新名称
   * @returns 是否重命名成功
   */
  renameLayer(layerId: string, newName: string): boolean {
    if (!this.suikaEditor) return false;

    const graphic = this.suikaEditor.doc.getGraphicsById(layerId);
    if (!graphic || graphic.isDeleted()) return false;

    try {
      graphic.updateAttrs({ objectName: newName });
      this.emit('layerRenamed', layerId, newName);

      return true;
    } catch (error) {
      console.error('[LayerManager] 重命名图层失败:', error);
      return false;
    }
  }

  /**
   * 删除图层
   * @param layerIds 要删除的图层ID数组
   * @returns 是否删除成功
   */
  deleteLayers(layerIds: string[]): boolean {
    if (!this.suikaEditor) return false;

    try {
      const graphics = layerIds
        .map(id => this.suikaEditor!.doc.getGraphicsById(id))
        .filter(graphic => graphic && !graphic.isDeleted()) as SuikaGraphics[];

      if (graphics.length === 0) return false;

      // 删除图层
      graphics.forEach(graphic => {
        graphic.setDeleted(true);
        graphic.removeFromParent();
        this.emit('layerRemoved', graphic.attrs.id);
      });

      // 清除选择
      this.suikaEditor.selectedElements.clear();
      this.suikaEditor.render();

      return true;
    } catch (error) {
      console.error('[LayerManager] 删除图层失败:', error);
      return false;
    }
  }

  /**
   * 复制图层
   * @param layerIds 要复制的图层ID数组
   * @returns 新创建的图层ID数组
   */
  duplicateLayers(layerIds: string[]): string[] {
    if (!this.suikaEditor) return [];

    try {
      const graphics = layerIds
        .map(id => this.suikaEditor!.doc.getGraphicsById(id))
        .filter(graphic => graphic && !graphic.isDeleted()) as SuikaGraphics[];

      if (graphics.length === 0) return [];

      const newLayerIds: string[] = [];

      // TODO: 实现图层复制逻辑
      // 这需要深度克隆Suika图形对象并添加到场景中

      return newLayerIds;
    } catch (error) {
      console.error('[LayerManager] 复制图层失败:', error);
      return [];
    }
  }

  /**
   * 设置图层不透明度
   * @param layerId 图层ID
   * @param opacity 不透明度 (0-1)
   */
  setLayerOpacity(layerId: string, opacity: number) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(layerId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      const clampedOpacity = Math.max(0, Math.min(1, opacity));
      graphic.updateAttrs({ opacity: clampedOpacity });
      
      this.suikaEditor.render();
      this.emit('layerOpacityChanged', layerId, clampedOpacity);

    } catch (error) {
      console.error('[LayerManager] 设置图层不透明度失败:', error);
    }
  }

  /**
   * 移动图层到指定位置
   * @param layerId 图层ID
   * @param targetIndex 目标索引
   */
  moveLayerToIndex(layerId: string, _targetIndex: number) {
    if (!this.suikaEditor) return;

    const graphic = this.suikaEditor.doc.getGraphicsById(layerId);
    if (!graphic || graphic.isDeleted()) return;

    try {
      const parent = graphic.getParent();
      if (!parent) return;

      // TODO: 实现图层重排序逻辑
      // 这需要调用Suika的图层排序API
      
      this.suikaEditor.render();
      this.emit('layerReordered', this.getLayers().map(layer => layer.id));
    } catch (error) {
      console.error('[LayerManager] 移动图层失败:', error);
    }
  }

  /**
   * 获取图层数量
   * @returns 图层数量
   */
  getLayerCount(): number {
    return this.getLayers().length;
  }

  /**
   * 清理资源
   */
  destroy() {
    if (this.suikaEditor) {
      this.suikaEditor.selectedElements.off('itemsChange', this.handleSelectionChange);
    }
    this.selectedLayerIds.clear();
    this.removeAllListeners();
  }
}

// 导出单例实例
export const layerManager = new LayerManager();