/**
 * 混合函数工具 - 纯 TypeScript 实现
 * 不包含 styled-components 依赖，可以安全地被 TypeScript 编译
 */

import { Theme } from './index';
import type { Mixins } from './mixins.types';

// 响应式设计工具函数
export const responsive = {
  /**
   * 生成最小宽度媒体查询
   */
  above: (breakpoint: keyof Theme['breakpoints']) => 
    `@media (min-width: var(--breakpoint-${breakpoint}))`,

  /**
   * 生成最大宽度媒体查询
   */
  below: (breakpoint: keyof Theme['breakpoints']) => 
    `@media (max-width: calc(var(--breakpoint-${breakpoint}) - 1px))`,

  /**
   * 生成区间媒体查询
   */
  between: (
    min: keyof Theme['breakpoints'], 
    max: keyof Theme['breakpoints']
  ) => 
    `@media (min-width: var(--breakpoint-${min})) and (max-width: calc(var(--breakpoint-${max}) - 1px))`,

  /**
   * 高分辨率屏幕查询
   */
  retina: () => 
    `@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)`,

  /**
   * 暗色模式查询
   */
  dark: () => 
    `@media (prefers-color-scheme: dark)`,

  /**
   * 减少动画偏好查询
   */
  reducedMotion: () => 
    `@media (prefers-reduced-motion: reduce)`,
};

// 可访问性工具函数
export const accessibility = {
  /**
   * 屏幕阅读器专用样式
   */
  srOnly: () => `
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

  /**
   * 焦点环样式
   */
  focusRing: (color?: string) => `
    outline: var(--focus-ring-width) var(--focus-ring-style) ${color || 'var(--focus-ring-color)'};
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--focus-ring-radius);
  `,

  /**
   * 最小触摸目标尺寸
   */
  minTouchTarget: () => `
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
  `,

  /**
   * 高对比度模式支持
   */
  highContrast: () => `
    @media (prefers-contrast: high) {
      border: 1px solid;
    }
  `,
};

// 布局工具函数
export const layout = {
  /**
   * Flexbox居中
   */
  flexCenter: () => `
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  /**
   * Flexbox列布局
   */
  flexColumn: () => `
    display: flex;
    flex-direction: column;
  `,

  /**
   * Flexbox行布局
   */
  flexRow: () => `
    display: flex;
    flex-direction: row;
  `,

  /**
   * 绝对定位居中
   */
  absoluteCenter: () => `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,

  /**
   * 全屏覆盖
   */
  fullScreen: () => `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  `,

  /**
   * 容器样式
   */
  container: (maxWidth?: keyof Theme['responsive']['containers']) => `
    width: 100%;
    max-width: var(--container-${maxWidth || 'lg'});
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  `,

  /**
   * 网格布局
   */
  grid: (columns: number, gap?: keyof Theme['spacing']) => `
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: var(--spacing-${gap || 'md'});
  `,
};

// 效果工具函数
export const effects = {
  /**
   * 阴影效果
   */
  shadow: (level: keyof Theme['shadows']) => `
    box-shadow: var(--shadow-${level});
  `,

  /**
   * 毛玻璃效果
   */
  glassmorphism: (blur: number = 10, opacity: number = 0.1) => `
    backdrop-filter: blur(${blur}px);
    background: rgba(255, 255, 255, ${opacity});
    border: 1px solid rgba(255, 255, 255, 0.2);
  `,

  /**
   * 渐变背景
   */
  gradient: (direction: string, colors: string[]) => `
    background: linear-gradient(${direction}, ${colors.join(', ')});
  `,

  /**
   * 悬停缩放效果
   */
  hoverScale: (scale: number = 1.05, duration?: keyof Theme['animation']['duration']) => `
    transition: transform var(--duration-${duration || 'fast'}) var(--easing-ease-out);
    
    &:hover {
      transform: scale(${scale});
    }
  `,

  /**
   * 淡入动画
   */
  fadeIn: (duration?: keyof Theme['animation']['duration']) => `
    animation: fadeIn var(--duration-${duration || 'normal'}) var(--easing-ease-out);
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  /**
   * 滑入动画
   */
  slideIn: (
    direction: 'up' | 'down' | 'left' | 'right',
    distance: string = '20px',
    duration?: keyof Theme['animation']['duration']
  ) => {
    const transformValue = direction === 'up' || direction === 'left' ? distance : `-${distance}`;
    const transformProperty = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
    
    return `
      animation: slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} 
        var(--duration-${duration || 'normal'}) var(--easing-ease-out);
      
      @keyframes slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} {
        from {
          opacity: 0;
          transform: ${transformProperty}(${transformValue});
        }
        to {
          opacity: 1;
          transform: ${transformProperty}(0);
        }
      }
    `;
  },
};

// 文本工具函数
export const typography = {
  /**
   * 文本截断
   */
  truncate: (lines?: number) => {
    if (lines && lines > 1) {
      return `
        display: -webkit-box;
        -webkit-line-clamp: ${lines};
        -webkit-box-orient: vertical;
        overflow: hidden;
      `;
    }
    return `
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
  },

  /**
   * 字体平滑
   */
  fontSmooth: () => `
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  `,

  /**
   * 文本选择样式
   */
  textSelection: (color?: string) => `
    ::selection {
      background-color: ${color || 'var(--color-primary)'}40;
      color: var(--color-text-primary);
    }
  `,
};

// 性能工具函数
export const performance = {
  /**
   * GPU加速
   */
  gpuAcceleration: () => `
    transform: translateZ(0);
    will-change: transform;
  `,

  /**
   * 内容可见性优化
   */
  contentVisibility: () => `
    content-visibility: auto;
    contain-intrinsic-size: 0 500px;
  `,

  /**
   * 滚动优化
   */
  smoothScroll: () => `
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  `,
};

// 导出所有工具函数
export const mixinsUtils: Mixins = {
  responsive,
  accessibility,
  layout,
  effects,
  typography,
  performance,
};

export default mixinsUtils;