/**
 * Switch组件 - 基于Radix UI和Figma UI3设计系统
 * 提供可访问的开关切换功能
 */
import React from 'react';
interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
    className?: string;
}
export declare const Switch: React.FC<SwitchProps>;
export {};
//# sourceMappingURL=Switch.d.ts.map