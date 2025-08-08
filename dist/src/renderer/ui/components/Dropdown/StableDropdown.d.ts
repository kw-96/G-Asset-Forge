/**
 * StableDropdown组件 - 解决Radix UI的useEffect依赖问题
 * 提供稳定的下拉菜单功能，防止无限循环
 */
import React from 'react';
interface StableDropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    className?: string;
    sideOffset?: number;
    alignOffset?: number;
}
interface StableDropdownItemProps {
    children: React.ReactNode;
    onSelect?: (event: Event) => void;
    disabled?: boolean;
    destructive?: boolean;
    className?: string;
}
export declare const StableDropdown: React.FC<StableDropdownProps>;
export declare const StableDropdownItem: React.FC<StableDropdownItemProps>;
export declare const StableDropdownSeparator: React.FC<{
    className?: string;
}>;
export type { StableDropdownProps, StableDropdownItemProps };
//# sourceMappingURL=StableDropdown.d.ts.map