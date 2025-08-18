/**
 * Styled-components 混合函数
 * 基于工具函数的 CSS-in-JS 实现
 */

import { css } from 'styled-components';
import { Theme } from './index';

// 响应式设计混合函数
export const responsive = {
  above: (breakpoint: keyof Theme['breakpoints']) => (styles: any) => css`
    @media (min-width: ${({ theme }) => theme.breakpoints[breakpoint]}) {
      ${styles}
    }
  `,

  below: (breakpoint: keyof Theme['breakpoints']) => (styles: any) => css`
    @media (max-width: ${({ theme }) => 
      parseInt(theme.breakpoints[breakpoint]) - 1}px) {
      ${styles}
    }
  `,

  between: (
    min: keyof Theme['breakpoints'], 
    max: keyof Theme['breakpoints']
  ) => (styles: any) => css`
    @media (min-width: ${({ theme }) => theme.breakpoints[min]}) and 
           (max-width: ${({ theme }) => parseInt(theme.breakpoints[max]) - 1}px) {
      ${styles}
    }
  `,

  retina: (styles: any) => css`
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      ${styles}
    }
  `,

  dark: (styles: any) => css`
    @media (prefers-color-scheme: dark) {
      ${styles}
    }
  `,

  reducedMotion: (styles: any) => css`
    @media (prefers-reduced-motion: reduce) {
      ${styles}
    }
  `,
};

// 可访问性混合函数
export const accessibility = {
  srOnly: () => css`
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  `,

  focusRing: (color?: string) => css`
    outline: ${({ theme }) => theme.accessibility.focusRing.width} 
             ${({ theme }) => theme.accessibility.focusRing.style} 
             ${color || (({ theme }) => theme.accessibility.focusRing.color)};
    outline-offset: ${({ theme }) => theme.accessibility.focusRing.offset};
    border-radius: ${({ theme }) => theme.accessibility.focusRing.radius};
  `,

  minTouchTarget: () => css`
    min-width: ${({ theme }) => theme.accessibility.minTouchTarget};
    min-height: ${({ theme }) => theme.accessibility.minTouchTarget};
  `,

  highContrast: (styles: any) => css`
    @media (prefers-contrast: high) {
      ${styles}
    }
  `,
};

// 布局混合函数
export const layout = {
  flexCenter: () => css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  flexColumn: () => css`
    display: flex;
    flex-direction: column;
  `,

  flexRow: () => css`
    display: flex;
    flex-direction: row;
  `,

  absoluteCenter: () => css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,

  fullScreen: () => css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  `,

  container: (maxWidth?: keyof Theme['responsive']['containers']) => css`
    width: 100%;
    max-width: ${({ theme }) => 
      maxWidth ? theme.responsive.containers[maxWidth] : theme.responsive.containers.lg};
    margin: 0 auto;
    padding: 0 ${({ theme }) => theme.spacing.md};
  `,

  grid: (columns: number, gap?: keyof Theme['spacing']) => css`
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: ${({ theme }) => gap ? theme.spacing[gap] : theme.spacing.md};
  `,
};

// 效果混合函数
export const effects = {
  shadow: (level: keyof Theme['shadows']) => css`
    box-shadow: ${({ theme }) => theme.shadows[level]};
  `,

  glassmorphism: (blur: number = 10, opacity: number = 0.1) => css`
    backdrop-filter: blur(${blur}px);
    background: rgba(255, 255, 255, ${opacity});
    border: 1px solid rgba(255, 255, 255, 0.2);
  `,

  gradient: (direction: string, colors: string[]) => css`
    background: linear-gradient(${direction}, ${colors.join(', ')});
  `,

  hoverScale: (scale: number = 1.05, duration?: keyof Theme['animation']['duration']) => css`
    transition: transform ${({ theme }) => 
      duration ? theme.animation.duration[duration] : theme.animation.duration.fast} 
      ${({ theme }) => theme.animation.easing.easeOut};

    &:hover {
      transform: scale(${scale});
    }
  `,

  fadeIn: (duration?: keyof Theme['animation']['duration']) => css`
    animation: fadeIn ${({ theme }) => 
      duration ? theme.animation.duration[duration] : theme.animation.duration.normal} 
      ${({ theme }) => theme.animation.easing.easeOut};

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  slideIn: (
    direction: 'up' | 'down' | 'left' | 'right',
    distance: string = '20px',
    duration?: keyof Theme['animation']['duration']
  ) => css`
    animation: slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} 
      ${({ theme }) => 
        duration ? theme.animation.duration[duration] : theme.animation.duration.normal} 
      ${({ theme }) => theme.animation.easing.easeOut};

    @keyframes slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} {
      from {
        opacity: 0;
        transform: translate${direction === 'left' || direction === 'right' ? 'X' : 'Y'}(
          ${direction === 'up' || direction === 'left' ? distance : `-${distance}`}
        );
      }
      to {
        opacity: 1;
        transform: translate${direction === 'left' || direction === 'right' ? 'X' : 'Y'}(0);
      }
    }
  `,
};

// 文本混合函数
export const typography = {
  truncate: (lines?: number) => css`
    ${lines && lines > 1 ? css`
      display: -webkit-box;
      -webkit-line-clamp: ${lines};
      -webkit-box-orient: vertical;
      overflow: hidden;
    ` : css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}
  `,

  fontSmooth: () => css`
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  `,

  textSelection: (color?: string) => css`
    ::selection {
      background-color: ${color || (({ theme }) => theme.colors.primary)}40;
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `,
};

// 性能混合函数
export const performance = {
  gpuAcceleration: () => css`
    transform: translateZ(0);
    will-change: transform;
  `,

  contentVisibility: () => css`
    content-visibility: auto;
    contain-intrinsic-size: 0 500px;
  `,

  smoothScroll: () => css`
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  `,
};

// 导出所有混合函数
export const mixins = {
  responsive,
  accessibility,
  layout,
  effects,
  typography,
  performance,
};

export default mixins;