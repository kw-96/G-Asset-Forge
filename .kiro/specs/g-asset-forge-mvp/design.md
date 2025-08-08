# 设计文档

## 概述

G-Asset Forge 是一个基于 Electron 的桌面应用程序，专为企业内网环境中的游戏素材创作而设计。该应用采用模块化架构，集成了基于Suika的高性能无限画布系统、H5-Editor的移动端编辑功能，以及参考Figma和Penpot设计的现代化UI界面。核心特色是无限画布设计，让用户可以在无边界的创作空间中自由设计，获得类似专业设计工具的体验。

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
│  │Infinite     │Design Tools │H5 Editor    │Asset Library│  │
│  │Canvas Engine│Manager      │Manager      │Manager      │  │
│  │(Suika)      │             │(H5-Editor)  │             │  │
│  │- Viewport   │             │             │             │  │
│  │- Spatial    │             │             │             │  │
│  │- Navigator  │             │             │             │  │
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
- **画布引擎**: Suika (高性能原生Canvas引擎，替代Fabric.js)
- **H5编辑器**: H5-Editor (Vue到React适配层)
- **状态管理**: Zustand (轻量级状态管理)
- **UI组件库**: 自定义组件系统 (基于Figma和Penpot设计语言)
- **样式系统**: Styled Components / CSS-in-JS (现代化样式管理)
- **主题系统**: 支持暗色/亮色模式切换
- **文件处理**: Node.js fs-extra (增强文件操作)
- **图片处理**: Sharp (高性能图片处理)
- **打包工具**: electron-builder (应用打包分发)

## 组件和接口设计

### 0. 开源项目集成架构

```typescript
// Suika集成接口
interface SuikaIntegration {
  // 核心编辑器
  editor: SuikaEditor;
  scene: SuikaScene;
  renderer: SuikaRenderer;
  
  // 适配层
  createReactAdapter(): SuikaReactAdapter;
  migrateFromFabric(fabricCanvas: fabric.Canvas): void;
}

// H5-Editor集成接口
interface H5EditorIntegration {
  // Vue到React适配
  vueAdapter: VueToReactAdapter;
  
  // 核心功能
  pageManager: H5PageManager;
  componentLibrary: H5ComponentLibrary;
  templateSystem: H5TemplateSystem;
  
  // 导出系统
  exportEngine: H5ExportEngine;
}

// UI设计参考系统
interface UIDesignSystem {
  // Figma风格组件
  figmaComponents: FigmaStyleComponents;
  
  // Penpot交互模式
  penpotInteractions: PenpotInteractionSystem;
  
  // 主题系统
  themeProvider: ModernThemeProvider;
  
  // 组件库
  customUILibrary: CustomUIComponentLibrary;
}
```

### 1. 无限画布引擎 (Infinite Canvas Engine - 基于Suika)

```typescript
interface SuikaInfiniteCanvasEngine {
  // Suika核心集成
  suikaEditor: SuikaEditor;
  suikaScene: SuikaScene;
  
  // 无限画布管理 (基于Suika)
  createInfiniteCanvas(options: InfiniteCanvasOptions): Promise<SuikaInfiniteCanvas>;
  destroyCanvas(canvasId: string): void;
  
  // 视口管理 (无限画布核心)
  getViewport(canvasId: string): ViewportInfo;
  setViewport(canvasId: string, viewport: ViewportInfo): void;
  panViewport(canvasId: string, deltaX: number, deltaY: number): void;
  zoomViewport(canvasId: string, scale: number, centerPoint?: Point): void;
  
  // 视图控制 (Suika原生性能)
  setZoom(canvasId: string, scale: number): void;
  panCanvas(canvasId: string, deltaX: number, deltaY: number): void;
  fitToContent(canvasId: string): void;
  fitToScreen(canvasId: string): void;
  
  // 空间索引和查询
  spatialIndex: SpatialIndex;
  queryObjectsInRegion(canvasId: string, region: Rectangle): SuikaGraph[];
  getVisibleObjects(canvasId: string): SuikaGraph[];
  
  // 对象操作 (Suika Graph系统)
  addGraph(canvasId: string, graph: SuikaGraph, position?: Point): string;
  removeGraph(canvasId: string, graphId: string): void;
  updateGraph(canvasId: string, graphId: string, properties: Partial<SuikaGraph>): void;
  
  // 渲染优化
  enableViewportCulling(canvasId: string, enabled: boolean): void;
  setRenderRegion(canvasId: string, region: Rectangle): void;
  
  // 导航和概览
  createOverviewNavigator(canvasId: string): OverviewNavigator;
  showWelcomeArea(canvasId: string, templates: CanvasTemplate[]): void;
  hideWelcomeArea(canvasId: string): void;
  
  // 事件处理 (React适配)
  on(event: SuikaEvent, callback: SuikaEventCallback): void;
  off(event: SuikaEvent, callback: SuikaEventCallback): void;
  
  // Fabric.js迁移支持
  migrateFromFabric(fabricCanvas: fabric.Canvas): Promise<void>;
}

interface InfiniteCanvasOptions {
  backgroundColor?: string;
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  enableSpatialIndex?: boolean;
  viewportCulling?: boolean;
}

interface ViewportInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

interface Point {
  x: number;
  y: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SpatialIndex {
  insert(object: SuikaGraph): void;
  remove(objectId: string): void;
  query(region: Rectangle): SuikaGraph[];
  update(objectId: string, newBounds: Rectangle): void;
}

interface OverviewNavigator {
  show(): void;
  hide(): void;
  updateThumbnail(): void;
  onViewportChange(callback: (viewport: ViewportInfo) => void): void;
}

interface CanvasTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'mobile' | 'desktop' | 'game' | 'social';
  thumbnail?: string;
}

interface InfiniteCanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group' | 'template';
  // 世界坐标系位置（无限画布中的绝对位置）
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  // 空间索引边界框
  bounds: Rectangle;
  // 层级（用于渲染顺序）
  zIndex: number;
  properties: Record<string, any>;
  
  // 无限画布特有属性
  isTemplate?: boolean; // 是否为模板对象
  templateCategory?: string;
  snapToGrid?: boolean;
  
  // 计算在当前视口中的屏幕坐标
  getScreenPosition(viewport: ViewportInfo): Point;
  // 更新空间索引
  updateSpatialIndex(): void;
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

### 3. H5编辑器管理器 (H5 Editor Manager - 基于H5-Editor)

```typescript
interface H5EditorManager {
  // H5-Editor核心集成
  h5Editor: H5EditorCore;
  vueAdapter: VueToReactAdapter;
  
  // 编辑器模式
  enterH5Mode(): void;
  exitH5Mode(): void;
  isH5Mode(): boolean;
  
  // 页面管理 (H5-Editor特性)
  createPage(options: H5PageOptions): Promise<H5Page>;
  deletePage(pageId: string): void;
  switchPage(pageId: string): void;
  getPages(): H5Page[];
  
  // 组件系统 (H5-Editor组件库)
  getComponentLibrary(): H5ComponentLibrary;
  addComponent(component: H5Component): void;
  removeComponent(componentId: string): void;
  
  // 画布设置
  setCanvasSize(width: number, height: number): void;
  setBackgroundColor(color: string): void;
  setBackgroundImage(imageUrl: string): void;
  setBackgroundGradient(gradient: GradientOptions): void;
  
  // 导出功能 (H5-Editor导出引擎)
  exportH5(options: H5ExportOptions): Promise<H5ExportResult>;
  exportImage(options: ExportOptions): Promise<Blob>;
  previewExport(options: ExportOptions): Promise<string>;
  
  // 模板系统 (H5-Editor模板)
  loadTemplate(templateId: string): Promise<void>;
  saveAsTemplate(name: string): Promise<string>;
  getTemplateLibrary(): H5Template[];
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

### 4. UI设计系统 (UI Design System - 基于Figma和Penpot)

```typescript
interface UIDesignSystem {
  // Figma风格组件
  figmaComponents: {
    toolbar: FigmaStyleToolbar;
    propertyPanel: FigmaStylePropertyPanel;
    layerPanel: FigmaStyleLayerPanel;
    colorPicker: FigmaStyleColorPicker;
    fontSelector: FigmaStyleFontSelector;
  };
  
  // Penpot交互模式
  penpotInteractions: {
    toolSwitching: PenpotToolSwitching;
    objectSelection: PenpotObjectSelection;
    contextMenus: PenpotContextMenus;
    keyboardShortcuts: PenpotKeyboardShortcuts;
  };
  
  // 现代化主题系统
  themeProvider: {
    currentTheme: 'light' | 'dark';
    switchTheme(theme: 'light' | 'dark'): void;
    getThemeColors(): ThemeColors;
    getThemeSpacing(): ThemeSpacing;
    getThemeTypography(): ThemeTypography;
  };
  
  // 自定义UI组件库
  customComponents: {
    Button: CustomButton;
    Input: CustomInput;
    Panel: CustomPanel;
    Dropdown: CustomDropdown;
    Slider: CustomSlider;
    ColorPicker: CustomColorPicker;
    FontSelector: CustomFontSelector;
  };
}

interface FigmaStyleToolbar {
  tools: ToolbarTool[];
  activeToolId: string;
  setActiveTool(toolId: string): void;
  getToolGroups(): ToolGroup[];
}

interface PenpotToolSwitching {
  switchTool(toolType: ToolType): void;
  getToolState(): ToolState;
  enableQuickSwitch(): void;
  disableQuickSwitch(): void;
}
```

### 5. 素材库管理器 (Asset Library Manager)

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
  
  // 无限画布配置
  infiniteCanvas: {
    backgroundColor: string;
    backgroundImage?: string;
    // 内容边界框（所有对象的包围盒）
    contentBounds: Rectangle;
    // 默认视口位置
    defaultViewport: ViewportInfo;
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
    // 无限画布特有设置
    viewportCulling: boolean;
    spatialIndexEnabled: boolean;
    overviewNavigatorEnabled: boolean;
    welcomeAreaEnabled: boolean;
  };
  
  // 视图状态
  viewState: {
    currentViewport: ViewportInfo;
    zoomHistory: ViewportInfo[];
    bookmarks: ViewportBookmark[];
  };
  
  // 元数据
  metadata: {
    author: string;
    tags: string[];
    category: string;
    // 统计信息
    objectCount: number;
    canvasArea: number; // 实际使用的画布面积
  };
}

interface ViewportBookmark {
  id: string;
  name: string;
  viewport: ViewportInfo;
  thumbnail?: string;
  createdAt: Date;
}

interface Layer {
  id: string;
  name: string;
  type: 'object' | 'group' | 'template';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  objects: InfiniteCanvasObject[];
  children?: Layer[]; // for group layers
  
  // 无限画布特有属性
  bounds: Rectangle; // 图层内容的边界框
  isTemplate: boolean; // 是否为模板图层
  spatiallyIndexed: boolean; // 是否参与空间索引
  
  // 图层在无限画布中的可见性管理
  isVisibleInViewport(viewport: ViewportInfo): boolean;
  getVisibleObjects(viewport: ViewportInfo): InfiniteCanvasObject[];
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
// 无限画布操作测试
describe('Infinite Canvas Operations', () => {
  test('should create infinite canvas without dimension limits', async () => {
    const canvas = await infiniteCanvasEngine.createInfiniteCanvas({
      backgroundColor: '#ffffff',
      gridEnabled: true,
      viewportCulling: true
    });
    expect(canvas.isInfinite()).toBe(true);
    expect(canvas.hasDimensionLimits()).toBe(false);
  });
  
  test('should maintain 60fps during zoom operations across wide range', async () => {
    const performanceMonitor = new PerformanceMonitor();
    performanceMonitor.start();
    
    // 测试更大的缩放范围 (10%-500%)
    for (let i = 0.1; i <= 5.0; i += 0.2) {
      await infiniteCanvasEngine.setZoom('canvas-1', i);
      await waitForFrame();
    }
    
    const avgFps = performanceMonitor.getAverageFPS();
    expect(avgFps).toBeGreaterThanOrEqual(60);
  });
  
  test('should efficiently handle viewport culling with many objects', async () => {
    const canvas = await infiniteCanvasEngine.createInfiniteCanvas({
      viewportCulling: true
    });
    
    // 创建1000个分散在大范围内的对象
    for (let i = 0; i < 1000; i++) {
      await canvas.addObject({
        type: 'shape',
        worldX: Math.random() * 10000,
        worldY: Math.random() * 10000,
        width: 100,
        height: 100
      });
    }
    
    // 设置小视口
    canvas.setViewport({ x: 0, y: 0, width: 800, height: 600, zoom: 1 });
    
    const visibleObjects = canvas.getVisibleObjects();
    const memoryUsage = process.memoryUsage().heapUsed;
    
    // 只应该渲染视口内的对象
    expect(visibleObjects.length).toBeLessThan(100);
    expect(memoryUsage).toBeLessThan(100 * 1024 * 1024); // < 100MB
  });
  
  test('should provide smooth infinite panning', async () => {
    const canvas = await infiniteCanvasEngine.createInfiniteCanvas();
    const startPosition = { x: 0, y: 0 };
    
    // 测试大范围平移
    await canvas.panViewport(10000, 10000);
    const viewport = canvas.getViewport();
    
    expect(viewport.x).toBe(10000);
    expect(viewport.y).toBe(10000);
    
    // 测试负方向平移
    await canvas.panViewport(-20000, -20000);
    const newViewport = canvas.getViewport();
    
    expect(newViewport.x).toBe(-10000);
    expect(newViewport.y).toBe(-10000);
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
interface InfiniteCanvasPerformanceMetrics {
  // 启动性能
  appStartupTime: number; // < 5秒
  infiniteCanvasInitTime: number; // < 1秒
  
  // 运行时性能
  memoryUsage: number;    // < 500MB (总体)
  canvasMemoryUsage: number; // < 100MB (画布部分)
  canvasFPS: number;      // >= 60fps
  
  // 无限画布特有性能指标
  viewportCullingEfficiency: number; // 视口裁剪效率 > 90%
  spatialIndexQueryTime: number;     // 空间索引查询 < 1ms
  objectLoadTime: number;            // 对象加载时间 < 50ms
  panSmoothness: number;             // 平移流畅度 >= 60fps
  zoomSmoothness: number;            // 缩放流畅度 >= 60fps
  
  // 大数据量性能
  maxObjectsWithoutDegradation: number; // 不降级的最大对象数 >= 1000
  largeCanvasNavigationTime: number;    // 大画布导航时间 < 200ms
  overviewThumbnailUpdateTime: number;  // 概览缩略图更新 < 100ms
  
  // 操作响应时间
  toolSwitchTime: number; // < 100ms
  objectSelectionTime: number; // < 50ms (在大量对象中)
  fileSaveTime: number;   // < 1秒
  exportTime: number;     // < 3秒
  
  // 资源使用
  cpuUsage: number;       // < 30%
  diskIORate: number;     // 监控磁盘读写
  gpuUsage: number;       // GPU使用率 (如果可用)
  
  // 用户体验指标
  firstContentfulPaint: number;    // 首次内容绘制 < 500ms
  timeToInteractive: number;       // 可交互时间 < 2秒
  navigationResponseTime: number;  // 导航响应时间 < 100ms
}
```

这个设计文档涵盖了G-Asset Forge MVP的核心架构、组件设计、数据模型、错误处理和测试策略。设计充分考虑了桌面应用的特点和企业内网环境的需求，为后续的开发实施提供了清晰的技术指导。
