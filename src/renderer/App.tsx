import React, { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import { useAppStore } from './stores/appStore';

interface AppProps {
  onReady?: () => void;
}

const App: React.FC<AppProps> = ({ onReady }) => {
  const { initializeApp, isLoading } = useAppStore();

  useEffect(() => {
    console.log('App mounted');
    initializeApp().then(() => {
      console.log('App initialized');
      if (onReady) {
        onReady();
      }
    }).catch((error) => {
      console.error('Failed to initialize app:', error);
      if (onReady) {
        onReady(); // 即使失败也要隐藏加载屏幕
      }
    });
  }, [initializeApp, onReady]);

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f0f0f0',
        fontFamily: 'system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>G-Asset Forge MVP</h1>
          <p>应用正在初始化...</p>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #ddd',
            borderTop: '4px solid #007acc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return <Layout />;
};

export default App;
