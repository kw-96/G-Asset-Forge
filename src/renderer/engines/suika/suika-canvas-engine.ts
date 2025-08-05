// Suika画布引擎适配器
import { SuikaEditor } from './core/editor';
import type { ICanvasEngine } from '../../core/canvas/canvas-manager';
import type { 
  ICanvasConfig, 
  ICanvasState, 
  ICanvasObject 
} from '../../core/canvas/canvas-types';
import { CanvasEngineType } from '../../core/canvas/canvas-manager';

export class SuikaCanvasEngine implements ICanvasEngine {
  public readonly type = CanvasEngineType.SUIKA;
  private editor: SuikaEditor | null = null;
  private container: HTMLElement | null = null;

  async initialize(container: HTMLElement, config: ICanvasConfig): Promise<void> {
    this.container = container;
    
    this.editor = new SuikaEditor({
      containerElement: container as HTMLDivElement,
      width: config.size.width,
      height: config.size.height,
      showPerfMonitor: process.env.NODE_ENV === 'development'
    });

    // 等待编辑器初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  destroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
    this.container = null;
  }

  getState(): ICanvasState {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // 从Suika编辑器获取状态并转换为统一格式
    const zoom = this.editor.zoomManager.getZoom();
    const viewport = this.editor.viewportManager.getViewport();
    
    return {
      layers: [], // TODO: 从Suika场景图获取图层信息
      selectedObjects: [], // TODO: 从Suika获取选中对象
      activeLayer: 'default',
      zoom,
      pan: { x: viewport.x, y: viewport.y }
    };
  }

  setState(state: Partial<ICanvasState>): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    if (state.zoom !== undefined) {
      this.editor.zoomManager.setZoom(state.zoom);
    }

    if (state.pan !== undefined) {
      const viewport = this.editor.viewportManager.getViewport();
      this.editor.viewportManager.setViewport({
        ...viewport,
        x: state.pan.x,
        y: state.pan.y
      });
    }
  }

  addObject(object: ICanvasObject): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // TODO: 将统一对象格式转换为Suika对象并添加到场景图
    console.log('Adding object to Suika:', object);
  }

  removeObject(id: string): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // TODO: 从Suika场景图中移除对象
    console.log('Removing object from Suika:', id);
  }

  updateObject(id: string, updates: Partial<ICanvasObject>): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // TODO: 更新Suika场景图中的对象
    console.log('Updating object in Suika:', id, updates);
  }

  selectObjects(ids: string[]): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // TODO: 在Suika中选择对象
    console.log('Selecting objects in Suika:', ids);
  }

  clearSelection(): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // TODO: 清除Suika中的选择
    
  }

  zoom(level: number): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.zoomManager.setZoom(level);
  }

  pan(x: number, y: number): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.viewportManager.pan(x, y);
  }

  render(): void {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    this.editor.render();
  }

  exportImage(format: 'png' | 'jpg', quality: number = 1): string {
    if (!this.editor) {
      throw new Error('Suika editor not initialized');
    }

    // TODO: 实现Suika的图片导出
    const canvas = this.editor.canvasElement;
    return canvas.toDataURL(`image/${format}`, quality);
  }

  // Suika特有的方法
  getSuikaEditor(): SuikaEditor | null {
    return this.editor;
  }
}