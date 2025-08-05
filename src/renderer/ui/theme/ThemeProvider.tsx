// 主题提供者组件
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, type ITheme } from './index';

export type ThemeMode = 'light' | 'dark';

interface IThemeContext {
  theme: ITheme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<IThemeContext | undefined>(undefined);

export const useTheme = (): IThemeContext => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface IThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<IThemeProviderProps> = ({ 
  children, 
  defaultMode = 'light' 
}) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // 尝试从localStorage读取保存的主题模式
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
      return savedMode || defaultMode;
    }
    return defaultMode;
  });

  const theme = mode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // 保存主题模式到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', mode);
    }
  }, [mode]);

  // 更新CSS变量以支持原生CSS
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // 设置CSS变量
      root.style.setProperty('--color-primary', theme.colors.primary);
      root.style.setProperty('--color-background', theme.colors.background);
      root.style.setProperty('--color-surface', theme.colors.surface);
      root.style.setProperty('--color-text-primary', theme.colors.text.primary);
      root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
      root.style.setProperty('--color-border-default', theme.colors.border.default);
      
      // 设置body背景色
      document.body.style.backgroundColor = theme.colors.background;
      document.body.style.color = theme.colors.text.primary;
    }
  }, [theme]);

  const contextValue: IThemeContext = {
    theme,
    mode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};