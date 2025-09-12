import './SelectInput.scss';

import { type FC } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SelectInput: FC<SelectInputProps> = ({
  value,
  options,
  onChange,
  placeholder = '请选择',
}) => {
  return (
    <select
      className="select-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
