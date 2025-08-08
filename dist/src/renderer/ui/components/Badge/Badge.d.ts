/**
 * Badge组件 - 基于Figma UI3设计系统
 * 用于显示状态、标签和计数
 */
import React from 'react';
export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
export type BadgeSize = 'sm' | 'md' | 'lg';
interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    children?: React.ReactNode;
    className?: string;
}
export declare const Badge: React.FC<BadgeProps>;
export {};
//# sourceMappingURL=Badge.d.ts.map