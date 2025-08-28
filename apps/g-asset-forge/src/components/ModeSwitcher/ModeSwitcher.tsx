/**
 * 模式切换器组件 - 添加H5模式和设计模式的切换功能
 */
import './ModeSwitcher.scss';

import React from 'react';

import { SvgIcon } from '../SvgIcon';

export interface ModeSwitcherProps {
  currentMode: 'design' | 'h5';
  onModeChange: (mode: 'design' | 'h5') => void;
  className?: string;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onModeChange,
  className,
}) => {
  return (
    <div className={`mode-switcher ${className || ''}`}>
      <button
        type="button"
        className={`mode-switcher__btn ${
          currentMode === 'design' ? 'mode-switcher__btn--active' : ''
        }`}
        onClick={() => onModeChange('design')}
        title="设计模式"
      >
        <SvgIcon name="icon.24.file.design.library" size={16} />
        <span>设计模式</span>
      </button>

      <button
        type="button"
        className={`mode-switcher__btn ${
          currentMode === 'h5' ? 'mode-switcher__btn--active' : ''
        }`}
        onClick={() => onModeChange('h5')}
        title="H5模式"
      >
        <SvgIcon name="icon.24.plus" size={16} />
        <span>H5模式</span>
      </button>
    </div>
  );
};
