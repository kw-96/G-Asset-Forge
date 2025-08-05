import React, { useState } from 'react';
import styled from 'styled-components';
import { IconButton, Button } from '../../ui';
import { useAppStore } from '../../stores/appStore';
import {
  DesktopIcon,
  Component1Icon,
  CodeIcon,
  ChevronDownIcon,
  EyeOpenIcon
} from '@radix-ui/react-icons';

const PropertiesPanelContainer = styled.aside<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => $collapsed ? '0px' : '280px'};
  min-width: ${({ $collapsed }) => $collapsed ? '0px' : '280px'};
  height: calc(100vh - 68px);
  background: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: none;
  background: ${({ $active, theme }) => 
    $active ? theme.colors.background : theme.colors.surface
  };
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${({ $active, theme }) => 
    $active ? theme.colors.primary : 'transparent'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.sm};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PropertyRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PropertyLabel = styled.label`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 60px;
`;

const PropertyInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 12px;
  margin-left: ${({ theme }) => theme.spacing.sm};
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PropertyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PropertyInputSmall = styled(PropertyInput)`
  margin-left: 0;
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 14px;
  
  svg {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    opacity: 0.5;
  }
`;

interface PropertiesPanelProps {
  collapsed: boolean;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ collapsed }) => {
  const { 
    elements, 
    selectedElements, 
    updateElement 
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'design' | 'prototype' | 'code'>('design');

  // 获取当前选中的元素（支持多选，但只编辑第一个）
  const selectedElement = selectedElements.length > 0 && selectedElements[0] ? elements[selectedElements[0]] : null;

  // 更新元素属性的通用函数
  const handlePropertyChange = (property: string, value: any) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { [property]: value });
    }
  };

  // 生成CSS代码
  const generateCSS = (element: any): string => {
    const className = element.name.toLowerCase().replace(/\s+/g, '-') || element.type;
    let css = `.${className} {\n`;
    
    // 基础尺寸和位置
    css += `  position: absolute;\n`;
    css += `  left: ${element.x}px;\n`;
    css += `  top: ${element.y}px;\n`;
    css += `  width: ${element.width}px;\n`;
    css += `  height: ${element.height}px;\n`;
    
    // 背景和填充
    if (element.fill && element.fill !== 'transparent' && element.type !== 'text') {
      css += `  background-color: ${element.fill};\n`;
    }
    
    // 边框
    if (element.stroke && element.strokeWidth) {
      css += `  border: ${element.strokeWidth}px ${element.strokeStyle || 'solid'} ${element.stroke};\n`;
    }
    
    // 圆角
    if (element.borderRadius && element.type !== 'ellipse') {
      css += `  border-radius: ${element.borderRadius}px;\n`;
    }
    
    // 椭圆特殊处理
    if (element.type === 'ellipse') {
      css += `  border-radius: 50%;\n`;
    }
    
    // 文本特殊处理
    if (element.type === 'text') {
      css += `  color: ${element.fill || '#000000'};\n`;
      css += `  font-size: ${element.fontSize || 14}px;\n`;
      css += `  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;\n`;
      css += `  display: flex;\n`;
      css += `  align-items: center;\n`;
      css += `  justify-content: center;\n`;
    }
    
    // 框架特殊处理
    if (element.type === 'frame') {
      css += `  background: transparent;\n`;
      css += `  border-style: dashed;\n`;
    }
    
    css += `}`;
    return css;
  };

  // 生成HTML代码
  const generateHTML = (element: any): string => {
    const className = element.name.toLowerCase().replace(/\s+/g, '-') || element.type;
    
    if (element.type === 'text') {
      return `<div class="${className}">${element.text || 'Sample Text'}</div>`;
    } else if (element.type === 'frame') {
      return `<div class="${className}">
  <!-- 框架内容 -->
</div>`;
    } else {
      return `<div class="${className}"></div>`;
    }
  };

  if (collapsed) {
    return <PropertiesPanelContainer $collapsed={true} />;
  }

  const tabs = [
    { id: 'design', label: '设计', icon: DesktopIcon },
    { id: 'prototype', label: '原型', icon: Component1Icon },
    { id: 'code', label: '代码', icon: CodeIcon }
  ] as const;

  return (
    <PropertiesPanelContainer $collapsed={false}>
      <TabsContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon width={14} height={14} />
            {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      <PanelContent>
        {!selectedElement ? (
          <EmptyState>
            <DesktopIcon width={32} height={32} />
            <div>未选择元素</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              选择一个元素来编辑其属性
            </div>
          </EmptyState>
        ) : (
          <>
            {activeTab === 'design' && (
              <>
                <Section>
                  <SectionHeader>
                    <span>位置</span>
                    <IconButton icon={<ChevronDownIcon />} variant="ghost" size="xs" />
                  </SectionHeader>
                  <PropertyRow>
                    <PropertyLabel>X</PropertyLabel>
                    <PropertyInput 
                      type="number" 
                      value={selectedElement?.x || 0}
                      onChange={(e) => handlePropertyChange('x', parseInt(e.target.value) || 0)}
                    />
                  </PropertyRow>
                  <PropertyRow>
                    <PropertyLabel>Y</PropertyLabel>
                    <PropertyInput 
                      type="number" 
                      value={selectedElement?.y || 0}
                      onChange={(e) => handlePropertyChange('y', parseInt(e.target.value) || 0)}
                    />
                  </PropertyRow>
                </Section>

                <Section>
                  <SectionHeader>
                    <span>尺寸</span>
                    <IconButton icon={<ChevronDownIcon />} variant="ghost" size="xs" />
                  </SectionHeader>
                  <PropertyRow>
                    <PropertyLabel>宽度</PropertyLabel>
                    <PropertyInput 
                      type="number" 
                      value={selectedElement?.width || 0}
                      onChange={(e) => handlePropertyChange('width', parseInt(e.target.value) || 0)}
                    />
                  </PropertyRow>
                  <PropertyRow>
                    <PropertyLabel>高度</PropertyLabel>
                    <PropertyInput 
                      type="number" 
                      value={selectedElement?.height || 0}
                      onChange={(e) => handlePropertyChange('height', parseInt(e.target.value) || 0)}
                    />
                  </PropertyRow>
                </Section>

                {/* 填充部分 - 不显示给文本和框架类型 */}
                {selectedElement?.type !== 'text' && selectedElement?.type !== 'frame' && (
                  <Section>
                    <SectionHeader>
                      <span>填充</span>
                      <IconButton icon={<ChevronDownIcon />} variant="ghost" size="xs" />
                    </SectionHeader>
                    <PropertyRow>
                      <ColorSwatch 
                        $color={selectedElement?.fill || '#3b82f6'} 
                        onClick={() => {
                          const color = prompt('输入颜色值:', selectedElement?.fill || '#3b82f6');
                          if (color) handlePropertyChange('fill', color);
                        }}
                      />
                      <PropertyInput 
                        type="text" 
                        value={selectedElement?.fill || '#3b82f6'}
                        onChange={(e) => handlePropertyChange('fill', e.target.value)}
                        placeholder="#颜色值"
                      />
                      <IconButton 
                        icon={<EyeOpenIcon />} 
                        variant="ghost" 
                        size="xs"
                        onClick={() => handlePropertyChange('fill', selectedElement?.fill === 'transparent' ? '#3b82f6' : 'transparent')}
                      />
                    </PropertyRow>
                  </Section>
                )}

                {/* 边框部分 */}
                <Section>
                  <SectionHeader>
                    <span>边框</span>
                    <IconButton icon={<ChevronDownIcon />} variant="ghost" size="xs" />
                  </SectionHeader>
                  <PropertyRow>
                    <ColorSwatch 
                      $color={selectedElement?.stroke || '#e5e7eb'}
                      onClick={() => {
                        const color = prompt('输入边框颜色值:', selectedElement?.stroke || '#e5e7eb');
                        if (color) handlePropertyChange('stroke', color);
                      }}
                    />
                    <PropertyGrid>
                      <PropertyInputSmall 
                        type="number" 
                        value={selectedElement?.strokeWidth || 1}
                        onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 0)}
                        placeholder="宽度"
                      />
                      <PropertyInputSmall 
                        type="text" 
                        value={selectedElement?.strokeStyle || 'solid'}
                        onChange={(e) => handlePropertyChange('strokeStyle', e.target.value)}
                        placeholder="样式"
                      />
                    </PropertyGrid>
                  </PropertyRow>
                </Section>

                {/* 圆角部分 - 只对矩形和框架显示 */}
                {(selectedElement?.type === 'rectangle' || selectedElement?.type === 'frame') && (
                  <Section>
                    <SectionHeader>
                      <span>圆角</span>
                      <IconButton icon={<ChevronDownIcon />} variant="ghost" size="xs" />
                    </SectionHeader>
                    <PropertyRow>
                      <PropertyLabel>半径</PropertyLabel>
                      <PropertyInput 
                        type="number" 
                        value={selectedElement?.borderRadius || 0}
                        onChange={(e) => handlePropertyChange('borderRadius', parseInt(e.target.value) || 0)}
                        placeholder="圆角半径"
                      />
                    </PropertyRow>
                  </Section>
                )}

                {/* 文本属性 - 只对文本元素显示 */}
                {selectedElement?.type === 'text' && (
                  <>
                    <Section>
                      <SectionHeader>
                        <span>文本</span>
                        <IconButton icon={<ChevronDownIcon />} variant="ghost" size="xs" />
                      </SectionHeader>
                      <PropertyRow>
                        <PropertyLabel>内容</PropertyLabel>
                        <PropertyInput 
                          type="text" 
                          value={selectedElement?.text || 'Sample Text'}
                          onChange={(e) => handlePropertyChange('text', e.target.value)}
                          placeholder="输入文本内容"
                        />
                      </PropertyRow>
                      <PropertyRow>
                        <PropertyLabel>字体大小</PropertyLabel>
                        <PropertyInput 
                          type="number" 
                          value={selectedElement?.fontSize || 14}
                          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 14)}
                          placeholder="字体大小"
                        />
                      </PropertyRow>
                      <PropertyRow>
                        <PropertyLabel>颜色</PropertyLabel>
                        <PropertyInput 
                          type="text" 
                          value={selectedElement?.fill || '#000000'}
                          onChange={(e) => handlePropertyChange('fill', e.target.value)}
                          placeholder="文本颜色"
                        />
                      </PropertyRow>
                    </Section>
                  </>
                )}

                {/* 元素信息 */}
                <Section>
                  <SectionHeader>
                    <span>元素信息</span>
                    <IconButton icon={<ChevronDownIcon />} variant="ghost" size="xs" />
                  </SectionHeader>
                  <PropertyRow>
                    <PropertyLabel>名称</PropertyLabel>
                    <PropertyInput 
                      type="text" 
                      value={selectedElement?.name || ''}
                      onChange={(e) => handlePropertyChange('name', e.target.value)}
                      placeholder="元素名称"
                    />
                  </PropertyRow>
                  <PropertyRow>
                    <PropertyLabel>类型</PropertyLabel>
                    <PropertyInput 
                      type="text" 
                      value={selectedElement?.type || ''}
                      disabled
                      style={{ opacity: 0.6 }}
                    />
                  </PropertyRow>
                  <PropertyRow>
                    <PropertyLabel>ID</PropertyLabel>
                    <PropertyInput 
                      type="text" 
                      value={selectedElement?.id || ''}
                      disabled
                      style={{ opacity: 0.6, fontSize: '10px' }}
                    />
                  </PropertyRow>
                </Section>
              </>
            )}

            {activeTab === 'prototype' && (
              <EmptyState>
                <Component1Icon width={32} height={32} />
                <div>原型功能</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  添加交互和动画效果
                </div>
              </EmptyState>
            )}

            {activeTab === 'code' && (
              selectedElement ? (
                <>
                  <Section>
                    <SectionHeader>
                      <span>HTML</span>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          const html = generateHTML(selectedElement);
                          navigator.clipboard.writeText(html);
                          console.log('HTML copied to clipboard');
                        }}
                      >
                        复制
                      </Button>
                    </SectionHeader>
                    <div style={{ 
                      background: '#1f2937', 
                      color: '#f8fafc',
                      padding: '12px', 
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-wrap',
                      overflow: 'auto'
                    }}>
                      {generateHTML(selectedElement)}
                    </div>
                  </Section>

                  <Section>
                    <SectionHeader>
                      <span>CSS</span>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          const css = generateCSS(selectedElement);
                          navigator.clipboard.writeText(css);
                          console.log('CSS copied to clipboard');
                        }}
                      >
                        复制
                      </Button>
                    </SectionHeader>
                    <div style={{ 
                      background: '#1f2937',
                      color: '#f8fafc',
                      padding: '12px', 
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {generateCSS(selectedElement)}
                    </div>
                  </Section>

                  <Section>
                    <SectionHeader>
                      <span>属性预览</span>
                    </SectionHeader>
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'Monaco, Menlo, monospace',
                      lineHeight: '1.5'
                    }}>
                      <div><strong>名称:</strong> {selectedElement.name}</div>
                      <div><strong>类型:</strong> {selectedElement.type}</div>
                      <div><strong>位置:</strong> x={selectedElement.x}, y={selectedElement.y}</div>
                      <div><strong>尺寸:</strong> {selectedElement.width} × {selectedElement.height}</div>
                      {selectedElement.fill && selectedElement.type !== 'frame' && (
                        <div><strong>填充:</strong> {selectedElement.fill}</div>
                      )}
                      {selectedElement.stroke && selectedElement.strokeWidth && (
                        <div><strong>边框:</strong> {selectedElement.strokeWidth}px {selectedElement.stroke}</div>
                      )}
                      {selectedElement.borderRadius && selectedElement.type !== 'ellipse' && (
                        <div><strong>圆角:</strong> {selectedElement.borderRadius}px</div>
                      )}
                      {selectedElement.type === 'text' && (
                        <>
                          <div><strong>文本:</strong> "{selectedElement.text || 'Sample Text'}"</div>
                          <div><strong>字体大小:</strong> {selectedElement.fontSize || 14}px</div>
                        </>
                      )}
                    </div>
                  </Section>
                </>
              ) : (
                <EmptyState>
                  <CodeIcon width={32} height={32} />
                  <div>选择元素</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    选择一个元素来查看生成的代码
                  </div>
                </EmptyState>
              )
            )}
          </>
        )}
      </PanelContent>
    </PropertiesPanelContainer>
  );
};

export default PropertiesPanel;