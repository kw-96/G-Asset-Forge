import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import AppTest from './App-test';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './ui/theme/ThemeProvider';
import { GlobalStyles } from './ui/styles/GlobalStyles';
if (typeof global === 'undefined') {
    globalThis.global = globalThis || window;
}
// 隐藏加载屏幕
const hideLoadingScreen = () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            loadingScreen.remove();
        }, 300);
    }
};
// 初始化 React 应用
const container = document.getElementById('root');
if (!container) {
    throw new Error('Root container not found');
}
const root = createRoot(container);
try {
    root.render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { children: _jsxs(ThemeProvider, { children: [_jsx(GlobalStyles, {}), _jsx(App, { onReady: hideLoadingScreen })] }) }) }));
    console.log('React app rendered successfully');
}
catch (error) {
    console.error('Failed to render React app:', error);
    // 简单的fallback界面
    document.body.innerHTML = `
    <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui;">
      <div style="text-align: center; color: #d32f2f;">
        <h1>渲染失败</h1>
        <p>React 应用无法启动</p>
        <button onclick="location.reload()" style="padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px;">
          重新加载
        </button>
      </div>
    </div>
  `;
}
//# sourceMappingURL=index.js.map