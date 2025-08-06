import React, { ReactNode } from 'react';
import { ITheme } from './index';
export type Theme = ITheme;
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