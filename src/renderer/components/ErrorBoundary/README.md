# 增强错误边界组件 (EnhancedErrorBoundary)

增强错误边界组件是一个专门处理React应用中各种错误的高级组件，提供智能错误分析、自动恢复机制和友好的用户界面。

## 功能特性

### 🔍 智能错误分析
- **多种错误模式检测**: 无限循环、渲染错误、异步错误、内存泄漏等
- **错误分类系统**: React错误、JavaScript错误、网络错误、性能错误
- **置信度评估**: 基于错误特征的智能置信度计算
- **修复建议生成**: 针对不同错误类型提供具体的修复建议

### 🛠️ 智能恢复机制
- **多种恢复策略**: 页面重载、状态重置、操作重试、组件重启、安全模式
- **风险评估**: 低、中、高风险级别的恢复策略分类
- **自动恢复**: 基于错误分析的智能自动恢复
- **手动恢复**: 用户可选择的恢复方式

### 👥 用户友好界面
- **中文错误信息**: 完全本地化的错误提示
- **视觉错误指示**: 基于错误类型和严重程度的图标和颜色
- **详细错误信息**: 可展开的错误详情和调试信息
- **恢复进度提示**: 实时显示恢复操作进度

### 📊 调试支持
- **错误报告生成**: 一键下载完整的错误诊断报告
- **性能监控集成**: 与应用性能监控系统集成
- **开发模式增强**: 开发环境下的额外调试信息

## 基本使用

### 简单包装
```tsx
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary/EnhancedErrorBoundary';

function App() {
  return (
    <EnhancedErrorBoundary>
      <YourAppComponents />
    </EnhancedErrorBoundary>
  );
}
```

### 带配置的使用
```tsx
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary/EnhancedErrorBoundary';

function App() {
  const handleError = (errorInfo) => {
    console.log('错误信息:', errorInfo);
    // 发送错误到监控系统
  };

  return (
    <EnhancedErrorBoundary
      enableAutoRecovery={true}
      maxRetries={3}
      retryDelay={2000}
      showDebugInfo={process.env.NODE_ENV === 'development'}
      onError={handleError}
    >
      <YourAppComponents />
    </EnhancedErrorBoundary>
  );
}
```

### 自定义fallback UI
```tsx
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary/EnhancedErrorBoundary';

const CustomFallback = () => (
  <div>应用出现问题，请稍后重试</div>
);

function App() {
  return (
    <EnhancedErrorBoundary fallback={<CustomFallback />}>
      <YourAppComponents />
    </EnhancedErrorBoundary>
  );
}
```

## 组件属性 (Props)

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `children` | `ReactNode` | - | 要保护的子组件 |
| `fallback` | `ReactNode` | - | 自定义的错误显示组件 |
| `onError` | `(errorInfo: EnhancedErrorInfo) => void` | - | 错误发生时的回调函数 |
| `enableAutoRecovery` | `boolean` | `false` | 是否启用自动恢复 |
| `maxRetries` | `number` | `3` | 最大重试次数 |
| `retryDelay` | `number` | `2000` | 重试延迟时间(毫秒) |
| `showDebugInfo` | `boolean` | `false` | 是否显示调试信息 |
| `enableErrorReporting` | `boolean` | `false` | 是否启用错误报告 |

## 错误类型

### ErrorType 枚举
```typescript
enum ErrorType {
  INFINITE_LOOP = 'infinite_loop',      // 无限循环
  RENDER_ERROR = 'render_error',        // 渲染错误
  ASYNC_ERROR = 'async_error',          // 异步错误
  MEMORY_ERROR = 'memory_error',        // 内存错误
  NETWORK_ERROR = 'network_error',      // 网络错误
  UNKNOWN_ERROR = 'unknown_error',      // 未知错误
}
```

### ErrorSeverity 枚举
```typescript
enum ErrorSeverity {
  LOW = 'low',          // 低严重程度
  MEDIUM = 'medium',    // 中等严重程度
  HIGH = 'high',        // 高严重程度
  CRITICAL = 'critical', // 严重程度
}
```

## 错误信息结构

```typescript
interface EnhancedErrorInfo {
  type: ErrorType;                    // 错误类型
  severity: ErrorSeverity;            // 严重程度
  message: string;                    // 错误消息
  stack?: string;                     // 错误堆栈
  componentStack?: string;            // 组件堆栈
  timestamp: number;                  // 时间戳
  userAgent: string;                  // 用户代理
  url: string;                        // 当前URL
  userId?: string;                    // 用户ID
  sessionId?: string;                 // 会话ID
  additionalInfo?: Record<string, any>; // 额外信息
}
```

## 恢复策略

### 自动恢复
组件会根据错误分析结果自动选择最适合的恢复策略：

1. **低风险策略** (优先选择)
   - 组件重启
   - 状态重置
   - 操作重试

2. **中等风险策略**
   - 缓存清理
   - 安全模式

3. **高风险策略** (最后选择)
   - 页面重载

### 手动恢复
用户可以通过界面按钮手动触发恢复：

- **智能恢复**: 使用推荐的恢复策略
- **重新加载**: 强制重新加载页面
- **下载报告**: 下载详细的错误报告

## 错误分析

### 支持的错误模式
- **无限循环**: 检测useEffect依赖问题、递归调用等
- **内存泄漏**: 检测未清理的事件监听器、定时器等
- **渲染抖动**: 检测频繁的组件重新渲染
- **状态突变**: 检测直接修改state的问题
- **异步竞态**: 检测异步操作冲突
- **Hook依赖**: 检测Hook依赖数组问题

### 修复建议示例
```typescript
// 无限循环错误的修复建议
[
  '检查useEffect的依赖数组，确保不包含每次渲染都变化的值',
  '使用useCallback和useMemo稳定化函数和对象引用',
  '避免在渲染过程中直接调用setState',
  '检查是否存在组件间的循环依赖'
]
```

## 开发模式功能

在开发环境中，组件提供额外的调试功能：

### 错误详情显示
- 错误ID和时间戳
- 完整的错误堆栈信息
- 组件堆栈跟踪
- 错误分析结果
- 恢复计划详情

### 错误报告生成
```json
{
  "errorId": "error-1691234567890-abc123",
  "type": "INFINITE_LOOP",
  "severity": "HIGH",
  "message": "Maximum update depth exceeded",
  "timestamp": 1691234567890,
  "errorAnalysis": {
    "pattern": "infinite_loop",
    "confidence": 0.95,
    "suggestions": ["检查useEffect依赖数组"]
  },
  "recoveryPlan": {
    "recommendedStrategy": "reset_state",
    "autoRecoveryEnabled": true
  },
  "diagnosticReport": {
    "memoryUsage": "45MB",
    "renderCount": 156,
    "performanceMetrics": {}
  }
}
```

## 最佳实践

### 1. 合理的错误边界层次
```tsx
// 应用级错误边界
<EnhancedErrorBoundary enableAutoRecovery={true}>
  <App>
    {/* 页面级错误边界 */}
    <EnhancedErrorBoundary>
      <Router>
        <Routes>
          {/* 组件级错误边界 */}
          <Route path="/dashboard" element={
            <EnhancedErrorBoundary>
              <Dashboard />
            </EnhancedErrorBoundary>
          } />
        </Routes>
      </Router>
    </EnhancedErrorBoundary>
  </App>
</EnhancedErrorBoundary>
```

### 2. 错误监控集成
```tsx
const errorReportingService = {
  reportError: (errorInfo) => {
    // 发送到错误监控服务
    analytics.track('error_boundary_triggered', {
      errorType: errorInfo.type,
      severity: errorInfo.severity,
      userId: getCurrentUserId(),
    });
  }
};

<EnhancedErrorBoundary 
  onError={errorReportingService.reportError}
  enableErrorReporting={true}
>
  <App />
</EnhancedErrorBoundary>
```

### 3. 环境特定配置
```tsx
const isDevelopment = process.env.NODE_ENV === 'development';

<EnhancedErrorBoundary
  enableAutoRecovery={!isDevelopment} // 开发环境禁用自动恢复
  showDebugInfo={isDevelopment}       // 开发环境显示调试信息
  maxRetries={isDevelopment ? 1 : 3}  // 开发环境减少重试次数
>
  <App />
</EnhancedErrorBoundary>
```

## 性能考虑

### 内存使用
- 错误历史记录自动清理
- 大型错误报告的延迟生成
- 组件卸载时的资源清理

### 渲染性能
- 错误状态下的最小化渲染
- 样式组件的优化
- 避免不必要的重新渲染

## 故障排除

### 常见问题

**Q: 为什么自动恢复没有触发？**
A: 检查错误分析的置信度是否大于0.7，且错误被标记为可恢复。

**Q: 如何自定义错误分析逻辑？**
A: 可以扩展ErrorAnalyzer类或提供自定义的错误分析函数。

**Q: 错误边界不能捕获某些错误？**
A: 错误边界无法捕获事件处理器、异步代码、服务端渲染和错误边界自身的错误。

### 调试技巧

1. **启用详细日志**
```tsx
<EnhancedErrorBoundary showDebugInfo={true}>
```

2. **检查错误分析结果**
```tsx
const handleError = (errorInfo) => {
  console.log('错误分析:', errorInfo.additionalInfo.errorAnalysis);
};
```

3. **监控恢复成功率**
```tsx
// 在生产环境中监控恢复统计
const stats = errorRecoveryManager.getRecoveryStats();
console.log('恢复成功率:', stats.successRate);
```

## 相关组件

- `ErrorAnalyzer`: 错误分析工具
- `ErrorRecoveryManager`: 错误恢复管理器
- `ReactLoopFix`: React无限循环修复工具包

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的错误捕获和显示
- 实现智能错误分析
- 添加自动恢复机制
- 提供友好的中文界面