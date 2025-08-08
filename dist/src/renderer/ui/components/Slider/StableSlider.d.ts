/**
 * StableSlider组件 - 解决Radix UI Slider的useEffect依赖问题
 * 提供稳定的滑块输入功能，防止无限循环
 */
import React from 'react';
interface StableSliderProps {
    value: number[];
    onValueChange: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    label?: string;
    className?: string;
    name?: string;
    orientation?: 'horizontal' | 'vertical';
    inverted?: boolean;
    showValue?: boolean;
}
export declare const StableSlider: React.FC<StableSliderProps>;
export type { StableSliderProps };
//# sourceMappingURL=StableSlider.d.ts.map