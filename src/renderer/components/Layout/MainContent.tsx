import React from 'react';
import { Layout } from 'antd';
import CanvasArea from '../Canvas/CanvasArea';
import PropertiesPanel from '../Properties/PropertiesPanel';

const { Content, Sider } = Layout;

const MainContent: React.FC = () => {
  return (
    <Layout style={{ height: '100%' }}>
      <Content style={{ background: '#f0f2f5', position: 'relative' }}>
        <CanvasArea />
      </Content>
      <Sider
        width={300}
        style={{
          background: '#ffffff',
          borderLeft: '1px solid #d9d9d9'
        }}
      >
        <PropertiesPanel />
      </Sider>
    </Layout>
  );
};

export default MainContent;