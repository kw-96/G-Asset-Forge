/**
 * Figma风格的颜色选择器
 * 支持HSB、RGB、HEX等多种颜色模式
 */

import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../Icon/SvgIcon';
import { Input } from '../Input/Input';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  showAlpha?: boolean;
  presetColors?: string[];
}

const ColorPickerContainer = styled.div`
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  padding: 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
`;

const ColorArea = styled.div`
  position: relative;
  width: 248px;
  height: 160px;
  border-radius: 6px;
  margin-bottom: 12px;
  cursor: crosshair;
  background: linear-gradient(to right, white, transparent),
              linear-gradient(to top, black, transparent);
`;

const ColorAreaBackground = styled.div<{ $hue: number }>`
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: hsl(${({ $hue }) => $hue}, 100%, 50%);
  z-index: -1;
`;

const ColorAreaOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: 
    linear-gradient(to right, white, transparent),
    linear-gradient(to top, black, transparent);
`;

const ColorAreaCursor = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  pointer-events: none;
`;

const HueSlider = styled.div`
  position: relative;
  width: 248px;
  height: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  background: linear-gradient(to right, 
    #ff0000 0%, 
    #ffff00 16.66%, 
    #00ff00 33.33%, 
    #00ffff 50%, 
    #0000ff 66.66%, 
    #ff00ff 83.33%, 
    #ff0000 100%
  );
  cursor: pointer;
`;

const HueSliderThumb = styled.div<{ $position: number }>`
  position: absolute;
  left: ${({ $position }) => $position}px;
  top: 50%;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  pointer-events: none;
`;

const AlphaSlider = styled.div<{ $color: string }>`
  position: relative;
  width: 248px;
  height: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  cursor: pointer;
  background: 
    linear-gradient(to right, transparent, ${({ $color }) => $color}),
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px;
  background-position: 0 0, 0 0, 0 4px, 4px -4px, -4px 0px;
`;

const AlphaSliderThumb = styled.div<{ $position: number }>`
  position: absolute;
  left: ${({ $position }) => $position}px;
  top: 50%;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  pointer-events: none;
`;

const ColorInputs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ColorModeToggle = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ColorModeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 6px 12px;
  border: none;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary[500] : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primary[600] : '#f9fafb'};
  }
`;

const ColorInput = styled(Input)`
  flex: 1;
  font-size: 12px;
  text-align: center;
  height: 28px;
`;

const PresetColors = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  margin-bottom: 12px;
`;

const PresetColor = styled.button<{ $color: string; $selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid ${({ $selected, theme }) => 
    $selected ? theme.colors.primary[500] : 'transparent'};
  background: ${({ $color }) => $color};
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 2px;
    background: 
      linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
      linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #f3f4f6 75%), 
      linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
    background-size: 6px 6px;
    background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
    z-index: -1;
  }
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  background: ${({ $color }) => $color};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 6px;
    background: 
      linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
      linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #f3f4f6 75%), 
      linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
    z-index: -1;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EyedropperButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms ease;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

// 颜色转换工具函数
const hexToHsb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const s = max === 0 ? 0 : Math.round((diff / max) * 100);
  const brightness = Math.round(max * 100);
  
  return { h, s, b: brightness };
};

const hsbToHex = (h: number, s: number, b: number) => {
  s /= 100;
  b /= 100;
  
  const c = b * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = b - c;
  
  let r = 0, g = 0, blue = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; blue = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; blue = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; blue = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; blue = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; blue = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; blue = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  blue = Math.round((blue + m) * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  onClose: _onClose,
  showAlpha = false,
  presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00',
    '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#808080', '#c0c0c0', '#800000', '#008000',
    '#000080', '#808000', '#800080', '#008080'
  ]
}) => {
  const [colorMode, setColorMode] = useState<'HSB' | 'RGB' | 'HEX'>('HEX');
  const [hsb, setHsb] = useState(() => hexToHsb(value));
  const [alpha, setAlpha] = useState(100);
  
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const alphaSliderRef = useRef<HTMLDivElement>(null);

  const currentColor = hsbToHex(hsb.h, hsb.s, hsb.b);

  const handleColorAreaChange = useCallback((e: React.MouseEvent) => {
    if (!colorAreaRef.current) return;
    
    const rect = colorAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(248, e.clientX - rect.left));
    const y = Math.max(0, Math.min(160, e.clientY - rect.top));
    
    const s = Math.round((x / 248) * 100);
    const b = Math.round(((160 - y) / 160) * 100);
    
    const newHsb = { ...hsb, s, b };
    setHsb(newHsb);
    onChange(hsbToHex(newHsb.h, newHsb.s, newHsb.b));
  }, [hsb, onChange]);

  const handleHueChange = useCallback((e: React.MouseEvent) => {
    if (!hueSliderRef.current) return;
    
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(248, e.clientX - rect.left));
    const h = Math.round((x / 248) * 360);
    
    const newHsb = { ...hsb, h };
    setHsb(newHsb);
    onChange(hsbToHex(newHsb.h, newHsb.s, newHsb.b));
  }, [hsb, onChange]);

  const handleAlphaChange = useCallback((e: React.MouseEvent) => {
    if (!alphaSliderRef.current) return;
    
    const rect = alphaSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(248, e.clientX - rect.left));
    const newAlpha = Math.round((x / 248) * 100);
    
    setAlpha(newAlpha);
    // 这里可以扩展支持alpha通道
  }, []);

  const handlePresetColorClick = (color: string) => {
    setHsb(hexToHsb(color));
    onChange(color);
  };

  return (
    <ColorPickerContainer>
      {/* 颜色选择区域 */}
      <ColorArea
        ref={colorAreaRef}
        onMouseDown={handleColorAreaChange}
      >
        <ColorAreaBackground $hue={hsb.h} />
        <ColorAreaOverlay />
        <ColorAreaCursor 
          $x={(hsb.s / 100) * 248} 
          $y={160 - (hsb.b / 100) * 160} 
        />
      </ColorArea>

      {/* 色相滑块 */}
      <HueSlider
        ref={hueSliderRef}
        onMouseDown={handleHueChange}
      >
        <HueSliderThumb $position={(hsb.h / 360) * 248} />
      </HueSlider>

      {/* 透明度滑块 */}
      {showAlpha && (
        <AlphaSlider
          ref={alphaSliderRef}
          $color={currentColor}
          onMouseDown={handleAlphaChange}
        >
          <AlphaSliderThumb $position={(alpha / 100) * 248} />
        </AlphaSlider>
      )}

      {/* 颜色模式切换 */}
      <ColorModeToggle>
        {(['HSB', 'RGB', 'HEX'] as const).map((mode) => (
          <ColorModeButton
            key={mode}
            $active={colorMode === mode}
            onClick={() => setColorMode(mode)}
          >
            {mode}
          </ColorModeButton>
        ))}
      </ColorModeToggle>

      {/* 颜色输入 */}
      <ColorInputs>
        <ColorPreview $color={currentColor} />
        {colorMode === 'HEX' && (
          <ColorInput
            value={currentColor}
            onChange={(e) => {
              const hex = e.target.value;
              if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                setHsb(hexToHsb(hex));
                onChange(hex);
              }
            }}
          />
        )}
        {colorMode === 'RGB' && (
          <>
            <ColorInput placeholder="R" />
            <ColorInput placeholder="G" />
            <ColorInput placeholder="B" />
          </>
        )}
        {colorMode === 'HSB' && (
          <>
            <ColorInput value={hsb.h} placeholder="H" />
            <ColorInput value={hsb.s} placeholder="S" />
            <ColorInput value={hsb.b} placeholder="B" />
          </>
        )}
      </ColorInputs>

      {/* 预设颜色 */}
      <PresetColors>
        {presetColors.map((color) => (
          <PresetColor
            key={color}
            $color={color}
            $selected={color === currentColor}
            onClick={() => handlePresetColorClick(color)}
          />
        ))}
      </PresetColors>

      {/* 操作按钮 */}
      <ActionButtons>
        <EyedropperButton>
          <SvgIcon name="icon.24.eyedropper.small" size={12} title="吸管工具" />
          吸管
        </EyedropperButton>
        
        <ColorPreview $color={currentColor} />
      </ActionButtons>
    </ColorPickerContainer>
  );
};