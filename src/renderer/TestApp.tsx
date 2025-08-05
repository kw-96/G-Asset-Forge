import React from 'react';
import { Button, Card, Space } from 'antd';

const TestApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      minHeight: '100vh', 
      background: '#f0f2f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card 
        title="G-Asset Forge - 测试页面" 
        style={{ width: 400, textAlign: 'center' }}
      >
        <Space direction="vertical" size="large">
          <p>应用程序已成功启动！</p>
          <p>如果你看到这个页面，说明基本的 React 渲染是正常的。</p>
          <Button 
            type="primary" 
            onClick={() => {
              console.log('测试按钮被点击');
              alert('测试成功！');
            }}
          >
            测试按钮
          </Button>
          <Button 
            onClick={() => {
              console.log('当前环境信息:', {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                electron: typeof window !== 'undefined' && window.electronAPI ? '可用' : '不可用'
              });
            }}
          >
            打印环境信息
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default TestApp;