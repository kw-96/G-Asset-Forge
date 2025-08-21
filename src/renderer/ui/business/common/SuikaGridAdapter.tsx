/**
 * Suika网格系统React适配器
 * 将Suika Grid类包装为React Hook和组件
 * 完全复用Suika的原始实现
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { SuikaGrid, type GridConfig, type ViewportInfo } from './SuikaGrid';
import { useCanvasGrid, useCanvasCoordinate } from './CanvasCoordinateContext';
import { rafThrottle } from '../../../logic/utils/rafThrottle';
import { GridCanvas } from './SuikaCanvasStyles';

export interface SuikaGridAdapterProps {
  gridConfig?: Partial<GridConfig>;
  minZoomThreshold?: number; // 最小显示缩放阈值 - 修复：改为1，与Suika一致
}

/**
 * Suika网格适配器组件
 * 完全复用Suika的原始实现
 */
export const SuikaGridAdapter: React.FC<SuikaGridAdapterProps> = ({
  gridConfig = {},
  minZoomThreshold = 1  // 修复：从8改为1，让网格在正常缩放级别下显示
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<SuikaGrid | null>(null);

  const { shouldShowGrid, worldToScreen } = useCanvasGrid();
  const { zoom, pan } = useCanvasCoordinate();

  // 默认网格配置 - 完全复用Suika的网格设置
  // 参考 suika/packages/core/src/setting.ts: gridViewX: 1, gridViewY: 1
  const defaultConfig: GridConfig = {
    stepX: 1,        // 固定1px步长，与Suika一致
    stepY: 1,        // 固定1px步长，与Suika一致
    lineColor: '#3b82f688',
    lineWidth: 1,
    opacity: 0.8,
    useDynamicStep: false, // 网格使用固定步长，标尺使用动态步长
    ...gridConfig
  };

  // 检查是否应该显示网格 - 修复：降低阈值，与Suika一致
  const shouldShow = shouldShowGrid() && zoom >= minZoomThreshold;

  // Suika风格：使用RAF节流的渲染函数
  const render = useCallback(rafThrottle(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shouldShow) return;

    // 懒初始化网格
    if (!gridRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        gridRef.current = new SuikaGrid(ctx, defaultConfig, worldToScreen);
      }
    }

    const grid = gridRef.current;
    if (!grid) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 修复：使用Suika的简单视口计算方法，与SuikaRefLineAdapter一致
    // 这是Suika的原始实现，更稳定可靠
    const canvasWidth = canvas.width / window.devicePixelRatio;
    const canvasHeight = canvas.height / window.devicePixelRatio;
    
    // 使用Suika的简单除法方法计算世界坐标边界
    // 与 suika/packages/core/src/viewport_manager.ts 中的逻辑完全一致
    const worldMinX = (0 - pan.x) / zoom;
    const worldMinY = (0 - pan.y) / zoom;
    const worldMaxX = (canvasWidth - pan.x) / zoom;
    const worldMaxY = (canvasHeight - pan.y) / zoom;
    
    const viewport: ViewportInfo = {
      width: canvasWidth,
      height: canvasHeight,
      bounds: {
        minX: worldMinX,
        maxX: worldMaxX,
        minY: worldMinY,
        maxY: worldMaxY,
      }
    };

    // 绘制网格 - 传递zoom参数以支持动态步长
    try {
      grid.draw(viewport, zoom);
    } catch (error) {
      if (process.env['NODE_ENV'] === 'development') {
        console.error('Suika网格绘制失败:', error);
      }
    }
  }), [shouldShow, worldToScreen, zoom, pan, defaultConfig]);

  // Canvas初始化回调
  const canvasRefCallback = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      (canvasRef as any).current = canvas;
      
      // 延迟设置Canvas尺寸，确保容器完全渲染
      setTimeout(() => {
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
          
          // 立即触发渲染
          render();
        }
      }, 0);
    }
  }, [render]);

  // 状态变化时直接触发渲染
  useEffect(() => {
    render();
  }, [render]);

  // 配置变化时更新网格配置
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.updateConfig(defaultConfig);
    }
  }, [defaultConfig]);

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
          
          // 立即重新渲染
          render();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  // 如果不需要显示网格，返回null
  if (!shouldShow) return null;
  
  return <GridCanvas ref={canvasRefCallback} data-type="grid" className="suika-grid-canvas" />;
};

export default SuikaGridAdapter;
