import { EventEmitter } from '../utils/EventEmitter';
export interface ViewControlOptions {
    minZoom: number;
    maxZoom: number;
    zoomStep: number;
    panSensitivity: number;
    smoothPanning: boolean;
    constrainPan: boolean;
}
export interface ViewState {
    zoom: number;
    panX: number;
    panY: number;
    centerX: number;
    centerY: number;
}
export declare enum ViewControlEvent {
    ZOOM_CHANGED = "zoom:changed",
    PAN_CHANGED = "pan:changed",
    VIEW_RESET = "view:reset",
    FIT_TO_SCREEN = "fit:screen"
}
/**
 * View Control Manager for Canvas
 * Handles zoom, pan, and fit-to-screen functionality with performance optimization
 */
export declare class ViewControl extends EventEmitter {
    private canvas;
    private container;
    private options;
    private viewState;
    private animationFrame;
    private isDragging;
    private lastPanPoint;
    private frameCount;
    private lastFpsTime;
    private currentFps;
    private boundKeyDown;
    private boundKeyUp;
    constructor(canvas: any, container: HTMLElement, options?: Partial<ViewControlOptions>);
    /**
     * Set zoom level with performance optimization
     */
    setZoom(zoom: number, center?: any): void;
    /**
     * Zoom in by step amount
     */
    zoomIn(center?: any): void;
    /**
     * Zoom out by step amount
     */
    zoomOut(center?: any): void;
    /**
     * Pan canvas with smooth movement
     */
    pan(deltaX: number, deltaY: number): void;
    /**
     * Set absolute pan position
     */
    setPan(x: number, y: number): void;
    /**
     * Fit canvas to screen with optimal zoom
     */
    fitToScreen(padding?: number): void;
    /**
     * Reset view to default state
     */
    resetView(): void;
    /**
     * Get current view state
     */
    getViewState(): ViewState;
    /**
     * Get current FPS
     */
    getCurrentFPS(): number;
    /**
     * Enable/disable pan constraints
     */
    setConstrainPan(constrain: boolean): void;
    /**
     * Set zoom limits
     */
    setZoomLimits(minZoom: number, maxZoom: number): void;
    /**
     * Destroy view control and cleanup
     */
    destroy(): void;
    /**
     * Setup event handlers for mouse/touch interactions
     */
    private setupEventHandlers;
    /**
     * Remove event handlers
     */
    private removeEventHandlers;
    /**
     * Handle mouse wheel for zooming
     */
    private handleMouseWheel;
    /**
     * Handle mouse down for panning
     */
    private handleMouseDown;
    /**
     * Handle mouse move for panning
     */
    private handleMouseMove;
    /**
     * Handle mouse up to stop panning
     */
    private handleMouseUp;
    /**
     * Handle keyboard shortcuts
     */
    private handleKeyDown;
    /**
     * Handle key up events
     */
    private handleKeyUp;
    /**
     * Handle touch gestures for mobile
     */
    private handleTouchGesture;
    /**
     * Smooth panning with animation
     */
    private smoothPan;
    /**
     * Direct panning without animation
     */
    private directPan;
    /**
     * Constrain viewport to prevent panning too far
     */
    private constrainViewport;
    /**
     * Update internal view state
     */
    private updateViewState;
    /**
     * Clamp zoom to valid range
     */
    private clampZoom;
    /**
     * Update frame count for FPS calculation
     */
    private updateFrameCount;
    /**
     * Start performance monitoring
     */
    private startPerformanceMonitoring;
}
//# sourceMappingURL=ViewControl.d.ts.map