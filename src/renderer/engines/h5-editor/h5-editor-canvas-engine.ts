// H5-Editor画布引擎适配器
import { H5Editor } from './core/h5-editor';
import type { ICanvasEngine } from '../../core/canvas/canvas-manager';
import type { 
  ICanvasConfig, 
  ICanvasState, 
  ICanvasObject 
} from '../../core/canvas/canvas-types';
import { CanvasEngineType } from '../../core/canvas/canvas-manager';

export class H5EditorCanvasEngine implements ICanvasEngine {
  public readonly type = CanvasEngineType.H5_EDITOR;
  private editor: H5Editor | null = null;
  private container: HTMLElement | null = null;

  async initialize(container: HTMLElement, config: ICanvasConfig): Promise<void> {
    this.container = container;
    
    this.editor = new H5Editor({
      containerElement: container as HTMLDivElement,
      width: config.size.width,
      height: config.size.height,
      mode: 'mobile'
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
      throw new Error('H5 editor not initialized');
    }

    const currentPage = this.editor.getCurrentPage();
    
    return {
      layers: currentPage ? [{
        id: 'default',
        name: 'Default Layer',
        visible: true,
        locked: false,
        opacity: 1,
        objects: currentPage.components.map(comp => ({
          id: comp.id,
          type: comp.type,
          position: { x: comp.x, y: comp.y },
          size: { width: comp.width, height: comp.height },
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: 0
        }))
      }] : [],
      selectedObjects: [],
      activeLayer: 'default',
      zoom: 1,
      pan: { x: 0, y: 0 }
    };
  }

  setState(state: Partial<ICanvasState>): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    // H5Editor的状态管理相对简单
    // TODO: 根据需要实现状态设置
    console.log('Setting H5Editor state:', state);
  }

  addObject(object: ICanvasObject): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    // 将统一对象格式转换为H5Editor组件格式
    const component = {
      id: object.id,
      type: object.type,
      x: object.position.x,
      y: object.position.y,
      width: object.size.width,
      height: object.size.height,
      props: {}
    };

    this.editor.addComponent(component);
  }

  removeObject(id: string): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    this.editor.removeComponent(id);
  }

  updateObject(id: string, updates: Partial<ICanvasObject>): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    const componentUpdates: any = {};
    
    if (updates.position) {
      componentUpdates.x = updates.position.x;
      componentUpdates.y = updates.position.y;
    }
    
    if (updates.size) {
      componentUpdates.width = updates.size.width;
      componentUpdates.height = updates.size.height;
    }

    this.editor.updateComponent(id, componentUpdates);
  }

  selectObjects(ids: string[]): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    // TODO: H5Editor的选择逻辑
    console.log('Selecting objects in H5Editor:', ids);
  }

  clearSelection(): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    // TODO: 清除H5Editor中的选择
    console.log('Clearing selection in H5Editor');
  }

  zoom(level: number): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    // H5Editor可能不支持缩放，或需要特殊处理
    console.log('Zooming H5Editor to:', level);
  }

  pan(x: number, y: number): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    // H5Editor可能不支持平移，或需要特殊处理
    console.log('Panning H5Editor to:', x, y);
  }

  render(): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    this.editor.render();
  }

  exportImage(format: 'png' | 'jpg', quality: number = 1): string {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.exportAsImage(format, quality);
  }

  // H5Editor特有的方法
  getH5Editor(): H5Editor | null {
    return this.editor;
  }

  setPageBackground(background: any): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    this.editor.setPageBackground(background);
  }

  createPage(name: string): any {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.createPage(name);
  }

  setCurrentPage(pageId: string): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    this.editor.setCurrentPage(pageId);
  }
}