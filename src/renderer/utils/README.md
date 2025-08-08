# React无限循环修复工具集

这个工具集提供了三个核心工具来帮助检测和防止React应用中的无限循环问题：

1. **InitializationManager** - 确保应用只初始化一次
2. **StateValidator** - 检测和防止状态更新的无限循环
3. **DebugLogger** - 提供结构化的调试日志功能

## 快速开始

### 基本导入

```typescript
import { reactLoopFixToolkit } from '@/utils/ReactLoopFix';
// 或者单独导入
import { InitializationManager, StateValidator, DebugLogger } from '@/utils';
```

### 1. 应用初始化管理

在应用的主入口点使用InitializationManager确保只初始化一次：

```typescript
// src/renderer/components/App/AppContainer.tsx
import React, { useEffect, useState } from 'react';
import { reactLoopFixToolkit } from '@/utils/ReactLoopFix';
import { useAppStore } from '@/stores/appStore';

export const AppContainer: React.FC = () => {
  const { initializeApp } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 使用工具集确保只初始化一次
        await reactLoopFixToolkit.initializeAppOnce(async () => {
          await initializeApp();
          setIsInitialized(true);
        });
      } catch (error) {
        console.error('应用初始化失败:', error);
      }
    };

    init();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  if (!isInitialized) {
    return <div>加载中...</div>;
  }

  return <MainApp />;
};
```

### 2. 状态更新验证

在自定义Hook中使用StateValidator验证状态更新：

```typescript
// src/renderer/hooks/useValidatedState.ts
import { useState, useCallback } from 'react';
import { reactLoopFixToolkit } from '@/utils/ReactLoopFix';

export function useValidatedState<T>(
  initialValue: T,
  statePath: string,
  componentName?: string
) {
  const [state, setState] = useState<T>(initialValue);

  const setValidatedState = useCallback((newValue: T | ((prev: T) => T)) => {
    const nextValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(state)
      : newValue;

    // 验证状态更新
    const shouldUpdate = reactLoopFixToolkit.validateStateUpdate(
      statePath,
      state,
      nextValue,
      componentName
    );

    if (shouldUpdate) {
      setState(nextValue);
    } else {
      console.warn(`状态更新被跳过: ${statePath}，值没有变化`);
    }
  }, [state, statePath, componentName]);

  return [state, setValidatedState] as const;
}
```

使用示例：

```typescript
// src/renderer/components/UserProfile.tsx
import React from 'react';
import { useValidatedState } from '@/hooks/useValidatedState';

export const UserProfile: React.FC = () => {
  const [userName, setUserName] = useValidatedState(
    '',
    'user.name',
    'UserProfile'
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  return (
    <input
      value={userName}
      onChange={handleNameChange}
      placeholder="用户名"
    />
  );
};
```

### 3. 组件渲染监控

使用自定义Hook监控组件渲染：

```typescript
// src/renderer/hooks/useRenderLogger.ts
import { useEffect, useRef } from 'react';
import { reactLoopFixToolkit } from '@/utils/ReactLoopFix';

export function useRenderLogger(
  componentName: string,
  props?: any,
  reason?: string
) {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    reactLoopFixToolkit.logComponentRender(
      componentName,
      renderCountRef.current,
      props,
      reason
    );
  });

  return renderCountRef.current;
}
```

使用示例：

```typescript
// src/renderer/components/Canvas/CanvasComponent.tsx
import React from 'react';
import { useRenderLogger } from '@/hooks/useRenderLogger';

interface CanvasComponentProps {
  width: number;
  height: number;
  zoom: number;
}

export const CanvasComponent: React.FC<CanvasComponentProps> = (props) => {
  const renderCount = useRenderLogger('CanvasComponent', props);

  // 如果渲染次数过多，发出警告
  if (renderCount > 10) {
    console.warn(`CanvasComponent渲染次数过多: ${renderCount}`);
  }

  return (
    <div>
      <canvas width={props.width} height={props.height} />
      <div>渲染次数: {renderCount}</div>
    </div>
  );
};
```

### 4. useEffect监控

监控useEffect的执行：

```typescript
// src/renderer/hooks/useEffectLogger.ts
import { useEffect, DependencyList } from 'react';
import { reactLoopFixToolkit } from '@/utils/ReactLoopFix';

export function useEffectLogger(
  effect: React.EffectCallback,
  deps: DependencyList,
  effectName: string,
  componentName: string
) {
  useEffect(() => {
    reactLoopFixToolkit.logEffectExecution(
      componentName,
      effectName,
      deps,
      'mount'
    );

    const cleanup = effect();

    return () => {
      reactLoopFixToolkit.logEffectExecution(
        componentName,
        effectName,
        deps,
        'cleanup'
      );
      if (cleanup) {
        cleanup();
      }
    };
  }, deps);
}
```

### 5. 无限循环检测

在开发环境中定期检测无限循环：

```typescript
// src/renderer/utils/developmentHelpers.ts
import { reactLoopFixToolkit } from '@/utils/ReactLoopFix';

export function startInfiniteLoopDetection() {
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const hasLoop = reactLoopFixToolkit.detectInfiniteLoop();
      if (hasLoop) {
        console.error('🚨 检测到潜在的无限循环！');
        
        // 生成诊断报告
        const report = reactLoopFixToolkit.generateDiagnosticReport();
        console.table(report.stateValidation);
        
        // 可选：暂停执行以便调试
        // debugger;
      }
    }, 5000); // 每5秒检测一次
  }
}
```

### 6. 诊断报告

获取完整的诊断报告：

```typescript
// src/renderer/components/DevTools/DiagnosticPanel.tsx
import React, { useState } from 'react';
import { reactLoopFixToolkit } from '@/utils/ReactLoopFix';

export const DiagnosticPanel: React.FC = () => {
  const [report, setReport] = useState<any>(null);

  const generateReport = () => {
    const diagnosticReport = reactLoopFixToolkit.generateDiagnosticReport();
    setReport(diagnosticReport);
  };

  const clearHistory = () => {
    reactLoopFixToolkit.clearAllHistory();
    setReport(null);
  };

  return (
    <div>
      <h3>React循环检测诊断</h3>
      <button onClick={generateReport}>生成报告</button>
      <button onClick={clearHistory}>清除历史</button>
      
      {report && (
        <div>
          <h4>初始化状态</h4>
          <p>已初始化: {report.initialization.isInitialized ? '是' : '否'}</p>
          <p>耗时: {report.initialization.duration}ms</p>
          
          <h4>状态验证</h4>
          <p>总更新数: {report.stateValidation.totalUpdates}</p>
          <p>可疑模式: {report.stateValidation.suspiciousPatterns}</p>
          
          <h4>日志统计</h4>
          <p>总条目: {report.logging.totalEntries}</p>
          <p>错误数: {report.logging.entriesByLevel.error}</p>
          <p>警告数: {report.logging.entriesByLevel.warn}</p>
        </div>
      )}
    </div>
  );
};
```

## 最佳实践

### 1. 在应用启动时初始化

```typescript
// src/renderer/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContainer } from './components/App/AppContainer';
import { startInfiniteLoopDetection } from './utils/developmentHelpers';

// 启动开发环境的无限循环检测
startInfiniteLoopDetection();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<AppContainer />);
```

### 2. 在关键组件中使用状态验证

对于容易出现无限循环的组件（如画布、编辑器等），使用状态验证：

```typescript
// src/renderer/components/Canvas/CanvasWorkspace.tsx
import React, { useEffect } from 'react';
import { useValidatedState } from '@/hooks/useValidatedState';
import { useRenderLogger } from '@/hooks/useRenderLogger';

export const CanvasWorkspace: React.FC = () => {
  const [canvasState, setCanvasState] = useValidatedState(
    { zoom: 1, x: 0, y: 0 },
    'canvas.viewport',
    'CanvasWorkspace'
  );
  
  const renderCount = useRenderLogger('CanvasWorkspace', canvasState);

  // 监控渲染频率
  useEffect(() => {
    if (renderCount > 20) {
      console.warn('CanvasWorkspace渲染过于频繁，可能存在无限循环');
    }
  }, [renderCount]);

  return (
    <div>
      {/* 画布内容 */}
    </div>
  );
};
```

### 3. 错误边界集成

```typescript
// src/renderer/components/ErrorBoundary.tsx
import React from 'react';
import { reactLoopFixToolkit } from '@/utils/ReactLoopFix';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误日志
    reactLoopFixToolkit.debugLogger.error(
      'react-error',
      '组件错误边界捕获到错误',
      { error: error.message, errorInfo },
      'ErrorBoundary'
    );

    // 检查是否可能是无限循环导致的错误
    const hasLoop = reactLoopFixToolkit.detectInfiniteLoop();
    if (hasLoop) {
      console.error('错误可能由无限循环引起');
      const report = reactLoopFixToolkit.generateDiagnosticReport();
      console.table(report.stateValidation);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>出现了错误</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## API参考

### InitializationManager

- `initializeOnce(initFunction)` - 确保初始化函数只执行一次
- `isInitialized` - 检查是否已初始化
- `getStats()` - 获取初始化统计信息
- `reset()` - 重置状态（主要用于测试）

### StateValidator

- `validateStateUpdate(path, prev, next, component)` - 验证状态更新
- `detectInfiniteLoop()` - 检测无限循环
- `getSuspiciousPatterns()` - 获取可疑模式列表
- `generateReport()` - 生成验证报告

### DebugLogger

- `debug/info/warn/error(category, message, data, component)` - 记录不同级别的日志
- `logComponent(name, action, details)` - 记录组件相关日志
- `logStateUpdate(path, prev, next, component)` - 记录状态更新
- `logRender(component, count, props, reason)` - 记录渲染信息
- `generateStats()` - 生成日志统计

### ReactLoopFixToolkit

- `initializeAppOnce(initFunction)` - 应用初始化
- `validateStateUpdate(path, prev, next, component)` - 状态验证
- `detectInfiniteLoop()` - 无限循环检测
- `generateDiagnosticReport()` - 生成完整诊断报告
- `clearAllHistory()` - 清除所有历史数据

## 故障排除

### 常见问题

1. **状态更新被跳过** - 检查是否传入了相同的值
2. **无限循环警告** - 检查useEffect的依赖数组
3. **渲染次数过多** - 检查是否有不必要的状态更新

### 调试技巧

1. 使用诊断报告查看整体状况
2. 查看可疑模式列表定位问题
3. 使用日志过滤功能专注特定组件
4. 在开发环境启用详细日志