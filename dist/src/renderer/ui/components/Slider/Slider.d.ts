/**
 * Slider组件 - 基于Radix UI和Figma UI3设计系统
 * 提供可访问的滑块输入功能
 */
import React from 'react';
interface SliderProps {
    value: number[];
    onValueChange: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    label?: string;
    className?: string;
}
export declare const Slider: React.FC<SliderProps>;
export {};
//# sourceMappingURL=Slider.d.ts.map