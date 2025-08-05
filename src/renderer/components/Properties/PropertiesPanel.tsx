import React from 'react';
import { Card, Typography, Space, Divider } from 'antd';
import { useAppStore } from '../../stores/appStore';
import CanvasProperties from './CanvasProperties';
import ToolProperties from './ToolProperties';

const { Title } = Typography;

const PropertiesPanel: React.FC = () => {
  const { activeTool } = useAppStore();

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card size="small">
          <Title level={5} style={{ margin: 0 }}>画布属性</Title>
          <Divider style={{ margin: '12px 0' }} />
          <CanvasProperties />
        </Card>

        {activeTool && (
          <Card size="small">
            <Title level={5} style={{ margin: 0 }}>
              {getToolDisplayName(activeTool)}属性
            </Title>
            <Divider style={{ margin: '12px 0' }} />
            <ToolProperties tool={activeTool} />
          </Card>
        )}

        <Card size="small">
          <Title level={5} style={{ margin: 0 }}>图层</Title>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ color: '#8c8c8c', textAlign: 'center', padding: '20px 0' }}>
            暂无图层
          </div>
        </Card>
      </Space>
    </div>
  );
};

const getToolDisplayName = (tool: string): string => {
  const toolNames: Record<string, string> = {
    select: '选择工具',
    text: '文本工具',
    image: '图片工具',
    shape: '形状工具',
    brush: '画笔工具',
    crop: '裁剪工具'
  };
  return toolNames[tool] || tool;
};

export default PropertiesPanel;