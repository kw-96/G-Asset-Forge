import React, { ReactNode } from 'react';
import { lightTheme } from './index';
export type ThemeMode = 'light' | 'dark';
interface ThemeContextType {
    theme: typeof lightTheme;
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