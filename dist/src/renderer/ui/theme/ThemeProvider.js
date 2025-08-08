import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './index';
const ThemeContext = createContext(undefined);
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');
    const toggleTheme = () => {
        setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
    };
    const setTheme = (newMode) => {
        setMode(newMode);
    };
    const currentTheme = mode === 'light' ? lightTheme : darkTheme;
    const contextValue = {
        theme: currentTheme,
        mode,
        toggleTheme,
        setTheme,
    };
    return (_jsx(ThemeContext.Provider, { value: contextValue, children: _jsx(StyledThemeProvider, { theme: currentTheme, children: children }) }));
};
//# sourceMappingURL=ThemeProvider.js.map