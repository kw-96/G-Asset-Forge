/**
 * 素材库面板 - 游戏资产管理和浏览
 * 支持5大分类、搜索过滤、上传管理等功能
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Input } from '../../ui/components/Input/Input';
import { Button } from '../../ui/components/Button/Button';
import { Badge } from '../../ui/components/Badge/Badge';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Dropdown, DropdownItem } from '../../ui/components/Dropdown/Dropdown';
import { SvgIcon } from '../../ui/components/Icon/SvgIcon';

interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  thumbnail: string;
  size: string;
  format: string;
  tags: string[];
  favorite: boolean;
}

type AssetCategory = 'backgrounds' | 'characters' | 'ui-elements' | 'icons' | 'effects';

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

const SearchSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryTab = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.border.default};
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primary + '20' : theme.colors.surface};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  white-space: nowrap;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const AssetsGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.sm};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  align-content: start;
`;

const AssetItem = styled.div`
  aspect-ratio: 1;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all ${({ theme }) => theme.animation.duration.fast};
  background: ${({ theme }) => theme.colors.surface};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AssetThumbnail = styled.div<{ $bgColor?: string }>`
  width: 100%;
  height: 70%;
  background: ${({ $bgColor, theme }) => $bgColor || theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
`;

const AssetInfo = styled.div`
  height: 30%;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AssetName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const AssetOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ${({ theme }) => theme.animation.duration.fast};
  
  ${AssetItem}:hover & {
    opacity: 1;
  }
`;

const FavoriteButton = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xs};
  right: ${({ theme }) => theme.spacing.xs};
  background: rgba(0, 0, 0, 0.5);
  color: white;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const PanelFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const AssetsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all'>('all');
  const [, setSortBy] = useState<'name' | 'date' | 'size'>('name');

  const categories = [
    { id: 'all' as const, name: '全部', count: 52 },
    { id: 'backgrounds' as const, name: '背景', count: 10 },
    { id: 'characters' as const, name: '角色', count: 5 },
    { id: 'ui-elements' as const, name: 'UI元素', count: 20 },
    { id: 'icons' as const, name: '图标', count: 15 },
    { id: 'effects' as const, name: '特效', count: 8 },
  ];

  const mockAssets: Asset[] = [
    {
      id: '1',
      name: '科幻背景1',
      category: 'backgrounds',
      thumbnail: '🌌',
      size: '1920x1080',
      format: 'PNG',
      tags: ['科幻', '太空', '蓝色'],
      favorite: true,
    },
    {
      id: '2',
      name: '主按钮',
      category: 'ui-elements',
      thumbnail: '🔘',
      size: '200x60',
      format: 'PNG',
      tags: ['按钮', 'UI', '蓝色'],
      favorite: false,
    },
    {
      id: '3',
      name: '战士角色',
      category: 'characters',
      thumbnail: '⚔️',
      size: '256x256',
      format: 'PNG',
      tags: ['角色', '战士', '像素'],
      favorite: true,
    },
    {
      id: '4',
      name: '设置图标',
      category: 'icons',
      thumbnail: '⚙️',
      size: '64x64',
      format: 'SVG',
      tags: ['图标', '设置', '齿轮'],
      favorite: false,
    },
    {
      id: '5',
      name: '爆炸特效',
      category: 'effects',
      thumbnail: '💥',
      size: '128x128',
      format: 'PNG',
      tags: ['特效', '爆炸', '动画'],
      favorite: false,
    },
  ];

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || asset.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (assetId: string) => {
    console.log('Toggle favorite:', assetId);
  };

  const handleAssetClick = (asset: Asset) => {
    console.log('Asset clicked:', asset);
  };

  const handleUpload = () => {
    console.log('Upload asset');
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>素材库</PanelTitle>
        
        <SearchSection>
          <Input
            placeholder="搜索素材..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
          />
          <Dropdown trigger={<IconButton variant="ghost" size="sm" icon={<SvgIcon name="icon.16.chevron.down" size={12} title="排序" />} />}>
            <DropdownItem onSelect={() => setSortBy('name')}>
              按名称排序
            </DropdownItem>
            <DropdownItem onSelect={() => setSortBy('date')}>
              按日期排序
            </DropdownItem>
            <DropdownItem onSelect={() => setSortBy('size')}>
              按大小排序
            </DropdownItem>
          </Dropdown>
        </SearchSection>

        <CategoryTabs>
          {categories.map(category => (
            <CategoryTab
              key={category.id}
              $active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name} ({category.count})
            </CategoryTab>
          ))}
        </CategoryTabs>

        <StatsSection>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {filteredAssets.length} 个素材
          </span>
          <Badge variant="info" size="sm">
            {mockAssets.filter(a => a.favorite).length} 收藏
          </Badge>
        </StatsSection>
      </PanelHeader>

      <AssetsGrid>
        {filteredAssets.map(asset => (
          <AssetItem key={asset.id} onClick={() => handleAssetClick(asset)}>
            <AssetThumbnail>
              {asset.thumbnail}
            </AssetThumbnail>
            
            <AssetInfo>
              <AssetName>{asset.name}</AssetName>
            </AssetInfo>

            <FavoriteButton
              variant="ghost"
              size="xs"
              icon={<SvgIcon name={asset.favorite ? 'icon.16.rating.filled' : 'icon.16.rating'} size={12} title={asset.favorite ? '取消收藏' : '收藏'} />}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(asset.id);
              }}
            />

            <AssetOverlay>
              <Button variant="primary" size="sm">
                使用
              </Button>
            </AssetOverlay>
          </AssetItem>
        ))}
      </AssetsGrid>

      <PanelFooter>
        <Button variant="outline" size="sm" onClick={handleUpload}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
            <SvgIcon name="icon.16.publish" size={12} title="上传" /> 上传素材
          </span>
        </Button>
        <Button variant="ghost" size="sm">
          <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
            <SvgIcon name="icon.16.folder" size={12} title="分类" /> 管理分类
          </span>
        </Button>
      </PanelFooter>
    </PanelContainer>
  );
};