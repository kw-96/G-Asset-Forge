// 项目管理组件
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ProjectManager as ProjectManagerClass,
  type IProjectData,
  type IProjectMetadata,
  type IProjectTemplate,
  type IProjectSettings
} from '../../managers/project/ProjectManager';

interface IProjectManagerProps {
  onProjectOpen?: (project: IProjectData) => void;
  onProjectCreate?: (project: IProjectData) => void;
  onProjectClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ProjectManager: React.FC<IProjectManagerProps> = ({
  onProjectOpen,
  onProjectCreate,
  onProjectClose,
  className,
  style
}) => {
  const projectManagerRef = useRef<ProjectManagerClass | null>(null);
  const [currentProject, setCurrentProject] = useState<IProjectData | null>(null);
  const [recentProjects, setRecentProjects] = useState<IProjectMetadata[]>([]);
  const [templates, setTemplates] = useState<IProjectTemplate[]>([]);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 新项目表单状态
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSettings, setCustomSettings] = useState<Partial<IProjectSettings>>({});

  // 初始化项目管理器
  useEffect(() => {
    const userDataPath = process.env['NODE_ENV'] === 'development' 
      ? './dev-user-data' 
      : require('electron').remote?.app.getPath('userData') || './user-data';
    
    projectManagerRef.current = new ProjectManagerClass(userDataPath);

    // 绑定事件
    projectManagerRef.current.on('projectCreated', (project) => {
      setCurrentProject(project);
      onProjectCreate?.(project);
    });

    projectManagerRef.current.on('projectOpened', (project) => {
      setCurrentProject(project);
      onProjectOpen?.(project);
    });

    projectManagerRef.current.on('projectClosed', () => {
      setCurrentProject(null);
      onProjectClose?.();
    });

    projectManagerRef.current.on('recentProjectsUpdated', (projects) => {
      setRecentProjects(projects);
    });

    // 加载初始数据
    setRecentProjects(projectManagerRef.current.getRecentProjects());
    setTemplates(projectManagerRef.current.getTemplates());
    setCurrentProject(projectManagerRef.current.getCurrentProject());

    return () => {
      projectManagerRef.current?.destroy();
    };
  }, [onProjectCreate, onProjectOpen, onProjectClose]);

  // 创建新项目
  const handleCreateProject = useCallback(async () => {
    if (!projectManagerRef.current || !newProjectName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await projectManagerRef.current.createProject({
        name: newProjectName.trim(),
        ...(newProjectDescription.trim() ? { description: newProjectDescription.trim() } : {}),
        ...(selectedTemplate ? { template: selectedTemplate } : {}),
        settings: customSettings
      });

      setShowNewProjectDialog(false);
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedTemplate('');
      setCustomSettings({});
    } catch (error: unknown) {
      console.error('创建项目失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setError(`创建项目失败: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [newProjectName, newProjectDescription, selectedTemplate, customSettings]);

  // 打开项目
  const handleOpenProject = useCallback(async (filePath?: string) => {
    if (!projectManagerRef.current) return;

    if (!filePath) {
      // 打开文件选择对话框
      const { dialog } = require('electron').remote;
      const result = await dialog.showOpenDialog({
        title: '打开项目',
        filters: [
          { name: 'G-Asset Forge 项目', extensions: ['gaf'] },
          { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return;
      }

      filePath = result.filePaths[0];
    }

    setIsLoading(true);
    setError(null);

    try {
      const finalPath: string = filePath!;
      await projectManagerRef.current.loadProject(finalPath);
    } catch (error: unknown) {
      console.error('打开项目失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setError(`打开项目失败: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 保存项目
  const handleSaveProject = useCallback(async () => {
    if (!projectManagerRef.current || !currentProject) return;

    setIsLoading(true);
    setError(null);

    try {
      await projectManagerRef.current.saveProject();
    } catch (error: unknown) {
      console.error('保存项目失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setError(`保存项目失败: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  // 另存为项目
  const handleSaveProjectAs = useCallback(async () => {
    if (!projectManagerRef.current || !currentProject) return;

    const { dialog } = require('electron').remote;
    const result = await dialog.showSaveDialog({
      title: '另存为项目',
      defaultPath: `${currentProject.metadata.name}.gaf`,
      filters: [
        { name: 'G-Asset Forge 项目', extensions: ['gaf'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await projectManagerRef.current.saveProjectAs(result.filePath);
    } catch (error: unknown) {
      console.error('另存为项目失败:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setError(`另存为项目失败: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  // 关闭项目
  const handleCloseProject = useCallback(() => {
    if (!projectManagerRef.current) return;
    projectManagerRef.current.closeProject();
  }, []);

  // 从最近项目中移除
  const handleRemoveFromRecent = useCallback((projectId: string) => {
    if (!projectManagerRef.current) return;
    projectManagerRef.current.removeFromRecentProjects(projectId);
  }, []);

  // 格式化日期
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={className} style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      ...style
    }}>
      {/* 头部工具栏 */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            📁 项目管理
          </h4>
          
          {currentProject && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              当前项目: {currentProject.metadata.name}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setShowNewProjectDialog(true)}
            disabled={isLoading}
            style={{
              padding: '6px 12px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            📄 新建项目
          </button>
          
          <button
            type="button"
            onClick={() => handleOpenProject()}
            disabled={isLoading}
            style={{
              padding: '6px 12px',
              border: '1px solid #007bff',
              backgroundColor: 'white',
              color: '#007bff',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            📂 打开项目
          </button>
          
          {currentProject && (
            <>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={isLoading}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #28a745',
                  backgroundColor: 'white',
                  color: '#28a745',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                💾 保存
              </button>
              
              <button
                type="button"
                onClick={handleSaveProjectAs}
                disabled={isLoading}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ffc107',
                  backgroundColor: 'white',
                  color: '#ffc107',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 另存为
              </button>
              
              <button
                type="button"
                onClick={handleCloseProject}
                disabled={isLoading}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #dc3545',
                  backgroundColor: 'white',
                  color: '#dc3545',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕ 关闭
              </button>
            </>
          )}
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          fontSize: '12px'
        }}>
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#d1ecf1',
          border: '1px solid #bee5eb',
          color: '#0c5460',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          ⏳ 处理中...
        </div>
      )}

      {/* 当前项目信息 */}
      {currentProject && (
        <div style={{
          padding: '16px',
          backgroundColor: '#e3f2fd',
          borderBottom: '1px solid #bbdefb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>
                {currentProject.metadata.name}
              </h5>
              {currentProject.metadata.description && (
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                  {currentProject.metadata.description}
                </p>
              )}
              <div style={{ fontSize: '11px', color: '#999' }}>
                创建于: {formatDate(currentProject.metadata.createdAt)} • 
                更新于: {formatDate(currentProject.metadata.updatedAt)}
                {currentProject.metadata.filePath && (
                  <> • 路径: {currentProject.metadata.filePath}</>
                )}
              </div>
            </div>
            
            {currentProject.metadata.thumbnail && (
              <img
                src={currentProject.metadata.thumbnail}
                alt="项目缩略图"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* 最近项目列表 */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
            最近项目
          </h5>
          
          {recentProjects.length > 0 && (
            <button
              type="button"
              onClick={() => projectManagerRef.current?.clearRecentProjects()}
              style={{
                padding: '4px 8px',
                border: '1px solid #dc3545',
                backgroundColor: 'white',
                color: '#dc3545',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              清空列表
            </button>
          )}
        </div>
        
        {recentProjects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
            <div>还没有最近项目</div>
            <div style={{ marginTop: '8px' }}>创建或打开项目后会显示在这里</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentProjects.map(project => (
              <div
                key={project.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer'
                }}
                onClick={() => project.filePath && handleOpenProject(project.filePath)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>
                    {project.name}
                  </div>
                  {project.description && (
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                      {project.description}
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#999' }}>
                    {project.lastOpenedAt ? 
                      `最后打开: ${formatDate(project.lastOpenedAt)}` : 
                      `创建于: ${formatDate(project.createdAt)}`
                    }
                    {project.filePath && (
                      <> • {project.filePath}</>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  {project.isTemplate && (
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '8px'
                    }}>
                      模板
                    </span>
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromRecent(project.id);
                    }}
                    style={{
                      padding: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新建项目对话框 */}
      {showNewProjectDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '500px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>
              创建新项目
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  项目名称 *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="输入项目名称"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  项目描述
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="输入项目描述（可选）"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical',
                    minHeight: '60px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  项目模板
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                >
                  <option value="">选择模板（可选）</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowNewProjectDialog(false);
                  setNewProjectName('');
                  setNewProjectDescription('');
                  setSelectedTemplate('');
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                取消
              </button>
              
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isLoading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: newProjectName.trim() && !isLoading ? '#007bff' : '#6c757d',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: newProjectName.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: '12px'
                }}
              >
                {isLoading ? '创建中...' : '创建项目'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;