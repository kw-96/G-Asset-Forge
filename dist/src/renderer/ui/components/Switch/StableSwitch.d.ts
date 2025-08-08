/**
 * StableSwitch组件 - 解决Radix UI Switch的useEffect依赖问题
 * 提供稳定的开关切换功能，防止无限循环
 */
import React from 'react';
interface StableSwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
    className?: string;
    name?: string;
    value?: string;
    required?: boolean;
}
export declare const StableSwitch: React.FC<StableSwitchProps>;
export type { StableSwitchProps };
//# sourceMappingURL=StableSwitch.d.ts.map