/**
 * H5-Editor画布引擎适配器 - 增强版本
 * @description 提供H5Editor与统一接口之间的适配层
 * @author 开发团队
 */

import { H5Editor, type H5EditorOptions } from './core/h5-editor';
import { H5EditorManager, type H5EditorManagerOptions } from './core/h5-editor-manager';
import { SuikaH5Integration } from './integration/suika-integration';
import type { CanvasEngine } from '../../core/canvas/canvas-manager';
import { 
  ElementType
} from '../../../../interfaces/types/canvas';
import type { 
  CanvasConfig, 
  CanvasState, 
  CanvasElement
} from '../../../../interfaces/types/canvas';
import { CanvasEngineType } from '../../core/canvas/canvas-manager';

export class H5EditorCanvasEngine implements CanvasEngine {
  public readonly type = CanvasEngineType.H5_EDITOR;
  private editor: H5Editor | null = null;
  private manager: H5EditorManager | null = null;
  private suikaIntegration: SuikaH5Integration | null = null;
  async initialize(container: HTMLElement, config: CanvasConfig): Promise<void> {
    try {
      // 创建管理器
      const managerOptions: H5EditorManagerOptions = {
        enableSuikaIntegration: true,
        enableAutoSave: true,
        autoSaveInterval: 30000,
        maxUndoSteps: 50,
        performanceMonitoring: true
      };
      
      this.manager = new H5EditorManager(managerOptions);

      // 创建编辑器选项
      const editorOptions: H5EditorOptions = {
        containerElement: container as HTMLDivElement,
        width: config.size.width,
        height: config.size.height,
        mode: config.size.width <= 768 ? 'mobile' : 'desktop',
        enablePreview: true,
        enableMultiPage: true,
        enableComponentLibrary: true,
        enableTemplateSystem: true
      };

      // 初始化编辑器
      this.editor = await this.manager.initializeH5Editor(container, editorOptions);

      // 创建Suika集成（如果需要）
      this.suikaIntegration = new SuikaH5Integration({
        enableBidirectionalSync: true,
        enableObjectMapping: true,
        enableEventBridge: true,
        syncInterval: 1000,
        conflictResolution: 'h5-priority'
      });

      console.log('H5EditorCanvasEngine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize H5EditorCanvasEngine:', error);
      throw error;
    }
  }

  destroy(): void {
    if (this.suikaIntegration) {
      this.suikaIntegration.destroy();
      this.suikaIntegration = null;
    }

    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }

    // 编辑器会被管理器销毁
    this.editor = null;
  }

  getState(): CanvasState {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    const currentPage = this.editor.getCurrentPage();
    
    return {
      id: 'h5-editor-canvas',
      name: 'H5 Editor Canvas',
      config: {
        size: { width: 800, height: 600 },
        width: 800,
        height: 600,
        backgroundColor: { type: 'solid', color: '#ffffff' },
        gridEnabled: false,
        gridSize: 20,
        gridColor: '#e0e0e0',
        snapToGrid: false,
        snapToObjects: false,
        showRulers: false,
        rulerUnit: 'px',
        zoomLevel: 1,
        minZoom: 0.1,
        maxZoom: 10,
        engineType: 'h5-editor',
        enableGPUAcceleration: true,
        maxTextureSize: 4096,
        targetFPS: 60
      },
      elements: currentPage ? currentPage.components.map((comp: any) => {
        const elementType = this.mapH5TypeToElementType(comp.type);
        const baseElement = {
          id: comp.id,
          name: comp.name || `Component ${comp.id}`,
          type: elementType,
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: 'normal' as any,
          transform: {
            x: comp.x || 0,
            y: comp.y || 0,
            width: comp.width || 100,
            height: comp.height || 100,
            rotation: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // 根据类型创建正确的元素
        switch (elementType) {
          case ElementType.TEXT:
            return {
              ...baseElement,
              content: comp.content || '',
              style: { fontSize: 16, fontFamily: 'Arial', color: '#000000' } as any
            } as any;
          case ElementType.IMAGE:
            return {
              ...baseElement,
              imageData: { src: comp.src || '', alt: comp.alt || '' } as any
            } as any;
          case ElementType.SHAPE:
            return {
              ...baseElement,
              shapeData: { type: 'rectangle' } as any
            } as any;
          case ElementType.GROUP:
            return {
              ...baseElement,
              children: []
            } as any;
          default:
            return {
              ...baseElement,
              shapeData: { type: 'rectangle' } as any
            } as any;
        }
      }) : [],
      selectedElementIds: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1
      },
      history: {
        canUndo: false,
        canRedo: false,
        currentIndex: 0,
        totalSteps: 0,
        maxSteps: 50
      },
      performance: {
        fps: 0,
        memoryUsage: 0,
        renderTime: 0,
        elementCount: 0,
        lastUpdate: new Date().toISOString()
      },
      isModified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  setState(state: Partial<CanvasState>): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    // H5Editor的状态管理相对简单
    // TODO: 根据需要实现状态设置
    console.log('Setting H5Editor state:', state);
  }

  addObject(object: CanvasElement): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    // 将统一对象格式转换为H5Editor组件格式
    const component = {
      id: object.id,
      type: object.type as 'text' | 'image' | 'button' | 'shape' | 'container' | 'custom',
      x: object.transform.x,
      y: object.transform.y,
      width: object.transform.width,
      height: object.transform.height,
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

  updateObject(id: string, updates: Partial<CanvasElement>): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    const componentUpdates: any = {};
    
    if (updates.transform?.x) {
      componentUpdates.x = updates.transform.x;
    }
    
    if (updates.transform?.width) {
      componentUpdates.width = updates.transform.width;
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

  getH5Manager(): H5EditorManager | null {
    return this.manager;
  }

  getSuikaIntegration(): SuikaH5Integration | null {
    return this.suikaIntegration;
  }

  setPageBackground(background: any): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    this.editor.setPageBackground(background);
  }

  createPage(name: string, options?: any): any {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.createPage(name, options);
  }

  setCurrentPage(pageId: string): void {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    this.editor.setCurrentPage(pageId);
  }

  // 增强的导出功能
  exportAsImageEnhanced(format: 'png' | 'jpg' = 'png', quality: number = 1, scale: number = 1): string {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.exportAsImage(format, quality, scale);
  }

  getExportPreview(format: 'png' | 'jpg' = 'png', quality: number = 0.8, maxSize: number = 200): string {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.getExportPreview(format, quality, maxSize);
  }

  // 模板系统
  loadTemplate(templateId: string): boolean {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.loadTemplate(templateId);
  }

  saveAsTemplate(name: string, category: string = '自定义'): any {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.saveAsTemplate(name, category);
  }

  getTemplates(): any[] {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.getTemplates();
  }

  // 组件库
  addComponentFromLibrary(libraryItemId: string, position?: { x: number; y: number }): any {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.addComponentFromLibrary(libraryItemId, position);
  }

  getComponentLibrary(): any[] {
    if (!this.editor) {
      throw new Error('H5 editor not initialized');
    }

    return this.editor.getComponentLibrary();
  }

  // 项目管理
  createNewProject(name: string, options?: any): any {
    if (!this.manager) {
      throw new Error('H5 manager not initialized');
    }

    return this.manager.createNewProject(name, options);
  }

  async loadProject(projectData: any): Promise<void> {
    if (!this.manager) {
      throw new Error('H5 manager not initialized');
    }

    await this.manager.loadProject(projectData);
  }

  async saveCurrentProject(): Promise<any> {
    if (!this.manager) {
      throw new Error('H5 manager not initialized');
    }

    return await this.manager.saveCurrentProject();
  }

  // 撤销重做
  undo(): boolean {
    if (!this.manager) {
      throw new Error('H5 manager not initialized');
    }

    return this.manager.undo();
  }

  redo(): boolean {
    if (!this.manager) {
      throw new Error('H5 manager not initialized');
    }

    return this.manager.redo();
  }

  canUndo(): boolean {
    if (!this.manager) {
      return false;
    }

    return this.manager.canUndo();
  }

  canRedo(): boolean {
    if (!this.manager) {
      return false;
    }

    return this.manager.canRedo();
  }

  // 模式切换
  async switchToSuikaMode(): Promise<void> {
    if (!this.manager) {
      throw new Error('H5 manager not initialized');
    }

    await this.manager.switchToSuikaMode();
  }

  getCurrentMode(): 'h5' | 'suika' {
    if (!this.manager) {
      return 'h5';
    }

    return this.manager.getCurrentMode();
  }

  // Suika集成
  initializeSuikaIntegration(suikaEditor: any): void {
    if (!this.suikaIntegration || !this.editor) {
      throw new Error('Integration or editor not initialized');
    }

    this.suikaIntegration.initialize(this.editor, suikaEditor, this.manager || undefined);
  }

  syncWithSuika(): void {
    if (this.suikaIntegration) {
      this.suikaIntegration.bidirectionalSync();
    }
  }

  async exportCombinedWithSuika(format: 'png' | 'jpg' = 'png', quality: number = 1): Promise<any> {
    if (!this.suikaIntegration) {
      throw new Error('Suika integration not initialized');
    }

    return await this.suikaIntegration.exportCombined(format, quality);
  }

  // 性能监控
  getPerformanceInfo(): any {
    if (!this.editor) {
      return {};
    }

    return this.editor.getPerformanceInfo();
  }

  getManagerInfo(): any {
    if (!this.manager) {
      return {};
    }

    return this.manager.getManagerInfo();
  }

  getIntegrationStatus(): any {
    if (!this.suikaIntegration) {
      return { isInitialized: false };
    }

    return this.suikaIntegration.getIntegrationStatus();
  }

  // 私有方法：将H5类型映射到ElementType
  private mapH5TypeToElementType(h5Type: string): ElementType {
    switch (h5Type) {
      case 'text':
        return ElementType.TEXT;
      case 'image':
        return ElementType.IMAGE;
      case 'button':
      case 'shape':
        return ElementType.SHAPE;
      case 'container':
        return ElementType.GROUP;
      default:
        return ElementType.SHAPE;
    }
  }
}