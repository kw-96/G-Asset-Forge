/*
* 自动布局开关
*/
import './Switch.scss';

import React from 'react';

interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <label className={`switch ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="slider" />
    </label>
  );
};
