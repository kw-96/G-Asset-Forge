import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import AppTest from './App-test';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './ui/theme/ThemeProvider';
import { GlobalStyles } from './ui/styles/GlobalStyles';

// 在 Electron 中设置 global 对象
declare global {
  var global: typeof globalThis;
}

if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis || window;
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
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <GlobalStyles />
          <App onReady={hideLoadingScreen} />
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('React app rendered successfully');
} catch (error) {
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
