/**
 * 有机体组件统一导出
 * @description 由分子和原子组件组合而成的复杂功能组件
 */

// 导航相关
export { TopToolbar } from './Navbar/TopToolbar';
export { StatusBar } from './Navbar/StatusBar';

// 面板相关
// export { LayersPanel } from './Panel/LayersPanel';
export { FigmaPropertiesPanel as PropertiesPanel } from './Panel/PropertiesPanel';

// Figma风格组件
export { FigmaInteractive } from './Figma/FigmaInteractive';
export { FigmaLoader } from './Figma/FigmaLoader';
export { FigmaNotification } from './Figma/FigmaNotification';
export { FigmaTransition } from './Figma/FigmaTransition';
export { FigmaUIIntegration as FigmaUIIntegrationProps } from './Figma/FigmaUIIntegration';
export { FigmaVirtualizedList } from './Figma/FigmaVirtualizedList';
export { FigmaThemeTransition as ThemeTransition } from './Figma/ThemeTransition';

// 重新导出类型
export type { TopToolbarProps } from './Navbar/TopToolbar';
export type { StatusBarProps } from './Navbar/StatusBar';
// export type { LayersPanelProps } from './Panel/LayersPanel';
export type { PropertiesPanelProps } from './Panel/PropertiesPanel';  
export type { FigmaInteractiveProps } from './Figma/FigmaInteractive';
export type { FigmaLoaderProps } from './Figma/FigmaLoader';
export type { FigmaNotificationProps } from './Figma/FigmaNotification';
export type { FigmaTransitionProps } from './Figma/FigmaTransition';
export type { FigmaVirtualizedListProps } from './Figma/FigmaVirtualizedList';
export type { ThemeTransitionProps as FigmaThemeTransitionProps } from './Figma/ThemeTransition';
export type { FigmaUIIntegrationState as FigmaUIIntegrationStateProps } from './Figma/FigmaUIIntegration';
export type { FigmaUIIntegrationConfig as FigmaUIIntegrationConfigProps } from './Figma/FigmaUIIntegration';