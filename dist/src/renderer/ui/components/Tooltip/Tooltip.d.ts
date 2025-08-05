import React from 'react';
interface ITooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    disabled?: boolean;
}
export declare const Tooltip: React.FC<ITooltipProps>;
export {};
//# sourceMappingURL=Tooltip.d.ts.map