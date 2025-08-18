/**
 * API接口统一导出
 * @description 提供所有API接口的统一入口
 * @author 开发团队
 */

// 导出基础API类型
export * from './base';

// 导出画布API
export * from './canvas';

// 导出项目API
export * from './project';

// 导出素材API
export * from './asset';

// 导入主要接口类型用于UnifiedAPI
import type { CanvasAPI } from './canvas';
import type { ProjectAPI } from './project';
import type { AssetAPI } from './asset';

/**
 * 统一API接口
 */
export interface UnifiedAPI {
  canvas: CanvasAPI;
  project: ProjectAPI;
  asset: AssetAPI;
}

/**
 * API客户端配置接口
 */
export interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  version?: string;
  enableLogging?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

/**
 * API客户端接口
 */
export interface APIClient extends UnifiedAPI {
  config: APIClientConfig;
  
  /**
   * 设置认证令牌
   */
  setAuthToken(token: string): void;
  
  /**
   * 清除认证令牌
   */
  clearAuthToken(): void;
  
  /**
   * 获取健康状态
   */
  getHealth(): Promise<import('./base').APIResponse<import('./base').HealthCheckResponse>>;
  
  /**
   * 刷新配置
   */
  refreshConfig(config: Partial<APIClientConfig>): void;
}