import React from 'react';
import { Layout, Menu } from 'antd';
import {
  SelectOutlined,
  FontSizeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  ScissorOutlined,
  FolderOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, currentTool, setCurrentTool } = useAppStore();

  const toolItems = [
    {
      key: 'select',
      icon: <SelectOutlined />,
      label: '选择工具',
    },
    {
      key: 'text',
      icon: <FontSizeOutlined />,
      label: '文本工具',
    },
    {
      key: 'image',
      icon: <PictureOutlined />,
      label: '图片工具',
    },
    {
      key: 'shape',
      icon: <AppstoreOutlined />,
      label: '形状工具',
    },
    {
      key: 'brush',
      icon: <BgColorsOutlined />,
      label: '画笔工具',
    },
    {
      key: 'crop',
      icon: <ScissorOutlined />,
      label: '裁剪工具',
    },
  ];

  const menuItems = [
    {
      key: 'tools',
      label: '设计工具',
      type: 'group' as const,
      children: toolItems,
    },
    {
      key: 'divider1',
      type: 'divider' as const,
    },
    {
      key: 'assets',
      icon: <FolderOutlined />,
      label: '资源库',
    },
    {
      key: 'divider2',
      type: 'divider' as const,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (toolItems.some(tool => tool.key === key)) {
      setCurrentTool(key === currentTool ? null : key);
    } else {
      console.log(`Menu item clicked: ${key}`);
      // TODO: Handle other menu items
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={sidebarCollapsed}
      width={240}
      style={{
        background: '#001529',
        borderRight: '1px solid #303030'
      }}
    >
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={currentTool ? [currentTool] : []}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: '#001529',
          border: 'none'
        }}
      />
    </Sider>
  );
};

export default Sidebar;