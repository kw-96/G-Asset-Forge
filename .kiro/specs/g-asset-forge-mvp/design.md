# 设计文档

## 概述

G-Asset Forge 是一个基于 Electron 的桌面应用程序，专为企业内网环境中的游戏素材创作而设计。该应用采用模块化架构，集成了画布系统、设计工具、H5编辑器和素材库管理功能，为游戏开发团队提供完整的素材制作解决方案。

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                    │
├─────────────────────────────────────────────────────────────┤
│  File System Manager  │  Window Manager  │  Update Manager  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Electron Renderer Process                 │
├─────────────────────────────────────────────────────────────┤
│                      React Application                      │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                               │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │Canvas Engine│Design Tools │H5 Editor    │Asset Library│  │
│  │(Fabric.js)  │Manager      │Manager      │Manager      │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer                                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │Project      │Asset        │History      │Export       │  │
│  │Storage      │Storage      │Manager      │Manager      │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    File System Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Local Storage    │    Shared Network Drives               │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选择

- **桌面框架**: Electron 28+ (跨平台支持)
- **前端框架**: React 18 + TypeScript
- **画布引擎**: Fabric.js 5.x (稳定的2D画布库)
- **状态管理**: Zustand (轻量级状态管理)
- **UI组件库**: Ant Design (企业级UI组件)
- **文件处理**: Node.js fs-extra (增强文件操作)
- **图片处理**: Sharp (高性能图片处理)
- **打包工具**: electron-builder (应用打包分发)

## 组件和接口设计

### 1. 画布引擎 (Canvas Engine)

```typescript
interface CanvasEngine {
  // 画布管理
  createCanvas(options: CanvasOptions): Promise<Canvas>;
  destroyCanvas(canvasId: string): void;
  resizeCanvas(canvasId: string, width: number, height: number): void;
  
  // 视图控制
  setZoom(canvasId: string, scale: number): void;
  panCanvas(canvasId: string, deltaX: number, deltaY: number): void;
  fitToScreen(canvasId: string): void;
  
  // 对象操作
  addObject(canvasId: string, object: CanvasObject): string;
  removeObject(canvasId: string, objectId: string): void;
  updateObject(canvasId: string, objectId: string, properties: Partial<CanvasObject>): void;
  
  // 事件处理
  on(event: CanvasEvent, callback: EventCallback): void;
  off(event: CanvasEvent, callback: EventCallback): void;
}

interface CanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  preserveObjectStacking?: boolean;
}

interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  properties: Record<string, any>;
}
```

### 2. 设计工具管理器 (Design Tools Manager)

```typescript
interface DesignToolsManager {
  // 工具管理
  activateTool(toolType: ToolType): void;
  deactivateTool(): void;
  getCurrentTool(): ToolType | null;
  
  // 工具实例
  getSelectTool(): SelectTool;
  getTextTool(): TextTool;
  getImageTool(): ImageTool;
  getShapeTool(): ShapeTool;
  getBrushTool(): BrushTool;
  getCropTool(): CropTool;
}

enum ToolType {
  SELECT = 'select',
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  BRUSH = 'brush',
  CROP = 'crop'
}

interface TextTool {
  addText(content: string, options: TextOptions): Promise<string>;
  editText(objectId: string, content: string): void;
  setFontFamily(objectId: string, fontFamily: string): void;
  setFontSize(objectId: string, fontSize: number): void;
  setFontColor(objectId: string, color: string): void;
  setTextAlign(objectId: string, align: 'left' | 'center' | 'right'): void;
}

interface ImageTool {
  uploadImage(file: File): Promise<string>;
  addImageFromUrl(url: string): Promise<string>;
  resizeImage(objectId: string, width: number, height: number): void;
  cropImage(objectId: string, cropArea: CropArea): void;
  setOpacity(objectId: string, opacity: number): void;
}

interface ShapeTool {
  addShape(shapeType: ShapeType, options: ShapeOptions): Promise<string>;
  setFillColor(objectId: string, color: string): void;
  setStrokeColor(objectId: string, color: string): void;
  setStrokeWidth(objectId: string, width: number): void;
}
```

### 3. H5编辑器管理器 (H5 Editor Manager)

```typescript
interface H5EditorManager {
  // 编辑器模式
  enterH5Mode(): void;
  exitH5Mode(): void;
  isH5Mode(): boolean;
  
  // 画布设置
  setCanvasSize(width: number, height: number): void;
  setBackgroundColor(color: string): void;
  setBackgroundImage(imageUrl: string): void;
  setBackgroundGradient(gradient: GradientOptions): void;
  
  // 导出功能
  exportImage(options: ExportOptions): Promise<Blob>;
  previewExport(options: ExportOptions): Promise<string>;
  
  // 预设模板
  loadTemplate(templateId: string): Promise<void>;
  saveAsTemplate(name: string): Promise<string>;
}

interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number; // 1-100
  scale: number;   // 0.1-5.0
  transparent: boolean;
  filename?: string;
}

interface GradientOptions {
  type: 'linear' | 'radial';
  colors: Array<{color: string, position: number}>;
  angle?: number; // for linear gradient
  centerX?: number; // for radial gradient
  centerY?: number; // for radial gradient
}
```

### 4. 素材库管理器 (Asset Library Manager)

```typescript
interface AssetLibraryManager {
  // 素材分类
  getCategories(): Promise<AssetCategory[]>;
  getAssetsByCategory(categoryId: string): Promise<Asset[]>;
  
  // 素材搜索
  searchAssets(query: string, filters?: AssetFilters): Promise<Asset[]>;
  
  // 素材操作
  uploadAsset(file: File, metadata: AssetMetadata): Promise<Asset>;
  deleteAsset(assetId: string): Promise<void>;
  favoriteAsset(assetId: string): Promise<void>;
  unfavoriteAsset(assetId: string): Promise<void>;
  
  // 素材使用
  addAssetToCanvas(assetId: string, canvasId: string): Promise<string>;
  previewAsset(assetId: string): Promise<string>;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  tags: string[];
  thumbnail: string;
  fullSize: string;
  fileSize: number;
  dimensions: [number, number];
  license: 'free' | 'premium';
  uploadDate: Date;
  isFavorite: boolean;
}

interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  subcategories?: AssetCategory[];
}

interface AssetFilters {
  categories?: string[];
  tags?: string[];
  license?: 'free' | 'premium';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}
```

## 数据模型

### 项目数据模型

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  
  // 画布配置
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImage?: string;
  };
  
  // 图层数据
  layers: Layer[];
  
  // 项目设置
  settings: {
    gridEnabled: boolean;
    snapToGrid: boolean;
    gridSize: number;
    rulers: boolean;
    guides: Guide[];
  };
  
  // 元数据
  metadata: {
    author: string;
    tags: string[];
    category: string;
  };
}

interface Layer {
  id: string;
  name: string;
  type: 'object' | 'group';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  objects: CanvasObject[];
  children?: Layer[]; // for group layers
}

interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
}
```

### 历史记录数据模型

```typescript
interface HistoryManager {
  // 历史操作
  pushState(action: HistoryAction): void;
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  
  // 历史管理
  clear(): void;
  getHistorySize(): number;
  setMaxHistorySize(size: number): void;
}

interface HistoryAction {
  id: string;
  type: ActionType;
  timestamp: Date;
  description: string;
  data: {
    before: any;
    after: any;
  };
}

enum ActionType {
  ADD_OBJECT = 'add_object',
  REMOVE_OBJECT = 'remove_object',
  MODIFY_OBJECT = 'modify_object',
  MOVE_OBJECT = 'move_object',
  RESIZE_CANVAS = 'resize_canvas',
  CHANGE_BACKGROUND = 'change_background'
}
```

## 错误处理

### 错误分类和处理策略

```typescript
enum ErrorType {
  CANVAS_ERROR = 'canvas_error',
  FILE_ERROR = 'file_error',
  NETWORK_ERROR = 'network_error',
  PERMISSION_ERROR = 'permission_error',
  VALIDATION_ERROR = 'validation_error',
  SYSTEM_ERROR = 'system_error'
}

interface ErrorHandler {
  handleError(error: AppError): void;
  showUserError(message: string, type: ErrorType): void;
  logError(error: Error, context: string): void;
}

class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
  }
}

// 错误处理策略
const errorHandlingStrategies = {
  [ErrorType.CANVAS_ERROR]: {
    showToUser: true,
    logToFile: true,
    fallbackAction: 'refresh_canvas'
  },
  [ErrorType.FILE_ERROR]: {
    showToUser: true,
    logToFile: true,
    fallbackAction: 'show_file_dialog'
  },
  [ErrorType.NETWORK_ERROR]: {
    showToUser: true,
    logToFile: true,
    fallbackAction: 'retry_or_offline_mode'
  }
};
```

## 测试策略

### 测试层次结构

1. **单元测试** (Jest + React Testing Library)
   - 组件逻辑测试
   - 工具函数测试
   - 数据模型测试

2. **集成测试** (Jest + Electron Testing)
   - 画布引擎集成测试
   - 文件系统操作测试
   - 跨进程通信测试

3. **端到端测试** (Playwright)
   - 用户工作流测试
   - 导出功能测试
   - 性能基准测试

### 关键测试场景

```typescript
// 画布操作测试
describe('Canvas Operations', () => {
  test('should create canvas with specified dimensions', async () => {
    const canvas = await canvasEngine.createCanvas({
      width: 1920,
      height: 1080
    });
    expect(canvas.getWidth()).toBe(1920);
    expect(canvas.getHeight()).toBe(1080);
  });
  
  test('should maintain 60fps during zoom operations', async () => {
    const performanceMonitor = new PerformanceMonitor();
    performanceMonitor.start();
    
    for (let i = 0.5; i <= 2.0; i += 0.1) {
      await canvasEngine.setZoom('canvas-1', i);
      await waitForFrame();
    }
    
    const avgFps = performanceMonitor.getAverageFPS();
    expect(avgFps).toBeGreaterThanOrEqual(60);
  });
});

// 文件操作测试
describe('File Operations', () => {
  test('should save project to shared drive', async () => {
    const project = createTestProject();
    const result = await projectManager.saveProject(project, '/shared/projects/');
    expect(result.success).toBe(true);
    expect(fs.existsSync(result.filePath)).toBe(true);
  });
  
  test('should fallback to local storage when network drive unavailable', async () => {
    mockNetworkDriveUnavailable();
    const project = createTestProject();
    const result = await projectManager.saveProject(project, '/shared/projects/');
    expect(result.fallbackUsed).toBe(true);
    expect(result.filePath).toContain(os.homedir());
  });
});
```

### 性能测试指标

```typescript
interface PerformanceMetrics {
  // 启动性能
  appStartupTime: number; // < 5秒
  canvasInitTime: number; // < 1秒
  
  // 运行时性能
  memoryUsage: number;    // < 500MB
  canvasFPS: number;      // >= 60fps
  
  // 操作响应时间
  toolSwitchTime: number; // < 100ms
  fileSaveTime: number;   // < 1秒
  exportTime: number;     // < 3秒
  
  // 资源使用
  cpuUsage: number;       // < 30%
  diskIORate: number;     // 监控磁盘读写
}
```

这个设计文档涵盖了G-Asset Forge MVP的核心架构、组件设计、数据模型、错误处理和测试策略。设计充分考虑了桌面应用的特点和企业内网环境的需求，为后续的开发实施提供了清晰的技术指导。