// H5Editor与Suika画布系统的集成模块
import { H5Editor, type IH5Component } from '../core/h5-editor';
import { H5EditorManager } from '../core/h5-editor-manager';

// 假设的Suika接口（实际应该从Suika引擎导入）
interface ISuikaEditor {
  addObject(object: any): void;
  removeObject(id: string): void;
  updateObject(id: string, updates: any): void;
  getObjects(): any[];
  exportAsImage(format: string, quality: number): string;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
}

export interface ISuikaH5IntegrationOptions {
  enableBidirectionalSync?: boolean;
  enableObjectMapping?: boolean;
  enableEventBridge?: boolean;
  syncInterval?: number;
  conflictResolution?: 'h5-priority' | 'suika-priority' | 'manual';
}

export interface IObjectMapping {
  h5ComponentId: string;
  suikaObjectId: string;
  type: 'text' | 'image' | 'shape' | 'group';
  lastSyncTime: Date;
  syncDirection: 'h5-to-suika' | 'suika-to-h5' | 'bidirectional';
}

/**
 * H5Editor与Suika画布系统的集成器
 * 负责两个编辑器系统之间的数据同步和协同工作
 */
export class SuikaH5Integration {
  private h5Editor: H5Editor | null = null;
  private suikaEditor: ISuikaEditor | null = null;
  private h5Manager: H5EditorManager | null = null;
  private objectMappings: Map<string, IObjectMapping> = new Map();
  private syncTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;
  private options: ISuikaH5IntegrationOptions;

  constructor(options: ISuikaH5IntegrationOptions = {}) {
    this.options = {
      enableBidirectionalSync: true,
      enableObjectMapping: true,
      enableEventBridge: true,
      syncInterval: 1000, // 1秒
      conflictResolution: 'h5-priority',
      ...options
    };
  }

  /**
   * 初始化集成
   */
  initialize(h5Editor: H5Editor, suikaEditor: ISuikaEditor, h5Manager?: H5EditorManager): void {
    if (this.isDestroyed) {
      throw new Error('SuikaH5Integration has been destroyed');
    }

    this.h5Editor = h5Editor;
    this.suikaEditor = suikaEditor;
    this.h5Manager = h5Manager || null;

    // 设置事件桥接
    if (this.options.enableEventBridge) {
      this.setupEventBridge();
    }

    // 启动同步
    if (this.options.enableBidirectionalSync) {
      this.startSync();
    }

    console.log('SuikaH5Integration initialized successfully');
  }

  /**
   * 从H5Editor同步到Suika
   */
  syncH5ToSuika(): void {
    if (!this.h5Editor || !this.suikaEditor || !this.options.enableObjectMapping) {
      return;
    }

    try {
      const currentPage = this.h5Editor.getCurrentPage();
      if (!currentPage) return;

      currentPage.components.forEach(component => {
        const mapping = this.objectMappings.get(component.id);
        
        if (mapping) {
          // 更新现有对象
          this.updateSuikaObject(component, mapping);
        } else {
          // 创建新对象
          this.createSuikaObject(component);
        }
      });

      // 清理已删除的对象
      this.cleanupDeletedObjects(currentPage.components);
    } catch (error) {
      console.error('Failed to sync H5 to Suika:', error);
    }
  }

  /**
   * 从Suika同步到H5Editor
   */
  syncSuikaToH5(): void {
    if (!this.h5Editor || !this.suikaEditor || !this.options.enableObjectMapping) {
      return;
    }

    try {
      const suikaObjects = this.suikaEditor.getObjects();
      
      suikaObjects.forEach(suikaObject => {
        const mapping = Array.from(this.objectMappings.values())
          .find(m => m.suikaObjectId === suikaObject.id);
        
        if (mapping) {
          // 更新现有组件
          this.updateH5Component(suikaObject, mapping);
        } else {
          // 创建新组件
          this.createH5Component(suikaObject);
        }
      });
    } catch (error) {
      console.error('Failed to sync Suika to H5:', error);
    }
  }

  /**
   * 双向同步
   */
  bidirectionalSync(): void {
    if (this.options.conflictResolution === 'h5-priority') {
      this.syncH5ToSuika();
    } else if (this.options.conflictResolution === 'suika-priority') {
      this.syncSuikaToH5();
    } else {
      // 手动解决冲突的逻辑
      this.handleConflicts();
    }
  }

  /**
   * 导出协同结果
   */
  async exportCombined(format: 'png' | 'jpg' = 'png', quality: number = 1): Promise<{
    h5Export: string;
    suikaExport: string;
    combined?: string;
  }> {
    const results: any = {};

    try {
      // 导出H5Editor内容
      if (this.h5Editor) {
        results.h5Export = this.h5Editor.exportAsImage(format, quality);
      }

      // 导出Suika内容
      if (this.suikaEditor) {
        results.suikaExport = this.suikaEditor.exportAsImage(format, quality);
      }

      // 如果需要，可以合并两个导出结果
      if (results.h5Export && results.suikaExport) {
        results.combined = await this.combineExports(results.h5Export, results.suikaExport);
      }

      return results;
    } catch (error) {
      console.error('Failed to export combined result:', error);
      throw error;
    }
  }

  /**
   * 切换到H5模式
   */
  async switchToH5Mode(): Promise<void> {
    if (this.h5Manager) {
      // 同步当前状态到H5
      this.syncSuikaToH5();
      
      // 切换模式
      await this.h5Manager.switchToH5Mode(
        document.createElement('div'), // 临时容器，实际应该从外部传入
        {
          containerElement: document.createElement('div'),
          width: 800,
          height: 600
        }
      );
    }
  }

  /**
   * 切换到Suika模式
   */
  async switchToSuikaMode(): Promise<void> {
    if (this.h5Manager) {
      // 同步当前状态到Suika
      this.syncH5ToSuika();
      
      // 切换模式
      await this.h5Manager.switchToSuikaMode();
    }
  }

  /**
   * 私有方法
   */
  private setupEventBridge(): void {
    if (!this.h5Editor || !this.suikaEditor) return;

    // H5Editor事件 -> Suika
    this.h5Editor.on('componentAdd', (component) => {
      this.createSuikaObject(component);
    });

    this.h5Editor.on('componentUpdate', (component) => {
      const mapping = this.objectMappings.get(component.id);
      if (mapping) {
        this.updateSuikaObject(component, mapping);
      }
    });

    this.h5Editor.on('componentRemove', (componentId) => {
      const mapping = this.objectMappings.get(componentId);
      if (mapping) {
        this.suikaEditor!.removeObject(mapping.suikaObjectId);
        this.objectMappings.delete(componentId);
      }
    });

    // Suika事件 -> H5Editor (假设Suika有类似的事件系统)
    // 实际实现需要根据Suika的API调整
  }

  private startSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.bidirectionalSync();
    }, this.options.syncInterval);
  }

  private stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private createSuikaObject(h5Component: IH5Component): void {
    if (!this.suikaEditor) return;

    try {
      const suikaObject = this.convertH5ComponentToSuikaObject(h5Component);
      this.suikaEditor.addObject(suikaObject);

      // 创建映射
      const mapping: IObjectMapping = {
        h5ComponentId: h5Component.id,
        suikaObjectId: suikaObject.id,
        type: h5Component.type as any,
        lastSyncTime: new Date(),
        syncDirection: 'h5-to-suika'
      };

      this.objectMappings.set(h5Component.id, mapping);
    } catch (error) {
      console.error('Failed to create Suika object:', error);
    }
  }

  private updateSuikaObject(h5Component: IH5Component, mapping: IObjectMapping): void {
    if (!this.suikaEditor) return;

    try {
      const updates = this.convertH5ComponentToSuikaUpdates(h5Component);
      this.suikaEditor.updateObject(mapping.suikaObjectId, updates);
      mapping.lastSyncTime = new Date();
    } catch (error) {
      console.error('Failed to update Suika object:', error);
    }
  }

  private createH5Component(suikaObject: any): void {
    if (!this.h5Editor) return;

    try {
      const h5Component = this.convertSuikaObjectToH5Component(suikaObject);
      this.h5Editor.addComponent(h5Component);

      // 创建映射
      const mapping: IObjectMapping = {
        h5ComponentId: h5Component.id,
        suikaObjectId: suikaObject.id,
        type: h5Component.type as any,
        lastSyncTime: new Date(),
        syncDirection: 'suika-to-h5'
      };

      this.objectMappings.set(h5Component.id, mapping);
    } catch (error) {
      console.error('Failed to create H5 component:', error);
    }
  }

  private updateH5Component(suikaObject: any, mapping: IObjectMapping): void {
    if (!this.h5Editor) return;

    try {
      const updates = this.convertSuikaObjectToH5Updates(suikaObject);
      this.h5Editor.updateComponent(mapping.h5ComponentId, updates);
      mapping.lastSyncTime = new Date();
    } catch (error) {
      console.error('Failed to update H5 component:', error);
    }
  }

  private cleanupDeletedObjects(currentComponents: IH5Component[]): void {
    const currentComponentIds = new Set(currentComponents.map(c => c.id));
    
    for (const [componentId, mapping] of this.objectMappings.entries()) {
      if (!currentComponentIds.has(componentId)) {
        // 组件已被删除，清理Suika对象
        if (this.suikaEditor) {
          this.suikaEditor.removeObject(mapping.suikaObjectId);
        }
        this.objectMappings.delete(componentId);
      }
    }
  }

  private handleConflicts(): void {
    // 冲突解决逻辑
    // 比较时间戳，决定使用哪个版本
    // 这里是简化实现
    console.log('Handling sync conflicts...');
  }

  private convertH5ComponentToSuikaObject(component: IH5Component): any {
    // 将H5组件转换为Suika对象格式
    return {
      id: `suika_${component.id}`,
      type: component.type,
      x: component.x,
      y: component.y,
      width: component.width,
      height: component.height,
      rotation: component.rotation || 0,
      opacity: component.opacity || 1,
      visible: component.visible !== false,
      properties: component.props
    };
  }

  private convertH5ComponentToSuikaUpdates(component: IH5Component): any {
    return {
      x: component.x,
      y: component.y,
      width: component.width,
      height: component.height,
      rotation: component.rotation || 0,
      opacity: component.opacity || 1,
      visible: component.visible !== false,
      properties: component.props
    };
  }

  private convertSuikaObjectToH5Component(suikaObject: any): IH5Component {
    // 将Suika对象转换为H5组件格式
    return {
      id: `h5_${suikaObject.id}`,
      type: suikaObject.type,
      x: suikaObject.x,
      y: suikaObject.y,
      width: suikaObject.width,
      height: suikaObject.height,
      rotation: suikaObject.rotation,
      opacity: suikaObject.opacity,
      visible: suikaObject.visible,
      props: suikaObject.properties || {}
    };
  }

  private convertSuikaObjectToH5Updates(suikaObject: any): Partial<IH5Component> {
    return {
      x: suikaObject.x,
      y: suikaObject.y,
      width: suikaObject.width,
      height: suikaObject.height,
      rotation: suikaObject.rotation,
      opacity: suikaObject.opacity,
      visible: suikaObject.visible,
      props: suikaObject.properties || {}
    };
  }

  private async combineExports(h5Export: string, _suikaExport: string): Promise<string> {
    // 合并两个导出结果的逻辑
    // 这里是简化实现，实际可能需要更复杂的图像合成
    return h5Export; // 暂时返回H5导出结果
  }

  /**
   * 获取集成状态
   */
  getIntegrationStatus(): {
    isInitialized: boolean;
    hasH5Editor: boolean;
    hasSuikaEditor: boolean;
    hasManager: boolean;
    mappingCount: number;
    syncEnabled: boolean;
    lastSyncTime: Date | null;
  } {
    return {
      isInitialized: !this.isDestroyed && !!this.h5Editor && !!this.suikaEditor,
      hasH5Editor: !!this.h5Editor,
      hasSuikaEditor: !!this.suikaEditor,
      hasManager: !!this.h5Manager,
      mappingCount: this.objectMappings.size,
      syncEnabled: !!this.syncTimer,
      lastSyncTime: this.objectMappings.size > 0 ? 
        new Date(Math.max(...Array.from(this.objectMappings.values()).map(m => m.lastSyncTime.getTime()))) :
        null
    };
  }

  /**
   * 销毁集成器
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.stopSync();
    this.objectMappings.clear();
    this.h5Editor = null;
    this.suikaEditor = null;
    this.h5Manager = null;
    this.isDestroyed = true;

    console.log('SuikaH5Integration destroyed successfully');
  }
}