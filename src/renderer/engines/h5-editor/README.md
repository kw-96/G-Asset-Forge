# H5-Editor引擎集成

H5-Editor引擎是G-Asset Forge中专门用于H5页面编辑和导出的核心组件。它提供了完整的H5编辑功能，包括多页面管理、组件库、模板系统、导出功能等。

## 核心特性

### 🎨 H5编辑器核心功能
- **多页面编辑**: 支持创建、删除、切换多个H5页面
- **丰富组件库**: 内置文本、图片、按钮、形状等基础组件
- **模板系统**: 提供移动端、桌面端等预设模板
- **实时预览**: 支持编辑过程中的实时预览功能
- **高质量导出**: 支持PNG、JPG格式，质量可控制

### 🔧 管理器功能
- **项目管理**: 完整的项目创建、保存、加载功能
- **撤销重做**: 支持多步撤销重做操作
- **自动保存**: 可配置的自动保存功能
- **性能监控**: 实时监控内存使用和性能指标

### 🌉 Vue到React适配
- **组件适配**: 将Vue组件无缝集成到React环境
- **响应式数据**: 支持Vue响应式数据在React中使用
- **事件桥接**: 完整的事件系统适配

### 🔗 Suika集成
- **双向同步**: 与Suika画布系统的双向数据同步
- **对象映射**: 自动映射H5组件和Suika对象
- **模式切换**: 支持H5模式和Suika模式的无缝切换

## 快速开始

### 基础使用

```typescript
import { H5Editor } from '@h5-editor/core/h5-editor';

// 创建编辑器实例
const editor = new H5Editor({
  containerElement: document.getElementById('editor-container'),
  width: 375,
  height: 667,
  mode: 'mobile',
  enablePreview: true,
  enableMultiPage: true,
  enableComponentLibrary: true,
  enableTemplateSystem: true
});

// 添加文本组件
editor.addComponent({
  id: 'text-1',
  type: 'text',
  x: 50,
  y: 50,
  width: 200,
  height: 40,
  props: {
    text: 'Hello H5Editor!',
    fontSize: 16,
    color: '#333333'
  }
});

// 导出图片
const imageData = editor.exportAsImage('png', 0.9);
```

### 使用管理器

```typescript
import { H5EditorManager } from '@h5-editor/core/h5-editor-manager';

// 创建管理器
const manager = new H5EditorManager({
  enableAutoSave: true,
  autoSaveInterval: 30000,
  maxUndoSteps: 50
});

// 初始化编辑器
const editor = await manager.initializeH5Editor(container, {
  containerElement: container,
  width: 800,
  height: 600,
  mode: 'desktop'
});

// 创建项目
const project = manager.createNewProject('我的H5项目');

// 撤销操作
if (manager.canUndo()) {
  manager.undo();
}
```

### React组件使用

```tsx
import React, { useRef } from 'react';
import { H5EditorCanvas, type IH5EditorCanvasRef } from '@h5-editor/adapter/react-adapter';

function MyH5Editor() {
  const editorRef = useRef<IH5EditorCanvasRef>(null);

  const handleExport = () => {
    const imageData = editorRef.current?.exportAsImage('png', 0.9);
    console.log('导出成功:', imageData);
  };

  return (
    <div>
      <H5EditorCanvas
        ref={editorRef}
        width={375}
        height={667}
        mode="mobile"
        enablePreview={true}
        onReady={(editor, manager) => {
          console.log('编辑器准备就绪');
        }}
        onExportComplete={(result) => {
          console.log('导出完成:', result);
        }}
      />
      <button onClick={handleExport}>导出图片</button>
    </div>
  );
}
```

### Vue组件适配

```typescript
import { createReactFromVue } from '@h5-editor/adapter/vue-to-react-adapter';
import MyVueComponent from './MyVueComponent.vue';

// 将Vue组件转换为React组件
const ReactComponent = createReactFromVue(MyVueComponent, 'MyVueComponent');

// 在React中使用
function App() {
  return (
    <div>
      <ReactComponent someProp="value" />
    </div>
  );
}
```

## API文档

### H5Editor类

#### 构造函数
```typescript
constructor(options: IH5EditorOptions)
```

#### 主要方法
- `createPage(name: string, options?: Partial<IH5Page>): IH5Page` - 创建页面
- `addComponent(component: IH5Component): void` - 添加组件
- `exportAsImage(format: 'png' | 'jpg', quality: number, scale: number): string` - 导出图片
- `loadTemplate(templateId: string): boolean` - 加载模板
- `setPageBackground(background: IH5Page['background']): void` - 设置背景

### H5EditorManager类

#### 构造函数
```typescript
constructor(options: IH5EditorManagerOptions)
```

#### 主要方法
- `initializeH5Editor(container: HTMLElement, options: IH5EditorOptions): Promise<H5Editor>` - 初始化编辑器
- `createNewProject(name: string, options?: Partial<IH5Project>): IH5Project` - 创建项目
- `undo(): boolean` - 撤销操作
- `redo(): boolean` - 重做操作
- `switchToSuikaMode(): Promise<void>` - 切换到Suika模式

### React组件Props

#### H5EditorCanvas
```typescript
interface IH5EditorCanvasProps {
  width: number;
  height: number;
  mode?: 'mobile' | 'desktop';
  enablePreview?: boolean;
  enableMultiPage?: boolean;
  enableComponentLibrary?: boolean;
  enableTemplateSystem?: boolean;
  onReady?: (editor: H5Editor, manager: H5EditorManager) => void;
  onExportComplete?: (result: any) => void;
  // ... 更多事件回调
}
```

## 配置选项

### 编辑器选项
```typescript
interface IH5EditorOptions {
  containerElement: HTMLDivElement;
  width: number;
  height: number;
  mode?: 'mobile' | 'desktop';
  enablePreview?: boolean;
  enableMultiPage?: boolean;
  enableComponentLibrary?: boolean;
  enableTemplateSystem?: boolean;
}
```

### 管理器选项
```typescript
interface IH5EditorManagerOptions {
  enableSuikaIntegration?: boolean;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  maxUndoSteps?: number;
  performanceMonitoring?: boolean;
}
```

## 性能优化

### 内存管理
- 编辑器自动管理Canvas内存使用
- 支持大量组件的高效渲染
- 提供性能监控和警告

### 渲染优化
- 智能重绘机制，只更新变化的区域
- 支持视口裁剪，提高大画布性能
- 60fps流畅渲染目标

### 导出优化
- 支持多种质量级别和缩放比例
- 3秒内完成标准画布导出
- 文件大小警告和优化建议

## 故障排除

### 常见问题

1. **编辑器初始化失败**
   - 检查容器元素是否存在
   - 确认尺寸参数是否有效
   - 查看控制台错误信息

2. **组件渲染异常**
   - 验证组件数据格式
   - 检查props属性是否正确
   - 确认组件类型是否支持

3. **导出功能异常**
   - 检查Canvas是否正确初始化
   - 验证导出参数范围
   - 确认浏览器支持Canvas导出

### 调试工具

```typescript
// 获取性能信息
const perfInfo = editor.getPerformanceInfo();
console.log('性能信息:', perfInfo);

// 获取管理器状态
const managerInfo = manager.getManagerInfo();
console.log('管理器状态:', managerInfo);

// 运行集成测试
import { runAllTests } from '@h5-editor/test/integration-test';
runAllTests();
```

## 更新日志

### v1.0.0 (当前版本)
- ✅ 完整的H5编辑器核心功能
- ✅ 管理器和项目管理系统
- ✅ Vue到React适配层
- ✅ Suika画布系统集成
- ✅ React组件封装
- ✅ 性能监控和优化

## 贡献指南

1. Fork项目仓库
2. 创建功能分支
3. 提交代码变更
4. 运行测试确保通过
5. 提交Pull Request

## 许可证

MIT License - 详见LICENSE文件