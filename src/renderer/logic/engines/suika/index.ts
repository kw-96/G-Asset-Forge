/**
 * Suika引擎统一导出文件 - 高性能2D画布渲染引擎
 * @description 提供Suika引擎的所有核心组件、适配器、类型定义和工具函数的统一导出
 * @author 开发团队
 */

// 核心引擎
export { SuikaCanvasEngine } from './suika-canvas-engine';

// 核心组件 (从Suika项目直接复用)
export { SuikaEditor } from './core/editor';

// 通用工具库
export * from './common';

// 几何计算库
export * from './geo';

// 适配器
export { SuikaToolAdapter } from './adapter/tool-adapter';

// 类型定义
export * from './types';