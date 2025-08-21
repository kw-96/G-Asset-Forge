/**
 * Suika参考线系统React适配器
 * 将Suika RefLine类包装为React Hook和组件
 * @description 提供参考线显示和交互功能，支持设计模式和H5模式
 * @author 开发团队
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { RefLine } from '../../../logic/engines/suika/core/ref-line';
import { useCanvasCoordinate } from './CanvasCoordinateContext';
import { rafThrottle } from '../../../logic/utils/rafThrottle';
import { RefLineCanvas } from './SuikaCanvasStyles';

export interface SuikaRefLineAdapterProps {
    visible?: boolean;
    mode?: 'design' | 'h5';
    selectedObjects?: any[];
}

/**
 * 模拟Suika编辑器接口用于参考线系统
 */
class MockSuikaEditorForRefLine {
    ctx: CanvasRenderingContext2D;
    setting: any;
    viewportManager: any;
    selectedElements: any;
    doc: any;

    constructor(
        ctx: CanvasRenderingContext2D,
        zoom: number,
        pan: { x: number; y: number },
        viewportSize: { width: number; height: number },
        selectedObjects: any[] = []
    ) {
        this.ctx = ctx;

        // 模拟设置系统
        this.setting = {
            get: (key: string) => {
                const settings: Record<string, any> = {
                    snapToGrid: false,
                    gridSnapX: 20,
                    gridSnapY: 20,
                    refLineTolerance: 5,
                    refLineStroke: '#ff6b6b',
                    refLineStrokeWidth: 1,
                    refLinePointSize: 6,
                };
                return settings[key];
            }
        };

        // 模拟视口管理器
        this.viewportManager = {
            getPageSize: () => viewportSize,
            getZoom: () => zoom,
            getSceneBbox: () => {
                // 计算当前视口在世界坐标中的边界
                const worldMinX = (0 - pan.x) / zoom;
                const worldMinY = (0 - pan.y) / zoom;
                const worldMaxX = (viewportSize.width - pan.x) / zoom;
                const worldMaxY = (viewportSize.height - pan.y) / zoom;

                return {
                    minX: worldMinX,
                    minY: worldMinY,
                    maxX: worldMaxX,
                    maxY: worldMaxY,
                };
            }
        };

        // 模拟选中元素系统
        this.selectedElements = {
            getItems: () => selectedObjects.map(obj => ({
                getBbox: () => ({
                    minX: obj.x || 0,
                    minY: obj.y || 0,
                    maxX: (obj.x || 0) + (obj.width || 100),
                    maxY: (obj.y || 0) + (obj.height || 100),
                }),
                getWorldBboxVerts: () => [
                    { x: obj.x || 0, y: obj.y || 0 },
                    { x: (obj.x || 0) + (obj.width || 100), y: obj.y || 0 },
                    { x: (obj.x || 0) + (obj.width || 100), y: (obj.y || 0) + (obj.height || 100) },
                    { x: obj.x || 0, y: (obj.y || 0) + (obj.height || 100) },
                ],
                attrs: { id: obj.id }
            }))
        };

        // 模拟文档系统
        this.doc = {
            getCurrentCanvas: () => ({
                forEachVisibleChildNode: (_callback: (graphics: any) => void) => {
                    // 这里可以遍历所有可见的图形对象
                    // 暂时为空实现
                }
            })
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
 * Suika参考线适配器组件
 */
export const SuikaRefLineAdapter: React.FC<SuikaRefLineAdapterProps> = ({
    visible = true,
    mode = 'design',
    selectedObjects = []
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const refLineRef = useRef<RefLine | null>(null);
    const mockEditorRef = useRef<MockSuikaEditorForRefLine | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const { zoom, pan } = useCanvasCoordinate();

    // 检查是否应该显示参考线
    const shouldShow = visible && (mode === 'design' || mode === 'h5');

    // 使用RAF节流的渲染函数
    const render = useCallback(rafThrottle(() => {
        const canvas = canvasRef.current;
        if (!canvas || !shouldShow || !isInitialized) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 获取视口尺寸
        const rect = canvas.getBoundingClientRect();
        const viewportSize = {
            width: rect.width,
            height: rect.height
        };

        // 更新模拟编辑器的状态
        if (mockEditorRef.current) {
            mockEditorRef.current.viewportManager = {
                getPageSize: () => viewportSize,
                getZoom: () => zoom,
                getSceneBbox: () => {
                    const worldMinX = (0 - pan.x) / zoom;
                    const worldMinY = (0 - pan.y) / zoom;
                    const worldMaxX = (viewportSize.width - pan.x) / zoom;
                    const worldMaxY = (viewportSize.height - pan.y) / zoom;

                    return {
                        minX: worldMinX,
                        minY: worldMinY,
                        maxX: worldMaxX,
                        maxY: worldMaxY,
                    };
                }
            };

            // 更新toViewportPt方法
            mockEditorRef.current.toViewportPt = (worldX: number, worldY: number) => ({
                x: worldX * zoom + pan.x,
                y: worldY * zoom + pan.y
            });

            // 更新选中对象
            mockEditorRef.current.selectedElements = {
                getItems: () => selectedObjects.map(obj => ({
                    getBbox: () => ({
                        minX: obj.x || 0,
                        minY: obj.y || 0,
                        maxX: (obj.x || 0) + (obj.width || 100),
                        maxY: (obj.y || 0) + (obj.height || 100),
                    }),
                    getWorldBboxVerts: () => [
                        { x: obj.x || 0, y: obj.y || 0 },
                        { x: (obj.x || 0) + (obj.width || 100), y: obj.y || 0 },
                        { x: (obj.x || 0) + (obj.width || 100), y: (obj.y || 0) + (obj.height || 100) },
                        { x: obj.x || 0, y: (obj.y || 0) + (obj.height || 100) },
                    ],
                    attrs: { id: obj.id }
                }))
            };
        }

        // 清除Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 缓存参考线并绘制
        try {
            if (refLineRef.current) {
                refLineRef.current.cacheGraphicsRefLines({
                    excludeItems: selectedObjects
                });
                refLineRef.current.drawRefLine(ctx);
            }
        } catch (error) {
            if (process.env['NODE_ENV'] === 'development') {
                console.error('Suika参考线绘制失败:', error);
            }
        }
    }), [shouldShow, zoom, pan, mode, selectedObjects, isInitialized]);

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

                    // 初始化参考线系统
                    const viewportSize = { width: rect.width, height: rect.height };
                    mockEditorRef.current = new MockSuikaEditorForRefLine(ctx, zoom, pan, viewportSize, selectedObjects);
                    refLineRef.current = new RefLine(mockEditorRef.current);
                    setIsInitialized(true);
                }
            }
        }
    }, [zoom, pan, selectedObjects]);

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