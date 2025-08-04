import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface ToolPropertiesProps {
  tool: string;
}

const ToolProperties: React.FC<ToolPropertiesProps> = ({ tool }) => {
  const renderToolProperties = () => {
    switch (tool) {
      case 'select':
        return (
          <div>
            <Text type="secondary">
              点击并拖拽选择对象。按住Shift键可选择多个对象。
            </Text>
          </div>
        );
      
      case 'text':
        return (
          <div>
            <Text type="secondary">
              点击画布添加文本。选中文本时，文本属性将在此处显示。
            </Text>
          </div>
        );
      
      case 'image':
        return (
          <div>
            <Text type="secondary">
              点击上传并添加图片到画布。支持格式：PNG、JPG、GIF。
            </Text>
          </div>
        );
      
      case 'shape':
        return (
          <div>
            <Text type="secondary">
              点击并拖拽创建形状。选中形状时，形状属性将在此处显示。
            </Text>
          </div>
        );
      
      case 'brush':
        return (
          <div>
            <Text type="secondary">
              点击并拖拽使用画笔绘制。在此处调整画笔大小和透明度。
            </Text>
          </div>
        );
      
      case 'crop':
        return (
          <div>
            <Text type="secondary">
              选择图片并拖拽进行裁剪。点击外部区域应用裁剪。
            </Text>
          </div>
        );
      
      default:
        return (
          <div>
            <Text type="secondary">
              选择工具后，工具属性将在此处显示。
            </Text>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      {renderToolProperties()}
    </div>
  );
};

export default ToolProperties;