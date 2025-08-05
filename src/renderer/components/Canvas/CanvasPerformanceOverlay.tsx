import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import PerformanceMonitor from '../Performance/PerformanceMonitor';
import './CanvasPerformanceOverlay.less';

const CanvasPerformanceOverlay: React.FC = () => {
  const [showMonitor, setShowMonitor] = useState(false);

  return (
    <div className="canvas-performance-overlay">
      {!showMonitor && (
        <Tooltip title="显示性能监控" placement="left">
          <Button
            type="primary"
            shape="circle"
            icon={<DashboardOutlined />}
            onClick={() => setShowMonitor(true)}
            className="performance-toggle"
          />
        </Tooltip>
      )}
      
      {showMonitor && (
        <PerformanceMonitor
          visible={showMonitor}
          onClose={() => setShowMonitor(false)}
        />
      )}
    </div>
  );
};

export default CanvasPerformanceOverlay;