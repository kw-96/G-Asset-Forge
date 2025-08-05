// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { fabric } from 'fabric';
import { message, Button, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import './CanvasComponent.less';

interface CanvasComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

// 简化的画布初始化函数
const createSimpleCanvas = (containerId: string, width: number, height: number): any => {
  const canvas = new any(containerId, {
    width,
    height,
    backgroundColor: '#ffffff',
    selection: true,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
    stateful: true,
    enableRetinaScaling: true
  });

  // 基本事件监听
  canvas.on('selection:created', () => console.log('对象被选中'));
  canvas.on('selection:cleared', () => console.log('取消选择'));
  canvas.on('object:modified', () => console.log('对象被修改'));

  return canvas;
};

// 添加示例内容到画布
const addSampleContent = (canvas: any) => {
  try {
    // 添加欢迎文本
    const welcomeText = new any('欢迎使用 G-Asset Forge', {
      left: 50,
      top: 50,
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fill: '#333333',
      fontWeight: 'bold'
    });
    canvas.add(welcomeText);

    // 添加示例矩形
    const rect = new any({
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
    const circle = new any({
      left: 300,
      top: 120,
      radius: 50,
      fill: '#2196F3',
      stroke: '#1565C0',
      strokeWidth: 2
    });
    canvas.add(circle);

    // 添加说明文本
    const infoText = new any('这是一个示例画布，您可以选择、移动和编辑这些对象', {
      left: 50,
      top: 250,
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fill: '#666666'
    });
    canvas.add(infoText);

    canvas.renderAll();
    console.log('示例内容添加成功');
  } catch (error) {
    console.error('添加示例内容失败:', error);
  }
};

const CanvasComponent: React.FC<CanvasComponentProps> = ({ className, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initAttempts, setInitAttempts] = useState(0);
  
  const {
    canvas,
    width,
    height,
    setCanvas,
    setCanvasContainer,
    updatePerformanceMetrics
  } = useCanvasStore();

  // 重试初始化
  const retryInitialization = () => {
    setError(null);
    setIsInitialized(false);
    setInitAttempts(prev => prev + 1);
  };

  // 简化的画布初始化
  useEffect(() => {
    const initializeCanvas = async () => {
      if (!canvasRef.current || isInitialized) return;

      try {
        console.log(`开始初始化画布组件... (第${initAttempts + 1}次尝试)`);
        setError(null);
        
        // 创建唯一的画布ID
        const canvasId = `canvas-${Date.now()}-${initAttempts}`;
        canvasRef.current.id = canvasId;
        
        // 设置画布容器
        const container = canvasRef.current.parentElement;
        if (container) {
          setCanvasContainer(container);
        }
        
        // 等待DOM准备就绪
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 创建简化的画布
        const newCanvas = createSimpleCanvas(canvasId, width, height);
        
        // 设置画布样式
        const canvasElement = newCanvas.getElement();
        if (canvasElement) {
          canvasElement.style.border = '1px solid #d9d9d9';
          canvasElement.style.borderRadius = '4px';
          canvasElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
        
        // 设置画布到store
        setCanvas(newCanvas);
        
        // 添加示例内容
        addSampleContent(newCanvas);
        
        // 模拟性能指标更新
        updatePerformanceMetrics(60, 25, 4);
        
        setIsInitialized(true);
        console.log('画布初始化成功');
        message.success('画布初始化成功');
        
      } catch (err) {
        console.error('Canvas initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : '画布初始化失败';
        setError(errorMessage);
        console.log('设置错误状态，将显示错误界面');
      }
    };

    // 延迟初始化，确保DOM已准备好
    const timer = setTimeout(initializeCanvas, 200);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (canvas && isInitialized) {
        try {
          canvas.dispose();
          setCanvas(null);
        } catch (error) {
          console.warn('清理画布时出错:', error);
        }
      }
    };
  }, [width, height, setCanvas, setCanvasContainer, updatePerformanceMetrics, initAttempts]);

  // 错误显示
  if (error) {
    return (
      <div className={`canvas-container error ${className || ''}`} style={style}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '40px'
        }}>
          <Alert
            message="画布初始化失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px', maxWidth: '400px' }}
          />
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={retryInitialization}
          >
            重试初始化
          </Button>
        </div>
      </div>
    );
  }

  // 加载显示
  if (!isInitialized) {
    return (
      <div className={`canvas-container loading ${className || ''}`} style={style}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{ color: '#666', fontSize: '14px' }}>
            正在初始化画布... (尝试 {initAttempts + 1})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`canvas-container ${className || ''}`} style={style}>
      <div 
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
        <canvas 
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>
      
      {/* 性能信息显示 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666'
      }}>
        画布就绪 | 对象: {canvas?.getObjects().length || 0}
      </div>
    </div>
  );
};

export default CanvasComponent;
