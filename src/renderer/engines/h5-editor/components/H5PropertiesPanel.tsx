/**
 * H5 模式 - 右侧属性面板（简版）
 * 聚焦页面级与组件级的常见属性占位，后续可与 H5EditorCanvas 对接。
 */
import React from 'react';
import styled from 'styled-components';

interface H5PropertiesPanelProps {
  selected?: { type: 'page' | 'component'; name?: string; props?: Record<string, any> } | null;
  onChange?: (key: string, value: any) => void;
}

const PanelContainer = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.interface.panel.light};
  border-left: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Section = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.interface.divider.light};
`;

const Title = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #374151;
  min-width: 72px;
`;

const Input = styled.input`
  height: 28px;
  padding: 0 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  flex: 1;
  font-size: 12px;
`;

export const H5PropertiesPanel: React.FC<H5PropertiesPanelProps> = ({ selected, onChange }) => {
  if (!selected) {
    return (
      <PanelContainer>
        <Section>
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 20px' }}>
            选择一个页面或组件来编辑属性
          </div>
        </Section>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <Section>
        <Title>{selected.type === 'page' ? '页面' : '组件'}属性</Title>
        <Row>
          <Label>名称</Label>
          <Input defaultValue={selected.name || ''} onBlur={(e) => onChange?.('name', e.target.value)} />
        </Row>
        <Row>
          <Label>背景色</Label>
          <Input defaultValue={(selected?.props?.['background'] as string) || '#ffffff'} onBlur={(e) => onChange?.('background', e.target.value)} />
        </Row>
        <Row>
          <Label>备注</Label>
          <Input defaultValue={(selected?.props?.['note'] as string) || ''} onBlur={(e) => onChange?.('note', e.target.value)} />
        </Row>
      </Section>
    </PanelContainer>
  );
};

export default H5PropertiesPanel;


