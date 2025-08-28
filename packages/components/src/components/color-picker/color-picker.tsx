import './color-picker.scss';

import { type FC, useState } from 'react';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  style?: React.CSSProperties;
}

export const ColorPicker: FC<ColorPickerProps> = ({
  value = '#000000',
  onChange,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    onChange?.(newColor);
  };

  return (
    <div className="sk-color-picker" style={style}>
      <div
        className="sk-color-picker-trigger"
        style={{ backgroundColor: value }}
        onClick={() => setIsOpen(!isOpen)}
      />
      <input
        type="color"
        value={value}
        onChange={handleColorChange}
        className="sk-color-picker-input"
      />
    </div>
  );
};
