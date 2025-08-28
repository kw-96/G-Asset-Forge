/**
 * 悬浮操作按钮组件 - 在画布右上角提供素材库、模板库、项目库的快速访问
 */
import './FloatingActionButtons.scss';

import React from 'react';

import { SvgIcon } from '../SvgIcon';

export interface FloatingActionButtonsProps {
  onOpenAssetLibrary: () => void;
  onOpenTemplateLibrary: () => void;
  onOpenProjectLibrary: () => void;
  className?: string;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onOpenAssetLibrary,
  onOpenTemplateLibrary,
  onOpenProjectLibrary,
  className,
}) => {
  return (
    <div className={`floating-action-buttons ${className || ''}`}>
      <button
        type="button"
        className="floating-btn floating-btn--asset"
        onClick={onOpenAssetLibrary}
        title="素材库"
      >
        <SvgIcon name="icon.24.file.design.assets" size={24} />
      </button>

      <button
        type="button"
        className="floating-btn floating-btn--template"
        onClick={onOpenTemplateLibrary}
        title="模板库"
      >
        <SvgIcon name="icon.24.file.design.mods" size={24} />
      </button>

      <button
        type="button"
        className="floating-btn floating-btn--project"
        onClick={onOpenProjectLibrary}
        title="项目库"
      >
        <SvgIcon name="icon.24.file.design.library" size={24} />
      </button>
    </div>
  );
};
