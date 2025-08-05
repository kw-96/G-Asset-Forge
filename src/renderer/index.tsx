import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import TestApp from './TestApp';
import TestEngineApp from './TestEngineApp';
import TestUIApp from './TestUIApp';
import TestArchitectureApp from './TestArchitectureApp';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.less';

// Polyfill for global in Electron renderer process
if (typeof global === 'undefined') {
  (window as any).global = globalThis || window || this;
  (globalThis as unknown).global = globalThis || window;
}

// Configure Ant Design theme
const theme = {
  token: {
    colorPrimary: '#667eea',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
  },
};

// Initialize React application
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

// Hide loading screen once React is ready
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

// 临时使用架构测试页面来验证重构后的系统
const USE_ARCHITECTURE_TEST = true;

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        {USE_ARCHITECTURE_TEST ? (
          <TestArchitectureApp />
        ) : (
          <App onReady={hideLoadingScreen} />
        )}
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
);