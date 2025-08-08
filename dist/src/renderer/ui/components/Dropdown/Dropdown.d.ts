/**
 * Dropdown组件 - 基于Radix UI和Figma UI3设计系统
 * 提供可访问的下拉菜单功能
 */
import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
}
interface DropdownItemProps {
    children: React.ReactNode;
    onSelect?: (event: Event) => void;
    disabled?: boolean;
    destructive?: boolean;
}
export declare const Dropdown: React.FC<DropdownProps>;
export declare const DropdownItem: React.FC<DropdownItemProps>;
export declare const DropdownSeparatorComponent: import("styled-components/dist/types").IStyledComponentBase<"web", import("styled-components").FastOmit<Omit<DropdownMenu.DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
    ref?: ((instance: HTMLDivElement | null) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | React.RefObject<HTMLDivElement> | null | undefined;
}, never>> & string & Omit<React.ForwardRefExoticComponent<DropdownMenu.DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>>, keyof React.Component<any, {}, any>>;
export {};
//# sourceMappingURL=Dropdown.d.ts.map