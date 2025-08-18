/**
 * 业务服务层统一导出
 * @description 提供所有业务服务的统一入口
 * @author 开发团队
 */

import { canvasService } from './CanvasService';
import { assetService } from './AssetService';
import { projectService } from './ProjectService';
import { toolService } from './ToolService';

// 导出服务类
export { CanvasService } from './CanvasService';
export { AssetService } from './AssetService';
export { ProjectService } from './ProjectService';
export { ToolService } from './ToolService';

// 导出服务实例
export { canvasService } from './CanvasService';
export { assetService } from './AssetService';
export { projectService } from './ProjectService';
export { toolService } from './ToolService';

// 导出服务接口
export type { 
  CanvasOperationResult,
} from './CanvasService';

export type { 
  AssetOperationResult,
  AssetImportOptions,
  AssetBatchOperation,
  AssetRecommendation 
} from './AssetService';

export type { 
  ProjectOperationResult,
  ProjectCreateOptions,
  ProjectImportOptions,
  ProjectBackupOptions,
  ProjectCollaboration 
} from './ProjectService';

export type { 
  ToolUsageStats 
} from './ToolService';

/**
 * 服务健康状态接口
 */
export interface ServiceHealthStatus {
  isHealthy: boolean;
  issues: string[];
  warnings: string[];
  timestamp: string;
}

/**
 * 服务管理器类
 * @description 统一管理所有业务服务的生命周期
 */
export class ServiceManager {
  private static instance: ServiceManager | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * 获取服务管理器单例实例
   */
  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  /**
   * 初始化所有服务
   */
  public async initializeAll(): Promise<{
    success: boolean;
    results: Record<string, any>;
  }> {
    if (this.isInitialized) {
      return { success: true, results: {} };
    }

    console.info('[service-manager] 开始初始化所有服务');

    const results: Record<string, any> = {};
    let allSuccess = true;

    try {
      // 初始化画布服务
      results['canvas'] = await canvasService.initialize();

      if (!results['canvas'].success) allSuccess = false;

      // 初始化素材服务
      results['asset'] = await assetService.initialize();
      if (!results['asset'].success) allSuccess = false;

      // 初始化项目服务
      results['project'] = await projectService.initialize();
      if (!results['project'].success) allSuccess = false;

      // 初始化工具服务
      results['tool'] = await toolService.initialize();
      if (!results['tool'].success) allSuccess = false;

      this.isInitialized = allSuccess;

      console.info('[service-manager] 服务初始化完成', {
        success: allSuccess,
        canvas: results['canvas'].success,
        asset: results['asset'].success,
        project: results['project'].success,
        tool: results['tool'].success,
      });

      return { success: allSuccess, results };
    } catch (error) {
      console.error('[service-manager] 服务初始化失败:', error);
      return {
        success: false,
        results: {
          ...results,
          error: error instanceof Error ? error.message : '未知错误',
        },
      };
    }
  }

  /**
   * 销毁所有服务
   */
  public destroyAll(): {
    success: boolean;
    results: Record<string, any>;
  } {
    if (!this.isInitialized) {
      return { success: true, results: {} };
    }

    console.info('[service-manager] 开始销毁所有服务');

    const results: Record<string, any> = {};
    let allSuccess = true;

    try {
      // 销毁项目服务
      results['project'] = projectService.destroy();
      if (!results['project'].success) allSuccess = false;

      // 销毁工具服务
      results['tool'] = toolService.destroy();
      if (!results['tool'].success) allSuccess = false;

      // 销毁素材服务
      results['asset'] = assetService.destroy();
      if (!results['asset'].success) allSuccess = false;

      // 销毁画布服务
      results['canvas'] = canvasService.destroy();
      if (!results['canvas'].success) allSuccess = false;

      this.isInitialized = false;

      console.info('[service-manager] 服务销毁完成', {
        success: allSuccess,
        canvas: results['canvas'].success,
        asset: results['asset'].success,
        project: results['project'].success,
        tool: results['tool'].success,
      });

      return { success: allSuccess, results };
    } catch (error) {
      console.error('[service-manager] 服务销毁失败:', error);
      return {
        success: false,
        results: {
          ...results,
          error: error instanceof Error ? error.message : '未知错误',
        },
      };
    }
  }

  /**
   * 检查所有服务的健康状态
   */
  public checkAllHealth(): Record<string, ServiceHealthStatus> {
    const healthStatus: Record<string, ServiceHealthStatus> = {};

    try {
      // 检查画布服务
      healthStatus['canvas'] = canvasService.checkHealth();

      // 检查素材服务
      const assetHealth = assetService.checkHealth();
      healthStatus['asset'] = {
        ...assetHealth,
        timestamp: assetHealth.timestamp || new Date().toISOString()
      };

      // 检查项目服务
      const projectHealth = projectService.checkHealth();
      healthStatus['project'] = {
        ...projectHealth,
        timestamp: projectHealth.timestamp || new Date().toISOString()
      };

      // 检查工具服务
      const toolHealth = toolService.checkHealth();
      healthStatus['tool'] = {
        ...toolHealth,
        timestamp: toolHealth.timestamp || new Date().toISOString()
      };

      // 汇总健康状态
      const allHealthy = Object.values(healthStatus).every(status => status.isHealthy);
      const totalIssues = Object.values(healthStatus).reduce(
        (sum, status) => sum + status.issues.length, 0
      );
      const totalWarnings = Object.values(healthStatus).reduce(
        (sum, status) => sum + status.warnings.length, 0
      );

      console.debug('[service-manager] 服务健康检查完成', {
        allHealthy,
        totalIssues,
        totalWarnings,
      });

      return healthStatus;
    } catch (error) {
      console.error('[service-manager] 健康检查失败:', error);
      return {
        error: {
          isHealthy: false,
          issues: ['健康检查执行失败'],
          warnings: [],
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * 获取所有服务的状态
   */
  public getAllStatus() {
    return {
      isInitialized: this.isInitialized,
      services: {
        canvas: canvasService.getStatus(),
        asset: assetService.getStatus(),
        project: projectService.getStatus(),
        tool: toolService.getStatus(),
      },
      health: this.checkAllHealth(),
    };
  }

  /**
   * 重启所有服务
   */
  public async restartAll(): Promise<{
    success: boolean;
    results: Record<string, any>;
  }> {
    console.info('[service-manager] 重启所有服务');

    // 先销毁
    const destroyResults = this.destroyAll();
    
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 重新初始化
    const initResults = await this.initializeAll();

    return {
      success: destroyResults.success && initResults.success,
      results: {
        destroy: destroyResults.results,
        initialize: initResults.results,
      },
    };
  }
}

// 导出服务管理器实例
export const serviceManager = ServiceManager.getInstance();