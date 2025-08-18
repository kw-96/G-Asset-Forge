/**
 * 主进程核心系统统一导出
 * @description 提供主进程核心系统的统一入口
 * @author 开发团队
 */

// 导出核心类
export { Application } from './Application';
export { Lifecycle } from './Lifecycle';
export { Bootstrap } from './Bootstrap';

// 导出类型定义
export type { ApplicationConfig } from './Application';
export type { LifecycleEventHandler, QuitEventHandler } from './Lifecycle';
export type { BootstrapConfig } from './Bootstrap';