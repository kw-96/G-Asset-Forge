import './input.scss';

import { type FC, type InputHTMLAttributes } from 'react';

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const Input: FC<InputProps> = ({
  value,
  onChange,
  suffix,
  className,
  style,
  ...props
}) => {
  return (
    <div className={`sk-input-wrapper ${className || ''}`} style={style}>
      <input
        className="sk-input"
        value={value}
        onChange={onChange}
        {...props}
      />
      {suffix && <span className="sk-input-suffix">{suffix}</span>}
    </div>
  );
};
