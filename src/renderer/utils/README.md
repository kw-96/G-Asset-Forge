# Utils 工具目录

这个目录包含了G-Asset Forge应用中使用的各种工具函数和类，按功能分类组织。

## 📁 目录结构

utils/
├── managers/                    # 管理器类
│   └── index.ts                # 管理器统一导出
├── performance/                 # 性能监控工具
│   └── index.ts                # 性能工具统一导出
├── events/                      # 事件系统
│   └── index.ts                # 事件系统统一导出
├── DevTools.ts                  # 开发调试工具
├── EventEmitter.ts              # 基础事件发射器
├── TypedEventEmitter.ts         # 类型安全事件发射器
├── InitializationManager.ts     # 应用初始化管理器
├── UIEnhancementManager.ts      # UI增强功能管理器
├── FigmaBatchUpdateManager.ts   # 批量更新管理器
├── PerformanceMonitor.ts        # 基础性能监控器
├── FigmaPerformanceMonitor.ts   # Figma风格性能监控器
├── RadixUIPerformanceMonitor.ts # RadixUI性能监控器
├── index.ts                     # 统一导出文件
└── README.md                    # 说明文档

## 🎯 功能分类

### 管理器类 (managers/)

负责应用各个子系统的管理和协调：

- **InitializationManager** - 应用启动和初始化流程管理
- **UIEnhancementManager** - UI增强功能的统一管理
- **FigmaBatchUpdateManager** - 批量UI更新的性能优化

### 性能监控 (performance/)

提供多层次的性能监控和优化：

- **PerformanceMonitor** - 基础性能指标监控
- **FigmaPerformanceMonitor** - Figma风格的性能监控和报告
- **RadixUIPerformanceMonitor** - 专门针对RadixUI组件的性能监控

### 事件系统 (events/)

提供灵活的事件通信机制：

- **EventEmitter** - 基础事件发射器实现
- **TypedEventEmitter** - 类型安全的事件发射器

### 开发工具

- **DevTools** - 开发模式下的调试面板和工具

## 🚀 使用方式

### 基本导入

```typescript
// 导入特定工具
import { PerformanceMonitor, EventEmitter } from '@/utils';

// 导入分类工具
import { InitializationManager } from '@/utils/managers';
import { FigmaPerformanceMonitor } from '@/utils/performance';
import { TypedEventEmitter } from '@/utils/events';
```

### 管理器使用示例

```typescript
import { UIEnhancementManager } from '@/utils';

// 获取管理器实例
const uiManager = UIEnhancementManager.getInstance();

// 启用功能
uiManager.enableFeature(UIFeature.PERFORMANCE_MONITORING);

// 获取性能指标
const metrics = uiManager.getPerformanceMetrics();
```

### 性能监控示例

```typescript
import { FigmaPerformanceMonitor } from '@/utils';

// 开始监控
FigmaPerformanceMonitor.startMonitoring();

// 测量操作性能
const endMeasure = FigmaPerformanceMonitor.measureCanvasRender();
// ... 执行画布渲染操作
endMeasure();

// 获取性能报告
const report = FigmaPerformanceMonitor.generateReport();
```

### 事件系统示例

```typescript
import { TypedEventEmitter } from '@/utils';

// 定义事件类型
interface AppEvents {
  'tool-changed': { toolName: string };
  'canvas-updated': { elementCount: number };
}

// 创建类型安全的事件发射器
const appEvents = new TypedEventEmitter<AppEvents>();

// 监听事件
appEvents.on('tool-changed', (data) => {
  console.log(`工具切换到: ${data.toolName}`);
});

// 发射事件
appEvents.emit('tool-changed', { toolName: 'brush' });
```

## 🔧 开发指南

### 添加新工具

1. 在相应的分类目录下创建新文件
2. 在对应的分类index.ts中添加导出
3. 在主index.ts中添加向后兼容导出
4. 更新README文档

### 性能监控集成

```typescript
// 在组件中集成性能监控
import { RadixUIPerformanceMonitor } from '@/utils';

const MyComponent = () => {
  useEffect(() => {
    const monitor = RadixUIPerformanceMonitor.getInstance();
    monitor.startMonitoring('MyComponent');
    
    return () => {
      monitor.stopMonitoring('MyComponent');
    };
  }, []);
  
  // 组件逻辑...
};
```

### 事件通信最佳实践

```typescript
// 定义全局事件类型
interface GlobalEvents {
  'app:initialized': { timestamp: number };
  'ui:theme-changed': { theme: 'light' | 'dark' };
  'canvas:element-added': { elementId: string; type: string };
}

// 创建全局事件总线
export const globalEvents = new TypedEventEmitter<GlobalEvents>();
```

## 📊 性能考虑

### 单例模式

大多数管理器类使用单例模式，确保：

- 全局状态一致性
- 资源使用效率
- 避免重复初始化

### 懒加载

```typescript
// 推荐的懒加载模式
let performanceMonitor: PerformanceMonitor | null = null;

export const getPerformanceMonitor = () => {
  if (!performanceMonitor) {
    performanceMonitor = PerformanceMonitor.getInstance();
  }
  return performanceMonitor;
};
```

### 内存管理

```typescript
// 组件卸载时清理资源
useEffect(() => {
  const cleanup = () => {
    // 停止监控
    performanceMonitor?.stopMonitoring();
    // 移除事件监听器
    eventEmitter.removeAllListeners();
  };
  
  return cleanup;
}, []);
```

## 🧪 测试建议

### 单元测试

```typescript
// 测试管理器功能
describe('UIEnhancementManager', () => {
  it('should enable features correctly', () => {
    const manager = UIEnhancementManager.getInstance();
    manager.enableFeature(UIFeature.TOOLTIPS);
    expect(manager.isFeatureEnabled(UIFeature.TOOLTIPS)).toBe(true);
  });
});
```

### 性能测试

```typescript
// 测试性能监控
describe('PerformanceMonitor', () => {
  it('should measure operation time', () => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTiming('test-operation');
    // 模拟操作
    const duration = monitor.endTiming('test-operation');
    expect(duration).toBeGreaterThan(0);
  });
});
```

## 🔗 相关文档

- [UI增强系统文档](../components/UIIntegration/)
- [性能优化指南](../../../docs/performance.md)
- [事件系统架构](../../../docs/events.md)
- [开发工具使用](../../../docs/dev-tools.md)
