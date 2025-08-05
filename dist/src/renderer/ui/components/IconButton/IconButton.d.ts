import React from 'react';
export type IconButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
interface IIconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart'> {
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    icon: React.ReactNode;
    loading?: boolean;
}
export declare const IconButton: React.FC<IIconButtonProps>;
export {};
//# sourceMappingURL=IconButton.d.ts.map