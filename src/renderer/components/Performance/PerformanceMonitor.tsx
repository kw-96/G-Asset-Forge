import React, { useEffect, useState } from 'react';
import { Card, Progress, Alert, Button, Space, Tooltip } from 'antd';
import { 
  DashboardOutlined, 
  DatabaseOutlined, 
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useCanvasStore } from '../../stores/canvasStore';
import { memoryManager, MemoryEvent } from '../../engines/MemoryManager';
import './PerformanceMonitor.less';

interface PerformanceData {
  fps: number;
  memoryUsage: number;
  objectCount: number;
  cacheSize: number;
  lastGC: Date | null;
  warnings: string[];
}

interface PerformanceMonitorProps {
  visible?: boolean;
  onClose?: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ visible = true, onClose }) => {
  const { fps, memoryUsage, objectCount } = useCanvasStore();
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 60,
    memoryUsage: 0,
    objectCount: 0,
    cacheSize: 0,
    lastGC: null,
    warnings: []
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    // Update performance data from store
    setPerformanceData(prev => ({
      ...prev,
      fps,
      memoryUsage,
      objectCount
    }));

    // Get memory manager stats
    const memoryStats = memoryManager.getMemoryStats();
    setPerformanceData(prev => ({
      ...prev,
      cacheSize: memoryStats.cacheSize,
      lastGC: memoryStats.lastGC
    }));
  }, [fps, memoryUsage, objectCount, isMonitoring]);

  useEffect(() => {
    // Listen to memory events
    const handleMemoryWarning = (stats: any) => {
      setPerformanceData(prev => ({
        ...prev,
        warnings: [...prev.warnings, `内存使用警告: ${stats.totalMemory.toFixed(1)}MB`]
      }));
    };

    const handleMemoryCritical = (stats: any) => {
      setPerformanceData(prev => ({
        ...prev,
        warnings: [...prev.warnings, `内存使用严重警告: ${stats.totalMemory.toFixed(1)}MB`]
      }));
    };

    const handleGarbageCollected = (stats: any) => {
      setPerformanceData(prev => ({
        ...prev,
        lastGC: stats.lastGC,
        warnings: prev.warnings.filter(w => !w.includes('内存使用'))
      }));
    };

    memoryManager.on(MemoryEvent.MEMORY_WARNING, handleMemoryWarning);
    memoryManager.on(MemoryEvent.MEMORY_CRITICAL, handleMemoryCritical);
    memoryManager.on(MemoryEvent.GARBAGE_COLLECTED, handleGarbageCollected);

    return () => {
      memoryManager.off(MemoryEvent.MEMORY_WARNING, handleMemoryWarning);
      memoryManager.off(MemoryEvent.MEMORY_CRITICAL, handleMemoryCritical);
      memoryManager.off(MemoryEvent.GARBAGE_COLLECTED, handleGarbageCollected);
    };
  }, []);

  const handleForceGC = () => {
    memoryManager.forceGarbageCollection();
  };

  const handleClearCache = () => {
    memoryManager.clearAll();
    setPerformanceData(prev => ({
      ...prev,
      cacheSize: 0,
      warnings: []
    }));
  };

  const handleClearWarnings = () => {
    setPerformanceData(prev => ({
      ...prev,
      warnings: []
    }));
  };

  const getFPSStatus = () => {
    if (performanceData.fps >= 55) return 'success';
    if (performanceData.fps >= 30) return 'normal';
    return 'exception';
  };

  const getMemoryStatus = () => {
    if (performanceData.memoryUsage <= 50) return 'success';
    if (performanceData.memoryUsage <= 80) return 'normal';
    return 'exception';
  };

  const formatLastGC = () => {
    if (!performanceData.lastGC) return '从未执行';
    const now = new Date();
    const diff = now.getTime() - performanceData.lastGC.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒前`;
    }
    return `${seconds}秒前`;
  };

  if (!visible) return null;

  return (
    <div className="performance-monitor">
      <Card
        title={
          <Space>
            <DashboardOutlined />
            性能监控
            <Button
              type="text"
              size="small"
              onClick={() => setIsMonitoring(!isMonitoring)}
              style={{ marginLeft: 'auto' }}
            >
              {isMonitoring ? '暂停' : '开始'}
            </Button>
            {onClose && (
              <Button type="text" size="small" onClick={onClose}>
                ×
              </Button>
            )}
          </Space>
        }
        size="small"
        className="performance-card"
      >
        {/* FPS监控 */}
        <div className="metric-section">
          <div className="metric-header">
            <EyeOutlined />
            <span>帧率 (FPS)</span>
            <span className={`metric-value ${getFPSStatus()}`}>
              {performanceData.fps}
            </span>
          </div>
          <Progress
            percent={Math.min((performanceData.fps / 60) * 100, 100)}
            status={getFPSStatus()}
            size="small"
            showInfo={false}
          />
          <div className="metric-info">
            目标: 60 FPS | 当前: {performanceData.fps} FPS
          </div>
        </div>

        {/* 内存监控 */}
        <div className="metric-section">
          <div className="metric-header">
            <DatabaseOutlined />
            <span>内存使用</span>
            <span className={`metric-value ${getMemoryStatus()}`}>
              {performanceData.memoryUsage.toFixed(1)}MB
            </span>
          </div>
          <Progress
            percent={Math.min((performanceData.memoryUsage / 100) * 100, 100)}
            status={getMemoryStatus()}
            size="small"
            showInfo={false}
          />
          <div className="metric-info">
            限制: 100MB | 缓存: {performanceData.cacheSize.toFixed(1)}MB
          </div>
        </div>

        {/* 对象计数 */}
        <div className="metric-section">
          <div className="metric-header">
            <span>对象数量</span>
            <span className="metric-value">
              {performanceData.objectCount}
            </span>
          </div>
          <div className="metric-info">
            画布中的对象总数
          </div>
        </div>

        {/* 垃圾回收信息 */}
        <div className="metric-section">
          <div className="metric-header">
            <span>垃圾回收</span>
            <span className="metric-value">
              {formatLastGC()}
            </span>
          </div>
          <Space size="small" style={{ marginTop: 8 }}>
            <Tooltip title="强制执行垃圾回收">
              <Button
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleForceGC}
              >
                强制GC
              </Button>
            </Tooltip>
            <Tooltip title="清空所有缓存">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleClearCache}
              >
                清空缓存
              </Button>
            </Tooltip>
          </Space>
        </div>

        {/* 警告信息 */}
        {performanceData.warnings.length > 0 && (
          <div className="warnings-section">
            <div className="warnings-header">
              <WarningOutlined />
              <span>性能警告</span>
              <Button
                type="text"
                size="small"
                onClick={handleClearWarnings}
                style={{ marginLeft: 'auto' }}
              >
                清除
              </Button>
            </div>
            {performanceData.warnings.slice(-3).map((warning, index) => (
              <Alert
                key={index}
                message={warning}
                type="warning"
                showIcon
                style={{ marginBottom: 4 }}
              />
            ))}
          </div>
        )}

        {/* 性能建议 */}
        <div className="suggestions-section">
          <div className="suggestions-header">性能建议</div>
          <ul className="suggestions-list">
            {performanceData.fps < 30 && (
              <li>帧率过低，考虑减少画布对象数量或降低渲染质量</li>
            )}
            {performanceData.memoryUsage > 80 && (
              <li>内存使用过高，建议执行垃圾回收或清空缓存</li>
            )}
            {performanceData.objectCount > 1000 && (
              <li>对象数量过多，考虑使用对象池或分组管理</li>
            )}
            {performanceData.cacheSize > 30 && (
              <li>缓存占用过多，建议清理不必要的纹理缓存</li>
            )}
            {performanceData.warnings.length === 0 && 
             performanceData.fps >= 55 && 
             performanceData.memoryUsage <= 50 && (
              <li style={{ color: '#52c41a' }}>性能状态良好</li>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;