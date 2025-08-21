/**
 * Suika参考线系统React适配器 - 统一调用Suika核心
 * @description 直接使用Suika核心的Setting系统和RefLine类，避免重复实现
 * @author 开发团队
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { SuikaEditor } from '../../../logic/engines/suika/core/editor';
import { RefLineCanvas } from './SuikaCanvasStyles';

export interface SuikaRefLineAdapterProps {
    editor?: SuikaEditor; // Suika编辑器实例
    visible?: boolean;
    mode?: 'design' | 'h5';
    selectedObjects?: any[];
}



/**
 * Suika参考线适配器组件 - 统一调用Suika核心
 * @description 直接使用Suika核心的Setting系统和RefLine类
 */
export const SuikaRefLineAdapter: React.FC<SuikaRefLineAdapterProps> = ({
    editor,
    visible = true,
    mode = 'design',
    selectedObjects = []
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [, setIsInitialized] = useState(false);

    // 直接使用Suika核心的状态
    const zoom = editor?.viewportManager?.getZoom() || 1;
    const pan = editor?.viewportManager?.getPos() || { x: 0, y: 0 };

    // 检查是否应该显示参考线
    const shouldShow = visible && (mode === 'design' || mode === 'h5');

    // 使用Suika核心的渲染函数
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !shouldShow || !editor) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 清除Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 直接使用Suika核心的参考线绘制
        try {
            // 检查编辑器是否有必要的方法
            if (!editor.refLine || typeof editor.refLine.drawRefLine !== 'function') {
                if (process.env['NODE_ENV'] === 'development') {
                    console.warn('Suika编辑器实例不完整，跳过参考线绘制');
                }
                return;
            }

            // 临时设置ctx到editor，让RefLine类可以使用
            const originalCtx = editor.ctx;
            editor.ctx = ctx;
            
            // 使用Suika核心的参考线系统
            if (editor.refLine.cacheGraphicsRefLines) {
                editor.refLine.cacheGraphicsRefLines({
                    excludeItems: selectedObjects
                });
            }
            editor.refLine.drawRefLine(ctx);
            
            // 恢复原始ctx
            editor.ctx = originalCtx;
        } catch (error) {
            if (process.env['NODE_ENV'] === 'development') {
                console.error('Suika参考线绘制失败:', error);
            }
        }
    }, [shouldShow, zoom, pan, mode, selectedObjects, editor]);

    // Canvas初始化回调
    const canvasRefCallback = useCallback((canvas: HTMLCanvasElement | null) => {
        if (canvas) {
            (canvasRef as any).current = canvas;

            // 设置Canvas尺寸
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                canvas.width = rect.width * window.devicePixelRatio;
                canvas.height = rect.height * window.devicePixelRatio;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                    setIsInitialized(true);
                }
            }
        }
    }, []);

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

    // 提供吸附偏移计算功能 (暂时注释掉，后续可以根据需要实现)
    // const calculateSnapOffset = useCallback((targetPoints: { x: number; y: number }[]) => {
    //   if (!refLineRef.current || !shouldShow) {
    //     return { x: 0, y: 0 };
    //   }

    //   try {
    //     const offset = refLineRef.current.getGraphicsSnapOffset(targetPoints);
    //     if (onSnapOffset) {
    //       onSnapOffset(offset);
    //     }
    //     return offset;
    //   } catch (error) {
    //     if (process.env['NODE_ENV'] === 'development') {
    //       console.error('计算吸附偏移失败:', error);
    //     }
    //     return { x: 0, y: 0 };
    //   }
    // }, [shouldShow, onSnapOffset]);

    // 如果不需要显示参考线，返回null
    if (!shouldShow) return null;

    return <RefLineCanvas ref={canvasRefCallback} data-type="ref-line" className="suika-ref-line-canvas" />;
};

export default SuikaRefLineAdapter;