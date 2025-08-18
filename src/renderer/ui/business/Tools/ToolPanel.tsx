/**
 * 工具面板组件
 */
import React from 'react';

export interface ToolPanelProps {
  className?: string;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ className }) => {
  return (
    <div className={className}>
      <h3>工具面板</h3>
      <p>工具选择面板</p>
    </div>
  );
};
