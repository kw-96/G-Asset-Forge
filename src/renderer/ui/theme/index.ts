// 主题系统 - 基于Figma和Penpot设计语言
export interface ITheme {
  colors: {
    // 基础颜色
    primary: string;
    secondary: string;
    accent: string;
    
    // 语义颜色
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // 中性色
    background: string;
    surface: string;
    overlay: string;
    
    // 文本颜色
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
    };
    
    // 边框颜色
    border: {
      default: string;
      focus: string;
      hover: string;
    };
    
    // 阴影
    shadow: {
      small: string;
      medium: string;
      large: string;
    };
    
    // 画布特定颜色
    canvas: {
      background: string;
      grid: string;
      selection: string;
    };
  };
  
  typography: {
    fontFamily: {
      primary: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
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
    xxl: string;
  };
  
  borderRadius: {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  
  zIndex: {
    dropdown: number;
    modal: number;
    popover: number;
    tooltip: number;
  };
  
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

// 亮色主题 - 基于Figma设计语言
export const lightTheme: ITheme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    background: '#ffffff',
    surface: '#f8fafc',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      tertiary: '#94a3b8',
      disabled: '#cbd5e1',
      inverse: '#ffffff',
    },
    
    border: {
      default: '#e2e8f0',
      focus: '#667eea',
      hover: '#cbd5e1',
    },
    
    shadow: {
      small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      large: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    
    canvas: {
      background: '#f1f5f9',
      grid: '#e2e8f0',
      selection: '#667eea',
    },
  },
  
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    xxl: '5rem',
  },
  
  borderRadius: {
    none: '0',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    popover: 1030,
    tooltip: 1070,
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// 暗色主题 - 基于Penpot设计语言
export const darkTheme: ITheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    
    background: '#0f172a',
    surface: '#1e293b',
    overlay: 'rgba(0, 0, 0, 0.8)',
    
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#64748b',
      disabled: '#475569',
      inverse: '#1e293b',
    },
    
    border: {
      default: '#334155',
      focus: '#667eea',
      hover: '#475569',
    },
    
    shadow: {
      small: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      large: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    },
    
    canvas: {
      background: '#1e293b',
      grid: '#334155',
      selection: '#667eea',
    },
  },
};