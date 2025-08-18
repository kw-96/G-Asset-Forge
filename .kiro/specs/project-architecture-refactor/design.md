# 设计文档

## 概述

G-Asset Forge 项目架构重构设计基于当前项目的实际代码结构，旨在建立清晰、模块化、可维护的目录架构。通过分析现有的Electron + React + TypeScript技术栈，以及Suika引擎、H5-Editor引擎、Zustand状态管理等核心组件，重新组织代码为UI界面层、前端逻辑层、服务端/后端（主进程核心）、接口层和后端（跨局域网设备同步）等层次，同时建立统一的中文JSDoc注释规范。

## 架构设计

### 当前项目结构分析

基于现有代码分析，当前项目结构如下：

``` t
G-Asset Forge 当前架构
├── src/main/                    # Electron主进程
│   ├── main.ts                  # 应用入口
│   ├── managers/                # 系统管理器
│   │   ├── WindowManager.ts     # 窗口管理
│   │   └── FileSystemManager.ts # 文件系统管理
│   ├── handlers/                # IPC处理器
│   ├── config/                  # 配置管理
│   └── utils/                   # 工具函数
├── src/renderer/                # React渲染进程
│   ├── App.tsx                  # 应用根组件
│   ├── components/              # React组件
│   │   ├── App/AppContainer.tsx # 应用容器
│   │   ├── Layout/MainLayout.tsx # 主布局
│   │   ├── Canvas/              # 画布组件
│   │   ├── AssetLibrary/        # 素材库
│   │   └── Properties/          # 属性面板
│   ├── stores/                  # Zustand状态管理
│   │   ├── appStore.ts          # 应用状态
│   │   └── canvasStore.ts       # 画布状态
│   ├── engines/                 # 画布引擎
│   │   ├── suika/               # Suika引擎
│   │   └── h5-editor/           # H5编辑器引擎
│   ├── ui/                      # UI组件库
│   ├── hooks/                   # React Hooks
│   └── utils/                   # 工具函数
├── src/types/                   # 类型定义
└── src/utils/                   # 共享工具
```

### 重构后的目标架构

``` t
G-Asset Forge 重构后架构
├── UI界面层 (src/renderer/ui/)
│   ├── components/              # 基础UI组件库
│   ├── business/                # 业务组件
│   ├── layout/                  # 布局组件
│   └── theme/                   # 主题系统
├── 前端逻辑层 (src/renderer/logic/)
│   ├── managers/                # 业务管理器
│   ├── stores/                  # 状态管理
│   ├── engines/                 # 引擎适配器
│   └── services/                # 业务服务
├── 接口层 (src/interfaces/)
│   ├── api/                     # API定义
│   ├── types/                   # 类型定义
│   ├── schemas/                 # 数据模式
│   └── contracts/               # 接口契约
├── 主进程核心 (src/main/)
│   ├── core/                    # 核心系统
│   ├── managers/                # 系统管理器
│   ├── services/                # 系统服务
│   └── handlers/                # 事件处理器
└── 跨局域网同步 (src/sync/)
    ├── core/                    # 同步核心
    ├── services/                # 同步服务
    ├── protocols/               # 通信协议
    └── storage/                 # 存储管理
```

### 现有技术栈分析

基于当前代码分析，项目使用的技术栈：

- **桌面框架**: Electron (已实现Application类、WindowManager、IPC通信)
- **前端框架**: React 18 + TypeScript (已实现AppContainer、MainLayout等组件)
- **状态管理**: Zustand (已实现appStore、canvasStore)
- **画布引擎**:
  - Suika引擎 (高性能2D渲染，已集成SuikaCanvasEngine)
  - H5-Editor引擎 (移动端编辑，已集成H5EditorCanvas)
- **UI组件**:
  - styled-components (已广泛使用)
  - @radix-ui (已部分集成)
  - framer-motion (动画支持)
- **构建系统**: Webpack 5 (已配置多入口构建)
- **代码规范**: ESLint + TypeScript (需要添加中文JSDoc规范)

## 组件和接口设计

### 1. UI界面层架构重构 (基于现有src/renderer/ui/)

```typescript
/**
 * UI界面层架构重构 - 基于现有UI组件系统进行优化
 * @description 重新组织现有的UI组件，建立清晰的组件层次和复用体系
 */

// 当前UI结构 (src/renderer/ui/)
src/renderer/ui/
├── components/          # 现有基础组件
├── theme/              # 现有主题系统 (ThemeProvider已实现)
├── styles/             # 现有样式系统 (GlobalStyles已实现)
└── accessibility/      # 无障碍支持

// 重构后的UI结构
src/renderer/ui/
├── components/          # 基础UI组件库 (重新分类)
│   ├── atoms/          # 原子组件
│   │   ├── Button/     # 按钮组件
│   │   ├── Input/      # 输入框组件
│   │   ├── Icon/       # 图标组件
│   │   └── Text/       # 文本组件
│   ├── molecules/      # 分子组件
│   │   ├── SearchBox/  # 搜索框
│   │   ├── Card/       # 卡片组件
│   │   └── FormField/  # 表单项
│   ├── organisms/      # 有机体组件
│   │   ├── Navbar/     # 导航栏
│   │   ├── Sidebar/    # 侧边栏
│   │   └── Panel/      # 面板组件
│   └── templates/      # 模板组件
│       ├── Layout/     # 布局模板
│       └── Dialog/     # 对话框模板
├── business/           # 业务组件 (从现有components/迁移)
│   ├── Canvas/         # 画布组件 (从components/Canvas/)
│   ├── AssetLibrary/   # 素材库 (从components/AssetLibrary/)
│   ├── Properties/     # 属性面板 (从components/Properties/)
│   ├── Layout/         # 布局组件 (从components/Layout/)
│   └── Tools/          # 工具组件
├── theme/              # 主题系统 (保持现有结构)
│   ├── ThemeProvider.tsx # 现有主题提供者
│   ├── colors.ts       # 颜色定义
│   ├── typography.ts   # 字体定义
│   └── spacing.ts      # 间距定义
└── styles/             # 样式系统 (保持现有结构)
    ├── GlobalStyles.tsx # 现有全局样式
    └── animations.ts   # 动画定义

// UI组件接口定义
interface UIComponentSystem {
  // 基础组件
  atoms: {
    Button: React.ComponentType<ButtonProps>;
    Input: React.ComponentType<InputProps>;
    Icon: React.ComponentType<IconProps>;
    Text: React.ComponentType<TextProps>;
  };
  
  // 复合组件
  molecules: {
    SearchBox: React.ComponentType<SearchBoxProps>;
    Card: React.ComponentType<CardProps>;
    FormField: React.ComponentType<FormFieldProps>;
  };
  
  // 业务组件
  organisms: {
    Navbar: React.ComponentType<NavbarProps>;
    Sidebar: React.ComponentType<SidebarProps>;
    PropertyPanel: React.ComponentType<PropertyPanelProps>;
  };
  
  // 主题系统
  theme: {
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    shadows: ThemeShadows;
  };
}

// 主题接口定义
interface ThemeColors {
  primary: {
    50: string;
    100: string;
    500: string;
    900: string;
  };
  secondary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
}

interface ThemeTypography {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}
```

### 2. 前端逻辑层架构重构 (基于现有stores/、managers/、engines/)

```typescript
/**
 * 前端逻辑层架构重构 - 基于现有业务逻辑进行重新组织
 * @description 整合现有的stores、managers、engines，建立清晰的业务逻辑层次
 */

// 当前逻辑层结构分析
src/renderer/
├── stores/              # 现有Zustand状态管理
│   ├── appStore.ts     # 应用状态 (已实现完整的应用状态管理)
│   └── canvasStore.ts  # 画布状态 (已实现缩放、平移、性能监控)
├── managers/           # 现有业务管理器
│   ├── assets/         # 素材管理
│   ├── project/        # 项目管理
│   └── storage/        # 存储管理
├── engines/            # 现有画布引擎
│   ├── suika/          # Suika引擎 (已集成SuikaCanvasEngine)
│   ├── h5-editor/      # H5编辑器 (已集成H5EditorCanvas)
│   └── CanvasEngine.ts # 引擎抽象层
└── tools/              # 现有工具系统
    ├── ToolManager.ts  # 工具管理器
    ├── BrushTool.ts    # 画笔工具
    └── CropTool.ts     # 裁剪工具

// 重构后的逻辑层结构
src/renderer/logic/
├── stores/             # 状态管理 (迁移并扩展现有stores/)
│   ├── appStore.ts     # 应用状态 (保持现有实现)
│   ├── canvasStore.ts  # 画布状态 (保持现有实现)
│   ├── toolStore.ts    # 工具状态 (新增)
│   ├── assetStore.ts   # 素材状态 (新增)
│   └── projectStore.ts # 项目状态 (新增)
├── managers/           # 业务管理器 (整合现有managers/)
│   ├── canvas/         # 画布管理器
│   │   ├── CanvasManager.ts    # 画布生命周期管理
│   │   ├── ViewportManager.ts  # 视口管理 (基于canvasStore)
│   │   └── LayerManager.ts     # 图层管理
│   ├── tools/          # 工具管理器 (整合现有tools/)
│   │   ├── ToolManager.ts      # 现有工具管理器
│   │   ├── ToolRegistry.ts     # 工具注册表
│   │   └── ToolStateManager.ts # 工具状态管理
│   ├── assets/         # 素材管理器 (整合现有managers/assets/)
│   │   ├── AssetManager.ts     # 素材管理
│   │   └── AssetCacheManager.ts # 素材缓存
│   └── project/        # 项目管理器 (整合现有managers/project/)
│       ├── ProjectManager.ts   # 项目管理
│       └── FileManager.ts      # 文件管理
├── engines/            # 引擎适配器 (重构现有engines/)
│   ├── adapters/       # 引擎适配器
│   │   ├── SuikaAdapter.ts     # Suika引擎适配器
│   │   └── H5EditorAdapter.ts  # H5编辑器适配器
│   ├── core/           # 引擎核心 (保持现有engines/结构)
│   │   ├── suika/      # Suika引擎实现
│   │   └── h5-editor/  # H5编辑器实现
│   └── EngineFactory.ts # 引擎工厂 (现有engines/index.ts)
├── services/           # 业务服务 (新增)
│   ├── CanvasService.ts # 画布服务
│   ├── AssetService.ts  # 素材服务
│   └── ProjectService.ts # 项目服务
└── utils/              # 业务工具 (整合现有utils/)
    ├── validation.ts   # 数据验证
    ├── events/         # 事件系统 (现有utils/events/)
    └── performance/    # 性能监控 (现有utils/performance/)

// 业务管理器接口定义
interface BusinessLogicLayer {
  // 画布管理
  canvasManager: {
    createCanvas(options: CanvasOptions): Promise<Canvas>;
    destroyCanvas(canvasId: string): void;
    getCanvas(canvasId: string): Canvas | null;
    getAllCanvases(): Canvas[];
  };
  
  // 工具管理
  toolManager: {
    registerTool(tool: Tool): void;
    activateTool(toolType: ToolType): void;
    deactivateTool(): void;
    getCurrentTool(): Tool | null;
    getAvailableTools(): Tool[];
  };
  
  // 素材管理
  assetManager: {
    loadAsset(assetId: string): Promise<Asset>;
    saveAsset(asset: Asset): Promise<string>;
    deleteAsset(assetId: string): Promise<void>;
    searchAssets(query: AssetQuery): Promise<Asset[]>;
  };
  
  // 历史记录管理
  historyManager: {
    pushOperation(operation: Operation): void;
    undo(): boolean;
    redo(): boolean;
    canUndo(): boolean;
    canRedo(): boolean;
    clear(): void;
  };
}

// 状态管理接口定义
interface StateManagement {
  // 应用状态
  appStore: {
    theme: 'light' | 'dark';
    language: string;
    preferences: UserPreferences;
    setTheme: (theme: 'light' | 'dark') => void;
    setLanguage: (language: string) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
  };
  
  // 画布状态
  canvasStore: {
    activeCanvasId: string | null;
    canvases: Record<string, CanvasState>;
    viewport: ViewportState;
    selection: SelectionState;
    setActiveCanvas: (canvasId: string) => void;
    updateViewport: (viewport: Partial<ViewportState>) => void;
    updateSelection: (selection: SelectionState) => void;
  };
}
```

### 3. 接口层架构 (Interface Layer)

```typescript
/**
 * 接口层架构 - 负责API定义、数据验证和类型定义
 * @description 提供统一的接口契约、数据验证和错误处理机制
 */

// 目录结构
src/interfaces/
├── api/                # API接口定义
│   ├── canvas.api.ts   # 画布API接口
│   ├── assets.api.ts   # 素材API接口
│   ├── projects.api.ts # 项目API接口
│   └── sync.api.ts     # 同步API接口
├── types/              # 类型定义
│   ├── canvas.types.ts # 画布类型
│   ├── assets.types.ts # 素材类型
│   ├── projects.types.ts # 项目类型
│   ├── tools.types.ts  # 工具类型
│   └── common.types.ts # 通用类型
├── schemas/            # 数据模式定义
│   ├── canvas.schema.ts # 画布数据模式
│   ├── assets.schema.ts # 素材数据模式
│   └── projects.schema.ts # 项目数据模式
├── validators/         # 数据验证器
│   ├── canvas.validator.ts # 画布数据验证
│   ├── assets.validator.ts # 素材数据验证
│   └── projects.validator.ts # 项目数据验证
├── errors/             # 错误定义
│   ├── CanvasError.ts  # 画布错误
│   ├── AssetError.ts   # 素材错误
│   ├── ProjectError.ts # 项目错误
│   └── NetworkError.ts # 网络错误
└── contracts/          # 接口契约
    ├── ICanvasService.ts # 画布服务契约
    ├── IAssetService.ts  # 素材服务契约
    └── IProjectService.ts # 项目服务契约

// API接口定义
interface APILayer {
  // 画布API
  canvasAPI: {
    createCanvas(options: CreateCanvasRequest): Promise<CreateCanvasResponse>;
    updateCanvas(id: string, data: UpdateCanvasRequest): Promise<UpdateCanvasResponse>;
    deleteCanvas(id: string): Promise<DeleteCanvasResponse>;
    getCanvas(id: string): Promise<GetCanvasResponse>;
    listCanvases(query: ListCanvasesRequest): Promise<ListCanvasesResponse>;
  };
  
  // 素材API
  assetsAPI: {
    uploadAsset(file: File, metadata: AssetMetadata): Promise<UploadAssetResponse>;
    downloadAsset(id: string): Promise<DownloadAssetResponse>;
    deleteAsset(id: string): Promise<DeleteAssetResponse>;
    searchAssets(query: SearchAssetsRequest): Promise<SearchAssetsResponse>;
  };
  
  // 项目API
  projectsAPI: {
    createProject(data: CreateProjectRequest): Promise<CreateProjectResponse>;
    saveProject(id: string, data: SaveProjectRequest): Promise<SaveProjectResponse>;
    loadProject(id: string): Promise<LoadProjectResponse>;
    exportProject(id: string, options: ExportOptions): Promise<ExportProjectResponse>;
  };
}

// 数据验证接口
interface ValidationLayer {
  // 画布数据验证
  canvasValidator: {
    validateCreateCanvas(data: unknown): CreateCanvasRequest;
    validateUpdateCanvas(data: unknown): UpdateCanvasRequest;
    validateCanvasState(data: unknown): CanvasState;
  };
  
  // 素材数据验证
  assetValidator: {
    validateAssetMetadata(data: unknown): AssetMetadata;
    validateAssetFile(file: File): boolean;
    validateAssetQuery(data: unknown): AssetQuery;
  };
  
  // 项目数据验证
  projectValidator: {
    validateProjectData(data: unknown): ProjectData;
    validateExportOptions(data: unknown): ExportOptions;
    validateProjectMetadata(data: unknown): ProjectMetadata;
  };
}

// 错误处理接口
interface ErrorHandling {
  // 错误类型定义
  CanvasError: {
    CANVAS_NOT_FOUND: 'CANVAS_NOT_FOUND';
    CANVAS_CREATION_FAILED: 'CANVAS_CREATION_FAILED';
    INVALID_CANVAS_DATA: 'INVALID_CANVAS_DATA';
  };
  
  AssetError: {
    ASSET_NOT_FOUND: 'ASSET_NOT_FOUND';
    ASSET_UPLOAD_FAILED: 'ASSET_UPLOAD_FAILED';
    INVALID_ASSET_FORMAT: 'INVALID_ASSET_FORMAT';
  };
  
  ProjectError: {
    PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND';
    PROJECT_SAVE_FAILED: 'PROJECT_SAVE_FAILED';
    PROJECT_LOAD_FAILED: 'PROJECT_LOAD_FAILED';
  };
  
  // 错误处理器
  errorHandler: {
    handleCanvasError(error: CanvasError): void;
    handleAssetError(error: AssetError): void;
    handleProjectError(error: ProjectError): void;
    handleNetworkError(error: NetworkError): void;
  };
}
```

### 4. 主进程核心架构重构 (基于现有src/main/)

```typescript
/**
 * 主进程核心架构重构 - 基于现有Electron主进程代码进行优化
 * @description 重新组织现有的主进程代码，建立清晰的系统管理层次
 */

// 当前主进程结构分析
src/main/
├── main.ts             # 应用入口 (已实现Application类)
├── managers/           # 系统管理器
│   ├── WindowManager.ts # 窗口管理器 (已实现)
│   └── FileSystemManager.ts # 文件系统管理器 (已实现)
├── handlers/           # 事件处理器
│   └── ipcHandlers.ts  # IPC处理器 (已实现)
├── config/             # 配置管理
│   └── security.ts     # 安全配置 (已实现SecurityConfig)
└── utils/              # 工具函数
    └── logger.ts       # 日志工具 (已实现)

// 重构后的主进程结构
src/main/
├── core/               # 核心系统 (重构main.ts)
│   ├── Application.ts  # 应用程序主类 (从main.ts提取)
│   ├── Lifecycle.ts    # 生命周期管理
│   └── Bootstrap.ts    # 启动引导
├── managers/           # 系统管理器 (扩展现有managers/)
│   ├── WindowManager.ts # 窗口管理器 (保持现有实现)
│   ├── FileSystemManager.ts # 文件系统管理器 (保持现有实现)
│   ├── SecurityManager.ts # 安全管理器 (基于现有security.ts)
│   ├── MenuManager.ts  # 菜单管理器 (从main.ts提取)
│   └── UpdateManager.ts # 更新管理器 (新增)
├── services/           # 系统服务 (新增)
│   ├── IPCService.ts   # IPC通信服务
│   ├── FileService.ts  # 文件服务
│   └── LoggingService.ts # 日志服务 (基于现有logger.ts)
├── handlers/           # 事件处理器 (扩展现有handlers/)
│   ├── IPCHandlers.ts  # IPC事件处理 (保持现有实现)
│   ├── MenuHandlers.ts # 菜单事件处理 (从main.ts提取)
│   └── WindowHandlers.ts # 窗口事件处理
├── config/             # 配置管理 (扩展现有config/)
│   ├── AppConfig.ts    # 应用配置
│   ├── SecurityConfig.ts # 安全配置 (重构现有security.ts)
│   └── MenuConfig.ts   # 菜单配置
├── utils/              # 工具函数 (扩展现有utils/)
│   ├── logger.ts       # 日志工具 (保持现有实现)
│   ├── crypto.ts       # 加密工具 (新增)
│   └── validation.ts   # 验证工具 (新增)
└── types/              # 类型定义 (新增)
    ├── main.types.ts   # 主进程类型
    └── ipc.types.ts    # IPC类型

// 现有Application类重构
interface MainProcessCore {
  // 基于现有main.ts中的Application类
  application: {
    initialize(): Promise<void>;        // 现有initializeApp()
    createMainWindow(): BrowserWindow;  // 现有createMainWindow()
    setupIpcHandlers(): void;          // 现有setupIpcHandlers()
    setupMenu(): void;                 // 现有setupMenu()
    cleanup(): void;                   // 现有cleanup()
  };
  
  // 基于现有WindowManager
  windowManager: {
    createMainWindow(): BrowserWindow;  // 现有实现
    // 扩展其他窗口管理功能
  };
  
  // 基于现有FileSystemManager
  fileSystemManager: {
    // 现有文件系统操作
    // 扩展文件管理功能
  };
}

// 主进程核心接口
interface MainProcessCore {
  // 应用程序管理
  application: {
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    restart(): Promise<void>;
    getVersion(): string;
    getSystemInfo(): SystemInfo;
  };
  
  // 窗口管理
  windowManager: {
    createWindow(options: WindowOptions): Promise<BrowserWindow>;
    closeWindow(windowId: string): void;
    focusWindow(windowId: string): void;
    minimizeWindow(windowId: string): void;
    maximizeWindow(windowId: string): void;
    getAllWindows(): BrowserWindow[];
  };
  
  // 文件系统管理
  fileSystemManager: {
    readFile(path: string): Promise<Buffer>;
    writeFile(path: string, data: Buffer): Promise<void>;
    deleteFile(path: string): Promise<void>;
    createDirectory(path: string): Promise<void>;
    watchDirectory(path: string, callback: FileWatchCallback): void;
  };
  
  // 安全管理
  securityManager: {
    validateFileAccess(path: string): boolean;
    encryptData(data: string): string;
    decryptData(encryptedData: string): string;
    generateSecureToken(): string;
    validateToken(token: string): boolean;
  };
}

// IPC通信接口
interface IPCCommunication {
  // 渲染进程到主进程
  rendererToMain: {
    'file:read': (path: string) => Promise<Buffer>;
    'file:write': (path: string, data: Buffer) => Promise<void>;
    'window:minimize': () => void;
    'window:maximize': () => void;
    'window:close': () => void;
    'app:getVersion': () => string;
    'app:restart': () => void;
  };
  
  // 主进程到渲染进程
  mainToRenderer: {
    'file:changed': (path: string) => void;
    'app:update-available': (version: string) => void;
    'window:focus-changed': (focused: boolean) => void;
    'system:low-memory': (memoryInfo: MemoryInfo) => void;
  };
}
```

### 5. 后端（跨局域网设备同步）架构

```typescript
/**
 * 跨局域网设备同步架构 - 负责设备间状态同步和凭据管理
 * @description 提供设备发现、状态同步、凭据管理和离线缓存功能
 */

// 目录结构
src/sync/
├── core/               # 同步核心
│   ├── SyncEngine.ts   # 同步引擎
│   ├── DeviceManager.ts # 设备管理器
│   └── NetworkManager.ts # 网络管理器
├── services/           # 同步服务
│   ├── DiscoveryService.ts # 设备发现服务
│   ├── SyncService.ts  # 状态同步服务
│   ├── CredentialService.ts # 凭据管理服务
│   └── CacheService.ts # 缓存服务
├── protocols/          # 通信协议
│   ├── DeviceProtocol.ts # 设备通信协议
│   ├── SyncProtocol.ts # 同步协议
│   └── SecurityProtocol.ts # 安全协议
├── storage/            # 存储管理
│   ├── LocalStorage.ts # 本地存储
│   ├── NetworkStorage.ts # 网络存储
│   └── CacheStorage.ts # 缓存存储
├── security/           # 安全管理
│   ├── Encryption.ts   # 加密管理
│   ├── Authentication.ts # 身份验证
│   └── Authorization.ts # 权限控制
└── utils/              # 同步工具
    ├── networkUtils.ts # 网络工具
    ├── deviceUtils.ts  # 设备工具
    └── syncUtils.ts    # 同步工具

// 设备同步接口
interface DeviceSyncSystem {
  // 设备发现
  deviceDiscovery: {
    startDiscovery(): void;
    stopDiscovery(): void;
    getDiscoveredDevices(): Device[];
    connectToDevice(deviceId: string): Promise<Connection>;
    disconnectFromDevice(deviceId: string): void;
  };
  
  // 状态同步
  stateSync: {
    syncProjectState(projectId: string, devices: string[]): Promise<SyncResult>;
    syncAssetLibrary(devices: string[]): Promise<SyncResult>;
    syncUserPreferences(devices: string[]): Promise<SyncResult>;
    resolveConflicts(conflicts: Conflict[]): Promise<ConflictResolution>;
  };
  
  // 凭据管理
  credentialManager: {
    storeCredential(key: string, value: string): Promise<void>;
    retrieveCredential(key: string): Promise<string>;
    deleteCredential(key: string): Promise<void>;
    syncCredentials(devices: string[]): Promise<void>;
  };
  
  // 离线缓存
  offlineCache: {
    cacheData(key: string, data: any): Promise<void>;
    getCachedData(key: string): Promise<any>;
    clearCache(): Promise<void>;
    syncCacheWhenOnline(): Promise<void>;
  };
}

// 网络通信接口
interface NetworkCommunication {
  // 设备通信
  deviceCommunication: {
    sendMessage(deviceId: string, message: Message): Promise<void>;
    broadcastMessage(message: Message): Promise<void>;
    onMessageReceived(callback: MessageCallback): void;
    getConnectionStatus(deviceId: string): ConnectionStatus;
  };
  
  // 数据传输
  dataTransfer: {
    uploadFile(deviceId: string, file: File): Promise<TransferResult>;
    downloadFile(deviceId: string, fileId: string): Promise<File>;
    syncDirectory(deviceId: string, localPath: string, remotePath: string): Promise<SyncResult>;
  };
}
```

### 6. 代码注释规范系统 (基于现有代码分析)

```typescript
/**
 * 代码注释规范系统 - 统一的中文JSDoc注释标准
 * @description 基于现有代码中的注释模式，建立标准化的中文注释规范
 */

// 现有代码注释分析
// 1. AppContainer.tsx 已有良好的中文注释示例：
//    "应用主容器 - 重构版本，解决useEffect依赖问题"
// 2. appStore.ts 已有详细的中文日志和注释
// 3. main.ts 已有部分中文注释

// 标准注释模板定义
interface CommentTemplates {
  // 文件头注释模板 (基于现有AppContainer.tsx模式)
  fileHeader: {
    template: `
/**
 * {fileName} - {description}
 * @description {detailedDescription}
 * @author {author}
 */`;
    example: `
/**
 * 画布工具管理器 - 负责工具切换和状态管理
 * @description 提供统一的工具管理接口，支持工具注册、激活、状态管理等功能
 * @author 开发团队
 */`;
  };
  
  // 函数注释模板 (基于现有代码模式)
  functionComment: {
    template: `
/**
 * {description}
 * @param {paramType} {paramName} {paramDescription}
 * @returns {returnType} {returnDescription}
 * @throws {ErrorType} {errorDescription}
 * @example
 * {exampleCode}
 */`;
    example: `
/**
 * 激活指定的画布工具
 * @param toolType 工具类型，支持 'select' | 'text' | 'shape' | 'brush'
 * @param options 工具配置选项，可选参数
 * @returns 返回工具实例，如果激活失败返回 null
 * @throws {ToolNotFoundError} 当指定的工具类型不存在时抛出
 * @example
 * const tool = toolManager.activateTool('select', { multiSelect: true });
 */`;
  };
  
  // 类注释模板 (基于现有Application类模式)
  classComment: {
    template: `
/**
 * {className} - {description}
 * @description {detailedDescription}
 * @author {author}
 * @since {version}
 * @example
 * {exampleCode}
 */`;
    example: `
/**
 * 画布管理器类 - 负责画布的创建、销毁和状态管理
 * @description 提供完整的画布生命周期管理，包括创建、初始化、渲染、销毁等功能
 * @author 画布团队
 * @since 1.0.0
 * @example
 * const canvasManager = new CanvasManager();
 * const canvas = await canvasManager.createCanvas({ width: 800, height: 600 });
 */`;
  };
  
  // 接口注释模板 (基于现有类型定义模式)
  interfaceComment: {
    template: `
/**
 * {interfaceName} - {description}
 * @description {detailedDescription}
 * @property {propertyType} {propertyName} - {propertyDescription}
 * @example
 * {exampleCode}
 */`;
    example: `
/**
 * 工具配置接口 - 定义工具的基本配置结构
 * @description 所有工具都需要实现此接口，提供统一的配置格式
 * @property {string} id - 工具唯一标识符
 * @property {string} name - 工具显示名称
 * @property {string} icon - 工具图标路径
 * @property {boolean} enabled - 工具是否启用
 * @example
 * const toolConfig: ToolConfig = {
 *   id: 'select-tool',
 *   name: '选择工具',
 *   icon: '/icons/select.svg',
 *   enabled: true
 * };
 */`;
  };
}

// 标准注释格式示例
const commentExamples = {
  // 文件头注释
  fileHeader: `
/**
 * 画布工具管理器 - 负责工具切换和状态管理
 * @description 提供统一的工具管理接口，支持工具注册、激活、状态管理等功能
 * @author 开发团队
 */
  `,
  
  // 函数注释
  functionComment: `
/**
 * 激活指定的画布工具
 * @param toolType 工具类型，支持 'select' | 'text' | 'shape' | 'brush'
 * @param options 工具配置选项，可选参数
 * @returns 返回工具实例，如果激活失败返回 null
 * @throws {ToolNotFoundError} 当指定的工具类型不存在时抛出
 * @example
 * const tool = toolManager.activateTool('select', { multiSelect: true });
 * if (tool) {
 *   console.log('工具激活成功');
 * }
 */
  `,
  
  // 类注释
  classComment: `
/**
 * 画布管理器类 - 负责画布的创建、销毁和状态管理
 * @description 提供完整的画布生命周期管理，包括创建、初始化、渲染、销毁等功能
 * @author 画布团队
 * @since 1.0.0
 * @example
 * const canvasManager = new CanvasManager();
 * const canvas = await canvasManager.createCanvas({ width: 800, height: 600 });
 */
  `,
  
  // 接口注释
  interfaceComment: `
/**
 * 工具配置接口 - 定义工具的基本配置结构
 * @description 所有工具都需要实现此接口，提供统一的配置格式
 * @property {string} id - 工具唯一标识符
 * @property {string} name - 工具显示名称
 * @property {string} icon - 工具图标路径
 * @property {boolean} enabled - 工具是否启用
 * @example
 * const toolConfig: ToolConfig = {
 *   id: 'select-tool',
 *   name: '选择工具',
 *   icon: '/icons/select.svg',
 *   enabled: true
 * };
 */
  `
};

// 注释验证规则
interface CommentValidationRules {
  // 必需注释规则
  required: {
    fileHeader: boolean;        // 文件头注释必需
    exportedFunctions: boolean; // 导出函数注释必需
    publicMethods: boolean;     // 公共方法注释必需
    interfaces: boolean;        // 接口注释必需
    classes: boolean;          // 类注释必需
  };
  
  // 注释内容规则
  content: {
    descriptionMinLength: number; // 描述最小长度
    parameterDescription: boolean; // 参数描述必需
    returnDescription: boolean;    // 返回值描述必需
    exampleRequired: boolean;      // 示例代码必需
    chineseOnly: boolean;         // 仅允许中文描述
  };
  
  // 格式规则
  format: {
    jsdocFormat: boolean;      // 必须使用JSDoc格式
    indentation: number;       // 缩进空格数
    lineLength: number;        // 行长度限制
    emptyLineAfter: boolean;   // 注释后必须有空行
  };
}
```

## 数据模型

### 项目架构数据模型

```typescript
/**
 * 项目架构数据模型 - 定义项目结构和配置信息
 * @description 描述项目的目录结构、依赖关系和配置信息
 */

interface ProjectArchitecture {
  // 项目基本信息
  project: {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    repository: string;
  };
  
  // 目录结构定义
  structure: {
    src: DirectoryStructure;
    assets: DirectoryStructure;
    docs: DirectoryStructure;
    tests: DirectoryStructure;
    config: DirectoryStructure;
  };
  
  // 依赖管理
  dependencies: {
    production: Dependency[];
    development: Dependency[];
    peer: Dependency[];
  };
  
  // 构建配置
  build: {
    entry: string[];
    output: OutputConfig;
    optimization: OptimizationConfig;
    plugins: PluginConfig[];
  };
  
  // 代码规范配置
  codeStandards: {
    eslint: ESLintConfig;
    prettier: PrettierConfig;
    typescript: TypeScriptConfig;
    comments: CommentConfig;
  };
}

interface DirectoryStructure {
  path: string;
  description: string;
  children: DirectoryStructure[];
  files: FileStructure[];
  rules: DirectoryRules;
}

interface FileStructure {
  name: string;
  type: 'typescript' | 'javascript' | 'css' | 'json' | 'markdown';
  description: string;
  template?: string;
  required: boolean;
}

interface DirectoryRules {
  namingConvention: 'camelCase' | 'kebab-case' | 'PascalCase';
  maxDepth: number;
  allowedFileTypes: string[];
  requiredFiles: string[];
}
```

### 代码质量数据模型

```typescript
/**
 * 代码质量数据模型 - 定义代码质量指标和检查规则
 * @description 用于监控和评估代码质量，包括注释覆盖率、复杂度等指标
 */

interface CodeQualityMetrics {
  // 注释覆盖率
  commentCoverage: {
    fileHeaderCoverage: number;      // 文件头注释覆盖率
    functionCommentCoverage: number; // 函数注释覆盖率
    classCommentCoverage: number;    // 类注释覆盖率
    interfaceCommentCoverage: number; // 接口注释覆盖率
    overallCoverage: number;         // 总体注释覆盖率
  };
  
  // 代码复杂度
  complexity: {
    cyclomaticComplexity: number;    // 圈复杂度
    cognitiveComplexity: number;     // 认知复杂度
    maintainabilityIndex: number;    // 可维护性指数
    technicalDebt: number;           // 技术债务
  };
  
  // 代码规范
  codeStandards: {
    eslintErrors: number;            // ESLint错误数
    eslintWarnings: number;          // ESLint警告数
    prettierIssues: number;          // Prettier格式问题
    typescriptErrors: number;        // TypeScript错误数
  };
  
  // 测试覆盖率
  testCoverage: {
    lineCoverage: number;            // 行覆盖率
    branchCoverage: number;          // 分支覆盖率
    functionCoverage: number;        // 函数覆盖率
    statementCoverage: number;       // 语句覆盖率
  };
}

interface QualityGate {
  // 质量门禁规则
  rules: {
    minCommentCoverage: number;      // 最小注释覆盖率
    maxComplexity: number;           // 最大复杂度
    maxTechnicalDebt: number;        // 最大技术债务
    minTestCoverage: number;         // 最小测试覆盖率
  };
  
  // 检查结果
  result: {
    passed: boolean;                 // 是否通过质量门禁
    score: number;                   // 质量分数
    issues: QualityIssue[];          // 质量问题列表
    recommendations: string[];        // 改进建议
  };
}
```

## 错误处理

### 架构重构错误处理策略

```typescript
/**
 * 架构重构错误处理策略 - 定义重构过程中的错误处理机制
 * @description 提供重构过程中的错误分类、处理和恢复策略
 */

enum ArchitectureErrorType {
  STRUCTURE_ERROR = 'structure_error',        // 结构错误
  DEPENDENCY_ERROR = 'dependency_error',      // 依赖错误
  MIGRATION_ERROR = 'migration_error',        // 迁移错误
  VALIDATION_ERROR = 'validation_error',      // 验证错误
  BUILD_ERROR = 'build_error',               // 构建错误
  COMPATIBILITY_ERROR = 'compatibility_error' // 兼容性错误
}

interface ArchitectureError extends Error {
  type: ArchitectureErrorType;
  code: string;
  details: any;
  recovery?: RecoveryStrategy;
}

interface RecoveryStrategy {
  // 自动恢复策略
  automatic: {
    enabled: boolean;
    maxRetries: number;
    backoffDelay: number;
    fallbackAction: string;
  };
  
  // 手动恢复策略
  manual: {
    instructions: string[];
    rollbackSteps: string[];
    verificationSteps: string[];
  };
}

// 错误处理器
class ArchitectureErrorHandler {
  /**
   * 处理架构重构错误
   * @param error 架构错误对象
   * @returns 处理结果
   */
  handleError(error: ArchitectureError): ErrorHandlingResult {
    switch (error.type) {
      case ArchitectureErrorType.STRUCTURE_ERROR:
        return this.handleStructureError(error);
      case ArchitectureErrorType.DEPENDENCY_ERROR:
        return this.handleDependencyError(error);
      case ArchitectureErrorType.MIGRATION_ERROR:
        return this.handleMigrationError(error);
      default:
        return this.handleGenericError(error);
    }
  }
  
  /**
   * 处理结构错误
   * @param error 结构错误
   * @returns 处理结果
   */
  private handleStructureError(error: ArchitectureError): ErrorHandlingResult {
    // 实现结构错误处理逻辑
    return {
      success: false,
      message: '目录结构错误，正在尝试自动修复...',
      recovery: error.recovery
    };
  }
  
  /**
   * 处理依赖错误
   * @param error 依赖错误
   * @returns 处理结果
   */
  private handleDependencyError(error: ArchitectureError): ErrorHandlingResult {
    // 实现依赖错误处理逻辑
    return {
      success: false,
      message: '依赖关系错误，请检查package.json配置',
      recovery: error.recovery
    };
  }
}
```

## 测试策略

### 架构重构测试计划

```typescript
/**
 * 架构重构测试计划 - 定义重构过程的测试策略和验证方法
 * @description 确保重构过程的正确性和系统的稳定性
 */

interface ArchitectureTestPlan {
  // 结构验证测试
  structureTests: {
    directoryStructure: DirectoryStructureTest[];
    fileNaming: FileNamingTest[];
    dependencyGraph: DependencyGraphTest[];
    importPaths: ImportPathTest[];
  };
  
  // 功能回归测试
  regressionTests: {
    coreFeatures: CoreFeatureTest[];
    userWorkflows: UserWorkflowTest[];
    performance: PerformanceTest[];
    compatibility: CompatibilityTest[];
  };
  
  // 代码质量测试
  qualityTests: {
    commentCoverage: CommentCoverageTest[];
    codeStandards: CodeStandardsTest[];
    complexity: ComplexityTest[];
    maintainability: MaintainabilityTest[];
  };
  
  // 集成测试
  integrationTests: {
    moduleIntegration: ModuleIntegrationTest[];
    apiIntegration: APIIntegrationTest[];
    systemIntegration: SystemIntegrationTest[];
  };
}

// 测试用例示例
describe('项目架构重构测试', () => {
  describe('目录结构验证', () => {
    test('应该包含所有必需的目录', () => {
      const requiredDirectories = [
        'src/renderer/ui',
        'src/renderer/logic',
        'src/interfaces',
        'src/main',
        'src/sync'
      ];
      
      requiredDirectories.forEach(dir => {
        expect(fs.existsSync(dir)).toBe(true);
      });
    });
    
    test('文件命名应该符合规范', () => {
      const files = glob.sync('src/**/*.ts');
      files.forEach(file => {
        expect(file).toMatch(/^[a-zA-Z][a-zA-Z0-9]*\.ts$/);
      });
    });
  });
  
  describe('代码注释验证', () => {
    test('所有导出函数应该有中文JSDoc注释', () => {
      const sourceFiles = glob.sync('src/**/*.ts');
      sourceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const exportedFunctions = extractExportedFunctions(content);
        
        exportedFunctions.forEach(func => {
          expect(func.hasJSDocComment).toBe(true);
          expect(func.comment).toMatch(/\/\*\*[\s\S]*\*\//);
          expect(func.comment).toMatch(/[\u4e00-\u9fa5]/); // 包含中文
        });
      });
    });
    
    test('文件头应该包含标准注释', () => {
      const sourceFiles = glob.sync('src/**/*.ts');
      sourceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).toMatch(/^\/\*\*[\s\S]*?\*\//);
      });
    });
  });
  
  describe('依赖关系验证', () => {
    test('不应该存在循环依赖', () => {
      const dependencyGraph = buildDependencyGraph('src');
      const cycles = detectCycles(dependencyGraph);
      expect(cycles).toHaveLength(0);
    });
    
    test('导入路径应该使用别名', () => {
      const sourceFiles = glob.sync('src/**/*.ts');
      sourceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = extractImports(content);
        
        imports.forEach(importPath => {
          if (importPath.startsWith('./') || importPath.startsWith('../')) {
            // 相对路径应该只用于同级或子级文件
            expect(importPath.split('/').length).toBeLessThanOrEqual(2);
          }
        });
      });
    });
  });
});
```

这个设计文档全面覆盖了项目架构重构的各个方面，包括UI界面层、前端逻辑层、接口层、主进程核心、跨局域网同步后端，以及统一的代码注释规范。设计充分考虑了模块化、可维护性和团队协作的需求，为后续的实施提供了清晰的技术指导。
