import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { reactLoopFixToolkit } from '../utils/ReactLoopFix';
export const useAppStore = create()(devtools((set, get) => ({
    // Initial state
    version: '1.0.0',
    platform: 'unknown',
    // Initialization initial state
    isInitialized: false,
    isInitializing: false,
    initializationError: null,
    // Navigation initial state
    currentPage: 'editor',
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
    elements: {},
    selectedElements: [],
    selectedElement: null,
    // Project initial state
    currentProject: null,
    hasUnsavedChanges: false,
    // Actions
    initializeApp: async () => {
        const state = get();
        // 记录初始化开始
        reactLoopFixToolkit.debugLogger.info('app-store', '开始应用初始化', { isInitialized: state.isInitialized }, 'AppStore');
        try {
            // 设置初始化状态
            set({ isInitializing: true, initializationError: null });
            // 检查是否首次使用
            const hasUsedBefore = localStorage.getItem('g-asset-forge-used');
            const isFirstTime = !hasUsedBefore;
            // 记录首次使用状态
            reactLoopFixToolkit.debugLogger.info('app-store', `首次使用检测: ${isFirstTime}`, { hasUsedBefore: !!hasUsedBefore }, 'AppStore');
            // Initialize app-level configurations
            console.log('GAF App initialized');
            // 添加一些示例元素
            const sampleElements = {
                'rect1': {
                    id: 'rect1',
                    type: 'rectangle',
                    name: '矩形 1',
                    x: 100,
                    y: 100,
                    width: 200,
                    height: 100,
                    fill: '#3b82f6',
                    stroke: '#e5e7eb',
                    strokeWidth: 1,
                    borderRadius: 4,
                    opacity: 1,
                    visible: true,
                    locked: false
                },
                'text1': {
                    id: 'text1',
                    type: 'text',
                    name: '文本框',
                    x: 150,
                    y: 250,
                    width: 100,
                    height: 30,
                    fill: '#1f2937',
                    opacity: 1,
                    visible: true,
                    locked: false,
                    text: 'Sample Text',
                    fontSize: 14,
                    fontFamily: 'Arial',
                    fontWeight: 400,
                    textAlign: 'left'
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
            reactLoopFixToolkit.debugLogger.info('app-store', '应用初始化完成', { elementsCount: Object.keys(sampleElements).length }, 'AppStore');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            set({
                isInitializing: false,
                initializationError: errorMessage
            });
            reactLoopFixToolkit.debugLogger.error('app-store', '应用初始化失败', { error: errorMessage }, 'AppStore');
            console.error('Failed to initialize app:', error);
            throw error;
        }
    },
    // 使用InitializationManager确保只初始化一次
    initializeAppOnce: async () => {
        const state = get();
        // 如果已经初始化，直接返回
        if (state.isInitialized) {
            reactLoopFixToolkit.debugLogger.info('app-store', '应用已初始化，跳过重复初始化', { isInitialized: state.isInitialized }, 'AppStore');
            return;
        }
        // 使用InitializationManager确保只初始化一次
        await reactLoopFixToolkit.initializeAppOnce(async () => {
            await get().initializeApp();
        });
    },
    // 批量状态更新方法
    batchUpdate: (updates) => {
        const state = get();
        // 验证每个状态更新
        const validatedUpdates = {};
        let hasValidUpdates = false;
        for (const [key, value] of Object.entries(updates)) {
            const currentValue = state[key];
            const shouldUpdate = reactLoopFixToolkit.validateStateUpdate(`appStore.${key}`, currentValue, value, 'AppStore');
            if (shouldUpdate) {
                validatedUpdates[key] = value;
                hasValidUpdates = true;
            }
        }
        // 只有在有有效更新时才执行set
        if (hasValidUpdates) {
            reactLoopFixToolkit.debugLogger.debug('app-store', '批量状态更新', {
                updatedKeys: Object.keys(validatedUpdates),
                totalUpdates: Object.keys(validatedUpdates).length
            }, 'AppStore');
            set(validatedUpdates);
        }
        else {
            reactLoopFixToolkit.debugLogger.debug('app-store', '批量更新被跳过，没有有效的状态变化', { requestedKeys: Object.keys(updates) }, 'AppStore');
        }
    },
    // Basic setters with validation
    setAppVersion: (version) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.version', state.version, version, 'AppStore')) {
            set({ version });
        }
    },
    setPlatform: (platform) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.platform', state.platform, platform, 'AppStore')) {
            set({ platform });
        }
    },
    // Navigation Actions with validation
    setCurrentPage: (page) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.currentPage', state.currentPage, page, 'AppStore')) {
            set({ currentPage: page });
        }
    },
    setFirstTime: (isFirstTime) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.isFirstTime', state.isFirstTime, isFirstTime, 'AppStore')) {
            set({ isFirstTime });
        }
    },
    // UI Actions with validation
    setSidebarCollapsed: (collapsed) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.sidebarCollapsed', state.sidebarCollapsed, collapsed, 'AppStore')) {
            set({ sidebarCollapsed: collapsed });
        }
    },
    setToolbarCollapsed: (collapsed) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.toolbarCollapsed', state.toolbarCollapsed, collapsed, 'AppStore')) {
            set({ toolbarCollapsed: collapsed });
        }
    },
    setPropertiesPanelCollapsed: (collapsed) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.propertiesPanelCollapsed', state.propertiesPanelCollapsed, collapsed, 'AppStore')) {
            set({ propertiesPanelCollapsed: collapsed });
        }
    },
    setActiveTool: (tool) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.activeTool', state.activeTool, tool, 'AppStore')) {
            set({ activeTool: tool });
        }
    },
    setLoading: (loading) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.isLoading', state.isLoading, loading, 'AppStore')) {
            set({ isLoading: loading });
        }
    },
    // Canvas Actions with validation
    setCanvasZoom: (zoom) => {
        const state = get();
        const clampedZoom = Math.max(0.1, Math.min(10, zoom));
        if (reactLoopFixToolkit.validateStateUpdate('appStore.canvasZoom', state.canvasZoom, clampedZoom, 'AppStore')) {
            set({ canvasZoom: clampedZoom });
        }
    },
    setCanvasPosition: (x, y) => {
        const state = get();
        const newPosition = { x, y };
        const currentPosition = { x: state.canvasX, y: state.canvasY };
        if (reactLoopFixToolkit.validateStateUpdate('appStore.canvasPosition', currentPosition, newPosition, 'AppStore')) {
            set({ canvasX: x, canvasY: y });
        }
    },
    setShowGrid: (show) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.showGrid', state.showGrid, show, 'AppStore')) {
            set({ showGrid: show });
        }
    },
    setShowRulers: (show) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.showRulers', state.showRulers, show, 'AppStore')) {
            set({ showRulers: show });
        }
    },
    // Element Actions with validation
    addElement: (element) => {
        const state = get();
        const newElements = { ...state.elements, [element.id]: element };
        if (reactLoopFixToolkit.validateStateUpdate('appStore.elements', state.elements, newElements, 'AppStore')) {
            reactLoopFixToolkit.debugLogger.info('app-store', `添加元素: ${element.id}`, { elementType: element.type, elementName: element.name }, 'AppStore');
            set({
                elements: newElements,
                hasUnsavedChanges: true
            });
        }
    },
    updateElement: (id, updates) => {
        const state = get();
        const element = state.elements[id];
        if (!element) {
            reactLoopFixToolkit.debugLogger.warn('app-store', `尝试更新不存在的元素: ${id}`, { updates }, 'AppStore');
            return;
        }
        const updatedElement = { ...element, ...updates };
        const newElements = { ...state.elements, [id]: updatedElement };
        if (reactLoopFixToolkit.validateStateUpdate(`appStore.elements.${id}`, element, updatedElement, 'AppStore')) {
            reactLoopFixToolkit.debugLogger.debug('app-store', `更新元素: ${id}`, { updatedKeys: Object.keys(updates) }, 'AppStore');
            set({
                elements: newElements,
                hasUnsavedChanges: true
            });
        }
    },
    deleteElement: (id) => {
        const state = get();
        const element = state.elements[id];
        if (!element) {
            reactLoopFixToolkit.debugLogger.warn('app-store', `尝试删除不存在的元素: ${id}`, {}, 'AppStore');
            return;
        }
        const newElements = { ...state.elements };
        delete newElements[id];
        const newSelectedElements = state.selectedElements.filter(selectedId => selectedId !== id);
        const newSelectedElement = state.selectedElement?.id === id ? null : state.selectedElement;
        // 验证元素删除
        if (reactLoopFixToolkit.validateStateUpdate('appStore.elements', state.elements, newElements, 'AppStore')) {
            reactLoopFixToolkit.debugLogger.info('app-store', `删除元素: ${id}`, { elementType: element.type, elementName: element.name }, 'AppStore');
            set({
                elements: newElements,
                selectedElements: newSelectedElements,
                selectedElement: newSelectedElement,
                hasUnsavedChanges: true
            });
        }
    },
    selectElements: (elementIds) => {
        const state = get();
        const { elements } = state;
        // 验证选择的元素是否存在
        const validElementIds = elementIds.filter(id => elements[id]);
        if (validElementIds.length !== elementIds.length) {
            const invalidIds = elementIds.filter(id => !elements[id]);
            reactLoopFixToolkit.debugLogger.warn('app-store', '尝试选择不存在的元素', { invalidIds }, 'AppStore');
        }
        const selectedElement = validElementIds.length === 1 && validElementIds[0]
            ? elements[validElementIds[0]] || null
            : null;
        // 验证选择状态更新
        if (reactLoopFixToolkit.validateStateUpdate('appStore.selectedElements', state.selectedElements, validElementIds, 'AppStore')) {
            reactLoopFixToolkit.debugLogger.debug('app-store', '选择元素', { selectedCount: validElementIds.length, elementIds: validElementIds }, 'AppStore');
            set({
                selectedElements: validElementIds,
                selectedElement
            });
        }
    },
    clearSelection: () => {
        const state = get();
        const emptySelection = [];
        if (reactLoopFixToolkit.validateStateUpdate('appStore.selectedElements', state.selectedElements, emptySelection, 'AppStore')) {
            reactLoopFixToolkit.debugLogger.debug('app-store', '清除选择', { previousCount: state.selectedElements.length }, 'AppStore');
            set({
                selectedElements: emptySelection,
                selectedElement: null
            });
        }
    },
    // Project Actions with validation
    setCurrentProject: (project) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.currentProject', state.currentProject, project, 'AppStore')) {
            reactLoopFixToolkit.debugLogger.info('app-store', '设置当前项目', { hasProject: !!project }, 'AppStore');
            set({
                currentProject: project,
                hasUnsavedChanges: false
            });
        }
    },
    setHasUnsavedChanges: (hasChanges) => {
        const state = get();
        if (reactLoopFixToolkit.validateStateUpdate('appStore.hasUnsavedChanges', state.hasUnsavedChanges, hasChanges, 'AppStore')) {
            reactLoopFixToolkit.debugLogger.debug('app-store', '设置未保存更改状态', { hasChanges }, 'AppStore');
            set({ hasUnsavedChanges: hasChanges });
        }
    },
}), {
    name: 'gaf-app-store',
}));
//# sourceMappingURL=appStore.js.map