/**
 * Figma风格的字体选择器
 * 支持字体预览、搜索和分类
 */

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '../../atoms/Icon/SvgIcon';
import { Input } from '../../atoms/Input/Input';

interface FontOption {
  family: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  variants: string[];
  preview?: string;
}

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
  onClose?: () => void;
  showPreview?: boolean;
}

const FontPickerContainer = styled.div`
  width: 320px;
  max-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FontPickerHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  background: #f9fafb;
`;

const SearchInput = styled(Input)`
  width: 100%;
  font-size: 14px;
  height: 32px;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const FontCategories = styled.div`
  display: flex;
  gap: 2px;
  padding: 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  background: #fafafa;
`;

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary[500] : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#6b7280'};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primary[600] : '#f3f4f6'};
    color: ${({ $active }) => $active ? 'white' : '#374151'};
  }
`;

const FontList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const FontItem = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.primary[50] : 'transparent'};
  border-left: ${({ $selected, theme }) => 
    $selected ? `3px solid ${theme.colors.primary[500]}` : '3px solid transparent'};
  
  &:hover {
    background: ${({ $selected, theme }) => 
      $selected ? theme.colors.primary[50] : '#f9fafb'};
  }
`;

const FontInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FontName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const FontPreview = styled.div<{ $fontFamily: string }>`
  font-family: ${({ $fontFamily }) => $fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const FontCategory = styled.div`
  font-size: 10px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const FontVariants = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 12px;
`;

const VariantChip = styled.span`
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 3px;
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
`;

const NoResults = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
`;

const RecentFonts = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  background: #fafafa;
`;

const RecentFontsTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const RecentFontsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const RecentFontChip = styled.button<{ $selected: boolean }>`
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  border-radius: 4px;
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.primary[500] : 'white'};
  color: ${({ $selected }) => $selected ? 'white' : '#374151'};
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms ease;
  
  &:hover {
    background: ${({ $selected, theme }) => 
      $selected ? theme.colors.primary[600] : '#f9fafb'};
    border-color: ${({ theme }) => theme.colors.interface.divider.light};
  }
`;

// 预定义字体列表
const SYSTEM_FONTS: FontOption[] = [
  {
    family: 'Inter',
    category: 'sans-serif',
    variants: ['Regular', 'Medium', 'SemiBold', 'Bold'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'SF Pro Display',
    category: 'sans-serif',
    variants: ['Regular', 'Medium', 'SemiBold', 'Bold'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'Roboto',
    category: 'sans-serif',
    variants: ['Regular', 'Medium', 'Bold'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'Arial',
    category: 'sans-serif',
    variants: ['Regular', 'Bold'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'Helvetica Neue',
    category: 'sans-serif',
    variants: ['Regular', 'Medium', 'Bold'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'Times New Roman',
    category: 'serif',
    variants: ['Regular', 'Bold', 'Italic'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'Georgia',
    category: 'serif',
    variants: ['Regular', 'Bold', 'Italic'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'SF Mono',
    category: 'monospace',
    variants: ['Regular', 'Medium', 'SemiBold'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'Monaco',
    category: 'monospace',
    variants: ['Regular'],
    preview: 'The quick brown fox jumps over the lazy dog'
  },
  {
    family: 'Consolas',
    category: 'monospace',
    variants: ['Regular', 'Bold'],
    preview: 'The quick brown fox jumps over the lazy dog'
  }
];

const FONT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'sans-serif', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'monospace', label: 'Mono' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Script' }
];

export const FontPicker: React.FC<FontPickerProps> = ({
  value,
  onChange,
  onClose,
  showPreview = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentFonts] = useState(['Inter', 'Roboto', 'SF Pro Display', 'Arial']);

  const filteredFonts = useMemo(() => {
    let fonts = SYSTEM_FONTS;

    // 按分类过滤
    if (selectedCategory !== 'all') {
      fonts = fonts.filter(font => font.category === selectedCategory);
    }

    // 按搜索查询过滤
    if (searchQuery) {
      fonts = fonts.filter(font => 
        font.family.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return fonts;
  }, [searchQuery, selectedCategory]);

  const handleFontSelect = (fontFamily: string) => {
    onChange(fontFamily);
    onClose?.();
  };

  return (
    <FontPickerContainer>
      <FontPickerHeader>
        <SearchInput
          placeholder="搜索字体..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </FontPickerHeader>

      {recentFonts.length > 0 && (
        <RecentFonts>
          <RecentFontsTitle>最近使用</RecentFontsTitle>
          <RecentFontsList>
            {recentFonts.map((font) => (
              <RecentFontChip
                key={font}
                $selected={value === font}
                onClick={() => handleFontSelect(font)}
              >
                {font}
              </RecentFontChip>
            ))}
          </RecentFontsList>
        </RecentFonts>
      )}

      <FontCategories>
        {FONT_CATEGORIES.map((category) => (
          <CategoryButton
            key={category.id}
            $active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </CategoryButton>
        ))}
      </FontCategories>

      <FontList>
        {filteredFonts.length === 0 ? (
          <NoResults>
            <SvgIcon name="icon.24.search" size={24} title="无结果" />
            <div style={{ marginTop: '8px' }}>
              没有找到匹配的字体
            </div>
          </NoResults>
        ) : (
          filteredFonts.map((font) => (
            <FontItem
              key={font.family}
              $selected={value === font.family}
              onClick={() => handleFontSelect(font.family)}
            >
              <FontInfo>
                <FontName>{font.family}</FontName>
                {showPreview && (
                  <FontPreview $fontFamily={font.family}>
                    {font.preview || 'Aa Bb Cc 123'}
                  </FontPreview>
                )}
                <FontCategory>{font.category}</FontCategory>
              </FontInfo>
              
              <FontVariants>
                {font.variants.slice(0, 3).map((variant) => (
                  <VariantChip key={variant}>
                    {variant}
                  </VariantChip>
                ))}
                {font.variants.length > 3 && (
                  <VariantChip>
                    +{font.variants.length - 3}
                  </VariantChip>
                )}
              </FontVariants>
            </FontItem>
          ))
        )}
      </FontList>
    </FontPickerContainer>
  );
};