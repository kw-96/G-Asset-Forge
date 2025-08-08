/**
 * 右侧属性面板 - Figma风格的属性编辑面板
 * 根据选中的工具和对象显示相应的属性控制
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Input } from '../../ui/components/Input/Input';
import { Slider } from '../../ui/components/Slider/Slider';
import { Switch } from '../../ui/components/Switch/Switch';
import { IconButton } from '../../ui/components/IconButton/IconButton';

const PanelContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  overflow-y: auto;
`;

const PanelSection = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.surface};
`;

const SectionHeader = styled.div<{ $collapsed?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SectionContent = styled.div<{ $collapsed?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  padding-top: 0;
  display: ${({ $collapsed }) => $collapsed ? 'none' : 'block'};
`;

const PropertyRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PropertyLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 60px;
  flex-shrink: 0;
`;

const PropertyControl = styled.div`
  flex: 1;
`;

const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ColorPresets = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const PresetColor = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const NoSelection = styled.div`
  padding: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NoSelectionIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const RightPropertiesPanel: React.FC = () => {
  const [selectedTool] = useState<string>('select');
  const [selectedObject] = useState<any>(null);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  // 模拟属性状态
  const [properties, setProperties] = useState({
    position: { x: 100, y: 100 },
    size: { width: 200, height: 100 },
    rotation: 0,
    opacity: 100,
    fillColor: '#6366f1',
    strokeColor: '#000000',
    strokeWidth: 1,
    borderRadius: 0,
    fontSize: 16,
    fontWeight: 400,
    textAlign: 'left',
    visible: true,
    locked: false,
  });

  const colorPresets = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#64748b',
    '#000000', '#ffffff', '#f3f4f6', '#1f2937',
  ];

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateProperty = (key: string, value: any) => {
    setProperties(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedProperty = (parent: string, key: string, value: any) => {
    setProperties(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof typeof prev] as any), [key]: value }
    }));
  };

  // 如果没有选中对象，显示空状态
  if (!selectedObject && selectedTool === 'select') {
    return (
      <PanelContainer>
        <NoSelection>
          <NoSelectionIcon>🎯</NoSelectionIcon>
          <div>选择对象以编辑属性</div>
        </NoSelection>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      {/* 变换属性 */}
      <PanelSection>
        <SectionHeader onClick={() => toggleSection('transform')}>
          <SectionTitle>变换</SectionTitle>
          <IconButton
            variant="ghost"
            size="xs"
            icon={collapsedSections.includes('transform') ? '▶️' : '🔽'}
          />
        </SectionHeader>
        <SectionContent $collapsed={collapsedSections.includes('transform')}>
          <PropertyRow>
            <PropertyLabel>位置</PropertyLabel>
            <PropertyControl>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  size="sm"
                  value={properties.position.x}
                  onChange={(e) => updateNestedProperty('position', 'x', Number(e.target.value))}
                  placeholder="X"
                />
                <Input
                  size="sm"
                  value={properties.position.y}
                  onChange={(e) => updateNestedProperty('position', 'y', Number(e.target.value))}
                  placeholder="Y"
                />
              </div>
            </PropertyControl>
          </PropertyRow>

          <PropertyRow>
            <PropertyLabel>尺寸</PropertyLabel>
            <PropertyControl>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  size="sm"
                  value={properties.size.width}
                  onChange={(e) => updateNestedProperty('size', 'width', Number(e.target.value))}
                  placeholder="宽"
                />
                <Input
                  size="sm"
                  value={properties.size.height}
                  onChange={(e) => updateNestedProperty('size', 'height', Number(e.target.value))}
                  placeholder="高"
                />
              </div>
            </PropertyControl>
          </PropertyRow>

          <PropertyRow>
            <PropertyLabel>旋转</PropertyLabel>
            <PropertyControl>
              <Slider
                value={[properties.rotation]}
                onValueChange={(value) => updateProperty('rotation', value[0])}
                min={0}
                max={360}
              />
            </PropertyControl>
          </PropertyRow>

          <PropertyRow>
            <PropertyLabel>透明度</PropertyLabel>
            <PropertyControl>
              <Slider
                value={[properties.opacity]}
                onValueChange={(value) => updateProperty('opacity', value[0])}
                min={0}
                max={100}
              />
            </PropertyControl>
          </PropertyRow>
        </SectionContent>
      </PanelSection>

      {/* 外观属性 */}
      <PanelSection>
        <SectionHeader onClick={() => toggleSection('appearance')}>
          <SectionTitle>外观</SectionTitle>
          <IconButton
            variant="ghost"
            size="xs"
            icon={collapsedSections.includes('appearance') ? '▶️' : '🔽'}
          />
        </SectionHeader>
        <SectionContent $collapsed={collapsedSections.includes('appearance')}>
          <PropertyRow>
            <PropertyLabel>填充</PropertyLabel>
            <PropertyControl>
              <ColorPicker>
                <ColorSwatch $color={properties.fillColor} />
                <Input
                  size="sm"
                  value={properties.fillColor}
                  onChange={(e) => updateProperty('fillColor', e.target.value)}
                />
              </ColorPicker>
              <ColorPresets>
                {colorPresets.map((color) => (
                  <PresetColor
                    key={color}
                    $color={color}
                    onClick={() => updateProperty('fillColor', color)}
                  />
                ))}
              </ColorPresets>
            </PropertyControl>
          </PropertyRow>

          <PropertyRow>
            <PropertyLabel>描边</PropertyLabel>
            <PropertyControl>
              <ColorPicker>
                <ColorSwatch $color={properties.strokeColor} />
                <Input
                  size="sm"
                  value={properties.strokeColor}
                  onChange={(e) => updateProperty('strokeColor', e.target.value)}
                />
              </ColorPicker>
            </PropertyControl>
          </PropertyRow>

          <PropertyRow>
            <PropertyLabel>描边宽度</PropertyLabel>
            <PropertyControl>
              <Slider
                value={[properties.strokeWidth]}
                onValueChange={(value) => updateProperty('strokeWidth', value[0])}
                min={0}
                max={10}
              />
            </PropertyControl>
          </PropertyRow>

          <PropertyRow>
            <PropertyLabel>圆角</PropertyLabel>
            <PropertyControl>
              <Slider
                value={[properties.borderRadius]}
                onValueChange={(value) => updateProperty('borderRadius', value[0])}
                min={0}
                max={50}
              />
            </PropertyControl>
          </PropertyRow>
        </SectionContent>
      </PanelSection>

      {/* 文本属性（仅在选中文本时显示） */}
      {selectedTool === 'text' && (
        <PanelSection>
          <SectionHeader onClick={() => toggleSection('text')}>
            <SectionTitle>文本</SectionTitle>
            <IconButton
              variant="ghost"
              size="xs"
              icon={collapsedSections.includes('text') ? '▶️' : '🔽'}
            />
          </SectionHeader>
          <SectionContent $collapsed={collapsedSections.includes('text')}>
            <PropertyRow>
              <PropertyLabel>字体大小</PropertyLabel>
              <PropertyControl>
                <Slider
                  value={[properties.fontSize]}
                  onValueChange={(value) => updateProperty('fontSize', value[0])}
                  min={8}
                  max={72}
                />
              </PropertyControl>
            </PropertyRow>

            <PropertyRow>
              <PropertyLabel>字重</PropertyLabel>
              <PropertyControl>
                <Slider
                  value={[properties.fontWeight]}
                  onValueChange={(value) => updateProperty('fontWeight', value[0])}
                  min={100}
                  max={900}
                  step={100}
                />
              </PropertyControl>
            </PropertyRow>

            <PropertyRow>
              <PropertyLabel>对齐</PropertyLabel>
              <PropertyControl>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <IconButton
                    variant={properties.textAlign === 'left' ? 'primary' : 'ghost'}
                    size="sm"
                    icon="⬅️"
                    onClick={() => updateProperty('textAlign', 'left')}
                  />
                  <IconButton
                    variant={properties.textAlign === 'center' ? 'primary' : 'ghost'}
                    size="sm"
                    icon="↔️"
                    onClick={() => updateProperty('textAlign', 'center')}
                  />
                  <IconButton
                    variant={properties.textAlign === 'right' ? 'primary' : 'ghost'}
                    size="sm"
                    icon="➡️"
                    onClick={() => updateProperty('textAlign', 'right')}
                  />
                </div>
              </PropertyControl>
            </PropertyRow>
          </SectionContent>
        </PanelSection>
      )}

      {/* 图层属性 */}
      <PanelSection>
        <SectionHeader onClick={() => toggleSection('layer')}>
          <SectionTitle>图层</SectionTitle>
          <IconButton
            variant="ghost"
            size="xs"
            icon={collapsedSections.includes('layer') ? '▶️' : '🔽'}
          />
        </SectionHeader>
        <SectionContent $collapsed={collapsedSections.includes('layer')}>
          <PropertyRow>
            <PropertyLabel>可见</PropertyLabel>
            <PropertyControl>
              <Switch
                checked={properties.visible}
                onCheckedChange={(checked) => updateProperty('visible', checked)}
              />
            </PropertyControl>
          </PropertyRow>

          <PropertyRow>
            <PropertyLabel>锁定</PropertyLabel>
            <PropertyControl>
              <Switch
                checked={properties.locked}
                onCheckedChange={(checked) => updateProperty('locked', checked)}
              />
            </PropertyControl>
          </PropertyRow>
        </SectionContent>
      </PanelSection>
    </PanelContainer>
  );
};