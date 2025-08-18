/**
 * 应用程序全局状态管理 - 基于Zustand的应用状态存储
 * @description 管理应用的全局状态，包括初始化状态、导航状态、UI状态、画布状态等
 * @author 开发团队
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TextAlign, ElementType, BlendMode, ShapeType, type CanvasElement } from '../../interfaces/types/canvas';

/**
 * 应用页面类型
 * @description 定义应用中可用的页面类型
 */
type AppPage = 'home' | 'editor' | 'settings';

/**
 * 应用状态接口
 * @description 定义应用程序的完整状态结构和操作方法
 */
export interface AppState {
  // App info
  version: string;
  platform: string;

  // Initialization state
  isInitialized: boolean;
  isInitializing: boolean;
  initializationError: string | null;

  // Navigation state
  currentPage: AppPage;
  isFirstTime: boolean;

  // UI state
  sidebarCollapsed: boolean;
  toolbarCollapsed: boolean;
  propertiesPanelCollapsed: boolean;
  activeTool: string;
  isLoading: boolean;

  // Canvas state
  canvasZoom: number;
  canvasX: number;
  canvasY: number;
  showGrid: boolean;
  showRulers: boolean;

  // Element state
  elements: Record<string, CanvasElement>;
  selectedElements: string[];
  selectedElement: CanvasElement | null;

  // Project state
  currentProject: any | null;
  hasUnsavedChanges: boolean;

  // Actions
  /** 初始化应用程序 */
  initializeApp: () => Promise<void>;
  /** 确保应用只初始化一次 */
  initializeAppOnce: () => Promise<void>;
  /** 批量更新状态 */
  batchUpdate: (updates: Partial<AppState>) => void;
  /** 设置应用版本 */
  setAppVersion: (version: string) => void;
  /** 设置运行平台 */
  setPlatform: (platform: string) => void;

  // Navigation Actions
  setCurrentPage: (page: AppPage) => void;
  setFirstTime: (isFirstTime: boolean) => void;

  // UI Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setToolbarCollapsed: (collapsed: boolean) => void;
  setPropertiesPanelCollapsed: (collapsed: boolean) => void;
  setActiveTool: (tool: string) => void;
  setLoading: (loading: boolean) => void;

  // Canvas Actions
  setCanvasZoom: (zoom: number) => void;
  setCanvasPosition: (x: number, y: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowRulers: (show: boolean) => void;

  // Element Actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElements: (elementIds: string[]) => void;
  clearSelection: () => void;

  // Project Actions
  setCurrentProject: (project: Record<string, unknown> | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

/**
 * 应用状态存储Hook
 * @description 创建并导出应用程序的全局状态管理Hook
 * @returns 应用状态存储实例
 * @example
 * const { isInitialized, initializeApp } = useAppStore();
 */
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      version: '1.0.0',
      platform: 'unknown',

      // Initialization initial state
      isInitialized: false,
      isInitializing: false,
      initializationError: null,

      // Navigation initial state
      currentPage: 'editor' as AppPage,
      isFirstTime: true,

      // UI initial state
      sidebarCollapsed: false,
      toolbarCollapsed: false,
      propertiesPanelCollapsed: false,
      activeTool: 'select',
      isLoading: false,

      // Canvas initial state
      canvasZoom: 1,
      canvasX: 0,
      canvasY: 0,
      showGrid: true,
      showRulers: true,

      // Element initial state
      elements: {} as Record<string, CanvasElement>,
      selectedElements: [],
      selectedElement: null,

      // Project initial state
      currentProject: null,
      hasUnsavedChanges: false,

      // Actions
      /**
       * 初始化应用程序
       * @description 执行应用程序的完整初始化流程，包括状态设置和示例数据加载
       * @throws {Error} 当初始化失败时抛出错误
       */
      initializeApp: async () => {
        const state = get();

        // 记录初始化开始
        console.info('[app-store] 开始应用初始化', { isInitialized: state.isInitialized });

        try {
          // 设置初始化状态
          set({ isInitializing: true, initializationError: null });

          // 检查是否首次使用
          const hasUsedBefore = localStorage.getItem('g-asset-forge-used');
          const isFirstTime = !hasUsedBefore;

          // 记录首次使用状态
          console.info(`[app-store] 首次使用检测: ${isFirstTime}`, { hasUsedBefore: !!hasUsedBefore });

          // Initialize app-level configurations
          console.log('GAF App initialized');

          // 添加一些示例元素
          const sampleElements: Record<string, CanvasElement> = {
            'rect1': {
              id: 'rect1',
              type: ElementType.SHAPE,
              name: '矩形 1',
              transform: {
                x: 100,
                y: 100,
                width: 200,
                height: 100
              },
              fill: {
                color: '#3b82f6',
                type: 'solid'
              },
              stroke: {
                color: '#e5e7eb',
                width: 1,
                style: 'solid'
              },
              opacity: 1,
              visible: true,
              locked: false,
              blendMode: BlendMode.NORMAL,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              shapeData: {
                type: ShapeType.RECTANGLE,
                cornerRadius: 4
              }
            },
            'text1': {
              id: 'text1',
              type: ElementType.TEXT,
              name: '文本框',
              transform: {
                x: 150,
                y: 250,
                width: 100,
                height: 30
              },
              fill: {
                type: 'solid',
                color: '#1f2937'
              },
              opacity: 1,
              visible: true,
              locked: false,
              blendMode: BlendMode.NORMAL,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              content: 'Sample Text',
              style: {
                fontSize: 14,
                fontFamily: 'Arial',
                fontWeight: 400,
                textAlign: TextAlign.LEFT,
                fontStyle: 'normal',
                textDecoration: 'none',
                lineHeight: 0,
                letterSpacing: 0
              }
            }
          };

          // 批量更新状态
          set({
            elements: sampleElements,
            isFirstTime,
            isInitialized: true,
            isInitializing: false
          });

          // 标记已使用
          if (isFirstTime) {
            localStorage.setItem('g-asset-forge-used', 'true');
          }

          console.info('[app-store] 应用初始化完成', { elementsCount: Object.keys(sampleElements).length });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';

          set({
            isInitializing: false,
            initializationError: errorMessage
          });

          console.error('[app-store] 应用初始化失败', { error: errorMessage });

          console.error('Failed to initialize app:', error);
          throw error;
        }
      },

      /**
       * 确保应用只初始化一次
       * @description 检查初始化状态，避免重复初始化应用程序
       */
      initializeAppOnce: async () => {
        const state = get();

        // 如果已经初始化，直接返回
        if (state.isInitialized) {
          console.info('[app-store] 应用已初始化，跳过重复初始化', { isInitialized: state.isInitialized });
          return;
        }

        // 如果正在初始化，等待完成
        if (state.isInitializing) {
          console.info('[app-store] 应用正在初始化，等待完成');
          return;
        }

        // 执行初始化
        await get().initializeApp();
      },

      /**
       * 批量更新应用状态
       * @param updates 要更新的状态部分
       * @description 高效地批量更新多个状态字段，避免不必要的重新渲染
       */
      batchUpdate: (updates: Partial<AppState>) => {
        const state = get();

        // 简单的状态更新验证
        const validatedUpdates: Partial<AppState> = {};
        let hasValidUpdates = false;

        for (const [key, value] of Object.entries(updates)) {
          const currentValue = (state as any)[key];

          // 简单的值比较，避免不必要的更新
          if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
            (validatedUpdates as any)[key] = value;
            hasValidUpdates = true;
          }
        }

        // 只有在有有效更新时才执行set
        if (hasValidUpdates) {
          console.debug('[app-store] 批量状态更新', {
            updatedKeys: Object.keys(validatedUpdates),
            totalUpdates: Object.keys(validatedUpdates).length
          });

          set(validatedUpdates);
        } else {
          console.debug('[app-store] 批量更新被跳过，没有有效的状态变化', {
            requestedKeys: Object.keys(updates)
          });
        }
      },

      // Basic setters
      setAppVersion: (version: string) => {
        const state = get();
        if (state.version !== version) {
          set({ version });
        }
      },

      setPlatform: (platform: string) => {
        const state = get();
        if (state.platform !== platform) {
          set({ platform });
        }
      },

      // Navigation Actions
      setCurrentPage: (page: AppPage) => {
        const state = get();
        if (state.currentPage !== page) {
          set({ currentPage: page });
        }
      },

      setFirstTime: (isFirstTime: boolean) => {
        const state = get();
        if (state.isFirstTime !== isFirstTime) {
          set({ isFirstTime });
        }
      },

      // UI Actions
      setSidebarCollapsed: (collapsed: boolean) => {
        const state = get();
        if (state.sidebarCollapsed !== collapsed) {
          set({ sidebarCollapsed: collapsed });
        }
      },

      setToolbarCollapsed: (collapsed: boolean) => {
        const state = get();
        if (state.toolbarCollapsed !== collapsed) {
          set({ toolbarCollapsed: collapsed });
        }
      },

      setPropertiesPanelCollapsed: (collapsed: boolean) => {
        const state = get();
        if (state.propertiesPanelCollapsed !== collapsed) {
          set({ propertiesPanelCollapsed: collapsed });
        }
      },

      setActiveTool: (tool: string) => {
        const state = get();
        if (state.activeTool !== tool) {
          set({ activeTool: tool });
        }
      },

      setLoading: (loading: boolean) => {
        const state = get();
        if (state.isLoading !== loading) {
          set({ isLoading: loading });
        }
      },

      // Canvas Actions
      setCanvasZoom: (zoom: number) => {
        const state = get();
        const clampedZoom = Math.max(0.1, Math.min(10, zoom));
        if (state.canvasZoom !== clampedZoom) {
          set({ canvasZoom: clampedZoom });
        }
      },

      setCanvasPosition: (x: number, y: number) => {
        const state = get();
        if (state.canvasX !== x || state.canvasY !== y) {
          set({ canvasX: x, canvasY: y });
        }
      },

      setShowGrid: (show: boolean) => {
        const state = get();
        if (state.showGrid !== show) {
          set({ showGrid: show });
        }
      },

      setShowRulers: (show: boolean) => {
        const state = get();
        if (state.showRulers !== show) {
          set({ showRulers: show });
        }
      },

      // Element Actions
      addElement: (element: CanvasElement) => {
        const state = get();

        // 检查元素是否已存在
        if (state.elements[element.id]) {
          console.warn(`[app-store] 元素 ${element.id} 已存在，跳过添加`);
          return;
        }

        const newElements: Record<string, CanvasElement> = { ...state.elements, [element.id]: element };

        console.info(`[app-store] 添加元素: ${element.id}`, {
          elementType: element.type,
          elementName: element.name
        });

        set({
          elements: newElements,
          hasUnsavedChanges: true
        });
      },

      updateElement: (id: string, updates: Partial<CanvasElement>) => {
        const state = get();
        const element = state.elements[id];

        if (!element) {
          console.warn(`[app-store] 尝试更新不存在的元素: ${id}`, { updates });
          return;
        }

        const updatedElement = { ...element, ...updates };

        // 简单检查是否有实际变化
        if (JSON.stringify(element) === JSON.stringify(updatedElement)) {
          return; // 没有变化，跳过更新
        }

        const newElements: Record<string, CanvasElement> = { ...state.elements, [id]: updatedElement as CanvasElement };

        console.debug(`[app-store] 更新元素: ${id}`, { updatedKeys: Object.keys(updates) });

        set({
          elements: newElements,
          hasUnsavedChanges: true
        });
      },

      deleteElement: (id: string) => {
        const state = get();
        const element = state.elements[id];

        if (!element) {
          console.warn(`[app-store] 尝试删除不存在的元素: ${id}`);
          return;
        }

        const newElements: Record<string, CanvasElement> = { ...state.elements } as Record<string, CanvasElement>;
        delete newElements[id];

        const newSelectedElements = state.selectedElements.filter(selectedId => selectedId !== id);
        const newSelectedElement = state.selectedElement?.id === id ? null : state.selectedElement;

        console.info(`[app-store] 删除元素: ${id}`, {
          elementType: element.type,
          elementName: element.name
        });

        set({
          elements: newElements,
          selectedElements: newSelectedElements,
          selectedElement: newSelectedElement,
          hasUnsavedChanges: true
        });
      },

      selectElements: (elementIds: string[]) => {
        const state = get();
        const { elements } = state;

        // 验证选择的元素是否存在
        const validElementIds = elementIds.filter(id => elements[id]);
        if (validElementIds.length !== elementIds.length) {
          const invalidIds = elementIds.filter(id => !elements[id]);
          console.warn('[app-store] 尝试选择不存在的元素', { invalidIds });
        }

        const selectedElement = validElementIds.length === 1 && validElementIds[0]
          ? elements[validElementIds[0]] || null
          : null;

        // 检查选择是否有变化
        if (JSON.stringify(state.selectedElements) !== JSON.stringify(validElementIds)) {
          console.debug('[app-store] 选择元素', {
            selectedCount: validElementIds.length,
            elementIds: validElementIds
          });

          set({
            selectedElements: validElementIds,
            selectedElement
          });
        }
      },

      clearSelection: () => {
        const state = get();

        if (state.selectedElements.length > 0 || state.selectedElement !== null) {
          console.debug('[app-store] 清除选择', { previousCount: state.selectedElements.length });

          set({
            selectedElements: [],
            selectedElement: null
          });
        }
      },

      // Project Actions
      setCurrentProject: (project: Record<string, unknown> | null) => {
        const state = get();

        if (JSON.stringify(state.currentProject) !== JSON.stringify(project)) {
          console.info('[app-store] 设置当前项目', { hasProject: !!project });

          set({
            currentProject: project,
            hasUnsavedChanges: false
          });
        }
      },

      setHasUnsavedChanges: (hasChanges: boolean) => {
        const state = get();

        if (state.hasUnsavedChanges !== hasChanges) {
          console.debug('[app-store] 设置未保存更改状态', { hasChanges });

          set({ hasUnsavedChanges: hasChanges });
        }
      },
    }),
    {
      name: 'gaf-app-store',
    }
  )
);
