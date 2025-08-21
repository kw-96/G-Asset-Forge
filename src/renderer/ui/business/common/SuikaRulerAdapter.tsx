/**
 * Suika标尺系统React适配器 - 统一调用Suika核心
 * @description 直接使用Suika核心的Setting系统和Ruler类，避免重复实现
 * @author 开发团队
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { SuikaEditor } from '../../../logic/engines/suika/core/editor';
import { RulerCanvas } from './SuikaCanvasStyles';

export interface SuikaRulerAdapterProps {
  editor?: SuikaEditor; // Suika编辑器实例
  visible?: boolean;
  mode?: 'design' | 'h5';
}



/**
 * Suika标尺适配器组件 - 统一调用Suika核心
 * @description 直接使用Suika核心的Setting系统和Ruler类
 */
export const SuikaRulerAdapter: React.FC<SuikaRulerAdapterProps> = ({
  editor,
  visible = true,
  mode: _ = 'design' // 使用下划线表示未使用的参数
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 直接使用Suika核心的状态
  const zoom = editor?.viewportManager?.getZoom() || 1;
  const pan = editor?.viewportManager?.getPos() || { x: 0, y: 0 };

  // 使用Suika核心的渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible || !editor) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 直接使用Suika核心的标尺绘制
    try {
      // 检查编辑器是否有必要的方法
      if (!editor.setting || !editor.ruler || typeof editor.setting.get !== 'function') {
        if (process.env['NODE_ENV'] === 'development') {
          console.warn('Suika编辑器实例不完整，跳过标尺绘制');
        }
        return;
      }

      // 检查是否启用标尺
      if (editor.setting.get('enableRuler') && editor.ruler.draw) {
        // 临时设置ctx到editor，让Ruler类可以使用
        const originalCtx = editor.ctx;
        editor.ctx = ctx;
        
        // 使用Suika核心的标尺系统
        editor.ruler.draw();
        
        // 恢复原始ctx
        editor.ctx = originalCtx;
      }
    } catch (error) {
      if (process.env['NODE_ENV'] === 'development') {
        console.error('Suika标尺绘制失败:', error);
      }
    }
  }, [visible, zoom, pan, editor]);

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

  // 如果不需要显示标尺，返回null
  if (!visible) return null;
  
  return <RulerCanvas ref={canvasRefCallback} data-type="ruler" className="suika-ruler-canvas" />;
};

export default SuikaRulerAdapter;