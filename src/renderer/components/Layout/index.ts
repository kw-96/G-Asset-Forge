// 布局系统核心组件
export { MainLayout } from './MainLayout';
export { TopToolbar } from './TopToolbar';
export { LeftToolPanel } from './LeftToolPanel';
export { StatusBar } from './StatusBar';

// Figma风格组件
export { FigmaToolbar } from './FigmaToolbar';
export { FigmaLayersPanel } from './FigmaLayersPanel';

// 布局配置和自定义组件
export { FigmaLayoutCustomizer } from './FigmaLayoutCustomizer';
export { LayoutConfigManagerComponent } from './LayoutConfigManager';
export { LayoutPreview } from './LayoutPreview';

// 布局配置管理器类和类型
export { LayoutConfigManager } from './FigmaLayoutCustomizer';
export type { 
  LayoutConfig, 
  ExtendedLayoutConfig, 
  FigmaLayoutCustomizerProps 
} from './FigmaLayoutCustomizer';