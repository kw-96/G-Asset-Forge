import React, { useEffect, useState } from 'react';
import { Layout, message } from 'antd';
import { useAppStore } from './stores/appStore';
import { useCanvasStore } from './stores/canvasStore';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import StatusBar from './components/Layout/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';

const { Content } = Layout;

interface AppProps {
  onReady?: () => void;
}

const App: React.FC<AppProps> = ({ onReady }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsInitializationCheck, setNeedsInitializationCheck] = useState(false);
  const { initializeApp, setAppVersion, setPlatform } = useAppStore();
  const { initializeCanvas } = useCanvasStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('开始初始化应用...');
        
        // 最简化的初始化过程
        setAppVersion('1.0.0-dev');
        setPlatform('development');
        
        // 立即设置为已初始化
        setIsInitialized(true);
        setNeedsInitializationCheck(false);
        
        // 调用准备完成回调
        if (onReady) {
          onReady();
        }
        
        console.log('应用初始化完成');
        
      } catch (error) {
        console.error('应用初始化失败:', error);
        // 即使失败也要设置为已初始化，避免白屏
        setIsInitialized(true);
        setNeedsInitializationCheck(false);
        
        if (onReady) {
          onReady();
        }
      }
    };

    // 延迟一点时间确保DOM准备好
    setTimeout(initApp, 100);

    // Cleanup listeners on unmount
    return () => {
      cleanupMenuListeners();
    };
  }, [initializeApp, initializeCanvas, onReady, setAppVersion, setPlatform, needsInitializationCheck]);

  const setupMenuListeners = () => {
    // Check if electronAPI is available before setting up listeners
    if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.menu) {
      console.warn('Electron API不可用，跳过菜单监听器设置');
      return;
    }

    try {
      window.electronAPI.menu.onNewProject(() => {
        console.log('New project requested');
        // TODO: Implement new project functionality
      });

      window.electronAPI.menu.onOpenProject(() => {
        console.log('Open project requested');
        // TODO: Implement open project functionality
      });

      window.electronAPI.menu.onSaveProject(() => {
        console.log('Save project requested');
        // TODO: Implement save project functionality
      });

      window.electronAPI.menu.onExport(() => {
        console.log('Export requested');
        // TODO: Implement export functionality
      });

      window.electronAPI.menu.onUndo(() => {
        console.log('Undo requested');
        // TODO: Implement undo functionality
      });

      window.electronAPI.menu.onRedo(() => {
        console.log('Redo requested');
        // TODO: Implement redo functionality
      });

      window.electronAPI.menu.onZoomIn(() => {
        console.log('Zoom in requested');
        // TODO: Implement zoom in functionality
      });

      window.electronAPI.menu.onZoomOut(() => {
        console.log('Zoom out requested');
        // TODO: Implement zoom out functionality
      });

      window.electronAPI.menu.onFitToScreen(() => {
        console.log('Fit to screen requested');
        // TODO: Implement fit to screen functionality
      });
    } catch (error) {
      console.warn('设置菜单监听器时出错:', error);
    }
  };

  const cleanupMenuListeners = () => {
    // Check if electronAPI is available before cleanup
    if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.removeAllListeners) {
      return;
    }

    try {
      window.electronAPI.removeAllListeners('menu:new-project');
      window.electronAPI.removeAllListeners('menu:open-project');
      window.electronAPI.removeAllListeners('menu:save-project');
      window.electronAPI.removeAllListeners('menu:export');
      window.electronAPI.removeAllListeners('menu:undo');
      window.electronAPI.removeAllListeners('menu:redo');
      window.electronAPI.removeAllListeners('menu:zoom-in');
      window.electronAPI.removeAllListeners('menu:zoom-out');
      window.electronAPI.removeAllListeners('menu:fit-to-screen');
    } catch (error) {
      
    }
  };

  const handleInitializationReady = () => {
    setNeedsInitializationCheck(false);
  };

  const handleInitializationRetry = () => {
    // 重置状态以触发重新检查
    setIsInitialized(false);
  };

  // 如果需要初始化检查，显示检查器
  if (needsInitializationCheck) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>正在检查系统兼容性...</div>
        <button onClick={() => setNeedsInitializationCheck(false)}>跳过检查</button>
      </div>
    );
  }

  // 如果应用未初始化完成，显示加载状态
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ color: '#666', fontSize: '14px' }}>
          正在初始化应用程序...
        </p>
      </div>
    );
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Header />
      <Layout>
        <Sidebar />
        <Layout>
          <Content style={{ margin: 0, overflow: 'hidden' }}>
            <MainContent />
          </Content>
          <StatusBar />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;