# 稳定的Radix UI组件

这个模块提供了经过优化的Radix UI组件包装器，专门解决useEffect依赖问题和无限循环问题。

## 功能特性

### 🔧 稳定性优化
- **React.memo优化**: 防止不必要的重新渲染
- **useCallback稳定化**: 稳定化回调函数引用
- **useMemo稳定化**: 稳定化复杂计算和对象引用
- **空依赖数组**: 正确使用useEffect依赖数组

### 📊 性能监控
- **渲染次数监控**: 实时监控组件渲染频率
- **渲染时间测量**: 测量组件渲染性能
- **异常检测**: 自动检测异常渲染模式
- **性能警报**: 智能性能问题提醒

### 🛡️ 错误保护
- **错误边界包装**: 每个组件都有错误边界保护
- **回调错误捕获**: 安全的回调函数执行
- **错误日志记录**: 详细的错误信息记录

## 组件列表

### StableDropdown
稳定的下拉菜单组件，解决Radix UI Dropdown的useEffect问题。

```tsx
import { StableDropdown, StableDropdownItem } from '@/ui/components/RadixUI';

function MyComponent() {
  return (
    <StableDropdown trigger={<button>打开菜单</button>}>
      <StableDropdownItem onSelect={() => console.log('选中')}>
        菜单项1
      </StableDropdownItem>
      <StableDropdownItem onSelect={() => console.log('选中')}>
        菜单项2
      </StableDropdownItem>
    </StableDropdown>
  );
}
```

### StableSwitch
稳定的开关组件，解决Radix UI Switch的useEffect问题。

```tsx
import { StableSwitch } from '@/ui/components/RadixUI';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <StableSwitch
      checked={checked}
      onCheckedChange={setChecked}
      label="启用功能"
      description="这是一个开关组件"
    />
  );
}
```

### StableSlider
稳定的滑块组件，解决Radix UI Slider的useEffect问题。

```tsx
import { StableSlider } from '@/ui/components/RadixUI';

function MyComponent() {
  const [value, setValue] = useState([50]);

  return (
    <StableSlider
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      step={1}
      label="音量"
      showValue={true}
    />
  );
}
```

## 性能监控

### 使用性能监控Hook

```tsx
import { useRadixUIPerformance } from '@/ui/components/RadixUI';

function MyComponent() {
  const { renderCount, resetMetrics, getMetrics } = useRadixUIPerformance({
    componentName: 'MyComponent',
    enabled: true,
    debugMode: process.env.NODE_ENV === 'development',
  });

  return (
    <div>
      <p>渲染次数: {renderCount}</p>
      <button onClick={resetMetrics}>重置指标</button>
    </div>
  );
}
```

### 使用异常检测Hook

```tsx
import { useRadixUIAnomalyDetection } from '@/ui/components/RadixUI';

function MyComponent() {
  const { isAnomalyDetected, currentRenderCount, resetDetection } = 
    useRadixUIAnomalyDetection('MyComponent', {
      maxRenderCount: 20,
      timeWindow: 1000,
      enabled: true,
    });

  if (isAnomalyDetected) {
    console.warn('检测到异常渲染模式');
  }

  return <div>当前渲染次数: {currentRenderCount}</div>;
}
```

## 性能监控器

### 获取性能指标

```tsx
import { radixUIPerformanceMonitor } from '@/ui/components/RadixUI';

// 获取所有组件的性能指标
const allMetrics = radixUIPerformanceMonitor.getComponentMetrics();

// 获取特定组件的性能指标
const componentMetrics = radixUIPerformanceMonitor.getComponentMetrics('StableDropdown');

// 获取性能统计
const stats = radixUIPerformanceMonitor.getPerformanceStats();
console.log('总渲染次数:', stats.totalRenders);
console.log('平均渲染时间:', stats.averageRenderTime);
console.log('问题组件数量:', stats.problemComponents);
```

### 生成性能报告

```tsx
import { radixUIPerformanceMonitor } from '@/ui/components/RadixUI';

// 生成完整的性能报告
const report = radixUIPerformanceMonitor.generatePerformanceReport();

console.log('性能摘要:', report.summary);
console.log('组件指标:', report.componentMetrics);
console.log('最近警报:', report.recentAlerts);
console.log('优化建议:', report.recommendations);
```

## 组件别名

为了方便使用，我们提供了组件别名：

```tsx
import { 
  SafeDropdown,    // = StableDropdown
  SafeSwitch,      // = StableSwitch
  SafeSlider,      // = StableSlider
} from '@/ui/components/RadixUI';
```

## 向后兼容

原始的Radix UI组件仍然可用：

```tsx
import { 
  Dropdown,       // 原始Dropdown组件
  Switch,         // 原始Switch组件
  Slider,         // 原始Slider组件
} from '@/ui/components/RadixUI';
```

## 最佳实践

### 1. 优先使用稳定版本
```tsx
// ✅ 推荐：使用稳定版本
import { StableDropdown } from '@/ui/components/RadixUI';

// ❌ 不推荐：使用原始版本（除非有特殊需求）
import { Dropdown } from '@/ui/components/RadixUI';
```

### 2. 启用性能监控
```tsx
// 在开发环境中启用性能监控
const performanceOptions = {
  componentName: 'MyDropdown',
  enabled: process.env.NODE_ENV === 'development',
  debugMode: true,
};

const { renderCount } = useRadixUIPerformance(performanceOptions);
```

### 3. 处理错误回调
```tsx
// ✅ 推荐：使用try-catch处理回调错误
const handleSelect = useCallback((event) => {
  try {
    // 你的逻辑
    onItemSelect(event);
  } catch (error) {
    console.error('菜单项选择失败:', error);
  }
}, [onItemSelect]);

<StableDropdownItem onSelect={handleSelect}>
  菜单项
</StableDropdownItem>
```

### 4. 稳定化props
```tsx
// ✅ 推荐：使用useMemo稳定化复杂props
const dropdownProps = useMemo(() => ({
  align: 'start',
  side: 'bottom',
  sideOffset: 4,
}), []);

<StableDropdown {...dropdownProps}>
  {children}
</StableDropdown>
```

## 故障排除

### 常见问题

**Q: 为什么组件仍然频繁重新渲染？**
A: 检查传递给组件的props是否每次都是新对象。使用useMemo或useCallback稳定化引用。

**Q: 如何查看组件的性能指标？**
A: 使用`radixUIPerformanceMonitor.getComponentMetrics(componentName)`获取详细指标。

**Q: 性能监控会影响生产环境性能吗？**
A: 建议只在开发环境启用详细的性能监控，生产环境可以禁用或使用轻量级监控。

### 调试技巧

1. **启用调试模式**
```tsx
const { renderCount } = useRadixUIPerformance({
  componentName: 'MyComponent',
  debugMode: true, // 启用详细日志
});
```

2. **检查性能警报**
```tsx
const alerts = radixUIPerformanceMonitor.getPerformanceAlerts('MyComponent');
alerts.forEach(alert => {
  console.warn(`性能警报: ${alert.message}`, alert.suggestions);
});
```

3. **重置性能指标**
```tsx
// 重置特定组件的指标
radixUIPerformanceMonitor.resetComponentMetrics('MyComponent');

// 重置所有指标
radixUIPerformanceMonitor.resetComponentMetrics();
```

## 技术细节

### 稳定性优化原理

1. **React.memo**: 防止props未变化时的重新渲染
2. **useCallback**: 稳定化事件处理函数
3. **useMemo**: 稳定化复杂计算结果和对象引用
4. **空依赖数组**: 确保useEffect只在挂载/卸载时执行

### 性能监控原理

1. **渲染时间测量**: 使用performance.now()精确测量
2. **异常检测**: 基于渲染频率和时间的智能检测
3. **内存管理**: 自动清理过期的性能数据
4. **警报系统**: 基于阈值的智能警报

### 错误处理原理

1. **错误边界**: 每个组件都包装在EnhancedErrorBoundary中
2. **回调保护**: 所有回调函数都有try-catch保护
3. **错误恢复**: 集成自动错误恢复机制

## 更新日志

### v1.0.0
- 初始版本发布
- 支持StableDropdown、StableSwitch、StableSlider
- 完整的性能监控系统
- 错误边界保护
- 向后兼容支持