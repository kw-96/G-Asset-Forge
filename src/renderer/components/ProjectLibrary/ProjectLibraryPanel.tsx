/**
 * 项目库面板组件
 * - 展示最近项目、模板创建入口、导入入口
 * - 支持搜索和分类筛选
 */
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../ui/components/Icon/SvgIcon';

export type ProjectCategory = 'h5' | 'design' | 'demo' | 'other';

export interface IProjectItemMeta {
  id: string;
  name: string;
  description?: string;
  category: ProjectCategory;
  updatedAt: string;
  thumbnail?: string;
  tags?: string[];
}

export interface IProjectLibraryPanelProps {
  onOpenProject?: (project: IProjectItemMeta) => void;
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
`;

const OutlineButton = styled.button`
  height: 36px;
  padding: 0 12px;
  background: #fff;
  color: #374151;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
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
  // 示例最近项目数据（后续可对接 ProjectManager.recentProjects）
  const demoProjects: IProjectItemMeta[] = useMemo(() => ([
    { id: 'p-001', name: '无标题项目', description: '快速创建的演示项目', category: 'design', updatedAt: '2025-08-13 17:20', tags: ['演示'] },
    { id: 'p-002', name: 'H5签到活动', description: '包含每日签到逻辑和页面', category: 'h5', updatedAt: '2025-08-12 09:15', tags: ['H5','签到'] },
    { id: 'p-003', name: '拉新裂变页', description: '邀请好友获得奖励', category: 'h5', updatedAt: '2025-08-10 11:02' },
    { id: 'p-004', name: 'UI组件演示', description: '常用UI元素与布局', category: 'design', updatedAt: '2025-08-08 14:30' },
  ]), []);

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<ProjectCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return demoProjects.filter(p => {
      const catOk = category === 'all' ? true : p.category === category;
      const kwOk = kw === ''
        ? true
        : p.name.toLowerCase().includes(kw)
          || (p.description || '').toLowerCase().includes(kw)
          || (p.tags || []).some(t => t.toLowerCase().includes(kw));
      return catOk && kwOk;
    });
  }, [keyword, category, demoProjects]);

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
        <OutlineButton onClick={() => onImportProject && onImportProject()}>导入</OutlineButton>
        <PrimaryButton onClick={() => onCreateProject && onCreateProject()}>
          <SvgIcon name="icon.24.plus" size={16} title="新建" /> 新建项目
        </PrimaryButton>
      </Header>

      <Content>
        <Grid>
          {filtered.map(p => (
            <Card key={p.id} onDoubleClick={() => onOpenProject && onOpenProject(p)}>
              <Thumb>
                <SvgIcon name="icon.24.file.design.library" size={48} title={p.name} />
              </Thumb>
              <CardBody>
                <Name title={p.name}>{p.name}</Name>
                <Desc title={p.description}>{p.description}</Desc>
                <Meta>
                  <span>分类：{p.category} · 更新：{p.updatedAt}</span>
                  <Actions>
                    <OutlineButton onClick={() => onOpenProject && onOpenProject(p)}>打开</OutlineButton>
                  </Actions>
                </Meta>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Content>
    </Root>
  );
};


