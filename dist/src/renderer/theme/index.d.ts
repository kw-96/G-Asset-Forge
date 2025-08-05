export interface Theme {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        primaryHover: string;
        primaryActive: string;
        background: string;
        surface: string;
        surfaceHover: string;
        overlay: string;
        text: {
            primary: string;
            secondary: string;
            tertiary: string;
            disabled: string;
            inverse: string;
        };
        border: {
            default: string;
            focus: string;
            hover: string;
        };
        success: string;
        warning: string;
        error: string;
        info: string;
        canvas: {
            background: string;
            grid: string;
            ruler: string;
            selection: string;
        };
        shadow: {
            small: string;
            medium: string;
            large: string;
        };
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
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
    shadows: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    transitions: {
        fast: string;
        normal: string;
        slow: string;
    };
    fonts: {
        sans: string;
        mono: string;
    };
    fontSizes: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
    };
    fontWeights: {
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    typography: {
        fontFamily: {
            primary: string;
            secondary?: string;
        };
        fontSize: {
            xs: string;
            sm: string;
            base: string;
            lg: string;
            xl: string;
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
    zIndex: {
        modal: number;
        tooltip: number;
        dropdown: number;
        overlay: number;
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
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export type ThemeMode = 'light' | 'dark';
export declare const themes: {
    light: Theme;
    dark: Theme;
};
export type StyledTheme = Theme;
//# sourceMappingURL=index.d.ts.map