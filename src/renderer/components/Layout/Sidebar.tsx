import React, { useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '../../ui';
import { useAppStore } from '../../stores/appStore';
import {
  ComponentInstanceIcon,
  PlusIcon,
  EyeOpenIcon,
  LockClosedIcon,
  FrameIcon,
  BoxIcon,
  TextIcon,
  CircleIcon,
  Component1Icon,
  LockOpen1Icon,
  EyeClosedIcon,
} from '@radix-ui/react-icons';

const SidebarContainer = styled.aside<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? '0px' : '240px')};
  min-width: ${({ $collapsed }) => ($collapsed ? '0px' : '240px')};
  height: calc(100vh - 68px); /* 减去标题栏和工具栏高度 */
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
`;

const SectionTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const SectionTab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.background : theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const SectionContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const SearchBox = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 12px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const LayersList = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  z-index: 10;
`;

const LayerItem = styled.div<{
  $level?: number;
  $depth?: number;
  $selected?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 4px ${({ theme }) => theme.spacing.xs};
  margin-left: ${({ $level = 0, theme }) => $level * parseInt(theme.spacing.md)}px;
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  cursor: pointer;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};

  ${({ $depth }) => ($depth ? `margin-left: ${$depth * 2}px;` : '')}

  ${({ $selected }) =>
    $selected
      ? `
      background: rgba(0, 0, 0, 0.1);
    `
      : ''}

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const LayerIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.border.default};
  font-size: 10px;
`;

const LayerName = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LayerControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${LayerItem}:hover & {
    opacity: 1;
  }
`;

const PageTab = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Sidebar: React.FC = () => {
  const {
    sidebarCollapsed,
    elements,
    selectedElements,
    selectElements,
    updateElement,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLayerSelect = (elementId: string) => {
    if (selectedElements.includes(elementId)) {
      // 如果已选中，从选择中移除
      selectElements(selectedElements.filter((id) => id !== elementId));
    } else {
      // 否则添加到选择
      selectElements([elementId]);
    }
  };

  const handleLayerToggleVisibility = (elementId: string) => {
    const element = elements[elementId];
    if (element) {
      updateElement(elementId, { visible: !element.visible });
    }
  };

  const handleLayerToggleLock = (elementId: string) => {
    const element = elements[elementId];
    if (element) {
      updateElement(elementId, { locked: !element.locked });
    }
  };

  if (sidebarCollapsed) {
    return <SidebarContainer $collapsed={true} />;
  }

  return (
    <SidebarContainer $collapsed={sidebarCollapsed}>
      {/* 页面标签 */}
      <PageTab>
        <span>Page 1</span>
        <IconButton icon={<PlusIcon />} variant="ghost" size="xs" />
      </PageTab>

      {/* 区段标签页 */}
      <SectionTabs>
        <SectionTab
          $active={activeTab === 'layers'}
          onClick={() => setActiveTab('layers')}
        >
          图层
        </SectionTab>
        <SectionTab
          $active={activeTab === 'assets'}
          onClick={() => setActiveTab('assets')}
        >
          资源
        </SectionTab>
      </SectionTabs>

      <SectionContent>
        {activeTab === 'layers' && (
          <>
            {/* 搜索框 */}
            <SearchBox>
              <SearchInput
                type="text"
                placeholder="搜索图层..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBox>

            {/* 图层列表 */}
            <LayersList>
              {Object.values(elements).map((element) => (
                <LayerItem
                  key={element.id}
                  $depth={0}
                  $selected={selectedElements.includes(element.id)}
                  onClick={() => handleLayerSelect(element.id)}
                >
                  <LayerIcon>
                    {element.type === 'frame' && (
                      <FrameIcon width={14} height={14} />
                    )}
                    {element.type === 'rectangle' && (
                      <BoxIcon width={14} height={14} />
                    )}
                    {element.type === 'text' && (
                      <TextIcon width={14} height={14} />
                    )}
                    {element.type === 'ellipse' && (
                      <CircleIcon width={14} height={14} />
                    )}
                    {element.type === 'group' && (
                      <Component1Icon width={14} height={14} />
                    )}
                  </LayerIcon>
                  <LayerName>{element.name}</LayerName>
                  <LayerControls>
                    <IconButton
                      icon={
                        element.locked ? <LockClosedIcon /> : <LockOpen1Icon />
                      }
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLayerToggleLock(element.id);
                      }}
                    />
                    <IconButton
                      icon={
                        element.visible ? <EyeOpenIcon /> : <EyeClosedIcon />
                      }
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLayerToggleVisibility(element.id);
                      }}
                    />
                  </LayerControls>
                </LayerItem>
              ))}
            </LayersList>
          </>
        )}

        {activeTab === 'assets' && (
          <div
            style={{ padding: '16px', textAlign: 'center', color: '#666' }}
          >
            <ComponentInstanceIcon
              width={32}
              height={32}
              style={{ marginBottom: '8px' }}
            />
            <div>暂无资源</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              从文件资源管理器拖拽图片到这里
            </div>
          </div>
        )}
      </SectionContent>
    </SidebarContainer>
  );
};

export default Sidebar;
