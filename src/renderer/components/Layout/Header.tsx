import React from 'react';
import { Layout, Button, Space, Typography, Divider } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  SaveOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    currentProject, 
    hasUnsavedChanges,
    version 
  } = useAppStore();

  const handleNewProject = () => {
    console.log('New project clicked');
    // TODO: Implement new project functionality
  };

  const handleOpenProject = () => {
    console.log('Open project clicked');
    // TODO: Implement open project functionality
  };

  const handleSaveProject = () => {
    console.log('Save project clicked');
    // TODO: Implement save project functionality
  };

  const handleExport = () => {
    console.log('Export clicked');
    // TODO: Implement export functionality
  };

  return (
    <AntHeader 
      style={{ 
        padding: '0 16px', 
        background: '#001529',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #303030'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ color: 'white', marginRight: 16 }}
        />
        
        <Text style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginRight: 24 }}>
          G-Asset Forge
        </Text>

        <Space split={<Divider type="vertical" style={{ borderColor: '#434343' }} />}>
          <Button
            type="text"
            icon={<FileAddOutlined />}
            onClick={handleNewProject}
            style={{ color: 'white' }}
          >
            新建
          </Button>
          
          <Button
            type="text"
            icon={<FolderOpenOutlined />}
            onClick={handleOpenProject}
            style={{ color: 'white' }}
          >
            打开
          </Button>
          
          <Button
            type="text"
            icon={<SaveOutlined />}
            onClick={handleSaveProject}
            style={{ color: 'white' }}
            disabled={!currentProject}
          >
            保存{hasUnsavedChanges && '*'}
          </Button>
          
          <Button
            type="text"
            icon={<ExportOutlined />}
            onClick={handleExport}
            style={{ color: 'white' }}
            disabled={!currentProject}
          >
            导出
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {currentProject && (
          <Text style={{ color: 'white', marginRight: 16 }}>
            {currentProject.name}{hasUnsavedChanges && ' *'}
          </Text>
        )}
        
        <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
          v{version}
        </Text>
      </div>
    </AntHeader>
  );
};

export default Header;