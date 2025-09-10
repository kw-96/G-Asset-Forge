import { GAssetForgeFrame, type GAssetForgeGraphics } from '.';
import { GAssetForgeCanvas } from './canvas';

/**
 * Graphics Manager
 *
 * 1. record "id -> graphics"
 * 2. TODO: search graphics by box (with R-Tree)
 */
export class GraphicsStoreManager {
  private graphicsStore = new Map<string, GAssetForgeGraphics>();
  private canvasStore = new Map<string, GAssetForgeCanvas>();
  private frameStore = new Map<string, GAssetForgeFrame>();

  add(graphics: GAssetForgeGraphics) {
    const id = graphics.attrs.id;
    const graphicsStore = this.graphicsStore;

    // 如果图形对象已存在，以新数据为主，替换现有对象
    if (graphicsStore.has(id)) {
      this.remove(id);
    }

    if (graphics instanceof GAssetForgeCanvas) {
      this.canvasStore.set(id, graphics);
    } else if (graphics instanceof GAssetForgeFrame) {
      this.frameStore.set(id, graphics);
    }
    graphicsStore.set(id, graphics);
  }

  get(id: string) {
    return this.graphicsStore.get(id);
  }

  remove(id: string) {
    const graphics = this.graphicsStore.get(id);
    if (graphics) {
      this.graphicsStore.delete(id);

      if (graphics instanceof GAssetForgeCanvas) {
        this.canvasStore.delete(id);
      } else if (graphics instanceof GAssetForgeFrame) {
        this.frameStore.delete(id);
      }
    }
  }

  getAll() {
    const graphicsArr: GAssetForgeGraphics[] = [];
    for (const [, graphics] of this.graphicsStore) {
      if (!graphics.isDeleted()) {
        graphicsArr.push(graphics);
      }
    }
    return graphicsArr;
  }

  getCanvasItems() {
    return Array.from(this.canvasStore.values()).filter(
      (canvas) => !canvas.isDeleted(),
    );
  }

  getCanvasItemsData() {
    const canvasItems = Array.from(this.canvasStore.values()).filter(
      (canvas) => !canvas.isDeleted(),
    );

    canvasItems.sort((a, b) => {
      const aIndex = a.attrs.parentIndex?.position ?? '';
      const bIndex = b.attrs.parentIndex?.position ?? '';
      return aIndex < bIndex ? -1 : 1;
    });

    return canvasItems.map((canvas) => ({
      id: canvas.attrs.id,
      name: canvas.attrs.objectName,
    }));
  }

  getFrames() {
    const frames = Array.from(this.frameStore.values());
    return frames;
  }

  clear() {
    // TODO: modify this.changes
    this.graphicsStore.clear();
    this.canvasStore.clear();
    this.frameStore.clear();
  }
}
