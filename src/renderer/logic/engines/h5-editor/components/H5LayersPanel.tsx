/**
 * H5 模式 - 左侧层级/页面面板（简版）
 * 展示页面列表与简单层级，后续可与 H5EditorCanvas 通过上下文对接。
 */
import React from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../../../ui/components/atoms/Icon/SvgIcon';
import { EnhancedIconButton } from '../../../../ui/business/Enhanced/EnhancedIconButton';
import { useUIIntegration, UIFeature } from '../../../../ui/business/UIIntegration/UIIntegrationProvider';

export interface IH5PageItem {
  id: string;
  name: string;
  width: number;
  height: number;
  isCurrentPage?: boolean;
}

interface H5LayersPanelProps {
  pages?: IH5PageItem[];
  onSelectPage?: (pageId: string) => void;
  currentMode?: 'design' | 'h5';
  onSwitchMode?: (mode: 'design' | 'h5') => void;
  onOpenTemplateLibrary?: () => void;
  onOpenAssetLibrary?: () => void;
  onOpenProjectLibrary?: () => void;
}

const PanelContainer = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.interface.panel.light};
  border-right: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TopToolsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0;
  padding: 12px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  background: ${({ theme }) => theme.colors.surface};
`;

const TopToolButton = styled(EnhancedIconButton)`
  height: 100%;
  border: none !important;
  box-shadow: none !important;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PanelTitle = styled.h2`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  letter-spacing: 0.5px;
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 16px 8px;
`;

const PageItem = styled.button<{ $active: boolean }>`
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  background: ${({ $active }) => ($active ? '#e3f2fd' : 'white')};
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const H5LayersPanel: React.FC<H5LayersPanelProps> = ({
  pages = [],
  onSelectPage,
  currentMode = 'h5',
  onSwitchMode,
  onOpenTemplateLibrary,
  onOpenAssetLibrary,
  onOpenProjectLibrary,
}) => {
  const { isFeatureEnabled } = useUIIntegration();
  return (
    <PanelContainer>
      <TopToolsBar>
        <TopToolButton
          icon={<SvgIcon name="icon.24.file.design" size={24} title="设计模式" />}
          onClick={() => onSwitchMode && onSwitchMode('design')}
          enableFigmaInteractions={true}
          enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
          tooltipContent="设计模式"
          tooltipPlacement="bottom"
          interactionVariant="tool"
          aria-label="设计模式"
          variant={currentMode === 'design' ? 'primary' : 'ghost'}
        />
        <TopToolButton
          icon={<SvgIcon name="icon.24.file.H5" size={24} title="H5模式" />}
          onClick={() => onSwitchMode && onSwitchMode('h5')}
          enableFigmaInteractions={true}
          enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
          tooltipContent="H5模式"
          tooltipPlacement="bottom"
          interactionVariant="tool"
          aria-label="H5模式"
          variant={currentMode === 'h5' ? 'primary' : 'ghost'}
        />
        <TopToolButton
          icon={<SvgIcon name="icon.24.file.design.mods" size={24} title="模板库" />}
          onClick={() => onOpenTemplateLibrary && onOpenTemplateLibrary()}
          enableFigmaInteractions={true}
          enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
          tooltipContent="模板库"
          tooltipPlacement="bottom"
          interactionVariant="tool"
          aria-label="模板库"
          variant="ghost"
        />
        <TopToolButton
          icon={<SvgIcon name="icon.24.file.design.assets" size={24} title="素材库" />}
          onClick={() => onOpenAssetLibrary && onOpenAssetLibrary()}
          enableFigmaInteractions={true}
          enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
          tooltipContent="素材库"
          tooltipPlacement="bottom"
          interactionVariant="tool"
          aria-label="素材库"
          variant="ghost"
        />
        <TopToolButton
          icon={<SvgIcon name="icon.24.file.design.library" size={24} title="项目库" />}
          onClick={() => onOpenProjectLibrary && onOpenProjectLibrary()}
          enableFigmaInteractions={true}
          enableTooltip={isFeatureEnabled(UIFeature.TOOLTIPS)}
          tooltipContent="项目库"
          tooltipPlacement="bottom"
          interactionVariant="tool"
          aria-label="项目库"
          variant="ghost"
        />
      </TopToolsBar>
      <PanelHeader>
        <SvgIcon name="icon.24.file.H5" size={16} title="H5模式" />
        <PanelTitle>H5 页面/层级</PanelTitle>
      </PanelHeader>
      <List>
        {pages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 12px', fontSize: '12px' }}>
            暂无页面，可在画布区域的新建按钮创建页面
          </div>
        ) : (
          pages.map(p => (
            <PageItem key={p.id} $active={!!p.isCurrentPage} onClick={() => onSelectPage?.(p.id)}>
              <SvgIcon name="icon.16.frame" size={12} title="页面" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{p.name}</div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>{p.width}×{p.height}</div>
              </div>
              {p.isCurrentPage && (
                <span style={{ fontSize: '11px', color: '#0d6efd' }}>当前</span>
              )}
            </PageItem>
          ))
        )}
      </List>
    </PanelContainer>
  );
};

export default H5LayersPanel;


