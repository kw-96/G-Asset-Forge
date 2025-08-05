export interface ITheme {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        background: string;
        surface: string;
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
        shadow: {
            small: string;
            medium: string;
            large: string;
        };
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
export declare const lightTheme: ITheme;
export declare const darkTheme: ITheme;
//# sourceMappingURL=index.d.ts.map