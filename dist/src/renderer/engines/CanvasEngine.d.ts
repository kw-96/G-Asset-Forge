import { fabric } from 'fabric';
import { EventEmitter } from '../utils/EventEmitter';
export interface CanvasOptions {
    width: number;
    height: number;
    backgroundColor?: string;
    preserveObjectStacking?: boolean;
    selection?: boolean;
    renderOnAddRemove?: boolean;
}
export interface CanvasObject {
    id: string;
    type: 'text' | 'image' | 'shape' | 'group';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    opacity?: number;
    visible?: boolean;
    locked?: boolean;
    properties: Record<string, any>;
}
export declare enum CanvasEvent {
    CANVAS_CREATED = "canvas:created",
    CANVAS_DESTROYED = "canvas:destroyed",
    CANVAS_RESIZED = "canvas:resized",
    OBJECT_ADDED = "object:added",
    OBJECT_REMOVED = "object:removed",
    OBJECT_MODIFIED = "object:modified",
    SELECTION_CREATED = "selection:created",
    SELECTION_CLEARED = "selection:cleared",
    ZOOM_CHANGED = "zoom:changed",
    PAN_CHANGED = "pan:changed",
    PERFORMANCE_UPDATE = "performance:update"
}
export interface PerformanceMetrics {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    objectCount: number;
}
export declare const GAME_ASSET_PRESETS: {
    MOBILE_PORTRAIT: {
        width: number;
        height: number;
        name: string;
    };
    MOBILE_LANDSCAPE: {
        width: number;
        height: number;
        name: string;
    };
    IPHONE_X: {
        width: number;
        height: number;
        name: string;
    };
    IPHONE_14: {
        width: number;
        height: number;
        name: string;
    };
    IPAD: {
        width: number;
        height: number;
        name: string;
    };
    IPAD_PRO: {
        width: number;
        height: number;
        name: string;
    };
    ICON_SMALL: {
        width: number;
        height: number;
        name: string;
    };
    ICON_MEDIUM: {
        width: number;
        height: number;
        name: string;
    };
    ICON_LARGE: {
        width: number;
        height: number;
        name: string;
    };
    HD: {
        width: number;
        height: number;
        name: string;
    };
    FULL_HD: {
        width: number;
        height: number;
        name: string;
    };
    QUAD_HD: {
        width: number;
        height: number;
        name: string;
    };
    SQUARE_512: {
        width: number;
        height: number;
        name: string;
    };
    SQUARE_1024: {
        width: number;
        height: number;
        name: string;
    };
    ASPECT_16_9: {
        width: number;
        height: number;
        name: string;
    };
    ASPECT_4_3: {
        width: number;
        height: number;
        name: string;
    };
    ASPECT_3_2: {
        width: number;
        height: number;
        name: string;
    };
};
export type EventCallback = (...args: any[]) => void;
/**
 * Core Canvas Engine for G-Asset Forge
 * Manages canvas lifecycle, events, and performance optimization
 */
export declare class CanvasEngine extends EventEmitter {
    private canvases;
    private performanceMonitor;
    private isDestroyed;
    private resizeTimeout?;
    constructor();
    /**
     * Create a new canvas instance
     */
    createCanvas(containerId: string, options: CanvasOptions): Promise<fabric.Canvas>;
    /**
     * Destroy a canvas instance
     */
    destroyCanvas(canvasId: string): void;
    /**
     * Resize canvas
     */
    resizeCanvas(canvasId: string, width: number, height: number): void;
    /**
     * Get canvas instance by ID
     */
    getCanvas(canvasId: string): fabric.Canvas | undefined;
    /**
     * Get all canvas IDs
     */
    getCanvasIds(): string[];
    /**
     * Add object to canvas
     */
    addObject(canvasId: string, object: any): string;
    /**
     * Remove object from canvas
     */
    removeObject(canvasId: string, objectId: string): void;
    /**
     * Update object properties
     */
    updateObject(canvasId: string, objectId: string, properties: any): void;
    /**
     * Get performance metrics for a canvas
     */
    getPerformanceMetrics(canvasId: string): PerformanceMetrics | null;
    /**
     * Get all performance metrics
     */
    getAllPerformanceMetrics(): Map<string, PerformanceMetrics>;
    /**
     * Destroy the entire canvas engine
     */
    destroy(): void;
    /**
     * Setup canvas-specific event handlers
     */
    private setupCanvasEventHandlers;
    /**
     * Setup global event handlers
     */
    private setupGlobalEventHandlers;
    /**
     * Handle window resize event
     */
    private handleWindowResize;
    /**
     * Check memory usage and emit warnings if needed
     */
    private checkMemoryUsage;
    /**
     * Generate unique object ID
     */
    private generateObjectId;
}
export declare const canvasEngine: CanvasEngine;
//# sourceMappingURL=CanvasEngine.d.ts.map