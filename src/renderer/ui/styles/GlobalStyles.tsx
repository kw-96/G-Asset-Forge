// 全局样式 - 替代Ant Design的基础样式
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.border.hover};
  }

  /* 选择文本样式 */
  ::selection {
    background: ${({ theme }) => theme.colors.primary}30;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  /* 焦点样式重置 */
  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
  }

  /* 链接样式 */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.ease};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.primary}dd;
  }

  /* 标题样式 */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }

  /* 段落样式 */
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  /* 列表样式 */
  ul, ol {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
  }

  /* 表单元素样式重置 */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* 按钮样式重置 */
  button {
    font-family: inherit;
    font-size: inherit;
    border: none;
    background: none;
    cursor: pointer;
  }

  /* 图片样式 */
  img {
    max-width: 100%;
    height: auto;
  }

  /* 代码样式 */
  code, pre {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }

  code {
    padding: 2px 4px;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  pre {
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    overflow-x: auto;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  /* 分割线样式 */
  hr {
    border: none;
    height: 1px;
    background: ${({ theme }) => theme.colors.border.default};
    margin: ${({ theme }) => theme.spacing.lg} 0;
  }

  /* 表格样式 */
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: ${({ theme }) => theme.spacing.sm};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  th {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface};
  }

  /* 工具提示动画 */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-10px);
      opacity: 0;
    }
  }

  /* 禁用用户选择的工具类 */
  .no-select {
    user-select: none;
  }

  /* 可拖拽元素样式 */
  .draggable {
    cursor: grab;
  }

  .draggable:active {
    cursor: grabbing;
  }

  /* 加载状态样式 */
  .loading {
    pointer-events: none;
    opacity: 0.6;
  }
`;