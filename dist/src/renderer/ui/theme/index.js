/**
 * 主题系统 - 基于Figma UI3设计系统
 * 提供完整的设计令牌和主题配置
 */
import { colors, spacing, typography, borderRadius, shadows, animation, zIndex } from './tokens';
// 亮色主题 - 优化视觉层次和对比度
export const lightTheme = {
    colors: {
        primary: colors.primary[500],
        secondary: colors.primary[600],
        accent: colors.primary[400],
        success: colors.semantic.success[500],
        warning: colors.semantic.warning[500],
        error: colors.semantic.error[500],
        info: colors.semantic.info[500],
        background: '#fafbfc', // 更温和的背景色
        surface: '#ffffff', // 纯白表面
        overlay: 'rgba(15, 23, 42, 0.6)', // 更深的遮罩层
        text: {
            primary: colors.neutral[900],
            secondary: colors.neutral[700], // 增强对比度
            tertiary: colors.neutral[500],
            disabled: colors.neutral[400],
            inverse: colors.neutral[0],
        },
        border: {
            default: colors.neutral[200],
            focus: colors.primary[500],
            hover: colors.neutral[300],
        },
        shadow: {
            small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            large: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        canvas: {
            ...colors.canvas,
            background: '#f8fafc', // 更柔和的画布背景
        },
    },
    spacing: {
        xs: spacing[1],
        sm: spacing[2],
        md: spacing[4],
        lg: spacing[6],
        xl: spacing[8],
        '2xl': spacing[12],
        '3xl': spacing[16],
    },
    typography: {
        fontFamily: {
            primary: typography.fontFamily.sans,
            mono: typography.fontFamily.mono,
        },
        fontSize: typography.fontSize,
        fontWeight: typography.fontWeight,
        lineHeight: typography.lineHeight,
    },
    borderRadius,
    shadows,
    animation,
    zIndex,
};
// 暗色主题 - 优化对比度和视觉舒适度
export const darkTheme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        background: '#0f172a', // 更深的背景色
        surface: '#1e293b', // 更有层次的表面色
        overlay: 'rgba(0, 0, 0, 0.8)', // 更深的遮罩
        text: {
            primary: '#f8fafc', // 更亮的主文本
            secondary: '#cbd5e1', // 更好的对比度
            tertiary: '#94a3b8',
            disabled: '#64748b',
            inverse: '#0f172a',
        },
        border: {
            default: '#334155', // 更明显的边框
            focus: colors.primary[400], // 暗色模式下使用更亮的焦点色
            hover: '#475569',
        },
        shadow: {
            small: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            medium: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
            large: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        },
        canvas: {
            background: '#1e293b',
            grid: '#334155',
            selection: '#6366f1',
            selectionBg: 'rgba(99, 102, 241, 0.15)', // 稍微增强选择背景
            guide: '#f59e0b',
        },
    },
};
// 默认导出亮色主题
export const theme = lightTheme;
export default theme;
// 导出所有相关内容
export * from './tokens';
export * from './ThemeProvider';
//# sourceMappingURL=index.js.map