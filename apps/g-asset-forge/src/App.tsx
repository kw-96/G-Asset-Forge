import './App.css';

import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import Editor from './components/Editor';
import { HomePage } from './components/HomePage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { appEventEmitter } from './events';
import { en, type SupportedLocale, zh } from './locale';

const messageMap = {
  zh,
  en,
};

const getLocale = (): SupportedLocale => {
  const locale =
    localStorage.getItem('g-asset-forge-locale') || navigator.language;
  return locale.startsWith('zh') ? 'zh' : 'en';
};

type AppView = 'welcome' | 'home' | 'editor';

function App() {
  const [locale, setLocale] = useState(getLocale());
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [selectedMode, setSelectedMode] = useState<'design' | 'h5'>('design');

  useEffect(() => {
    // 检查用户是否已经使用过应用(暂时始终设置为首次使用)
    // const hasUsedApp = localStorage.getItem('g-asset-forge-used');
    const hasUsedApp = false;

    // 恢复正常的欢迎页面逻辑
    if (hasUsedApp) {
      setCurrentView('home');
    } else {
      setCurrentView('welcome');
    }
  }, []); // 空依赖数组，只在组件挂载时执行一次

  useEffect(() => {
    const localeChangeHandler = (locale: SupportedLocale) => {
      setLocale(locale);
    };
    appEventEmitter.on('localeChange', localeChangeHandler);
    return () => {
      appEventEmitter.off('localeChange', localeChangeHandler);
    };
  });

  const handleWelcomeComplete = () => {
    setCurrentView('home');
  };

  const handleModeSelect = (mode: 'design' | 'h5') => {
    setSelectedMode(mode);
    setCurrentView('editor');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleOpenProjectLibrary = () => {
    // 这里可以添加打开项目库的逻辑
    console.log('打开项目库');
    // 如果当前在首页，可以直接切换到编辑器并打开项目库
    if (currentView === 'home') {
      setCurrentView('editor');
    }
  };

  const handleOpenTemplateLibrary = () => {
    // 这里可以添加打开模板库的逻辑
    console.log('打开模板库');
  };

  const handleOpenAssetLibrary = () => {
    // 这里可以添加打开素材库的逻辑
    console.log('打开素材库');
  };

  const handleCreateNewProject = () => {
    // 这里可以添加创建新项目的逻辑
    console.log('创建新项目');
    setCurrentView('editor');
  };

  const handleOpenProject = (projectId: string) => {
    // 打开指定项目
    console.log('打开项目:', projectId);
    setCurrentView('editor');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
      case 'home':
        return (
          <HomePage
            onModeSelect={handleModeSelect}
            onOpenProjectLibrary={handleOpenProjectLibrary}
            onOpenTemplateLibrary={handleOpenTemplateLibrary}
            onOpenAssetLibrary={handleOpenAssetLibrary}
            onCreateNewProject={handleCreateNewProject}
            onOpenProject={handleOpenProject}
            recentProjects={[]} // 暂时为空，后续可以从本地存储加载
          />
        );
      case 'editor':
        // 可以根据 selectedMode 传递不同的配置给 Editor
        return (
          <Editor
            initialMode={selectedMode}
            onBackToHome={handleBackToHome}
            onOpenAssetLibrary={handleOpenAssetLibrary}
            onOpenTemplateLibrary={handleOpenTemplateLibrary}
            onOpenProjectLibrary={handleOpenProjectLibrary}
          />
        );
      default:
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }
  };

  return (
    <IntlProvider locale={locale} messages={messageMap[locale]}>
      <div className="g-asset-forge">{renderCurrentView()}</div>
    </IntlProvider>
  );
}

export default App;
