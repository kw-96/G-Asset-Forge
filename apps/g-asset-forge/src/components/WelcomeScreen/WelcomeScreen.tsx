/**
 * 欢迎屏幕
 */

import React, { useState } from 'react';
import { Button } from '@g-asset-forge/components';
import './WelcomeScreen.scss';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  console.log('WelcomeScreen 组件渲染');
  const [selectedOption] = useState<string>('new-project');

  const handleStart = () => {
    // 标记用户已经使用过应用
    localStorage.setItem('g-asset-forge-used', 'true');
    
    // 动态调整窗口尺寸为开发模式尺寸
    if (window.electronAPI?.windowControl?.resize) {
      window.electronAPI.windowControl.resize(1400, 900, true);
    }
    
    // 根据选择的选项执行不同的操作
    switch (selectedOption) {
      case 'tutorial':
        // 启动教程模式
        console.log('正在启动教程模式');
        break;
      case 'template':
        // 显示模板选择
        console.log('正在打开模板选择');
        break;
      default:
        // 直接进入主界面
        break;
    }
    onComplete();
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">G-ASSET FORGE</h1>
          <p className="welcome-subtitle">
            快速、批量、标准化的美术素材生产
          </p>
        </div>

        <div className="action-buttons">
          <Button style={{ color: '#fff' }} onClick={handleStart}>
            开始使用
          </Button>
        </div>
      </div>
    </div>
  );
};
