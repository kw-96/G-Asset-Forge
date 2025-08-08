// 全局样式 - 基于新的UI系统
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    overflow: hidden;
  }

  #root {
    width: 100vw;
    height: 100vh;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    
    &:hover {
      background: ${({ theme }) => theme.colors.border.hover};
    }
  }

  ::-webkit-scrollbar-corner {
    background: ${({ theme }) => theme.colors.background};
  }

  /* 选择文本样式 */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary}40;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  /* 焦点样式重置 */
  *:focus {
    outline: none;
  }

  /* 按钮重置 */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    
    &:disabled {
      cursor: not-allowed;
    }
  }

  /* 输入框重置 */
  input, textarea, select {
    border: none;
    outline: none;
    font-family: inherit;
  }

  /* 链接重置 */
  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary};
    
    &:hover {
      text-decoration: underline;
    }
  }

  /* 列表重置 */
  ul, ol {
    list-style: none;
  }

  /* 标题重置 */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  }

  /* 表单重置 */
  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  /* 代码样式 */
  code, pre {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  }

  /* 工具类 */
  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* 应用布局 - 增强视觉层次 */
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: ${({ theme }) => theme.colors.background};
    backdrop-filter: blur(8px);
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    gap: 1px; /* 添加微妙的分隔 */
  }

  .canvas-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.canvas.background};
    position: relative;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    margin: ${({ theme }) => theme.spacing.xs};
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* 工具栏样式增强 */
  .toolbar {
    background: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
    backdrop-filter: blur(12px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  /* 侧边栏样式增强 */
  .sidebar {
    background: ${({ theme }) => theme.colors.surface};
    border-right: 1px solid ${({ theme }) => theme.colors.border.default};
    backdrop-filter: blur(12px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  /* 属性面板样式增强 */
  .properties-panel {
    background: ${({ theme }) => theme.colors.surface};
    border-left: 1px solid ${({ theme }) => theme.colors.border.default};
    backdrop-filter: blur(12px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  /* 动画工具类 */
  .fade-in {
    animation: fadeIn ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.easeOut};
  }

  .slide-in-right {
    animation: slideInRight ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.easeOut};
  }

  .slide-in-left {
    animation: slideInLeft ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.easing.easeOut};
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  /* 加载屏幕样式 */
  #loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${({ theme }) => theme.zIndex.modal};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;