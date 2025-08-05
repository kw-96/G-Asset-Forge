// 全局样式 - 替代Ant Design的基础样式
import { createGlobalStyle } from 'styled-components';
import { Theme } from '../theme/ThemeProvider';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background.default};
    color: ${({ theme }) => theme.colors.text.primary};
    overflow: hidden;
  }

  #root {
    width: 100vw;
    height: 100vh;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.paper};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.secondary};
  }

  /* 选择文本样式 */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  /* 链接样式 */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  /* 按钮重置 */
  button {
    cursor: pointer;
    font-family: inherit;
  }

  button:disabled {
    cursor: not-allowed;
  }

  /* 输入框样式 */
  input, textarea, select {
    font-family: inherit;
  }

  /* 代码样式 */
  code {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }

  /* Custom scrollbars */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.border.hover};
    }
  }

  ::-webkit-scrollbar-corner {
    background: ${({ theme }) => theme.colors.background};
  }

  /* Selection styles */
  ::selection {
    background: ${({ theme }) => theme.colors.primary}40;
  }

  /* Focus outline reset */
  *:focus {
    outline: none;
  }

  /* Button reset */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  /* Input reset */
  input, textarea {
    border: none;
    outline: none;
    font-family: inherit;
  }

  /* Link reset */
  a {
    text-decoration: none;
    color: inherit;
  }

  /* List reset */
  ul, ol {
    list-style: none;
  }

  /* Heading reset */
  h1, h2, h3, h4, h5, h6 {
    font-weight: normal;
  }

  /* Remove default fieldset styles */
  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  /* Prevent user select on UI elements */
  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Utility classes */
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

  /* App layout */
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: ${({ theme }) => theme.colors.background};
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .canvas-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.canvas.background};
    position: relative;
  }

  /* Animation utilities */
  .fade-in {
    animation: fadeIn 0.2s ease-out;
  }

  .slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }

  .slide-in-left {
    animation: slideInLeft 0.3s ease-out;
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

  /* Loading screen styles */
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
    z-index: 9999;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;