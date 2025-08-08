/**
 * 顶部工具栏 - Figma风格的主工具栏
 * 包含文件操作、编辑操作、视图控制等功能
 */
import React from 'react';
interface TopToolbarProps {
    onToggleLeftPanel: () => void;
    onToggleRightPanel: () => void;
    leftPanelCollapsed: boolean;
    rightPanelCollapsed: boolean;
}
export declare const TopToolbar: React.FC<TopToolbarProps>;
export {};
//# sourceMappingURL=TopToolbar.d.ts.map