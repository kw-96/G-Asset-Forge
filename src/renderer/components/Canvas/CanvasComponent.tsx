import React, { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { canvasInitializer } from '../../engines/CanvasInitializer';
import { fabric } from 'fabric';
import { message } from 'antd';
import './CanvasComponent.less';

interface CanvasComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

// 添加示例内容到画布
const addSampleContent = (canvas: fabric.Canvas) => {
  // 添加欢迎文本
  const welcomeText = new fabric.Text('欢迎使用 G-Asset Forge', {
    left: 50,
    top: 50,
    fontFamily: 'Arial, sans-serif',
    fontSize: 24,
    fill: '#333333',
    fontWeight: 'bold'
  });
  canvas.add(welcomeText);

  // 添加示例矩形
  const rect = new fabric.Rect({
    left: 50,
    top: 100,
    width: 200,
    height: 100,
    fill: '#4CAF50',
    stroke: '#2E7D32',
    strokeWidth: 2,
    rx: 10,
    ry: 10
  });
  canvas.add(rect);

  // 添加示例圆形
  const circle = new fabric.Circle({
    left: 300,
    top: 120,
    radius: 50,
    fill: '#2196F3',
    stroke: '#1565C0',
    strokeWidth: 2
  });
  canvas.add(circle);

  // 添加说明文本
  const infoText = new fabric.Text('这是一个示例画布，您可以选择、移动和编辑这些对象', {
    left: 50,
    top: 250,
    fontFamily: 'Arial, sans-serif',
    fontSize: 14,
    fill: '#666666'
  });
  canvas.add(infoText);

  canvas.renderAll();
};

const CanvasComponent: React.FC<CanvasComponentProps> = ({ className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    canvas,
    canvasContainer,
    width,
    height,
    fps,
    memoryUsage,
    objectCount,
    setCanvas,
    setCanvasContainer,
    updatePerformanceMetrics
  } = useCanvasStore();

  // Initialize canvas when component mounts
  useEffect(() => {
    const initializeCanvas = async () => {
      if (!containerRef.current || isInitialized) return;

      try {
        console.log('开始初始化画布组件...');
        setError(null);
        
        // 设置容器引用
        setCanvasContainer(containerRef.current);
        
        // 创建唯一的容器ID
        const containerId = `canvas-container-${Date.now()}`;
        containerRef.current.id = containerId;
        
        // 使用 CanvasInitializer 初始化完整的画布系统
        const canvasSystem = await canvasInitializer.initializeCanvasSystem({
          containerId,
          width,
          height,
          backgroundColor: '#ffffff',
          enablePerformanceMonitoring: true,
          enableHealthChecking: true,
          memoryLimits: {
            maxCanvasMemory: 100,
            maxTotalMemory: 500,
            warningThreshold: 80,
            criticalThreshold: 120,
            gcThreshold: 150
          },
          viewControlOptions: {
            minZoom: 0.1,
            maxZoom: 5.0,
            zoomStep: 0.1,
            panSensitivity: 1.0,
            smoothPanning: true,
            constrainPan: true
          }
        });
        
        // 设置画布到store
        setCanvas(canvasSystem.canvas);
        
        // 设置画布样式
        const canvasElement = canvasSystem.canvas.getElement();
        if (canvasElement) {
          canvasElement.style.border = '1px solid #d9d9d9';
          canvasElement.style.borderRadius = '4px';
          canvasElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
        
        // 监听画布事件
        canvasSystem.canvas.on('after:render', () => {
          // 更新性能指标
          const metrics = canvasSystem.canvasEngine.getPerformanceMetrics(containerId);
          if (metrics) {
            updatePerformanceMetrics(metrics.fps, metrics.memoryUsage, metrics.objectCount);
          }
        });
        
        // 添加一些示例内容
        addSampleContent(canvasSystem.canvas);
        
        setIsInitialized(true);
        message.success('画布初始化成功');
        
      } catch (err) {
        console.error('Canvas initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : '画布初始化失败';
        setError(errorMessage);
        message.error(errorMessage);
      }
    };

    // 延迟初始化，确保DOM已准备好
    setTimeout(initializeCanvas, 100);

    // Cleanup on unmount
    return () => {
      if (isInitialized && containerRef.current?.id) {
        console.log('清理画布组件...');
        canvasInitializer.destroyCanvasSystem(containerRef.current.id);
        setCanvas(null);
        setCanvasContainer(null);
        setIsInitialized(false);
      }
    };
  }, [width, height, setCanvas, setCanvasContainer, updatePerformanceMetrics]); // 依赖画布尺寸

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      console.log('窗口大小改变');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Performance monitoring display
  const renderPerformanceInfo = () => {
    if (!isInitialized) return null;

    return (
      <div className="canvas-performance-info">
        <div className="performance-item">
          <span className="label">帧率:</span>
          <span className={`value ${fps < 30 ? 'warning' : fps < 50 ? 'caution' : 'good'}`}>
            {fps}
          </span>
        </div>
        <div className="performance-item">
          <span className="label">内存:</span>
          <span className={`value ${memoryUsage > 80 ? 'warning' : memoryUsage > 50 ? 'caution' : 'good'}`}>
            {memoryUsage.toFixed(1)}MB
          </span>
        </div>
        <div className="performance-item">
          <span className="label">对象:</span>
          <span className="value">{objectCount}</span>
        </div>
      </div>
    );
  };

  // Error display
  if (error) {
    return (
      <div className={`canvas-container error ${className || ''}`} style={style}>
        <div className="canvas-error">
          <h3>画布错误</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setIsInitialized(false);
            }}
            className="retry-button"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // Loading display
  if (!isInitialized) {
    return (
      <div className={`canvas-container loading ${className || ''}`} style={style}>
        <div className="canvas-loading">
          <div className="loading-spinner"></div>
          <p>正在初始化画布...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`canvas-container ${className || ''}`} style={style}>
      <div 
        ref={containerRef}
        className="canvas-wrapper"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          border: '2px dashed #d9d9d9',
          borderRadius: '8px'
        }}
      >
        {/* 画布将在这里渲染 */}
      </div>
      {renderPerformanceInfo()}
    </div>
  );
};

export default CanvasComponent;