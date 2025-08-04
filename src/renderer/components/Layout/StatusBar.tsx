import React from 'react';
import { Layout, Space, Typography, Progress } from 'antd';
import { useCanvasStore } from '../../stores/canvasStore';

const { Footer } = Layout;
const { Text } = Typography;

const StatusBar: React.FC = () => {
  const { zoom, width, height, fps, memoryUsage } = useCanvasStore();

  const formatZoom = (zoomValue: number) => {
    return `${Math.round(zoomValue * 100)}%`;
  };

  const formatMemory = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getMemoryColor = (usage: number) => {
    const usageMB = usage / (1024 * 1024);
    if (usageMB > 400) return '#ff4d4f'; // Red for high usage
    if (usageMB > 200) return '#faad14'; // Orange for medium usage
    return '#52c41a'; // Green for low usage
  };

  const getFpsColor = (fpsValue: number) => {
    if (fpsValue < 30) return '#ff4d4f'; // Red for low FPS
    if (fpsValue < 50) return '#faad14'; // Orange for medium FPS
    return '#52c41a'; // Green for good FPS
  };

  return (
    <Footer
      style={{
        padding: '8px 16px',
        background: '#fafafa',
        borderTop: '1px solid #d9d9d9',
        height: 'auto',
        lineHeight: 'normal'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="large">
          <Text style={{ fontSize: '12px' }}>
            画布: {width} × {height}
          </Text>
          
          <Text style={{ fontSize: '12px' }}>
            缩放: {formatZoom(zoom)}
          </Text>
        </Space>

        <Space size="large">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ fontSize: '12px' }}>帧率:</Text>
            <Text 
              style={{ 
                fontSize: '12px', 
                color: getFpsColor(fps),
                fontWeight: 'bold'
              }}
            >
              {fps}
            </Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ fontSize: '12px' }}>内存:</Text>
            <Text 
              style={{ 
                fontSize: '12px', 
                color: getMemoryColor(memoryUsage)
              }}
            >
              {formatMemory(memoryUsage)}
            </Text>
            <Progress
              percent={(memoryUsage / (1024 * 1024)) / 5} // 500MB max
              size="small"
              style={{ width: '60px' }}
              strokeColor={getMemoryColor(memoryUsage)}
              showInfo={false}
            />
          </div>
        </Space>
      </div>
    </Footer>
  );
};

export default StatusBar;