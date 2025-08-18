/**
 * H5-Editor引擎统一导出文件 - 移动端页面编辑引擎
 * @description 提供H5编辑器的完整功能，包括页面管理、组件系统、Vue到React适配、导出功能等
 * @author 开发团队
 */

// 核心引擎
export { H5EditorCanvasEngine } from './h5-editor-canvas-engine';

// 核心组件
export { 
  H5Editor,
  type H5EditorOptions,
  type H5Page,
  type H5Component,
  type H5Template,
  type H5ComponentLibraryItem,
  type H5EditorEvents
} from './core/h5-editor';

// 管理器
export {
  H5EditorManager,
  type H5EditorManagerOptions,
  type H5EditorManagerEvents,
  type H5Project
} from './core/h5-editor-manager';

// React适配器
export { 
  H5EditorCanvas, 
  H5EditorReactAdapter,
  type H5EditorCanvasProps,
  type H5EditorCanvasRef
} from './adapter/react-adapter';

// Vue到React适配器
export {
  VueToReactAdapter,
  VueComponentWrapper,
  VueReactivityAdapter,
  globalVueToReactAdapter,
  globalReactivityAdapter,
  createReactFromVue,
  createReactComponentsFromVue,
  type VueComponentProps,
  type VueToReactAdapterOptions
} from './adapter/vue-to-react-adapter';

// Suika集成
export {
  SuikaH5Integration,
  type SuikaH5IntegrationOptions,
  type ObjectMapping
} from './integration/suika-integration';

// 类型定义
export * from './types';

// 工具函数
export * from './utils/event-emitter';

// H5编辑器模式组件
export { H5EditorModePanel } from './components/H5EditorModePanel';

// 背景设置功能
export { BackgroundManager } from './background/BackgroundManager';
export { BackgroundSettingsPanel } from './components/BackgroundSettingsPanel';
export type { 
  BackgroundSettings, 
  BackgroundColor, 
  BackgroundGradient, 
  BackgroundImage, 
  BackgroundPreset 
} from './background/BackgroundManager';

// 测试工具（移除测试导出以避免构建错误）

// 便捷导出对象 - 暂时注释掉以避免构建错误
// export const H5EditorEngine = {
//   H5Editor,
//   H5EditorManager,
//   H5EditorCanvas,
//   VueToReactAdapter,
//   SuikaH5Integration,
//   createReactFromVue
// } as const;