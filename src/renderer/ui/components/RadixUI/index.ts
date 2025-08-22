/**
 * 稳定的Radix UI组件导出
 * 提供经过优化的Radix UI组件，解决useEffect依赖问题
 */

// 稳定的组件
export { 
  StableDropdown, 
  // StableDropdownItem, 
  StableDropdownSeparator 
} from '../molecules/Dropdown/Dropdown';
export type { 
  StableDropdownProps, 
  StableDropdownItemProps 
} from '../molecules/Dropdown/Dropdown';

export { StableSwitch } from '../atoms/Switch/Switch';
export type { StableSwitchProps } from '../atoms/Switch/Switch';

export { StableSlider } from '../atoms/Slider/Slider';
export type { StableSliderProps } from '../atoms/Slider/Slider';

// 原始组件（向后兼容）
export { 
  StableDropdownSeparator as DropdownSeparator 
} from '../molecules/Dropdown/Dropdown';
export { 
  StableSwitch as Switch 
} from '../atoms/Switch/Switch';
export { 
  StableSlider as Slider 
} from '../atoms/Slider/Slider';

// 性能监控工具
export { radixUIPerformanceMonitor } from '../../../logic/utils/RadixUIPerformanceMonitor';
export type { 
  ComponentPerformanceMetrics, 
  PerformanceAlert 
} from '../../../logic/utils/RadixUIPerformanceMonitor';

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
export { StableDropdown as SafeDropdown } from '../molecules/Dropdown/Dropdown';
// export { StableDropdownItem as SafeDropdownItem } from '../molecules/Dropdown/Dropdown';
export { StableDropdownSeparator as SafeDropdownSeparator } from '../molecules/Dropdown/Dropdown';
export { StableSwitch as SafeSwitch } from '../atoms/Switch/Switch';
export { StableSlider as SafeSlider } from '../atoms/Slider/Slider';