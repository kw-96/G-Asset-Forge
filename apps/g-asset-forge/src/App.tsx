import './App.css';

import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import Editor from './components/Editor';
import { HomePage } from './components/HomePage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { appEventEmitter } from './events';
import { en, type SupportedLocale, zh } from './locale';
import { ProjectManagementService } from './services/ProjectManagementService';

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
  const [projectManagementService] = useState(
    () => new ProjectManagementService(),
  );
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

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

  const handleModeSelect = async (mode: 'design' | 'h5') => {
    setSelectedMode(mode);

    // 自动创建一个未命名项目
    try {
      console.log('开始创建项目，模式:', mode);

      const projectResult = await projectManagementService.createProject({
        name: '未命名项目',
        description: '',
        type: mode,
      });

      if (projectResult) {
        console.log('项目创建成功:', projectResult);

        // 打开创建的项目
        const success = await projectManagementService.openProject(
          projectResult.id,
        );

        if (success) {
          console.log('项目打开成功，设置当前项目ID:', projectResult.id);
          setCurrentProjectId(projectResult.id);

          // 等待一小段时间确保项目管理服务状态更新
          await new Promise((resolve) => setTimeout(resolve, 100));

          setCurrentView('editor');
          console.log('自动创建并打开项目完成:', projectResult.name);

          // 调试信息
          console.log('当前项目管理服务状态:', {
            openTabs: projectManagementService.getOpenTabs(),
            activeTabId: projectManagementService.getActiveTabId(),
          });
        } else {
          console.error('打开自动创建的项目失败');
          setCurrentView('editor'); // 即使失败也进入编辑器
        }
      } else {
        console.error('创建项目失败');
        setCurrentView('editor'); // 即使失败也进入编辑器
      }
    } catch (error) {
      console.error('自动创建项目失败:', error);
      setCurrentView('editor'); // 即使失败也进入编辑器
    }
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

  const handleCreateNewProject = async () => {
    try {
      const projectResult = await projectManagementService.createProject({
        name: '新项目',
        description: '',
        type: selectedMode,
      });

      if (projectResult) {
        // 打开创建的项目
        const success = await projectManagementService.openProject(
          projectResult.id,
        );
        if (success) {
          setCurrentProjectId(projectResult.id);
          setCurrentView('editor');
          console.log('创建并打开新项目:', projectResult.name);

          // 确保项目管理服务状态正确更新
          // 触发标签页状态更新
          setTimeout(() => {
            console.log(
              '当前打开的标签页:',
              projectManagementService.getOpenTabs(),
            );
            console.log(
              '当前活动标签页:',
              projectManagementService.getActiveTabId(),
            );
          }, 100);
        } else {
          console.error('打开新创建的项目失败');
        }
      } else {
        console.error('创建项目失败');
      }
    } catch (error) {
      console.error('创建新项目失败:', error);
    }
  };

  const handleOpenProject = async (projectId: string) => {
    try {
      // 打开指定项目
      const success = await projectManagementService.openProject(projectId);
      if (success) {
        setCurrentProjectId(projectId);
        setCurrentView('editor');
        console.log('打开项目成功:', projectId);

        // 获取项目数据以确定模式
        const projectData = await projectManagementService.getProjectData(
          projectId,
        );
        if (projectData) {
          setSelectedMode(projectData.type);
        }
      } else {
        console.error('打开项目失败:', projectId);
      }
    } catch (error) {
      console.error('打开项目时发生错误:', error);
    }
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
            projectManagementService={projectManagementService}
            currentProjectId={currentProjectId}
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
