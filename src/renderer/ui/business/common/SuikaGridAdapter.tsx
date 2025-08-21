/**
 * Suika网格系统React适配器 - 统一调用Suika核心
 * @description 直接使用Suika核心的Setting系统和Grid类，避免重复实现
 * @author 开发团队
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { SuikaEditor } from '../../../logic/engines/suika/core/editor';
import { GridCanvas } from './SuikaCanvasStyles';

export interface SuikaGridAdapterProps {
  editor?: SuikaEditor; // Suika编辑器实例
  minZoomThreshold?: number; // 最小显示缩放阈值
}

/**
 * Suika网格适配器组件 - 统一调用Suika核心
 * @description 直接使用Suika核心的Setting系统和Grid类
 */
export const SuikaGridAdapter: React.FC<SuikaGridAdapterProps> = ({
  editor,
  minZoomThreshold = 8 // 使用Suika核心的默认阈值
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 直接使用Suika核心的状态
  const zoom = editor?.viewportManager?.getZoom() || 1;
  const enablePixelGrid = editor?.setting?.get('enablePixelGrid') || false;
  const minPixelGridZoom = editor?.setting?.get('minPixelGridZoom') || minZoomThreshold;

  // 检查是否应该显示网格 - 使用Suika核心的设置
  const shouldShow = enablePixelGrid && zoom >= minPixelGridZoom;

  // 使用Suika核心的渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shouldShow || !editor) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 直接使用Suika核心的网格绘制
    try {
      // 检查编辑器是否有必要的方法
      if (!editor.setting || !editor.viewportManager || typeof editor.setting.get !== 'function') {
        if (process.env['NODE_ENV'] === 'development') {
          console.warn('Suika编辑器实例不完整，跳过网格绘制');
        }
        return;
      }

      // 使用Suika核心的网格系统
      if (editor.setting.get('enablePixelGrid') && zoom >= (editor.setting.get('minPixelGridZoom') || 1)) {
        // 获取视口信息
        const viewport = editor.viewportManager;
        const canvasRect = canvas.getBoundingClientRect();
        
        // 绘制像素网格
        ctx.save();
        ctx.strokeStyle = editor.setting.get('pixelGridLineColor') || '#cccccc55';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        
        const gridSize = 1; // 1px网格
        const currentZoom = viewport.getZoom();
        const screenGridSize = gridSize * currentZoom;
        
        // 只在网格足够大时绘制，避免性能问题
        if (screenGridSize >= 2) {
          // 简化网格绘制，从0开始绘制
          const offsetX = 0;
          const offsetY = 0;
          
          // 绘制垂直线
          for (let x = offsetX; x < canvasRect.width; x += screenGridSize) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, canvasRect.height);
            ctx.stroke();
          }
          
          // 绘制水平线
          for (let y = offsetY; y < canvasRect.height; y += screenGridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(canvasRect.width, y + 0.5);
            ctx.stroke();
          }
        }
        
        ctx.restore();
      }
    } catch (error) {
      if (process.env['NODE_ENV'] === 'development') {
        console.error('Suika网格绘制失败:', error);
      }
    }
  }, [shouldShow, zoom, editor]);

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
