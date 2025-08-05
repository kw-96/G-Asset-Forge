import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 定义元素类型
interface CanvasElement {
  id: string;
  type: 'rectangle' | 'ellipse' | 'text' | 'image' | 'frame' | 'group';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  opacity?: number;
  visible: boolean;
  locked: boolean;
  children?: string[];
  parent?: string;
  // 文本相关属性
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
}

interface AppState {
  // App info
  version: string;
  platform: string;
  
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
  initializeApp: () => Promise<void>;
  setAppVersion: (version: string) => void;
  setPlatform: (platform: string) => void;
  
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

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      version: '1.0.0',
      platform: 'unknown',
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
        set({ isLoading: true });
        
        try {
          // Initialize app-level configurations
          console.log('GAF App initialized');
          
          // 添加一些示例元素
          const sampleElements: Record<string, CanvasElement> = {
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
          
          set({ elements: sampleElements });
        } catch (error) {
          console.error('Failed to initialize app:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Basic setters
      setAppVersion: (version: string) => set({ version }),
      setPlatform: (platform: string) => set({ platform }),
      
      // UI Actions
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      setToolbarCollapsed: (collapsed: boolean) => set({ toolbarCollapsed: collapsed }),
      setPropertiesPanelCollapsed: (collapsed: boolean) => set({ propertiesPanelCollapsed: collapsed }),
      setActiveTool: (tool: string) => set({ activeTool: tool }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      // Canvas Actions
      setCanvasZoom: (zoom: number) => set({ canvasZoom: Math.max(0.1, Math.min(10, zoom)) }),
      setCanvasPosition: (x: number, y: number) => set({ canvasX: x, canvasY: y }),
      setShowGrid: (show: boolean) => set({ showGrid: show }),
      setShowRulers: (show: boolean) => set({ showRulers: show }),
      
      // Element Actions
      addElement: (element: CanvasElement) => {
        set((state) => ({
          elements: { ...state.elements, [element.id]: element },
          hasUnsavedChanges: true
        }));
      },
      
      updateElement: (id: string, updates: Partial<CanvasElement>) => {
        set((state) => {
          const element = state.elements[id];
          if (!element) return state;
          
          return {
            elements: {
              ...state.elements,
              [id]: { ...element, ...updates }
            },
            hasUnsavedChanges: true
          };
        });
      },
      
      deleteElement: (id: string) => {
        set((state) => {
          const newElements = { ...state.elements };
          delete newElements[id];
          
          return {
            elements: newElements,
            selectedElements: state.selectedElements.filter(selectedId => selectedId !== id),
            selectedElement: state.selectedElement?.id === id ? null : state.selectedElement,
            hasUnsavedChanges: true
          };
        });
      },
      
      selectElements: (elementIds: string[]) => {
        const { elements } = get();
        const selectedElement = elementIds.length === 1 && elementIds[0] 
          ? elements[elementIds[0]] || null 
          : null;
        
        set({
          selectedElements: elementIds,
          selectedElement
        });
      },
      
      clearSelection: () => set({ selectedElements: [], selectedElement: null }),
      
      // Project Actions
      setCurrentProject: (project: Record<string, unknown> | null) => {
        set({ 
          currentProject: project,
          hasUnsavedChanges: false 
        });
      },
      
      setHasUnsavedChanges: (hasChanges: boolean) => set({ hasUnsavedChanges: hasChanges }),
    }),
    {
      name: 'gaf-app-store',
    }
  )
);
