/**
 * 主题系统 - 基于Figma UI3设计系统
 * 提供完整的设计令牌和主题配置
 */

import { colors, spacing, typography, borderRadius, shadows, animation, zIndex } from './tokens';

// 简化的主题接口
export interface Theme {
  colors: {
    // 主色系
    primary: string;
    secondary: string;
    accent: string;

    // 语义色
    success: string;
    warning: string;
    error: string;
    info: string;

    // 背景色
    background: {
      primary: string;
      secondary: string;
      hover: string;
      pressed: string;
    };
    surface: string;
    overlay: string;

    // 文本色
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
    };

    // 边框色
    border: {
      default: string;
      subtle: string;
      strong: string;
      focus: string;
      hover: string;
    };

    // 状态颜色
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };

    // 语义色彩
    semantic: typeof colors.semantic;

    // 中性色
    neutral: typeof colors.neutral;

    // 阴影
    shadow: {
      small: string;
      medium: string;
      large: string;
    };

    // 画布专用色
    canvas: {
      background: string;
      grid: string;
      selection: string;
      selectionBg: string;
      guide: string;
    };

    // Figma风格界面色彩
    interface: {
      sidebar: {
        light: string;
        dark: string;
      };
      toolbar: {
        light: string;
        dark: string;
      };
      canvasArea: {
        light: string;
        dark: string;
      };
      panel: {
        light: string;
        dark: string;
      };
      divider: {
        light: string;
        dark: string;
      };
    };

    // 交互色彩
    interaction: {
      hover: string;
      hoverDark: string;
      active: string;
      activeDark: string;
      focus: string;
      selection: string;
      selectionBg: string;
      disabled: string;
      disabledDark: string;
    };

    // 工具色彩
    tool: {
      select: string;
      frame: string;
      shape: string;
      pen: string;
      text: string;
      image: string;
      brush: string;
      crop: string;
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
    '4xl': string;
    '5xl': string;
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
  borderRadius: typeof borderRadius & {
    small: string;
    medium: string;
    large: string;
  };
  shadows: typeof shadows;
  animation: typeof animation;
  zIndex: typeof zIndex;
}

// 亮色主题 - 优化视觉层次和对比度
export const lightTheme: Theme = {
  colors: {
    primary: colors.primary[500],
    secondary: colors.primary[600],
    accent: colors.primary[400],
    success: colors.semantic.success[500],
    warning: colors.semantic.warning[500],
    error: colors.semantic.error[500],
    info: colors.semantic.info[500],
    background: {
      primary: '#fafbfc', // 更温和的背景色
      secondary: '#ffffff', // 纯白表面
      hover: colors.neutral[100],
      pressed: colors.neutral[200],
    },
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
      subtle: colors.neutral[100],
      strong: colors.neutral[300],
      focus: colors.primary[500],
      hover: colors.neutral[300],
    },
    status: {
      success: colors.semantic.success[500],
      warning: colors.semantic.warning[500],
      error: colors.semantic.error[500],
      info: colors.semantic.info[500],
    },
    semantic: colors.semantic,
    neutral: colors.neutral,
    shadow: {
      small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      large: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    canvas: {
      ...colors.canvas,
      background: '#f8fafc', // 更柔和的画布背景
    },
    interface: colors.interface,
    interaction: colors.interaction,
    tool: colors.tool,
  },
  spacing: {
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[4],
    lg: spacing[6],
    xl: spacing[8],
    '2xl': spacing[12],
    '3xl': spacing[16],
    '4xl': spacing[20],
    '5xl': spacing[24],
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
  borderRadius: {
    ...borderRadius,
    small: borderRadius.sm,
    medium: borderRadius.md,
    large: borderRadius.lg,
  },
  shadows,
  animation,
  zIndex,
};

// 暗色主题 - 优化对比度和视觉舒适度
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: {
      primary: '#0f172a', // 更深的背景色
      secondary: '#1e293b', // 更有层次的表面色
      hover: colors.neutral[700],
      pressed: colors.neutral[600],
    },
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
      subtle: colors.neutral[800],
      strong: colors.neutral[600],
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
      grid: '#475569', // 增强暗色模式下网格线的对比度
      selection: '#6366f1',
      selectionBg: 'rgba(99, 102, 241, 0.15)', // 稍微增强选择背景
      guide: '#f59e0b',
    },
    interface: colors.interface,
    interaction: colors.interaction,
    tool: colors.tool,
  },
};

// 默认导出亮色主题
export const theme = lightTheme;
export default theme;

// 类型导出
export type ThemeColors = Theme['colors'];
export type ThemeSpacing = Theme['spacing'];

// 导出所有相关内容
export * from './tokens';
export * from './ThemeProvider';