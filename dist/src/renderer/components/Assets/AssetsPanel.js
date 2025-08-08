import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 素材库面板 - 游戏资产管理和浏览
 * 支持5大分类、搜索过滤、上传管理等功能
 */
import { useState } from 'react';
import styled from 'styled-components';
import { Input } from '../../ui/components/Input/Input';
import { Button } from '../../ui/components/Button/Button';
import { Badge } from '../../ui/components/Badge/Badge';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Dropdown, DropdownItem } from '../../ui/components/Dropdown/Dropdown';
const PanelContainer = styled.div `
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
`;
const PanelHeader = styled.div `
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.surface};
`;
const PanelTitle = styled.h3 `
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;
const SearchSection = styled.div `
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;
const CategoryTabs = styled.div `
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;
const CategoryTab = styled.button `
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border.default};
  background: ${({ theme, $active }) => $active ? theme.colors.primary + '20' : theme.colors.surface};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.text.secondary};
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
const AssetsGrid = styled.div `
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.sm};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  align-content: start;
`;
const AssetItem = styled.div `
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
const AssetThumbnail = styled.div `
  width: 100%;
  height: 70%;
  background: ${({ $bgColor, theme }) => $bgColor || theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
`;
const AssetInfo = styled.div `
  height: 30%;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const AssetName = styled.div `
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;
const AssetOverlay = styled.div `
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
const FavoriteButton = styled(IconButton) `
  position: absolute;
  top: ${({ theme }) => theme.spacing.xs};
  right: ${({ theme }) => theme.spacing.xs};
  background: rgba(0, 0, 0, 0.5);
  color: white;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;
const PanelFooter = styled.div `
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;
const StatsSection = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;
export const AssetsPanel = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [, setSortBy] = useState('name');
    const categories = [
        { id: 'all', name: '全部', count: 52 },
        { id: 'backgrounds', name: '背景', count: 10 },
        { id: 'characters', name: '角色', count: 5 },
        { id: 'ui-elements', name: 'UI元素', count: 20 },
        { id: 'icons', name: '图标', count: 15 },
        { id: 'effects', name: '特效', count: 8 },
    ];
    const mockAssets = [
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
    const toggleFavorite = (assetId) => {
        console.log('Toggle favorite:', assetId);
    };
    const handleAssetClick = (asset) => {
        console.log('Asset clicked:', asset);
    };
    const handleUpload = () => {
        console.log('Upload asset');
    };
    return (_jsxs(PanelContainer, { children: [_jsxs(PanelHeader, { children: [_jsx(PanelTitle, { children: "\u7D20\u6750\u5E93" }), _jsxs(SearchSection, { children: [_jsx(Input, { placeholder: "\u641C\u7D22\u7D20\u6750...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), size: "sm" }), _jsxs(Dropdown, { trigger: _jsx(IconButton, { variant: "ghost", size: "sm", icon: "\uD83D\uDD3D" }), children: [_jsx(DropdownItem, { onSelect: () => setSortBy('name'), children: "\u6309\u540D\u79F0\u6392\u5E8F" }), _jsx(DropdownItem, { onSelect: () => setSortBy('date'), children: "\u6309\u65E5\u671F\u6392\u5E8F" }), _jsx(DropdownItem, { onSelect: () => setSortBy('size'), children: "\u6309\u5927\u5C0F\u6392\u5E8F" })] })] }), _jsx(CategoryTabs, { children: categories.map(category => (_jsxs(CategoryTab, { "$active": activeCategory === category.id, onClick: () => setActiveCategory(category.id), children: [category.name, " (", category.count, ")"] }, category.id))) }), _jsxs(StatsSection, { children: [_jsxs("span", { style: { fontSize: '12px', color: 'var(--text-secondary)' }, children: [filteredAssets.length, " \u4E2A\u7D20\u6750"] }), _jsxs(Badge, { variant: "info", size: "sm", children: [mockAssets.filter(a => a.favorite).length, " \u6536\u85CF"] })] })] }), _jsx(AssetsGrid, { children: filteredAssets.map(asset => (_jsxs(AssetItem, { onClick: () => handleAssetClick(asset), children: [_jsx(AssetThumbnail, { children: asset.thumbnail }), _jsx(AssetInfo, { children: _jsx(AssetName, { children: asset.name }) }), _jsx(FavoriteButton, { variant: "ghost", size: "xs", icon: asset.favorite ? '❤️' : '🤍', onClick: (e) => {
                                e.stopPropagation();
                                toggleFavorite(asset.id);
                            } }), _jsx(AssetOverlay, { children: _jsx(Button, { variant: "primary", size: "sm", children: "\u4F7F\u7528" }) })] }, asset.id))) }), _jsxs(PanelFooter, { children: [_jsx(Button, { variant: "outline", size: "sm", onClick: handleUpload, children: "\uD83D\uDCE4 \u4E0A\u4F20\u7D20\u6750" }), _jsx(Button, { variant: "ghost", size: "sm", children: "\uD83D\uDCC1 \u7BA1\u7406\u5206\u7C7B" })] })] }));
};
//# sourceMappingURL=AssetsPanel.js.map