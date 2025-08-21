/**
 * Suika标尺系统React适配器
 * 将Suika Ruler类包装为React Hook和组件
 * @description 提供标尺显示功能，支持设计模式和H5模式
 * @author 开发团队
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { SuikaRuler } from './SuikaRuler';
import { useCanvasCoordinate } from './CanvasCoordinateContext';
import { RulerCanvas } from './SuikaCanvasStyles';
import { Matrix } from './SuikaViewportManager';


export interface SuikaRulerAdapterProps {
  visible?: boolean;
  mode?: 'design' | 'h5';
}

/**
 * 模拟Suika编辑器接口用于标尺系统
 */
class MockSuikaEditor {
  ctx: CanvasRenderingContext2D;
  setting: any;
  viewportManager: any;
  selectedElements: any;

  constructor(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    pan: { x: number; y: number },
    viewportSize: { width: number; height: number }
  ) {
    this.ctx = ctx;
    
    // 模拟设置系统
    this.setting = {
      get: (key: string) => {
        const settings: Record<string, any> = {
          rulerWidth: 20,
          rulerBgColor: '#f0f0f0',
          rulerStroke: '#d0d0d0',
          rulerMarkStroke: '#666666',
          rulerMarkSize: 8,
          rulerSelectedBgColor: '#3b82f6',
        };
        return settings[key];
      }
    };

         // 模拟视口管理器 - 复用Suika的算法
     this.viewportManager = {
       getPageSize: () => viewportSize,
       getZoom: () => zoom,
       getSceneBbox: () => {
         // 复用Suika的getSceneBbox算法：使用矩阵变换计算场景边界
         // 与 suika/packages/core/src/viewport_manager.ts 中的 getSceneBbox() 方法完全一致
         
         // 构建变换矩阵：先平移，再缩放（与Suika ViewportManager一致）
         const viewMatrix = new Matrix()
           .translate(pan.x, pan.y)
           .scale(zoom, zoom);
         
         // 使用Suika的getSceneBbox算法：逆变换计算场景边界
         // 对应Suika中的：viewMatrix.applyInverse({ x: 0, y: 0 }) 和 viewMatrix.applyInverse({ x: width, y: height })
         const { x: minX, y: minY } = viewMatrix.applyInverse({ x: 0, y: 0 });
         const { x: maxX, y: maxY } = viewMatrix.applyInverse({ x: viewportSize.width, y: viewportSize.height });
         
         return {
           minX,
           minY,
           maxX,
           maxY,
         };
       }
     };

    // 模拟选中元素系统
    this.selectedElements = {
      getItems: () => [] // 暂时返回空数组
    };
  }

  /**
   * 世界坐标转视口坐标
   */
  toViewportPt(worldX: number, worldY: number) {
    const zoom = this.viewportManager.getZoom();
    const pan = { x: 0, y: 0 }; // 这里需要从外部获取pan值
    
    return {
      x: worldX * zoom + pan.x,
      y: worldY * zoom + pan.y
    };
  }

  /**
   * 世界尺寸转视口尺寸
   */
  toViewportSize(worldSize: number) {
    return worldSize * this.viewportManager.getZoom();
  }
}

/**
 * Suika标尺适配器组件
 */
export const SuikaRulerAdapter: React.FC<SuikaRulerAdapterProps> = ({
  visible = true,
  mode = 'design'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rulerRef = useRef<SuikaRuler | null>(null);
  const mockEditorRef = useRef<MockSuikaEditor | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const { zoom, pan } = useCanvasCoordinate();

  // 检查是否应该显示标尺
  const shouldShow = visible && (mode === 'design' || mode === 'h5');

  // 使用RAF节流的渲染函数 - 避免无限循环
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shouldShow) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 获取视口尺寸
    const rect = canvas.getBoundingClientRect();
    const viewportSize = {
      width: rect.width,
      height: rect.height
    };

    // 懒初始化标尺系统
    if (!rulerRef.current || !mockEditorRef.current) {
      mockEditorRef.current = new MockSuikaEditor(ctx, zoom, pan, viewportSize);
      
      // 创建标尺配置
      const rulerConfig = {
        width: 20,
        bgColor: '#f8f9fa',
        markStroke: '#6c757d',
        markSize: 8,
        selectedBgColor: '#007bff40',
        borderColor: '#dee2e6',
        textColor: '#495057',
        fontSize: 10,
        fontFamily: 'Arial, sans-serif',
      };
      
      // 创建世界坐标转屏幕坐标的函数
      const worldToScreen = (worldX: number, worldY: number) => ({
        x: worldX * zoom + pan.x,
        y: worldY * zoom + pan.y
      });
      
      rulerRef.current = new SuikaRuler(ctx, rulerConfig, worldToScreen, zoom);
    } else {
      // 更新标尺的缩放和坐标转换
      const worldToScreen = (worldX: number, worldY: number) => ({
        x: worldX * zoom + pan.x,
        y: worldY * zoom + pan.y
      });
      
      rulerRef.current.updateZoom(zoom);
      // 注意：这里需要更新worldToScreen函数，但SuikaRuler类没有提供更新方法
      // 所以我们需要重新创建标尺实例
      const rulerConfig = {
        width: 20,
        bgColor: '#f8f9fa',
        markStroke: '#6c757d',
        markSize: 8,
        selectedBgColor: '#007bff40',
        borderColor: '#dee2e6',
        textColor: '#495057',
        fontSize: 10,
        fontFamily: 'Arial, sans-serif',
      };
      
      rulerRef.current = new SuikaRuler(ctx, rulerConfig, worldToScreen, zoom);
    }

    // 清除Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制标尺
    try {
      // 复用Suika的视口信息算法：使用矩阵变换计算场景边界
      // 与 suika/packages/core/src/viewport_manager.ts 中的 getSceneBbox() 方法完全一致
      
      // 构建变换矩阵：先平移，再缩放（与Suika ViewportManager一致）
      const viewMatrix = new Matrix()
        .translate(pan.x, pan.y)
        .scale(zoom, zoom);
      
      // 使用Suika的getSceneBbox算法：逆变换计算场景边界
      // 对应Suika中的：viewMatrix.applyInverse({ x: 0, y: 0 }) 和 viewMatrix.applyInverse({ x: width, y: height })
      const { x: minX, y: minY } = viewMatrix.applyInverse({ x: 0, y: 0 });
      const { x: maxX, y: maxY } = viewMatrix.applyInverse({ x: viewportSize.width, y: viewportSize.height });
      
      const viewportInfo = {
        width: viewportSize.width,
        height: viewportSize.height,
        bounds: {
          minX,
          minY,
          maxX,
          maxY,
        }
      };
      rulerRef.current.draw(viewportInfo);
    } catch (error) {
      if (process.env['NODE_ENV'] === 'development') {
        console.error('Suika标尺绘制失败:', error);
      }
    }
  }, [shouldShow, zoom, pan, mode]);

  // Canvas初始化回调
  const canvasRefCallback = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      (canvasRef as any).current = canvas;
      
      // 延迟设置Canvas尺寸，确保容器完全渲染
      const updateCanvasSize = () => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width * window.devicePixelRatio;
          canvas.height = rect.height * window.devicePixelRatio;
          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${rect.height}px`;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
          }
          
          // 使用RAF节流触发渲染，避免频繁调用
          requestAnimationFrame(() => {
            if (render) render();
          });
        }
      };
      
      // 立即尝试一次
      updateCanvasSize();
      
      // 延迟再试一次，确保布局完成
      setTimeout(updateCanvasSize, 100);
      
      // 使用ResizeObserver监听尺寸变化
      resizeObserverRef.current = new ResizeObserver(updateCanvasSize);
      resizeObserverRef.current.observe(canvas);
    }
  }, []);

  // 状态变化时触发渲染 - 使用RAF节流避免频繁渲染
  useEffect(() => {
    if (shouldShow) {
      requestAnimationFrame(() => {
        if (render) render();
      });
    }
  }, [shouldShow, zoom, pan, mode]);

  // 清理ResizeObserver
  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // 窗口大小变化处理
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width * window.devicePixelRatio;
          canvas.height = rect.height * window.devicePixelRatio;
          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${rect.height}px`;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
          }
          
          // 使用RAF节流重新渲染，避免频繁调用
          requestAnimationFrame(() => {
            if (render) render();
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 如果不需要显示标尺，返回null
  if (!shouldShow) return null;
  
  return <RulerCanvas ref={canvasRefCallback} data-type="ruler" className="suika-ruler-canvas" />;
};

export default SuikaRulerAdapter;