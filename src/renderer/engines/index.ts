// 引擎统一导出文件

// 核心引擎导出
// 避免名称冲突，使用显式导出
export { 
  SuikaEditor, 
  SuikaCanvasEngine,
  ViewportManager,
  ZoomManager,
  SceneGraph,
  ToolManager,
  CommandManager,
  SuikaMemoryManager,
  SuikaCanvas,
  SuikaToolAdapter
} from './suika';

// 单独导出预设
export { GAME_ASSET_PRESETS } from './suika/suika-canvas-engine';

export * from './h5-editor';

// 系统工具导出
export { CanvasEngine } from './CanvasEngine';
export { CanvasHealthChecker } from './CanvasHealthChecker';
export { CanvasInitializationChecker } from './CanvasInitializationChecker';
export { CanvasInitializer } from './CanvasInitializer';
export { CanvasSystemValidator } from './CanvasSystemValidator';
export { SimpleCanvasValidator } from './SimpleCanvasValidator';
export { MemoryManager } from './MemoryManager';

// 解决 EventEmitter 冲突 - 显式导出 suika 的 EventEmitter
export { EventEmitter as SuikaEventEmitter } from './suika/utils/event-emitter';

// 引擎类型枚举
export enum EngineType {
  SUIKA = 'suika',
  H5_EDITOR = 'h5-editor'
}

// 引擎配置接口
export interface IEngineConfig {
  type: EngineType;
  width: number;
  height: number;
  containerElement: HTMLDivElement;
  showPerfMonitor?: boolean;
  userPreference?: Record<string, any>;
  enableGrid?: boolean;
  enableRuler?: boolean;
  backgroundColor?: string;
}

// 引擎工厂类
export class EngineFactory {
  /**
   * 创建引擎实例
   */
  static async createEngine(config: IEngineConfig) {
    // 首先进行系统验证
    const { CanvasSystemValidator } = await import('./CanvasSystemValidator');
    const validationResult = await CanvasSystemValidator.validateSystem();
    if (!validationResult.isReady) {
      throw new Error(`Canvas system not ready: ${validationResult.issues.join(', ')}`);
    }

    switch (config.type) {
      case EngineType.SUIKA:
        // 动态导入Suika引擎
        const { SuikaCanvasEngine } = await import('./suika');
        return new SuikaCanvasEngine({
          showPerfMonitor: config.showPerfMonitor ?? false,
          userPreference: config.userPreference ?? {},
          enableGrid: config.enableGrid ?? true,
          enableRuler: config.enableRuler ?? true,
          backgroundColor: config.backgroundColor ?? '#ffffff'
        });
      
      case EngineType.H5_EDITOR:
        // 动态导入H5-Editor引擎
        const { H5EditorCanvasEngine } = await import('./h5-editor');
        return new H5EditorCanvasEngine();
      
      default:
        throw new Error(`Unsupported engine type: ${config.type}`);
    }
  }

  /**
   * 获取可用的引擎类型
   */
  static getAvailableEngines(): EngineType[] {
    return Object.values(EngineType);
  }

  /**
   * 检查引擎是否可用
   */
  static async isEngineAvailable(type: EngineType): Promise<boolean> {
    try {
      switch (type) {
        case EngineType.SUIKA:
          await import('./suika');
          return true;
        case EngineType.H5_EDITOR:
          await import('./h5-editor');
          return true;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}