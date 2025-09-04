import { EventEmitter, throttle } from '@g-asset-forge/common';

import { type GAssetForgeEditor } from '../editor';
import { GraphicsType, type Optional } from '../type';
import { type GAssetForgeCanvas } from './canvas';
import {
  GAssetForgeGraphics,
  type GraphicsAttrs,
  type IGraphicsOpts,
} from './graphics';
import { GraphicsStoreManager } from './graphics_manger';

type GAssetForgeCanvasAttrs = GraphicsAttrs;

interface Events {
  sceneChange(
    ops: {
      added: Map<string, GraphicsAttrs>;
      deleted: Set<string>;
      update: Map<string, Partial<GraphicsAttrs>>;
    },
    source: string,
  ): void;
  currentCanvasChange(canvasId: string, prevCanvasId: string): void;
}

export class GAssetForgeDocument extends GAssetForgeGraphics<GAssetForgeCanvasAttrs> {
  override type = GraphicsType.Document;
  protected override isContainer = true;

  graphicsStoreManager = new GraphicsStoreManager();
  private emitter = new EventEmitter<Events>();

  private changes = {
    added: new Map<string, GraphicsAttrs>(),
    deleted: new Set<string>(),
    updatedIds: new Set<string>(),
  };

  private editor!: GAssetForgeEditor;
  private currentCanvasId: string = '';

  constructor(attrs: Optional<GAssetForgeCanvasAttrs, 'id' | 'transform'>) {
    super({ ...attrs, type: GraphicsType.Document }, {} as IGraphicsOpts);
  }

  setEditor(editor: GAssetForgeEditor) {
    this.editor = editor;
  }

  clear(immediate = true) {
    // TODO: update doc.updateInfo
    this.graphicsStoreManager.clear();
    // 如果immediate为true，立即清空currentCanvasId
    // 如果immediate为false，保持currentCanvasId不变，等待后续设置
    if (immediate) {
      this.currentCanvasId = '';
    }
  }

  getGraphicsById(id: string) {
    return this.graphicsStoreManager.get(id);
  }

  getGraphicsArrByIds(ids: Set<string>) {
    const graphicsArr: GAssetForgeGraphics[] = [];
    for (const id of ids) {
      const graphics = this.getGraphicsById(id);
      if (!graphics) {
        console.warn(`id ${id} is no exist in graphics array`);
        continue;
      }
      graphicsArr.push(graphics);
    }
    return graphicsArr;
  }

  getAllGraphicsArr() {
    return this.graphicsStoreManager.getAll();
  }

  getCurrentCanvas(): GAssetForgeCanvas | null {
    try {
      const canvasItems = this.graphicsStoreManager.getCanvasItems();

      // 如果没有画布项目，返回null
      if (!canvasItems || canvasItems.length === 0) {
        console.warn('没有可用的画布项目');
        return null;
      }

      // 查找当前画布ID对应的画布
      const canvas = canvasItems.find(
        (canvas) =>
          canvas && canvas.attrs && canvas.attrs.id === this.currentCanvasId,
      );

      // 如果找到了有效的画布，直接返回
      if (canvas && canvas.attrs && !canvas.isDeleted()) {
        return canvas;
      }

      // 如果当前画布无效，查找第一个有效的画布
      const validCanvas = canvasItems.find(
        (canvas) =>
          canvas && canvas.attrs && canvas.attrs.id && !canvas.isDeleted(),
      );

      if (validCanvas) {
        console.warn(
          `当前画布ID "${this.currentCanvasId}" 无效，切换到有效画布: ${validCanvas.attrs.id}`,
        );
        this.currentCanvasId = validCanvas.attrs.id;
        return validCanvas;
      }

      console.error('没有找到任何有效的画布');
      return null;
    } catch (error) {
      console.error('获取当前画布时出错:', error);
      return null;
    }
  }

  setCurrentCanvas(canvasId: string) {
    if (canvasId === this.currentCanvasId) {
      console.log('Same canvas, switch canvas failed');
      return;
    }

    const prevCanvasId = this.currentCanvasId;

    // 记录当前画布的选择状态和视口矩阵
    const prevCanvas = this.getCurrentCanvas();
    if (prevCanvas) {
      try {
        // 保存选择状态
        const currentSelectedIds = this.editor.selectedElements.getIdSet();
        prevCanvas.lastSelectedIds = new Set(currentSelectedIds);
        console.log('画布切换：保存选择状态', Array.from(currentSelectedIds));

        // 保存视口矩阵
        const currentViewMatrix = this.editor.viewportManager.getViewMatrix();
        prevCanvas.lastMatrix = currentViewMatrix.clone();
        console.log('画布切换：保存视口状态', {
          x: currentViewMatrix.tx,
          y: currentViewMatrix.ty,
          zoom: currentViewMatrix.a,
        });
      } catch (error) {
        console.warn('画布切换：保存状态时出错', error);
      }
    }

    // 切换到新画布
    this.currentCanvasId = canvasId;
    console.log('画布切换：已切换到画布', canvasId);

    // 恢复新画布的选择状态和视口矩阵
    const currentCanvas = this.getCurrentCanvas();
    if (currentCanvas) {
      try {
        // 恢复选择状态
        if (
          currentCanvas.lastSelectedIds &&
          currentCanvas.lastSelectedIds.size > 0
        ) {
          // 验证选择状态的有效性
          const validSelectedIds = new Set<string>();
          for (const id of currentCanvas.lastSelectedIds) {
            const graphics = this.getGraphicsById(id);
            if (
              graphics &&
              !graphics.isDeleted() &&
              this.isGraphicsInCurrentCanvas(graphics)
            ) {
              validSelectedIds.add(id);
            }
          }

          if (validSelectedIds.size > 0) {
            this.editor.selectedElements.setItemsById(validSelectedIds);
            console.log('画布切换：恢复选择状态', Array.from(validSelectedIds));
          } else {
            // 如果没有有效的选择状态，清空选择
            this.editor.selectedElements.clear();
            console.log('画布切换：清空选择状态（无有效选择）');
          }
        } else {
          // 清空选择状态
          this.editor.selectedElements.clear();
          console.log('画布切换：清空选择状态（无保存状态）');
        }

        // 恢复视口矩阵
        if (currentCanvas.lastMatrix) {
          this.editor.viewportManager.setViewMatrix(currentCanvas.lastMatrix);
          console.log('画布切换：恢复视口状态', {
            x: currentCanvas.lastMatrix.tx,
            y: currentCanvas.lastMatrix.ty,
            zoom: currentCanvas.lastMatrix.a,
          });
        } else {
          // 第一次切换到画布时，重置视口并聚焦到画布内容
          this.editor.viewportManager.resetViewport();
          console.log('画布切换：重置视口状态（首次切换）');

          // 尝试聚焦到画布内容
          this.focusCanvasContent(currentCanvas);
        }

        // 触发渲染更新
        if (this.editor.render) {
          this.editor.render();
        }
      } catch (error) {
        console.error('画布切换：恢复状态时出错', error);

        // 出错时的回退处理
        try {
          this.editor.selectedElements.clear();
          this.editor.viewportManager.resetViewport();
          console.log('画布切换：使用回退状态（清空选择，重置视口）');
        } catch (fallbackError) {
          console.error('画布切换：回退处理也失败', fallbackError);
        }
      }
    } else {
      console.error('画布切换：无法获取目标画布', canvasId);
    }

    this.emitter.emit('currentCanvasChange', canvasId, prevCanvasId);
  }

  /**
   * 聚焦到画布内容
   */
  private focusCanvasContent(canvas: GAssetForgeCanvas): void {
    try {
      const children = canvas.getChildren();
      if (children.length > 0) {
        // 计算画布内容的边界框
        const bboxes = children
          .filter((child) => child.isVisible() && !child.isDeleted())
          .map((child) => child.getBbox());

        if (bboxes.length > 0) {
          // 使用视口管理器聚焦到内容
          if (this.editor.viewportManager.zoomToFit) {
            this.editor.viewportManager.zoomToFit(1);
            console.log('画布切换：已聚焦到画布内容');
          }
        }
      }
    } catch (error) {
      console.warn('画布切换：聚焦到内容时出错', error);
    }
  }

  /**
   * 检查图形是否属于当前画布
   */
  private isGraphicsInCurrentCanvas(graphics: GAssetForgeGraphics): boolean {
    const currentCanvas = this.getCurrentCanvas();
    if (!currentCanvas) {
      return false;
    }

    // 检查图形是否是当前画布的子元素，或者就是当前画布本身
    return (
      graphics === currentCanvas || graphics.hasAncestor(currentCanvas.attrs.id)
    );
  }

  addGraphics(graphics: GAssetForgeGraphics) {
    this.graphicsStoreManager.add(graphics);
    this.changes.added.set(graphics.attrs.id, graphics.getAttrs());
    this.emitSceneChangeThrottle();
  }

  collectDeletedGraphics(graphics: GAssetForgeGraphics) {
    const id = graphics.attrs.id;
    if (graphics.isDeleted()) {
      this.changes.deleted.add(id);
      this.changes.added.delete(id);
    } else {
      this.changes.deleted.delete(id);
      this.changes.added.set(id, graphics.getAttrs());
    }
    this.emitSceneChangeThrottle();
  }

  collectUpdatedGraphics(id: string) {
    this.changes.updatedIds.add(id);
    this.emitSceneChangeThrottle();
  }

  flushChanges() {
    const updates = new Map<string, Partial<GraphicsAttrs>>();
    for (const id of this.changes.updatedIds) {
      const graphics = this.getGraphicsById(id);
      if (!graphics) {
        console.warn(
          `graphics ${id} is lost! 可能的原因: 1.图形被删除但未正确清理引用 2.H5容器重新创建导致ID变化 3.数据加载时序问题`,
        );
        continue;
      }
      updates.set(id, graphics.getUpdatedAttrs());
    }
    const changes = {
      added: this.changes.added,
      deleted: this.changes.deleted,
      update: updates,
    };
    this.clearChanges();
    return changes;
  }

  private clearChanges() {
    this.changes = {
      added: new Map(),
      deleted: new Set(),
      updatedIds: new Set(),
    };
  }

  private emitSceneChangeThrottle = throttle(
    () => {
      const changes = this.flushChanges();
      this.emitter.emit('sceneChange', changes, 'unknown');
    },
    100,
    // { leading: false },
  );

  getDeviceViewSize() {
    const canvasEl = this.editor.canvasElement;
    return {
      width: canvasEl.width,
      height: canvasEl.height,
    };
  }

  on<T extends keyof Events>(eventName: T, listener: Events[T]) {
    this.emitter.on(eventName, listener);
  }
  off<T extends keyof Events>(eventName: T, listener: Events[T]) {
    this.emitter.off(eventName, listener);
  }
}

export const isDocGraphics = (
  graphics: GAssetForgeGraphics,
): graphics is GAssetForgeDocument => {
  return graphics instanceof GAssetForgeDocument;
};
