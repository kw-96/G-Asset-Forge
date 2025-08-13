/**
 * UI组件统一导出
 * 基于Figma UI3设计系统构建的完整组件库
 */

// 基础组件
export { Button } from './Button/Button';
export type { ButtonVariant, ButtonSize } from './Button/Button';

export { IconButton } from './IconButton/IconButton';
export type { IconButtonVariant, IconButtonSize } from './IconButton/IconButton';

export { Input } from './Input/Input';
export type { InputSize, InputVariant } from './Input/Input';

export { Tooltip } from './Tooltip/Tooltip';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './Card/Card';
export type { CardVariant, CardPadding } from './Card/Card';

// 基于Figma UI3设计系统的新组件
export { Badge } from './Badge/Badge';
export type { BadgeVariant, BadgeSize } from './Badge/Badge';

export { Dropdown, DropdownItem } from './Dropdown/Dropdown';

export { ColorPicker } from './ColorPicker/ColorPicker';
export { FontPicker } from './FontPicker/FontPicker';
export { Modal, ConfirmModal } from './Modal/Modal';

export { Slider } from './Slider/Slider';

export { Switch } from './Switch/Switch';

export { Progress } from './Progress/Progress';
export type { ProgressVariant, ProgressSize } from './Progress/Progress';



// 主题切换组件
export { ThemeTransition, ThemeToggleButton, useThemeTransitionPerformance } from './ThemeTransition';

// Figma风格过渡动画组件
export { 
  FigmaTransition,
  FigmaFadeTransition,
  FigmaSlideTransition,
  FigmaScaleTransition,
  FigmaDrawerTransition,
  FigmaModalTransition,
  FigmaPanelTransition,
  FigmaDropdownTransition,
  FigmaTooltipTransition,
  FigmaNotificationTransition,
  FigmaStaggerTransition,
  FigmaPageTransition,
} from './FigmaTransition';
export type { 
  FigmaTransitionProps, 
  FigmaTransitionType, 
  FigmaTransitionDirection,
  FigmaStaggerTransitionProps,
  FigmaPageTransitionProps,
} from './FigmaTransition';

// Figma风格微交互组件
export {
  FigmaInteractive,
  FigmaButton,
  FigmaCard,
  FigmaPanel,
  FigmaTool,
  FigmaTab,
  FigmaListItem,
  FigmaIconButton,
  FigmaMenuItem,
  FigmaLongPress,
  useFigmaInteraction,
} from './FigmaInteractive';
export type {
  FigmaInteractiveProps,
  FigmaInteractiveVariant,
  FigmaLongPressProps,
} from './FigmaInteractive';

// Figma风格加载和状态动画组件
export {
  FigmaLoader,
  FigmaSpinner,
  FigmaDots,
  FigmaPulse,
  FigmaSkeleton,
  FigmaProgressLoader,
  FigmaWave,
  FigmaSkeletonText,
  FigmaLoadingState,
  FigmaStatusIndicator,
} from './FigmaLoader';
export type {
  FigmaLoaderProps,
  FigmaLoaderType,
  FigmaLoaderSize,
  FigmaSkeletonProps,
  FigmaLoadingStateProps,
  FigmaStatusIndicatorProps,
  FigmaStatusType,
} from './FigmaLoader';

// Figma风格通知系统
export {
  FigmaNotification,
  NotificationProvider,
  useNotifications,
  useNotificationManager,
  figmaNotifications,
  createNotificationManager,
} from './FigmaNotification';
export type {
  FigmaNotificationProps,
  FigmaNotificationType,
  FigmaNotificationPosition,
  FigmaNotificationAction,
} from './FigmaNotification';





// Figma风格无障碍支持组件
export {
  FigmaKeyboardNavigationProvider,
  useKeyboardNavigation,
  useShortcut,
  useKeyboardContext,
  useFocusManagement,
} from '../accessibility/FigmaKeyboardNavigation';
export type {
  FigmaShortcut,
  FigmaKeyboardNavigationConfig,
} from '../accessibility/FigmaKeyboardNavigation';

export {
  FigmaFocusManagerProvider,
  FigmaFocusIndicator,
  useFocusManager,
  useFocusTrap,
  useFocusRestore,
  useFocusable,
} from '../accessibility/FigmaFocusManager';
export type {
  FigmaFocusManagerConfig,
  FigmaFocusIndicatorProps,
  FigmaFocusVariant,
} from '../accessibility/FigmaFocusManager';

export {
  FigmaScreenReaderProvider,
  FigmaAriaLiveRegion,
  ScreenReaderOnly,
  AccessibleDescription,
  AccessibleLabel,
  useScreenReader,
  useScreenReaderAnnounce,
  useFigmaAnnounce,
  useScreenReaderStatus,
  useAriaEnhanced,
} from '../accessibility/FigmaScreenReader';
export type {
  FigmaAriaLiveRegionProps,
  FigmaAccessibilityAnnouncer,
  AriaLivePoliteness,
  AriaRelevant,
} from '../accessibility/FigmaScreenReader';

// Figma风格虚拟化列表组件
export {
  FigmaVirtualizedList,
  filterItems,
  sortItems,
  groupItems,
} from './FigmaVirtualizedList';
export type {
  FigmaVirtualizedListProps,
  VirtualizedListItem,
  VirtualizedListConfig,
} from './FigmaVirtualizedList';

// Figma UI集成组件
export {
  FigmaUIIntegration,
} from './FigmaUIIntegration';
export type {
  UIIntegrationState,
  UIIntegrationConfig,
} from './FigmaUIIntegration';

// 布局自定义组件
export {
  FigmaLayoutCustomizer,
  LayoutConfigManager,
} from '../../components/Layout/FigmaLayoutCustomizer';
export type {
  LayoutConfig,
  FigmaLayoutCustomizerProps,
} from '../../components/Layout/FigmaLayoutCustomizer';

// 性能监控和批量更新工具
export {
  unifiedPerformanceMonitor,
  useUnifiedPerformanceMonitor,
  UnifiedPerformanceMonitor,
} from '../../utils/performance/UnifiedPerformanceMonitor';
export type {
  UnifiedPerformanceMetrics,
  PerformanceReport,
  PerformanceThresholds,
} from '../../utils/performance/UnifiedPerformanceMonitor';

export {
  figmaBatchUpdateManager,
  useBatchUpdateManager,
  FigmaBatchUpdateManager,
  addCanvasUpdate,
  addUIUpdate,
  addDataUpdate,
  addAnimationUpdate,
  UpdatePriority,
} from '../../utils/FigmaBatchUpdateManager';
export type {
  UpdateTask,
  BatchUpdateConfig,
  PerformanceStats,
} from '../../utils/FigmaBatchUpdateManager';

// UI测试套件组件已移除 - 仅用于开发测试