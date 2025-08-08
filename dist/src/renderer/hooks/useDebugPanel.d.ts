/**
 * 调试面板Hook
 * 管理调试面板的显示状态和快捷键
 */
export interface UseDebugPanelOptions {
    enabled?: boolean;
    shortcutKey?: string;
    autoEnable?: boolean;
}
export declare const useDebugPanel: (options?: UseDebugPanelOptions) => {
    isVisible: boolean;
    isDebugEnabled: boolean;
    showPanel: () => void;
    hidePanel: () => void;
    togglePanel: () => void;
    toggleDebugTools: (enable?: boolean) => void;
    enabled: boolean;
};
//# sourceMappingURL=useDebugPanel.d.ts.map