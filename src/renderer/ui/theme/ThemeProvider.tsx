import React, { ReactNode, createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, Theme } from './index';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeConfig {
  customAccentColor?: string;
  reducedMotion: boolean;
  followSystem: boolean;
  transitionDuration: number;
}

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  actualMode: 'light' | 'dark'; // 实际应用的主题模式
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  // 为了向后兼容，直接暴露theme的属性
  colors: Theme['colors'];
  borderRadius: Theme['borderRadius'];

  // 新增功能
  systemPreference: 'light' | 'dark';
  followSystem: boolean;
  setFollowSystem: (follow: boolean) => void;
  transitionDuration: number;
  setTransitionDuration: (duration: number) => void;
  customAccentColor: string | undefined;
  setCustomAccentColor: (color: string) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;

  // 主题配置
  config: ThemeConfig;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface FigmaThemeProviderProps {
  children: ReactNode;
}

// 检测系统主题偏好
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// 检测系统是否偏好减少动画
const getSystemReducedMotion = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// 从本地存储加载主题配置
const loadThemeConfig = (): { mode: ThemeMode; config: ThemeConfig } => {
  try {
    const stored = localStorage.getItem('theme-config');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        mode: parsed.mode || 'system',
        config: {
          customAccentColor: parsed.customAccentColor,
          reducedMotion: parsed.reducedMotion ?? getSystemReducedMotion(),
          followSystem: parsed.followSystem ?? true,
          transitionDuration: parsed.transitionDuration ?? 300,
        }
      };
    }
  } catch (error) {
    console.warn('从localStorage加载主题配置失败:', error);
  }

  return {
    mode: 'system',
    config: {
      reducedMotion: getSystemReducedMotion(),
      followSystem: true,
      transitionDuration: 300,
    }
  };
};

// 保存主题配置到本地存储
const saveThemeConfig = (mode: ThemeMode, config: ThemeConfig) => {
  try {
    localStorage.setItem('theme-config', JSON.stringify({ mode, ...config }));
  } catch (error) {
    console.warn('保存主题配置到localStorage失败:', error);
  }
};

export const ThemeProvider: React.FC<FigmaThemeProviderProps> = ({ children }) => {
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(getSystemTheme);
  const [mode, setMode] = useState<ThemeMode>('system');
  const [config, setConfig] = useState<ThemeConfig>({
    reducedMotion: getSystemReducedMotion(),
    followSystem: true,
    transitionDuration: 300,
  });

  // 初始化时加载保存的配置
  useEffect(() => {
    const { mode: savedMode, config: savedConfig } = loadThemeConfig();
    setMode(savedMode);
    setConfig(savedConfig);
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 监听系统减少动画偏好变化
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (config.followSystem) {
        updateConfig({ reducedMotion: e.matches });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.followSystem]);

  // 计算实际应用的主题模式
  const actualMode: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') {
      return systemPreference;
    }
    return mode;
  }, [mode, systemPreference]);

  // 创建自定义主题（如果有自定义强调色）
  const currentTheme = useMemo(() => {
    const baseTheme = actualMode === 'light' ? lightTheme : darkTheme;

    // 创建基础主题的副本
    let theme = { ...baseTheme };

    // 如果启用了减少动画，修改动画持续时间
    if (config.reducedMotion) {
      // 使用类型断言来绕过严格的字面量类型检查
      const zeroMsDuration = {
        instant: '0ms' as const,
        fast: '0ms' as const,
        normal: '0ms' as const,
        slow: '0ms' as const,
        slower: '0ms' as const,
        microInteraction: '0ms' as const,
        transition: '0ms' as const,
        modal: '0ms' as const,
        drawer: '0ms' as const,
        tooltip: '0ms' as const,
      };

      theme = {
        ...theme,
        animation: {
          ...baseTheme.animation,
          duration: zeroMsDuration as unknown as typeof baseTheme.animation.duration,
        },
      };
    }

    // 如果有自定义强调色，应用它
    if (config.customAccentColor) {
      theme = {
        ...theme,
        colors: {
          ...theme.colors,
          primary: config.customAccentColor,
          accent: config.customAccentColor,
          interaction: {
            ...theme.colors.interaction,
            focus: config.customAccentColor,
            selection: config.customAccentColor,
          },
        },
      };
    }

    return theme;
  }, [actualMode, config.customAccentColor, config.reducedMotion]);

  const toggleTheme = () => {
    const newMode: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(newMode);
    saveThemeConfig(newMode, config);
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    saveThemeConfig(newMode, config);
  };

  const setFollowSystem = (follow: boolean) => {
    const newConfig = { ...config, followSystem: follow };
    setConfig(newConfig);
    saveThemeConfig(mode, newConfig);
  };

  const setTransitionDuration = (duration: number) => {
    const newConfig = { ...config, transitionDuration: duration };
    setConfig(newConfig);
    saveThemeConfig(mode, newConfig);
  };

  const setCustomAccentColor = (color: string) => {
    const newConfig = { ...config, customAccentColor: color };
    setConfig(newConfig);
    saveThemeConfig(mode, newConfig);
  };

  const setReducedMotion = (reduced: boolean) => {
    const newConfig = { ...config, reducedMotion: reduced };
    setConfig(newConfig);
    saveThemeConfig(mode, newConfig);
  };

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveThemeConfig(mode, newConfig);
  };

  const contextValue: ThemeContextType = {
    theme: currentTheme,
    mode,
    actualMode,
    colors: currentTheme.colors,
    borderRadius: currentTheme.borderRadius,
    toggleTheme,
    setTheme,
    systemPreference,
    followSystem: config.followSystem,
    setFollowSystem,
    transitionDuration: config.transitionDuration,
    setTransitionDuration,
    customAccentColor: config.customAccentColor,
    setCustomAccentColor,
    reducedMotion: config.reducedMotion,
    setReducedMotion,
    config,
    updateConfig,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export type { FigmaThemeProviderProps as ThemeProviderProps };
export { ThemeProvider as FigmaThemeProvider };