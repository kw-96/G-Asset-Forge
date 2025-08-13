/**
 * Figma风格的图层面板
 * 显示画布中所有对象的层级结构
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../ui/components/Icon/SvgIcon';
import { Input } from '../../ui/components/Input/Input';
import { AssetsPanel } from '../Assets/AssetsPanel';
import { Modal } from '../../ui/components/Modal/Modal';
import { EnhancedIconButton } from '../Enhanced/EnhancedIconButton';
import { useUIIntegration, UIFeature } from '../UIIntegration/UIIntegrationProvider';

interface LayerItem {
  id: string;
  name: string;
  type: 'frame' | 'text' | 'shape' | 'image' | 'group';
  visible: boolean;
  locked: boolean;
  children?: LayerItem[];
  expanded?: boolean;
}

interface FigmaLayersPanelProps {
  layers: LayerItem[];
  selectedLayerId?: string;
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
  onLayerRename: (layerId: string, newName: string) => void;
  onLayerToggleExpanded: (layerId: string) => void;
  // 可选：嵌入原 LeftToolPanel 的顶部工具区
  activePanel?: 'layers' | 'assets';
  onSwitchPanel?: (panel: 'layers' | 'assets') => void;
  // 新增：模式/库切换
  onSwitchMode?: (mode: 'design' | 'h5') => void;
  onOpenTemplateLibrary?: () => void;
  onOpenAssetLibrary?: () => void;
  onOpenProjectLibrary?: () => void;
}

const PanelContainer = styled.div`
  width: 280px;
  height: 100%;
  background: ${({ theme }) => theme.colors.interface.panel.light};
  border-right: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  display: flex;
  flex-direction: column;
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

const PanelHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelTitle = styled.h2`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LayersList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const LayerItem = styled.div<{ 
  $selected: boolean; 
  $depth: number;
  $isDragging?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 4px 8px 4px ${({ $depth }) => 8 + $depth * 16}px;
  cursor: pointer;
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.primary[50] : 'transparent'};
  border-left: ${({ $selected, theme }) => 
    $selected ? `2px solid ${theme.colors.primary[500]}` : '2px solid transparent'};
  opacity: ${({ $isDragging }) => $isDragging ? 0.5 : 1};
  
  &:hover {
    background: ${({ $selected, theme }) => 
      $selected ? theme.colors.primary[50] : '#f9fafb'};
  }
  
  &:hover .layer-controls {
    opacity: 1;
  }
`;

const LayerIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  color: #6b7280;
`;

const LayerName = styled.div`
  flex: 1;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LayerNameInput = styled(Input)`
  flex: 1;
  font-size: 12px;
  height: 20px;
  padding: 2px 4px;
  border: 1px solid ${({ theme }) => theme.colors.primary[500]};
  background: white;
`;

const LayerControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 150ms ease;
  
  &.layer-controls {
    opacity: 0;
  }
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: ${({ $active }) => $active ? '#374151' : '#9ca3af'};
  cursor: pointer;
  border-radius: 2px;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ExpandButton = styled.button<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  margin-right: 4px;
  transform: ${({ $expanded }) => $expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 150ms ease;
  
  &:hover {
    color: #374151;
  }
`;

const getLayerIcon = (type: LayerItem['type']) => {
  switch (type) {
    case 'frame':
      return 'icon.16.frame';
    case 'text':
      return 'icon.16.text';
    case 'shape':
      return 'icon.16.rectangle';
    case 'image':
      return 'icon.16.image';
    case 'group':
      return 'icon.16.group';
    default:
      return 'icon.16.rectangle';
  }
};

export const FigmaLayersPanel: React.FC<FigmaLayersPanelProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerRename,
  onLayerToggleExpanded,
  activePanel,
  onSwitchPanel,
  onSwitchMode,
  onOpenTemplateLibrary,
  onOpenAssetLibrary,
  onOpenProjectLibrary,
}) => {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { isFeatureEnabled } = useUIIntegration();
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);

  const handleLayerDoubleClick = (layer: LayerItem) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleNameSubmit = () => {
    if (editingLayerId && editingName.trim()) {
      onLayerRename(editingLayerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditingLayerId(null);
      setEditingName('');
    }
  };

  const renderLayer = (layer: LayerItem, depth = 0): React.ReactNode => {
    const isSelected = selectedLayerId === layer.id;
    const isEditing = editingLayerId === layer.id;
    const hasChildren = layer.children && layer.children.length > 0;

    return (
      <React.Fragment key={layer.id}>
        <LayerItem
          $selected={isSelected}
          $depth={depth}
          onClick={() => onLayerSelect(layer.id)}
          onDoubleClick={() => handleLayerDoubleClick(layer)}
        >
          {hasChildren && (
            <ExpandButton
              $expanded={layer.expanded || false}
              onClick={(e) => {
                e.stopPropagation();
                onLayerToggleExpanded(layer.id);
              }}
            >
              <SvgIcon name="icon.16.chevron.right" size={12} title="展开/折叠" />
            </ExpandButton>
          )}
          
          {!hasChildren && <div style={{ width: '16px', marginRight: '4px' }} />}
          
          <LayerIcon>
            <SvgIcon name={getLayerIcon(layer.type)} size={12} title={layer.type} />
          </LayerIcon>
          
          {isEditing ? (
            <LayerNameInput
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              autoFocus
            />
          ) : (
            <LayerName>{layer.name}</LayerName>
          )}
          
          <LayerControls className="layer-controls">
            <ControlButton
              $active={layer.visible}
              onClick={(e) => {
                e.stopPropagation();
                onLayerToggleVisibility(layer.id);
              }}
              title={layer.visible ? '隐藏图层' : '显示图层'}
            >
              <SvgIcon 
                name={layer.visible ? 'icon.16.visible' : 'icon.16.hidden'} 
                size={12} 
                title={layer.visible ? '可见' : '隐藏'} 
              />
            </ControlButton>
            
            <ControlButton
              $active={layer.locked}
              onClick={(e) => {
                e.stopPropagation();
                onLayerToggleLock(layer.id);
              }}
              title={layer.locked ? '解锁图层' : '锁定图层'}
            >
              <SvgIcon 
                name={layer.locked ? 'icon.16.lock.locked' : 'icon.16.lock.unlocked'} 
                size={12} 
                title={layer.locked ? '已锁定' : '未锁定'} 
              />
            </ControlButton>
          </LayerControls>
        </LayerItem>
        
        {hasChildren && layer.expanded && 
          layer.children!.map(child => renderLayer(child, depth + 1))
        }
      </React.Fragment>
    );
  };

  return (
    <PanelContainer>
      {onSwitchPanel && (
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
            variant="ghost"
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
            variant="ghost"
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
            onClick={() => onOpenAssetLibrary ? onOpenAssetLibrary() : setIsAssetsOpen(true)}
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
      )}
      <PanelHeader>
        <PanelTitle>图层</PanelTitle>
        <ControlButton title="添加图层">
          <SvgIcon name="icon.16.plus" size={12} title="添加图层" />
        </ControlButton>
      </PanelHeader>
      
      <LayersList>
        {layers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#9ca3af', 
            padding: '40px 20px',
            fontSize: '12px'
          }}>
            画布中没有对象
          </div>
        ) : (
          layers.map(layer => renderLayer(layer))
        )}
      </LayersList>

      <Modal isOpen={isAssetsOpen} onClose={() => setIsAssetsOpen(false)} title="素材库" size="xl">
        <AssetsPanel />
      </Modal>
    </PanelContainer>
  );
};