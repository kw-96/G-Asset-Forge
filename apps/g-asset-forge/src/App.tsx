import './App.css';

import { useCallback, useEffect, useState } from 'react';
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

interface RecentProject {
  id: string;
  name: string;
  type: 'design' | 'h5';
  lastOpenedAt: string;
  thumbnail?: string;
}

function App() {
  const [locale, setLocale] = useState(getLocale());
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [selectedMode, setSelectedMode] = useState<'design' | 'h5'>('design');
  const [projectManagementService] = useState(
    () => new ProjectManagementService(),
  );
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  // 自动导出相关状态
  const [autoExportInfo, setAutoExportInfo] = useState({
    isSupported: false,
    method: 'download' as 'electron' | 'directory' | 'download',
    description: '使用传统下载方式',
    isOptimal: false,
    browserInfo: null as any,
  });

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

  const handleBackToHome = async () => {
    try {
      // 如果有当前项目，关闭项目（closeProject内部会处理保存）
      if (currentProjectId) {
        console.log('关闭项目前保存当前项目:', currentProjectId);
        // 关闭项目（内部会调用manualSave）
        projectManagementService.closeProject(currentProjectId);
      }

      // 清理项目状态
      setCurrentProjectId(null);
      setSelectedMode('design');

      // 返回首页
      setCurrentView('home');

      console.log('项目已关闭，返回首页');
    } catch (error) {
      console.error('关闭项目时发生错误:', error);
      // 即使保存失败，也要返回首页
      setCurrentProjectId(null);
      setSelectedMode('design');
      setCurrentView('home');
    }
  };

  // 自动导出相关处理函数
  const handleAutoExportToggle = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        projectManagementService.enableAutoExport();
      } else {
        projectManagementService.disableAutoExport();
      }
    },
    [projectManagementService],
  );

  const handleRequestFileSystemPermission =
    useCallback(async (): Promise<boolean> => {
      return await projectManagementService.requestFileSystemPermission();
    }, [projectManagementService]);

  // 初始化自动导出信息
  useEffect(() => {
    const updateAutoExportInfo = () => {
      const info = projectManagementService.getAutoExportInfo();
      setAutoExportInfo(info);
    };

    updateAutoExportInfo();
  }, [projectManagementService]);

  // 加载项目列表
  const loadProjectsList = useCallback(async () => {
    try {
      const projects = await projectManagementService.getProjectsList();
      const recentProjectsData: RecentProject[] = projects.map((project) => ({
        id: project.id,
        name: project.name,
        type: project.type as 'design' | 'h5',
        lastOpenedAt:
          (typeof project.lastOpenedAt === 'string'
            ? project.lastOpenedAt
            : project.lastOpenedAt?.toISOString()) ||
          (typeof project.updatedAt === 'string'
            ? project.updatedAt
            : project.updatedAt?.toISOString()) ||
          new Date().toISOString(),
        thumbnail: project.thumbnail,
      }));
      setRecentProjects(recentProjectsData);
      console.log('已加载项目列表:', recentProjectsData.length, '个项目');
    } catch (error) {
      console.error('加载项目列表失败:', error);
      setRecentProjects([]);
    }
  }, [projectManagementService]);

  // 加载项目列表
  useEffect(() => {
    loadProjectsList();
  }, [loadProjectsList]);

  // 简单的库打开处理函数（暂时为空实现）
  const handleOpenProjectLibrary = () => {
    console.log('打开项目库');
  };

  const handleOpenTemplateLibrary = () => {
    console.log('打开模板库');
  };

  const handleOpenAssetLibrary = () => {
    console.log('打开素材库');
  };

  const handleCreateNewProject = async () => {
    try {
      const projectResult = await projectManagementService.createProject({
        name: '新项目',
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

          // 刷新项目列表
          loadProjectsList();

          // 确保项目管理服务状态正确更新
          setTimeout(() => {
            console.log('项目管理服务状态已更新');
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

  const handleCreateDesignProject = async () => {
    try {
      const projectResult = await projectManagementService.createProject({
        name: '设计项目',
        type: 'design',
      });

      if (projectResult) {
        const success = await projectManagementService.openProject(
          projectResult.id,
        );
        if (success) {
          setCurrentProjectId(projectResult.id);
          setCurrentView('editor');
          console.log('创建并打开设计项目:', projectResult.name);

          // 刷新项目列表
          loadProjectsList();
        } else {
          console.error('打开设计项目失败');
        }
      } else {
        console.error('创建设计项目失败');
      }
    } catch (error) {
      console.error('创建设计项目时出错:', error);
    }
  };

  const handleCreateH5Project = async () => {
    try {
      const projectResult = await projectManagementService.createProject({
        name: 'H5项目',
        type: 'h5',
      });

      if (projectResult) {
        const success = await projectManagementService.openProject(
          projectResult.id,
        );
        if (success) {
          setCurrentProjectId(projectResult.id);
          setCurrentView('editor');
          console.log('创建并打开H5项目:', projectResult.name);

          // 刷新项目列表
          loadProjectsList();
        } else {
          console.error('打开H5项目失败');
        }
      } else {
        console.error('创建H5项目失败');
      }
    } catch (error) {
      console.error('创建H5项目时出错:', error);
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
        const projectData = await projectManagementService.getCurrentProject();
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

  const handleDeleteProject = async (projectId: string) => {
    try {
      // 删除项目
      const success = await projectManagementService.deleteProject(projectId);
      if (success) {
        console.log('删除项目成功:', projectId);
        // 刷新项目列表
        loadProjectsList();
      } else {
        console.error('删除项目失败:', projectId);
      }
    } catch (error) {
      console.error('删除项目时出错:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
      case 'home':
        return (
          <HomePage
            onCreateNewProject={handleCreateNewProject}
            onCreateDesignProject={handleCreateDesignProject}
            onCreateH5Project={handleCreateH5Project}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            recentProjects={recentProjects}
            onAutoExportToggle={handleAutoExportToggle}
            onRequestFileSystemPermission={handleRequestFileSystemPermission}
            autoExportInfo={autoExportInfo}
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
