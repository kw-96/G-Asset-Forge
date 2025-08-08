/**
 * 设计令牌 - 基于Figma UI3设计系统
 * 定义颜色、间距、字体等设计基础元素
 */
export declare const colors: {
    readonly primary: {
        readonly 50: "#f0f4ff";
        readonly 100: "#e0e7ff";
        readonly 200: "#c7d2fe";
        readonly 300: "#a5b4fc";
        readonly 400: "#818cf8";
        readonly 500: "#6366f1";
        readonly 600: "#4f46e5";
        readonly 700: "#4338ca";
        readonly 800: "#3730a3";
        readonly 900: "#312e81";
    };
    readonly neutral: {
        readonly 0: "#ffffff";
        readonly 50: "#fafafa";
        readonly 100: "#f5f5f5";
        readonly 200: "#e5e5e5";
        readonly 300: "#d4d4d4";
        readonly 400: "#a3a3a3";
        readonly 500: "#737373";
        readonly 600: "#525252";
        readonly 700: "#404040";
        readonly 800: "#262626";
        readonly 900: "#171717";
        readonly 950: "#0a0a0a";
    };
    readonly semantic: {
        readonly success: {
            readonly 50: "#f0fdf4";
            readonly 500: "#22c55e";
            readonly 600: "#16a34a";
        };
        readonly warning: {
            readonly 50: "#fffbeb";
            readonly 500: "#f59e0b";
            readonly 600: "#d97706";
        };
        readonly error: {
            readonly 50: "#fef2f2";
            readonly 500: "#ef4444";
            readonly 600: "#dc2626";
        };
        readonly info: {
            readonly 50: "#eff6ff";
            readonly 500: "#3b82f6";
            readonly 600: "#2563eb";
        };
    };
    readonly canvas: {
        readonly background: "#f8fafc";
        readonly grid: "#e2e8f0";
        readonly selection: "#6366f1";
        readonly selectionBg: "rgba(99, 102, 241, 0.1)";
        readonly guide: "#f59e0b";
    };
};
export declare const spacing: {
    readonly 0: "0px";
    readonly 1: "4px";
    readonly 2: "8px";
    readonly 3: "12px";
    readonly 4: "16px";
    readonly 5: "20px";
    readonly 6: "24px";
    readonly 8: "32px";
    readonly 10: "40px";
    readonly 12: "48px";
    readonly 16: "64px";
    readonly 20: "80px";
    readonly 24: "96px";
};
export declare const typography: {
    readonly fontFamily: {
        readonly sans: string;
        readonly mono: string;
    };
    readonly fontSize: {
        readonly xs: "12px";
        readonly sm: "14px";
        readonly base: "16px";
        readonly lg: "18px";
        readonly xl: "20px";
        readonly '2xl': "24px";
        readonly '3xl': "30px";
        readonly '4xl': "36px";
    };
    readonly fontWeight: {
        readonly normal: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
    };
    readonly lineHeight: {
        readonly tight: "1.25";
        readonly normal: "1.5";
        readonly relaxed: "1.75";
    };
};
export declare const borderRadius: {
    readonly none: "0px";
    readonly sm: "2px";
    readonly base: "4px";
    readonly md: "6px";
    readonly lg: "8px";
    readonly xl: "12px";
    readonly '2xl': "16px";
    readonly full: "9999px";
};
export declare const shadows: {
    readonly xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    readonly sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)";
    readonly base: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)";
    readonly md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";
    readonly lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
    readonly xl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    readonly inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)";
};
export declare const animation: {
    readonly duration: {
        readonly fast: "150ms";
        readonly normal: "250ms";
        readonly slow: "350ms";
    };
    readonly easing: {
        readonly ease: "cubic-bezier(0.4, 0, 0.2, 1)";
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
};
export declare const zIndex: {
    readonly hide: -1;
    readonly auto: "auto";
    readonly base: 0;
    readonly docked: 10;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly banner: 1200;
    readonly overlay: 1300;
    readonly modal: 1400;
    readonly popover: 1500;
    readonly skipLink: 1600;
    readonly toast: 1700;
    readonly tooltip: 1800;
};
export declare const breakpoints: {
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
};
export declare const sizes: {
    readonly xs: "20px";
    readonly sm: "24px";
    readonly md: "32px";
    readonly lg: "40px";
    readonly xl: "48px";
    readonly '2xl': "56px";
};
//# sourceMappingURL=tokens.d.ts.map