import React from 'react';
import { Button, Slider, Select, Tooltip, Space, Divider } from 'antd';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  ExpandOutlined,
  ReloadOutlined,
  EyeOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useCanvasStore } from '../../stores/canvasStore';
import './CanvasToolbar.less';

const { Option } = Select;

interface CanvasToolbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ className, style }) => {
  const {
    zoom,
    width,
    height,
    fps,
    memoryUsage,
    objectCount,
    presets,
    setZoom,
    fitToScreen,
    resetView,
    applyPreset,
    getPresetList
  } = useCanvasStore();

  // 简化的缩放方法
  const zoomIn = () => {
    setZoom(zoom + 0.1);
  };

  const zoomOut = () => {
    setZoom(zoom - 0.1);
  };

  // Predefined zoom levels
  const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0, 5.0];

  const handleZoomChange = (value: number) => {
    setZoom(value / 100); // Convert percentage to decimal
  };

  const handleZoomSelect = (value: string) => {
    const zoomValue = parseFloat(value);
    if (!isNaN(zoomValue)) {
      setZoom(zoomValue / 100);
    }
  };

  const handlePresetChange = (presetKey: string) => {
    applyPreset(presetKey as keyof typeof presets);
  };

  const formatZoomPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const getPerformanceStatus = () => {
    if (fps < 30) return 'error';
    if (fps < 50) return 'warning';
    return 'success';
  };

  const getMemoryStatus = () => {
    if (memoryUsage > 80) return 'error';
    if (memoryUsage > 50) return 'warning';
    return 'success';
  };

  return (
    <div className={`canvas-toolbar ${className || ''}`} style={style}>
      <div className="toolbar-section">
        <span className="section-label">视图控制</span>
        <Space size="small">
          <Tooltip title="缩小 (Ctrl + -)">
            <Button
              icon={<ZoomOutOutlined />}
              size="small"
              onClick={() => zoomOut()}
              disabled={zoom <= 0.1}
            />
          </Tooltip>
          
          <div className="zoom-controls">
            <Select
              value={formatZoomPercentage(zoom)}
              size="small"
              style={{ width: 80 }}
              onChange={handleZoomSelect}
              dropdownMatchSelectWidth={false}
            >
              {zoomLevels.map(level => (
                <Option key={level} value={level * 100}>
                  {formatZoomPercentage(level)}
                </Option>
              ))}
            </Select>
            
            <Slider
              min={10}
              max={500}
              step={5}
              value={Math.round(zoom * 100)}
              onChange={handleZoomChange}
              style={{ width: 120, margin: '0 8px' }}
              tooltip={{ formatter: (value) => `${value}%` }}
            />
          </div>
          
          <Tooltip title="放大 (Ctrl + +)">
            <Button
              icon={<ZoomInOutlined />}
              size="small"
              onClick={() => zoomIn()}
              disabled={zoom >= 5.0}
            />
          </Tooltip>
          
          <Tooltip title="适应屏幕 (Ctrl + 1)">
            <Button
              icon={<ExpandOutlined />}
              size="small"
              onClick={fitToScreen}
            />
          </Tooltip>
          
          <Tooltip title="重置视图 (Ctrl + 0)">
            <Button
              icon={<ReloadOutlined />}
              size="small"
              onClick={resetView}
            />
          </Tooltip>
        </Space>
      </div>

      <Divider type="vertical" />

      <div className="toolbar-section">
        <span className="section-label">画布尺寸</span>
        <Space size="small">
          <Select
            placeholder="选择预设尺寸"
            size="small"
            style={{ width: 200 }}
            onChange={handlePresetChange}
            allowClear
          >
            {getPresetList().map(preset => (
              <Option key={preset.key} value={preset.key}>
                {preset.name}
              </Option>
            ))}
          </Select>
          
          <span className="canvas-size">
            {width} × {height}
          </span>
        </Space>
      </div>

      <Divider type="vertical" />

      <div className="toolbar-section">
        <span className="section-label">性能监控</span>
        <Space size="small">
          <Tooltip title="帧率 (目标: 60fps)">
            <div className={`performance-metric fps ${getPerformanceStatus()}`}>
              <EyeOutlined />
              <span>{fps} FPS</span>
            </div>
          </Tooltip>
          
          <Tooltip title="内存使用 (限制: 100MB)">
            <div className={`performance-metric memory ${getMemoryStatus()}`}>
              <DatabaseOutlined />
              <span>{memoryUsage.toFixed(1)} MB</span>
            </div>
          </Tooltip>
          
          <Tooltip title="对象数量">
            <div className="performance-metric objects">
              <span>{objectCount} 对象</span>
            </div>
          </Tooltip>
        </Space>
      </div>
    </div>
  );
};

export default CanvasToolbar;