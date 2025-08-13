// H5-Editor引擎统一导出文件 - 增强版本

// 核心引擎
export { H5EditorCanvasEngine } from './h5-editor-canvas-engine';

// 核心组件
export { 
  H5Editor,
  type IH5EditorOptions,
  type IH5Page,
  type IH5Component,
  type IH5Template,
  type IH5ComponentLibraryItem,
  type IH5EditorEvents
} from './core/h5-editor';

// 管理器
export {
  H5EditorManager,
  type IH5EditorManagerOptions,
  type IH5EditorManagerEvents,
  type IH5Project
} from './core/h5-editor-manager';

// React适配器
export { 
  H5EditorCanvas, 
  H5EditorReactAdapter,
  type IH5EditorCanvasProps,
  type IH5EditorCanvasRef
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
  type IVueComponentProps,
  type IVueToReactAdapterOptions
} from './adapter/vue-to-react-adapter';

// Suika集成
export {
  SuikaH5Integration,
  type ISuikaH5IntegrationOptions,
  type IObjectMapping
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
  IBackgroundSettings, 
  IBackgroundColor, 
  IBackgroundGradient, 
  IBackgroundImage, 
  IBackgroundPreset 
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