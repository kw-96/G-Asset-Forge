/**
 * 稳定的Radix UI组件导出
 * 提供经过优化的Radix UI组件，解决useEffect依赖问题
 */

// 稳定的组件
export { 
  StableDropdown, 
  StableDropdownItem, 
  StableDropdownSeparator 
} from '../Dropdown/StableDropdown';
export type { 
  StableDropdownProps, 
  StableDropdownItemProps 
} from '../Dropdown/StableDropdown';

export { StableSwitch } from '../Switch/StableSwitch';
export type { StableSwitchProps } from '../Switch/StableSwitch';

export { StableSlider } from '../Slider/StableSlider';
export type { StableSliderProps } from '../Slider/StableSlider';

// 原始组件（向后兼容）
export { 
  Dropdown, 
  DropdownItem, 
  DropdownSeparatorComponent as DropdownSeparator 
} from '../Dropdown/Dropdown';
export { Switch } from '../Switch/Switch';
export { Slider } from '../Slider/Slider';

// 性能监控工具
export { radixUIPerformanceMonitor } from '../../../utils/RadixUIPerformanceMonitor';
export type { 
  ComponentPerformanceMetrics, 
  PerformanceAlert 
} from '../../../utils/RadixUIPerformanceMonitor';

// 性能监控Hooks
export { 
  useRadixUIPerformance, 
  useRadixUIRenderCount, 
  useRadixUIAnomalyDetection 
} from '../../../hooks/useRadixUIPerformance';
export type { 
  UseRadixUIPerformanceOptions, 
  UseRadixUIPerformanceReturn 
} from '../../../hooks/useRadixUIPerformance';

// 重新导出稳定组件作为别名（推荐使用）
export { StableDropdown as SafeDropdown } from '../Dropdown/StableDropdown';
export { StableDropdownItem as SafeDropdownItem } from '../Dropdown/StableDropdown';
export { StableDropdownSeparator as SafeDropdownSeparator } from '../Dropdown/StableDropdown';
export { StableSwitch as SafeSwitch } from '../Switch/StableSwitch';
export { StableSlider as SafeSlider } from '../Slider/StableSlider';