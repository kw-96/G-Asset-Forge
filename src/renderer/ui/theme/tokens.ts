/**
 * 设计令牌 - 基于Figma UI3设计系统
 * 定义颜色、间距、字体等设计基础元素
 */

// 颜色系统
export const colors = {
    // 主色调 - 专业的蓝紫色调，适合设计工具
    primary: {
        50: '#f0f4ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1', // 主色
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
    },

    // 中性色 - 界面基础色
    neutral: {
        0: '#ffffff',
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a',
    },

    // 语义色彩
    semantic: {
        success: {
            50: '#f0fdf4',
            500: '#22c55e',
            600: '#16a34a',
        },
        warning: {
            50: '#fffbeb',
            500: '#f59e0b',
            600: '#d97706',
        },
        error: {
            50: '#fef2f2',
            500: '#ef4444',
            600: '#dc2626',
        },
        info: {
            50: '#eff6ff',
            500: '#3b82f6',
            600: '#2563eb',
        },
    },

    // 画布专用色彩
    canvas: {
        background: '#f8fafc',
        grid: '#e2e8f0',
        selection: '#6366f1',
        selectionBg: 'rgba(99, 102, 241, 0.1)',
        guide: '#f59e0b',
    },
} as const;

// 间距系统 - 8px基础网格
export const spacing = {
    0: '0px',
    1: '4px',   // 0.25rem
    2: '8px',   // 0.5rem
    3: '12px',  // 0.75rem
    4: '16px',  // 1rem
    5: '20px',  // 1.25rem
    6: '24px',  // 1.5rem
    8: '32px',  // 2rem
    10: '40px', // 2.5rem
    12: '48px', // 3rem
    16: '64px', // 4rem
    20: '80px', // 5rem
    24: '96px', // 6rem
} as const;

// 字体系统
export const typography = {
    fontFamily: {
        sans: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(', '),
        mono: [
            '"SF Mono"',
            'Monaco',
            '"Cascadia Code"',
            '"Roboto Mono"',
            'Consolas',
            '"Liberation Mono"',
            '"Courier New"',
            'monospace',
        ].join(', '),
    },

    fontSize: {
        xs: '12px',   // 0.75rem
        sm: '14px',   // 0.875rem
        base: '16px', // 1rem
        lg: '18px',   // 1.125rem
        xl: '20px',   // 1.25rem
        '2xl': '24px', // 1.5rem
        '3xl': '30px', // 1.875rem
        '4xl': '36px', // 2.25rem
    },

    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
    },
} as const;

// 圆角系统
export const borderRadius = {
    none: '0px',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
} as const;

// 阴影系统
export const shadows = {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

// 动画系统
export const animation = {
    duration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
    },

    easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
} as const;

// Z-index层级
export const zIndex = {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
} as const;

// 断点系统
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// 组件尺寸
export const sizes = {
    xs: '20px',
    sm: '24px',
    md: '32px',
    lg: '40px',
    xl: '48px',
    '2xl': '56px',
} as const;