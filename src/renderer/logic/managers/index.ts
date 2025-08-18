/**
 * 业务管理器统一导出 - 管理器系统集合
 * @description 导出所有业务管理器和相关类型定义
 * @author 开发团队
 */

import { canvasManager, CanvasManager } from './canvas/CanvasManager';
import { viewportManager, ViewportManager } from './canvas/ViewportManager';
import { toolManager, ToolManager } from './tools';
import { assetManager, AssetManager } from './assets/AssetManager';
import { projectManager, ProjectManager } from './project/ProjectManager';

// 画布管理器
export { CanvasManager, canvasManager } from './canvas/CanvasManager';
export { ViewportManager, viewportManager } from './canvas/ViewportManager';
export type { 
  CanvasEvent, 
  CanvasEventListener, 
  CanvasConfig
} from './canvas/CanvasManager';

export type { 
  ViewportBounds,
  ViewportState,
  ZoomOptions,
  FitOptions
} from './canvas/ViewportManager';

// 工具管理器
export * from './tools';

// 素材管理器
export { AssetManager, assetManager } from './assets/AssetManager';
export type { 
  AssetEvent, 
  AssetEventListener, 
  SearchResult,
  AssetStats
} from './assets/AssetManager';

// 项目管理器
export { ProjectManager, projectManager } from './project/ProjectManager';
export type { 
  ProjectEvent, 
  ProjectEventListener, 
  ProjectValidationResult
} from './project/ProjectManager';

/**
 * 管理器集合接口
 * @description 提供所有管理器实例的统一访问
 */
export interface Managers {
  canvas: CanvasManager;
  viewport: ViewportManager;
  tool: ToolManager;
  asset: AssetManager;
  project: ProjectManager;
}

/**
 * 获取所有管理器实例
 * @description 提供所有管理器的统一访问点
 */
export const getManagers = (): Managers => ({
  canvas: canvasManager,
  viewport: viewportManager,
  tool: toolManager,
  asset: assetManager,
  project: projectManager,
});

/**
 * 初始化所有管理器
 * @description 统一初始化所有业务管理器
 */
export const initializeManagers = async (): Promise<void> => {
  console.info('[managers] 开始初始化所有业务管理器');
  
  try {
    // 按依赖顺序初始化管理器
    await canvasManager.initialize();
    toolManager.initialize();
    await assetManager.initialize();
    await projectManager.initialize();
    
    console.info('[managers] 所有业务管理器初始化完成');
    
  } catch (error) {
    console.error('[managers] 业务管理器初始化失败:', error);
    throw error;
  }
};

/**
 * 销毁所有管理器
 * @description 统一销毁所有业务管理器
 */
export const destroyManagers = (): void => {
  console.info('[managers] 销毁所有业务管理器');
  
  try {
    // 按相反顺序销毁管理器
    projectManager.destroy();
    assetManager.destroy();
    toolManager.destroy();
    canvasManager.destroy();
    
    console.info('[managers] 所有业务管理器销毁完成');
    
  } catch (error) {
    console.error('[managers] 业务管理器销毁失败:', error);
  }
};

/**
 * 获取所有管理器的状态
 * @description 收集所有管理器的状态信息
 */
export const getManagersStatus = () => {
  try {
    return {
      canvas: canvasManager.getStatus(),
      viewport: viewportManager.getStatus(),
      tool: toolManager.getStatus(),
      asset: assetManager.getStatus(),
      project: projectManager.getStatus(),
    };
    
  } catch (error) {
    console.error('[managers] 获取管理器状态失败:', error);
    return null;
  }
};

/**
 * 管理器健康检查
 * @description 检查所有管理器的健康状态
 */
export const checkManagersHealth = () => {
  const issues: string[] = [];
  
  try {
    const status = getManagersStatus();
    
    if (!status) {
      issues.push('无法获取管理器状态');
      return { isHealthy: false, issues };
    }
    
    // 检查画布管理器
    if (!status.canvas.isInitialized) {
      issues.push('画布管理器未初始化');
    }
    
    // 检查工具管理器
    if (!status.tool.isInitialized) {
      issues.push('工具管理器未初始化');
    }
    
    if (status.tool.enabledToolsCount === 0) {
      issues.push('没有可用的工具');
    }
    
    // 检查素材管理器
    if (!status.asset.isInitialized) {
      issues.push('素材管理器未初始化');
    }
    
    if (status.asset.isLoading && Date.now() - (status.asset as any).loadingStartTime > 30000) {
      issues.push('素材加载超时');
    }
    
    // 检查项目管理器
    if (!status.project.isInitialized) {
      issues.push('项目管理器未初始化');
    }
    
    if (status.project.hasCurrentProject && status.project.projectStatus === 'error') {
      issues.push('当前项目处于错误状态');
    }
    
    return {
      isHealthy: issues.length === 0,
      issues,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    return {
      isHealthy: false,
      issues: [`管理器健康检查失败: ${error instanceof Error ? error.message : '未知错误'}`],
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * 管理器事件总线
 * @description 提供跨管理器的事件通信机制
 */
export class ManagerEventBus {
  private static instance: ManagerEventBus | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();

  private constructor() {}

  public static getInstance(): ManagerEventBus {
    if (!ManagerEventBus.instance) {
      ManagerEventBus.instance = new ManagerEventBus();
    }
    return ManagerEventBus.instance;
  }

  public on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  public off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  public emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[manager-event-bus] 事件监听器执行失败: ${event}`, error);
        }
      });
    }
  }

  public clear(): void {
    this.eventListeners.clear();
  }
}

// 导出事件总线实例
export const managerEventBus = ManagerEventBus.getInstance();