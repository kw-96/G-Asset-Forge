/**
 * 左侧工具面板 - Figma风格的工具选择面板
 * 包含设计工具和面板切换功能
 */
import React from 'react';
interface LeftToolPanelProps {
    activePanel: 'layers' | 'assets';
    onSwitchPanel: (panel: 'layers' | 'assets') => void;
}
export declare const LeftToolPanel: React.FC<LeftToolPanelProps>;
export {};
//# sourceMappingURL=LeftToolPanel.d.ts.map