import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  // App info
  version: string;
  platform: string;
  
  // UI state
  sidebarCollapsed: boolean;
  currentTool: string | null;
  isLoading: boolean;
  
  // Project state
  currentProject: any | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  initializeApp: () => Promise<void>;
  setAppVersion: (version: string) => void;
  setPlatform: (platform: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentTool: (tool: string | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentProject: (project: Record<string, unknown> | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      version: '1.0.0',
      platform: 'unknown',
      sidebarCollapsed: false,
      currentTool: null,
      isLoading: false,
      currentProject: null,
      hasUnsavedChanges: false,

      // Actions
      initializeApp: async () => {
        set({ isLoading: true });
        
        try {
          // Initialize app-level configurations
          console.log('App initialized');
        } catch (error) {
          console.error('Failed to initialize app:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setAppVersion: (version: string) => set({ version }),
      
      setPlatform: (platform: string) => set({ platform }),
      
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      
      setCurrentTool: (tool: string | null) => set({ currentTool: tool }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setCurrentProject: (project: Record<string, unknown> | null) => {
        set({ 
          currentProject: project,
          hasUnsavedChanges: false 
        });
      },
      
      setHasUnsavedChanges: (hasChanges: boolean) => set({ hasUnsavedChanges: hasChanges }),
    }),
    {
      name: 'app-store',
    }
  )
);