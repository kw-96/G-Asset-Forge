import React, { ReactNode } from 'react';
declare const theme: {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        text: {
            primary: string;
            secondary: string;
            disabled: string;
        };
        background: {
            default: string;
            paper: string;
            dark: string;
        };
        border: {
            default: string;
            light: string;
            dark: string;
        };
        surface: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    borderRadius: {
        small: string;
        medium: string;
        large: string;
    };
    shadows: {
        small: string;
        medium: string;
        large: string;
    };
};
export type Theme = typeof theme;
export type ThemeMode = 'light' | 'dark';
interface ThemeContextType {
    theme: Theme;
    mode: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}
export declare const useTheme: () => ThemeContextType;
interface ThemeProviderProps {
    children: ReactNode;
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export {};
//# sourceMappingURL=ThemeProvider.d.ts.map