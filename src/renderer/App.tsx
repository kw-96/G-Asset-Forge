import React, { useEffect } from 'react';
import { AppContainer } from './components/App/AppContainer';

interface AppProps {
  onReady?: () => void;
}

const App: React.FC<AppProps> = ({ onReady }) => {
  // 应用挂载后移除加载遮罩，防止停留在加载页
  useEffect(() => {
    try { onReady?.(); } catch {}
  }, [onReady]);

  return <AppContainer />;
};

export default App;
