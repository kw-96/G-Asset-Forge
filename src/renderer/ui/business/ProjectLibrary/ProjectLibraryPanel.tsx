/**
 * 项目库面板组件
 * - 展示最近项目、模板创建入口、导入入口
 * - 支持搜索和分类筛选
 */
import React, { useMemo, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../components/atoms/Icon/SvgIcon';
import { 
  ProjectManager as ProjectManagerClass,
  type ProjectItemMeta
} from '../../../logic/managers/project/ProjectManager';

export type ProjectCategory = 'h5' | 'design' | 'demo' | 'other';

export interface IProjectLibraryPanelProps {
  onOpenProject?: (project: ProjectItemMeta) => void;
  onCreateProject?: () => void;
  onImportProject?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
`;

const Header = styled.div`
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  height: 36px;
  padding: 0 12px 0 36px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%2399A" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>') no-repeat 10px center;
  background-size: 16px;
  outline: none;
`;

const CategorySelect = styled.select`
  height: 36px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  padding: 0 10px;
`;

const PrimaryButton = styled.button`
  height: 36px;
  padding: 0 12px;
  background: #0d6efd;
  color: #fff;
  border: 1px solid #0d6efd;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:disabled {
    background: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const OutlineButton = styled.button`
  height: 36px;
  padding: 0 12px;
  background: #fff;
  color: #374151;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
  min-height: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Thumb = styled.div`
  height: 140px;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Name = styled.div`
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Desc = styled.div`
  font-size: 12px;
  color: #6b7280;
  height: 32px;
  overflow: hidden;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

export const ProjectLibraryPanel: React.FC<IProjectLibraryPanelProps> = ({
  onOpenProject,
  onCreateProject,
  onImportProject,
  className,
  style
}) => {
  const projectManagerRef = useRef<ProjectManagerClass | null>(null);
  const [recentProjects, setRecentProjects] = useState<ProjectItemMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<ProjectCategory | 'all'>('all');

  // 初始化 ProjectManager
  useEffect(() => {
    projectManagerRef.current = ProjectManagerClass.getInstance();
    
    const loadRecentProjects = () => {
      try {
        const projects = projectManagerRef.current?.getRecentProjects() || [];
        // 转换为 ProjectItemMeta 格式
        const converted: ProjectItemMeta[] = projects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.type as ProjectCategory,
          updatedAt: p.lastOpenedAt ? new Date(p.lastOpenedAt).toLocaleString() : new Date().toLocaleString(),
          createdAt: new Date().toISOString(),
          lastOpenedAt: p.lastOpenedAt,
          thumbnail: p.thumbnailUrl || '',
          tags: [],
          filePath: p.filePath,
          isTemplate: false
        }));
        setRecentProjects(converted);
      } catch (err) {
        console.error('加载最近项目失败:', err);
        setError('加载最近项目失败');
      }
    };

    // 立即加载
    loadRecentProjects();

    // 监听项目变化
    const handleProjectOpened = () => loadRecentProjects();
    const handleProjectCreated = () => loadRecentProjects();
    
    projectManagerRef.current?.on('project-opened', handleProjectOpened);
    projectManagerRef.current?.on('project-created', handleProjectCreated);

    return () => {
      projectManagerRef.current?.off('project-opened', handleProjectOpened);
      projectManagerRef.current?.off('project-created', handleProjectCreated);
    };
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return recentProjects.filter(p => {
      const catOk = category === 'all' ? true : p.category === category;
      const kwOk = kw === ''
        ? true
        : p.name.toLowerCase().includes(kw)
          || (p.description || '').toLowerCase().includes(kw)
          || (p.tags || []).some(t => t.toLowerCase().includes(kw));
      return catOk && kwOk;
    });
  }, [keyword, category, recentProjects]);

  // 创建新项目
  const handleCreateProject = async () => {
    if (!projectManagerRef.current) {
      setError('项目管理器未初始化');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectManagerRef.current.createProject({
        name: '新项目',
        description: '快速创建的项目'
      });

      if (result.success) {
        onCreateProject?.();
      } else {
        setError(result.message || '创建项目失败');
      }
    } catch (err) {
      console.error('创建项目失败:', err);
      setError('创建项目失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 打开项目
  const handleOpenProject = async (project: ProjectItemMeta) => {
    if (!projectManagerRef.current || !project.filePath) {
      setError('无法打开项目：缺少文件路径');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await projectManagerRef.current.openProject(project.filePath);
      if (result.success) {
        onOpenProject?.(project);
      } else {
        setError(result.message || '打开项目失败');
      }
    } catch (err) {
      console.error('打开项目失败:', err);
      setError('打开项目失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Root className={className} style={style}>
      <Header>
        <SearchInput
          placeholder="🔍 搜索项目名称、标签或分类..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <CategorySelect value={category} onChange={(e) => setCategory(e.target.value as any)}>
          <option value="all">全部分类</option>
          <option value="h5">H5</option>
          <option value="design">设计</option>
          <option value="demo">示例</option>
          <option value="other">其他</option>
        </CategorySelect>
        <OutlineButton onClick={() => onImportProject && onImportProject()} disabled={isLoading}>
          导入
        </OutlineButton>
        <PrimaryButton onClick={handleCreateProject} disabled={isLoading}>
          <SvgIcon name="icon.24.plus" size={16} title="新建" /> 
          {isLoading ? '创建中...' : '新建项目'}
        </PrimaryButton>
      </Header>

      <Content>
        {/* 错误提示 */}
        {error && (
          <div style={{
            padding: '12px',
            margin: '16px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            fontSize: '14px'
          }}>
            {error}
            <button
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

        <Grid>
          {filtered.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontSize: '14px'
            }}>
              {recentProjects.length === 0 ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                  <div>还没有最近项目</div>
                  <div style={{ marginTop: '8px' }}>创建或打开项目后会显示在这里</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <div>没有找到匹配的项目</div>
                  <div style={{ marginTop: '8px' }}>尝试修改搜索条件</div>
                </>
              )}
            </div>
          ) : (
            filtered.map(p => (
              <Card key={p.id} onDoubleClick={() => handleOpenProject(p)}>
                <Thumb>
                  <SvgIcon name="icon.24.file.design.library" size={48} title={p.name} />
                </Thumb>
                <CardBody>
                  <Name title={p.name}>{p.name}</Name>
                  <Desc title={p.description}>{p.description}</Desc>
                  <Meta>
                    <span>分类：{p.category} · 更新：{p.updatedAt}</span>
                    <Actions>
                      <OutlineButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProject(p);
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? '打开中...' : '打开'}
                      </OutlineButton>
                    </Actions>
                  </Meta>
                </CardBody>
              </Card>
            ))
          )}
        </Grid>
      </Content>
    </Root>
  );
};


