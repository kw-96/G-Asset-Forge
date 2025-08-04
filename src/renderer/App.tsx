import React, { useEffect, useState } from 'react';
import { Layout, message } from 'antd';
import { useAppStore } from './stores/appStore';
import { useCanvasStore } from './stores/canvasStore';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import StatusBar from './components/Layout/StatusBar';

const { Content } = Layout;

interface AppProps {
  onReady?: () => void;
}

const App: React.FC<AppProps> = ({ onReady }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { initializeApp, setAppVersion, setPlatform } = useAppStore();
  const { initializeCanvas } = useCanvasStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('开始初始化应用...');
        
        // Check if electronAPI is available
        if (typeof window !== 'undefined' && window.electronAPI) {
          console.log('获取应用信息...');
          try {
            const version = await window.electronAPI.app.getVersion();
            const platform = await window.electronAPI.app.getPlatform();
            
            console.log('设置应用版本和平台...');
            setAppVersion(version);
            setPlatform(platform);
          } catch (apiError) {
            console.warn('无法获取Electron API信息，使用默认值:', apiError);
            setAppVersion('1.0.0');
            setPlatform('unknown');
          }
        } else {
          console.warn('Electron API不可用，可能在开发环境中');
          setAppVersion('1.0.0-dev');
          setPlatform('development');
        }

        // Initialize stores with error handling
        console.log('初始化应用存储...');
        try {
          await initializeApp();
        } catch (appError) {
          console.warn('应用存储初始化失败:', appError);
        }
        
        console.log('初始化画布存储...');
        try {
          await initializeCanvas();
        } catch (canvasError) {
          console.warn('画布存储初始化失败:', canvasError);
        }

        // Setup menu event listeners with error handling
        console.log('设置菜单监听器...');
        try {
          setupMenuListeners();
        } catch (menuError) {
          console.warn('菜单监听器设置失败:', menuError);
        }

        console.log('应用初始化完成');
        setIsInitialized(true);
        onReady?.();
        
        message.success('G-Asset Forge 初始化成功');
      } catch (error) {
        console.error('应用初始化失败:', error);
        message.error(`应用程序初始化失败: ${error instanceof Error ? error.message : String(error)}`);
        // 即使失败也要设置为已初始化，避免卡在加载界面
        setIsInitialized(true);
        onReady?.();
      }
    };

    initApp();

    // Cleanup listeners on unmount
    return () => {
      cleanupMenuListeners();
    };
  }, [initializeApp, initializeCanvas, onReady, setAppVersion, setPlatform]);

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

  if (!isInitialized) {
    return null; // Loading screen is shown by default
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