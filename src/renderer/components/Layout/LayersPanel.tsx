/**
 * 图层面板 - Figma风格的图层管理
 * 支持图层树结构、拖拽排序、可见性控制等
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Input } from '../../ui/components/Input/Input';
import { Button } from '../../ui/components/Button/Button';

interface Layer {
  id: string;
  name: string;
  type: 'group' | 'text' | 'image' | 'shape' | 'brush';
  visible: boolean;
  locked: boolean;
  children?: Layer[];
  expanded?: boolean;
}

const PanelContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
`;

const PanelHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.surface};
`;

const PanelTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const SearchInput = styled(Input)`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const LayersList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.sm};
`;

const LayerItem = styled.div<{ $level: number; $selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  padding-left: ${({ $level, theme }) => `calc(${theme.spacing.sm} + ${$level * 20}px)`};
  margin-bottom: 1px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  background: ${({ theme, $selected }) => 
    $selected ? theme.colors.primary + '20' : 'transparent'};
  border: 1px solid ${({ theme, $selected }) => 
    $selected ? theme.colors.primary : 'transparent'};
  
  &:hover {
    background: ${({ theme, $selected }) => 
      $selected ? theme.colors.primary + '30' : theme.colors.surface};
  }
`;

const LayerIcon = styled.div<{ $expanded?: boolean }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  transform: ${({ $expanded }) => $expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform ${({ theme }) => theme.animation.duration.fast};
`;

const LayerTypeIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.xs};
  font-size: 12px;
`;

const LayerName = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LayerControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  opacity: 0;
  transition: opacity ${({ theme }) => theme.animation.duration.fast};
  
  ${LayerItem}:hover & {
    opacity: 1;
  }
`;

const PanelFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const LayersPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLayers, setSelectedLayers] = useState<string[]>(['layer-1']);
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'group-1',
      name: '游戏UI组',
      type: 'group',
      visible: true,
      locked: false,
      expanded: true,
      children: [
        {
          id: 'layer-1',
          name: '主按钮',
          type: 'shape',
          visible: true,
          locked: false,
        },
        {
          id: 'layer-2',
          name: '按钮文字',
          type: 'text',
          visible: true,
          locked: false,
        },
      ],
    },
    {
      id: 'layer-3',
      name: '背景图片',
      type: 'image',
      visible: true,
      locked: false,
    },
    {
      id: 'layer-4',
      name: '装饰元素',
      type: 'brush',
      visible: false,
      locked: true,
    },
  ]);

  const getTypeIcon = (type: Layer['type']) => {
    switch (type) {
      case 'group': return '📁';
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'shape': return '⬜';
      case 'brush': return '🖌️';
      default: return '📄';
    }
  };

  const toggleLayerExpansion = (layerId: string) => {
    const updateLayer = (layers: Layer[]): Layer[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, expanded: !layer.expanded };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  };

  const toggleLayerVisibility = (layerId: string) => {
    const updateLayer = (layers: Layer[]): Layer[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, visible: !layer.visible };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  };

  const toggleLayerLock = (layerId: string) => {
    const updateLayer = (layers: Layer[]): Layer[] => {
      return layers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, locked: !layer.locked };
        }
        if (layer.children) {
          return { ...layer, children: updateLayer(layer.children) };
        }
        return layer;
      });
    };
    setLayers(updateLayer(layers));
  };

  const selectLayer = (layerId: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedLayers(prev => 
        prev.includes(layerId) 
          ? prev.filter(id => id !== layerId)
          : [...prev, layerId]
      );
    } else {
      setSelectedLayers([layerId]);
    }
  };

  const renderLayer = (layer: Layer, level = 0): React.ReactNode => {
    const isSelected = selectedLayers.includes(layer.id);
    
    return (
      <React.Fragment key={layer.id}>
        <LayerItem
          $level={level}
          $selected={isSelected}
          onClick={(e) => selectLayer(layer.id, e.ctrlKey || e.metaKey)}
        >
          {layer.children && (
            <LayerIcon
              $expanded={layer.expanded || false}
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerExpansion(layer.id);
              }}
            >
              ▶
            </LayerIcon>
          )}
          
          <LayerTypeIcon>
            {getTypeIcon(layer.type)}
          </LayerTypeIcon>
          
          <LayerName>{layer.name}</LayerName>
          
          <LayerControls>
            <IconButton
              variant="ghost"
              size="xs"
              icon={layer.visible ? '👁️' : '🙈'}
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility(layer.id);
              }}
            />
            <IconButton
              variant="ghost"
              size="xs"
              icon={layer.locked ? '🔒' : '🔓'}
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerLock(layer.id);
              }}
            />
          </LayerControls>
        </LayerItem>
        
        {layer.children && layer.expanded && 
          layer.children.map(child => renderLayer(child, level + 1))
        }
      </React.Fragment>
    );
  };

  const filteredLayers = layers.filter(layer =>
    layer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>图层</PanelTitle>
        <SearchInput
          placeholder="搜索图层..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
        />
      </PanelHeader>

      <LayersList>
        {filteredLayers.map(layer => renderLayer(layer))}
      </LayersList>

      <PanelFooter>
        <Button variant="ghost" size="sm" fullWidth>
          ➕ 添加图层
        </Button>
        <IconButton
          variant="ghost"
          size="sm"
          icon="🗑️"
          disabled={selectedLayers.length === 0}
        />
      </PanelFooter>
    </PanelContainer>
  );
};