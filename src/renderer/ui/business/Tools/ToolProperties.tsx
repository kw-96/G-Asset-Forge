/**
 * 工具属性组件
 */
import React from 'react';

export interface ToolPropertiesProps {
  className?: string;
}

export const ToolProperties: React.FC<ToolPropertiesProps> = ({ className }) => {
  return (
    <div className={className}>
      <h3>工具属性</h3>
      <p>工具属性配置面板</p>
    </div>
  );
};
