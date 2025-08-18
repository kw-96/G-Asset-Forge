/**
 * 模板库面板组件
 * 提供模板浏览、搜索、筛选与使用能力（弹窗内使用）
 */
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../components/atoms/Icon/SvgIcon';

export type TemplateCategory = 'game' | 'ui' | 'icon' | 'background' | 'general';

export interface TemplateMetadata {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  thumbnail?: string;
  tags: string[];
  rating?: number;
}

export interface TemplateLibraryPanelProps {
  /** 选择/使用模板回调 */
  onUseTemplate?: (template: TemplateMetadata) => void;
  /** 预览模板回调 */
  onPreviewTemplate?: (template: TemplateMetadata) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ---- UI ----
const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
`;

const Header = styled.div`
  padding: 20px;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  height: 36px;
  padding: 0 12px 0 36px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  outline: none;
  background: #fff url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%2399A" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>') no-repeat 10px center;
  background-size: 16px;
`;

const CategorySelect = styled.select`
  height: 36px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  padding: 0 10px;
`;

const Content = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
  min-height: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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

const Button = styled.button<{ $primary?: boolean }>`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${({ $primary }) => ($primary ? '#0d6efd' : '#e9ecef')};
  background: ${({ $primary }) => ($primary ? '#0d6efd' : '#fff')};
  color: ${({ $primary }) => ($primary ? '#fff' : '#374151')};
  cursor: pointer;
  font-size: 12px;
  &:hover { filter: brightness(0.98); }
`;

/**
 * 模板库面板
 */
export const TemplateLibraryPanel: React.FC<TemplateLibraryPanelProps> = ({
  onUseTemplate,
  onPreviewTemplate,
  className,
  style
}) => {
  // 示例模板数据（可后续接入ProjectManager或远端）
  const demoTemplates: TemplateMetadata[] = useMemo(() => ([
    { id: 'tpl-landing', name: '下载落地页', description: '活动下载/预约落地页模板', category: 'general', tags: ['下载', '预约', '活动'] },
    { id: 'tpl-checkin', name: '每日签到', description: '签到活动页面', category: 'game', tags: ['签到', '奖励', '留存'] },
    { id: 'tpl-invite', name: '拉新活动', description: '好友邀请裂变拉新', category: 'general', tags: ['拉新', '裂变'] },
    { id: 'tpl-ui-kit', name: 'UI组件套件', description: '常用UI元素与布局', category: 'ui', tags: ['UI', '组件'] },
    { id: 'tpl-icon-pack', name: '图标模板', description: '常用图标组合与规范', category: 'icon', tags: ['图标', '规范'] },
    { id: 'tpl-backgrounds', name: '背景模板', description: '多风格背景集合', category: 'background', tags: ['背景', '风格'] },
  ]), []);

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return demoTemplates.filter(tpl => {
      const catOk = category === 'all' ? true : tpl.category === category;
      const kwOk = kw === ''
        ? true
        : tpl.name.toLowerCase().includes(kw)
          || (tpl.description || '').toLowerCase().includes(kw)
          || tpl.tags.some(t => t.toLowerCase().includes(kw));
      return catOk && kwOk;
    });
  }, [keyword, category, demoTemplates]);

  return (
    <Root className={className} style={style}>
      <Header>
        <SearchInput
          placeholder="🔍 搜索模板名称、标签或分类..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <CategorySelect value={category} onChange={(e) => setCategory(e.target.value as any)}>
          <option value="all">全部分类</option>
          <option value="general">通用</option>
          <option value="game">游戏</option>
          <option value="ui">UI</option>
          <option value="icon">图标</option>
          <option value="background">背景</option>
        </CategorySelect>
      </Header>

      <Content>
        <Grid>
          {filtered.map(tpl => (
            <Card key={tpl.id} onDoubleClick={() => onUseTemplate && onUseTemplate(tpl)}>
              <Thumb>
                <SvgIcon name="icon.24.file.design.mods" size={48} title={tpl.name} />
              </Thumb>
              <CardBody>
                <Name title={tpl.name}>{tpl.name}</Name>
                <Desc title={tpl.description}>{tpl.description}</Desc>
                <Meta>
                  <span>分类：{tpl.category}</span>
                  <Actions>
                    <Button onClick={() => onPreviewTemplate && onPreviewTemplate(tpl)}>预览</Button>
                    <Button $primary onClick={() => onUseTemplate && onUseTemplate(tpl)}>使用</Button>
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


