import { CanvasEngine } from './CanvasEngine';
import { MemoryManager } from './MemoryManager';
import { ViewControl } from './ViewControl';
import { CanvasHealthChecker } from './CanvasHealthChecker';
import { fabric } from 'fabric';
export interface CanvasInitializationOptions {
    containerId: string;
    width: number;
    height: number;
    backgroundColor?: string;
    enablePerformanceMonitoring?: boolean;
    enableHealthChecking?: boolean;
    memoryLimits?: {
        maxCanvasMemory: number;
        maxTotalMemory: number;
        warningThreshold: number;
        criticalThreshold: number;
        gcThreshold: number;
    };
    viewControlOptions?: {
        minZoom: number;
        maxZoom: number;
        zoomStep: number;
        panSensitivity: number;
        smoothPanning: boolean;
        constrainPan: boolean;
    };
}
export interface CanvasSystemComponents {
    canvas: fabric.Canvas;
    canvasEngine: CanvasEngine;
    memoryManager: MemoryManager;
    viewControl: ViewControl;
    healthChecker: CanvasHealthChecker;
    container: HTMLElement;
}
/**
 * Canvas Initialization Manager
 * Handles the complete initialization of the canvas system
 */
export declare class CanvasInitializer {
    private static instance;
    private initializedSystems;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): CanvasInitializer;
    /**
     * Initialize complete canvas system
     */
    initializeCanvasSystem(options: CanvasInitializationOptions): Promise<CanvasSystemComponents>;
    /**
     * Get initialized canvas system
     */
    getCanvasSystem(containerId: string): CanvasSystemComponents | null;
    /**
     * Destroy canvas system
     */
    destroyCanvasSystem(containerId: string): void;
    /**
     * Destroy all canvas systems
     */
    destroyAllCanvasSystems(): void;
    /**
     * Get system health for all initialized canvases
     */
    getSystemHealth(): Promise<Record<string, any>>;
    /**
     * Setup system event handlers
     */
    private setupSystemEventHandlers;
    /**
     * Apply initial optimizations
     */
    private applyInitialOptimizations;
    /**
     * Validate initialization options
     */
    private validateOptions;
}
export declare const canvasInitializer: CanvasInitializer;
