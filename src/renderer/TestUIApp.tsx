// UI组件库测试应用
import React from 'react';
import { ThemeProvider } from './ui/theme/ThemeProvider';
import { GlobalStyles } from './ui/styles/GlobalStyles';
import { UITest } from './components/UITest';

const TestUIApp: React.FC = () => {
  return (
    <ThemeProvider defaultMode="light">
      <GlobalStyles />
      <UITest />
    </ThemeProvider>
  );
};

export default TestUIApp;