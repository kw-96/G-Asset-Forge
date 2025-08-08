/**
 * Progress组件 - 基于Figma UI3设计系统
 * 用于显示任务进度和加载状态
 */
import React from 'react';
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md' | 'lg';
interface ProgressProps {
    value?: number;
    variant?: ProgressVariant;
    size?: ProgressSize;
    indeterminate?: boolean;
    label?: string;
    showValue?: boolean;
    className?: string;
}
export declare const Progress: React.FC<ProgressProps>;
export {};
//# sourceMappingURL=Progress.d.ts.map