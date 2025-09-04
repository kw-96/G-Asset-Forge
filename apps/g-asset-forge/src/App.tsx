import './App.css';

import { useCallback, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';

import Editor from './components/Editor';
import { HomePage } from './components/HomePage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { appEventEmitter } from './events';
import { en, type SupportedLocale, zh } from './locale';
import ProjectManagementService from './services/ProjectManagementService';

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
  // 延迟初始化 ProjectManagementService，只在需要时创建
  const [projectManagementService, setProjectManagementService] =
    useState<ProjectManagementService | null>(null);
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

  // 确保 ProjectManagementService 已初始化
  const ensureProjectManagementService = useCallback(() => {
    if (!projectManagementService) {
      console.log('延迟初始化 ProjectManagementService');
      const service = new ProjectManagementService();
      setProjectManagementService(service);
      return service;
    }
    return projectManagementService;
  }, [projectManagementService]);

  const handleWelcomeComplete = () => {
    setCurrentView('home');
  };

  const handleBackToHome = async () => {
    try {
      // 如果有当前项目，关闭项目（closeProject内部会处理保存）
      if (currentProjectId && projectManagementService) {
        console.log('关闭项目前保存当前项目:', currentProjectId);
        // 关闭项目（内部会调用manualSave）
        projectManagementService.closeProject(currentProjectId);
      }

      // 清理项目状态
      setCurrentProjectId(null);
      setSelectedMode('design');

      // 清理编辑器状态 - 确保编辑器组件被完全卸载
      if (projectManagementService) {
        // 清理编辑器实例
        projectManagementService.setEditor(null as any);
        console.log('编辑器实例已清理');
      }

      // 清理全局编辑器实例
      if (typeof window !== 'undefined') {
        (window as any).editor = null;
        (window as any).__PROJECT_MANAGEMENT_SERVICE__ = null;
        console.log('全局编辑器实例已清理');
      }

      // 强制清理所有可能的定时器（作为备用方案）
      // 注意：这是一个备用方案，正常情况下组件清理应该已经处理了
      setTimeout(() => {
        // 检查是否还有编辑器相关的定时器在运行
        const activeTimers = (window as any).__G_ASSET_FORGE_TIMERS__ || [];
        if (activeTimers.length > 0) {
          console.log('发现未清理的定时器，强制清理:', activeTimers.length);
          activeTimers.forEach((timerId: number) => {
            clearInterval(timerId);
          });
          (window as any).__G_ASSET_FORGE_TIMERS__ = [];
        }
      }, 100);

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
      const service = ensureProjectManagementService();
      if (enabled) {
        service.enableAutoExport();
      } else {
        service.disableAutoExport();
      }
    },
    [ensureProjectManagementService],
  );

  const handleRequestFileSystemPermission =
    useCallback(async (): Promise<boolean> => {
      const service = ensureProjectManagementService();
      return await service.requestFileSystemPermission();
    }, [ensureProjectManagementService]);

  // 初始化自动导出信息
  useEffect(() => {
    const updateAutoExportInfo = () => {
      const service = ensureProjectManagementService();
      const info = service.getAutoExportInfo();
      setAutoExportInfo(info);
    };

    updateAutoExportInfo();
  }, [ensureProjectManagementService]);

  // 加载项目列表
  const loadProjectsList = useCallback(async () => {
    try {
      const service = ensureProjectManagementService();
      const projects = await service.getProjectsList();
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
  }, [ensureProjectManagementService]);

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
      const service = ensureProjectManagementService();
      const projectResult = await service.createProject({
        name: '新项目',
        type: selectedMode,
      });

      if (projectResult) {
        // 打开创建的项目
        const success = await service.openProject(projectResult.id);
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
      const service = ensureProjectManagementService();
      const projectResult = await service.createProject({
        name: '设计项目',
        type: 'design',
      });

      if (projectResult) {
        const success = await service.openProject(projectResult.id);
        if (success) {
          setCurrentProjectId(projectResult.id);
          setSelectedMode('design'); // 设置编辑器模式
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
      const service = ensureProjectManagementService();
      const projectResult = await service.createProject({
        name: 'H5项目',
        type: 'h5',
      });

      if (projectResult) {
        const success = await service.openProject(projectResult.id);
        if (success) {
          setCurrentProjectId(projectResult.id);
          setSelectedMode('h5'); // 设置编辑器模式
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
      const service = ensureProjectManagementService();
      // 打开指定项目
      const success = await service.openProject(projectId);
      if (success) {
        setCurrentProjectId(projectId);
        setCurrentView('editor');
        console.log('打开项目成功:', projectId);

        // 获取项目数据以确定模式
        const projectData = await service.getCurrentProject();
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
      const service = ensureProjectManagementService();
      // 删除项目
      const success = await service.deleteProject(projectId);
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
        // 只有在有当前项目时才渲染编辑器组件
        if (currentProjectId && projectManagementService) {
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
        } else {
          // 如果没有项目，返回首页
          console.log('没有当前项目，返回首页');
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
        }
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
