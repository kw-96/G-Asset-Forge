# 画布引擎系统

这个目录包含了G-Asset Forge的多引擎画布系统，支持不同的渲染引擎以满足不同的使用场景。

## 目录结构

```
engines/
├── suika/                    # Suika高性能画布引擎
│   ├── core/                # 核心组件
│   │   ├── editor.ts        # 主编辑器
│   │   ├── viewport-manager.ts  # 视口管理器（支持无限画布）
│   │   ├── zoom-manager.ts  # 缩放管理器（10%-500%）
│   │   ├── scene-graph.ts   # 场景图管理器（支持空间索引）
│   │   ├── tool-manager.ts  # 工具管理器
│   │   ├── command-manager.ts   # 命令管理器
│   │   └── memory-manager.ts    # 内存管理器
│   ├── adapter/             # 适配器层
│   │   ├── react-adapter.tsx    # React适配器
│   │   └── tool-adapter.ts      # 工具适配器
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   ├── suika-canvas-engine.ts   # Suika画布引擎主类
│   └── index.ts             # 导出文件
├── h5-editor/               # H5编辑器引擎
│   ├── core/                # 核心组件
│   ├── adapter/             # 适配器层
│   ├── types/               # 类型定义
│   ├── utils/               # 工具函数
│   ├── h5-editor-canvas-engine.ts  # H5编辑器引擎主类
│   └── index.ts             # 导出文件
├── CanvasEngine.ts          # 通用画布引擎接口
├── CanvasHealthChecker.ts   # 画布健康检查器
├── CanvasInitializationChecker.ts  # 初始化检查器
├── CanvasInitializer.ts     # 画布初始化器
├── CanvasSystemValidator.ts # 系统验证器
├── SimpleCanvasValidator.ts # 简单验证器
├── MemoryManager.ts         # 内存管理器
└── index.ts                 # 主导出文件
```

## 引擎特性

### Suika引擎
- **无限画布**: 支持无边界的画布系统
- **高性能渲染**: 基于原生Canvas的60fps渲染
- **扩展缩放范围**: 支持10%-500%的缩放范围
- **智能视口裁剪**: 只渲染可见对象，提高性能
- **空间索引**: 使用四叉树加速对象查询
- **内存优化**: 智能内存管理，保持使用量在合理范围

### H5-Editor引擎
- **移动端优化**: 专为移动端设计的编辑器
- **组件系统**: 丰富的H5组件库
- **模板系统**: 预设模板和自定义模板支持
- **导出功能**: 高质量的图片和H5页面导出

## 使用方式

### 基本使用

```typescript
import { EngineFactory, EngineType } from '@/engines';

// 创建Suika引擎实例
const suikaEngine = await EngineFactory.createEngine({
  type: EngineType.SUIKA,
  width: 800,
  height: 600,
  containerElement: document.getElementById('canvas-container') as HTMLDivElement,
  showPerfMonitor: true
});

// 初始化引擎
await suikaEngine.initialize(containerElement);

// 使用无限画布功能
suikaEngine.zoom(1.5); // 缩放到150%
suikaEngine.pan(100, 50); // 平移画布
suikaEngine.fitToContent(); // 适应内容
```

### 引擎切换

```typescript
// 检查引擎可用性
const isSuikaAvailable = await EngineFactory.isEngineAvailable(EngineType.SUIKA);
const isH5Available = await EngineFactory.isEngineAvailable(EngineType.H5_EDITOR);

// 获取所有可用引擎
const availableEngines = EngineFactory.getAvailableEngines();
```

## 系统验证

在使用引擎之前，系统会自动进行验证：

```typescript
import { CanvasSystemValidator } from '@/engines';

const validation = await CanvasSystemValidator.validateSystem();
if (!validation.isReady) {
  console.error('Canvas system not ready:', validation.issues);
  console.log('Recommendations:', validation.recommendations);
}
```

## 性能监控

所有引擎都内置了性能监控功能：

```typescript
// 获取性能信息
const perfInfo = engine.getPerformanceInfo();
console.log(`FPS: ${perfInfo.fps}, Render Time: ${perfInfo.renderTime}ms`);

// 获取内存使用情况
const memoryInfo = engine.getMemoryUsage();
console.log(`Memory Usage: ${memoryInfo.used}MB / ${memoryInfo.limit}MB`);
```

## 开发指南

### 添加新引擎

1. 在engines目录下创建新的引擎目录
2. 实现ICanvasEngine接口
3. 在EngineType枚举中添加新类型
4. 在EngineFactory中添加创建逻辑
5. 更新主导出文件

### 扩展现有引擎

1. 在对应引擎的core目录下添加新功能
2. 更新引擎主类以集成新功能
3. 添加相应的类型定义
4. 更新导出文件

## 注意事项

- 所有引擎都支持TypeScript，确保类型安全
- 使用前请确保进行系统验证
- 注意内存使用，避免内存泄漏
- 在生产环境中关闭性能监控以提高性能