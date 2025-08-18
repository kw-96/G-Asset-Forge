/**
 * 混合函数类型定义
 */

import { Theme } from './index';

// 响应式设计类型
export interface ResponsiveMixins {
  above: (breakpoint: keyof Theme['breakpoints']) => string;
  below: (breakpoint: keyof Theme['breakpoints']) => string;
  between: (
    min: keyof Theme['breakpoints'], 
    max: keyof Theme['breakpoints']
  ) => string;
  retina: () => string;
  dark: () => string;
  reducedMotion: () => string;
}

// 可访问性类型
export interface AccessibilityMixins {
  srOnly: () => string;
  focusRing: (color?: string) => string;
  minTouchTarget: () => string;
  highContrast: () => string;
}

// 布局类型
export interface LayoutMixins {
  flexCenter: () => string;
  flexColumn: () => string;
  flexRow: () => string;
  absoluteCenter: () => string;
  fullScreen: () => string;
  container: (maxWidth?: keyof Theme['responsive']['containers']) => string;
  grid: (columns: number, gap?: keyof Theme['spacing']) => string;
}

// 效果类型
export interface EffectsMixins {
  shadow: (level: keyof Theme['shadows']) => string;
  glassmorphism: (blur?: number, opacity?: number) => string;
  gradient: (direction: string, colors: string[]) => string;
  hoverScale: (scale?: number, duration?: keyof Theme['animation']['duration']) => string;
  fadeIn: (duration?: keyof Theme['animation']['duration']) => string;
  slideIn: (
    direction: 'up' | 'down' | 'left' | 'right',
    distance?: string,
    duration?: keyof Theme['animation']['duration']
  ) => string;
}

// 文本类型
export interface TypographyMixins {
  truncate: (lines?: number) => string;
  fontSmooth: () => string;
  textSelection: (color?: string) => string;
}

// 性能类型
export interface PerformanceMixins {
  gpuAcceleration: () => string;
  contentVisibility: () => string;
  smoothScroll: () => string;
}

// 总混合函数类型
export interface Mixins {
  responsive: ResponsiveMixins;
  accessibility: AccessibilityMixins;
  layout: LayoutMixins;
  effects: EffectsMixins;
  typography: TypographyMixins;
  performance: PerformanceMixins;
}