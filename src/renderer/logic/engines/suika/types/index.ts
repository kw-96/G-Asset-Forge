/**
 * Suika引擎类型定义 - 引擎相关的类型定义
 * @description 提供Suika引擎使用的类型定义
 * @author 开发团队
 */

// 重新导出几何类型
export * from '../geo/type';

// 重新导出设置类型
export type { SettingValue } from '../core/setting';

// 引擎特定类型
export interface SuikaEngineOptions {
  showPerfMonitor?: boolean;
  userPreference?: Record<string, any>;
  enableGrid?: boolean;
  enableRuler?: boolean;
  backgroundColor?: string;
}

export interface SuikaEngineState {
  zoom: number;
  viewport: {
    x: number;
    y: number;
  };
  selectedObjects: any[];
}