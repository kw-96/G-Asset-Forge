import { useAppStore } from '../appStore';

describe('AppStore', () => {
  it('should initialize with default values', () => {
    const store = useAppStore.getState();
    
    expect(store.version).toBe('1.0.0');
    expect(store.platform).toBe('unknown');
    expect(store.sidebarCollapsed).toBe(false);
    expect(store.currentTool).toBe(null);
    expect(store.isLoading).toBe(false);
    expect(store.currentProject).toBe(null);
    expect(store.hasUnsavedChanges).toBe(false);
  });

  it('should update sidebar collapsed state', () => {
    const { setSidebarCollapsed } = useAppStore.getState();
    
    setSidebarCollapsed(true);
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    
    setSidebarCollapsed(false);
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it('should update current tool', () => {
    const { setCurrentTool } = useAppStore.getState();
    
    setCurrentTool('select');
    expect(useAppStore.getState().currentTool).toBe('select');
    
    setCurrentTool(null);
    expect(useAppStore.getState().currentTool).toBe(null);
  });
});