/**
 * 主题系统 - 基于Figma UI3设计系统
 * 提供完整的设计令牌和主题配置
 */
import { typography, borderRadius, shadows, animation, zIndex } from './tokens';
export interface Theme {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        background: string;
        surface: string;
        overlay: string;
        text: {
            primary: string;
            secondary: string;
            tertiary: string;
            disabled: string;
            inverse: string;
        };
        border: {
            default: string;
            focus: string;
            hover: string;
        };
        shadow: {
            small: string;
            medium: string;
            large: string;
        };
        canvas: {
            background: string;
            grid: string;
            selection: string;
            selectionBg: string;
            guide: string;
        };
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
    };
    typography: {
        fontFamily: {
            primary: string;
            mono: string;
        };
        fontSize: typeof typography.fontSize;
        fontWeight: typeof typography.fontWeight;
        lineHeight: typeof typography.lineHeight;
    };
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
    animation: typeof animation;
    zIndex: typeof zIndex;
}
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export declare const theme: Theme;
export default theme;
export type ThemeColors = Theme['colors'];
export type ThemeSpacing = Theme['spacing'];
export * from './tokens';
export * from './ThemeProvider';
//# sourceMappingURL=index.d.ts.map