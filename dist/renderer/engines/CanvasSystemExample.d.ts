/**
 * Canvas System Usage Example
 * Demonstrates how to properly initialize and use the canvas system
 */
export declare class CanvasSystemExample {
    private canvasEngine;
    private memoryManager;
    private viewControl;
    private healthChecker;
    private canvas;
    constructor();
    /**
     * Initialize the canvas system
     */
    initialize(containerId: string): Promise<void>;
    /**
     * Add a text object to the canvas
     */
    addText(text: string, x?: number, y?: number): string | null;
    /**
     * Add a rectangle to the canvas
     */
    addRectangle(x?: number, y?: number, width?: number, height?: number): string | null;
    /**
     * Add an image to the canvas
     */
    addImage(imageUrl: string, x?: number, y?: number): Promise<string | null>;
    /**
     * Zoom operations
     */
    zoomIn(): void;
    zoomOut(): void;
    fitToScreen(): void;
    resetView(): void;
    /**
     * Get current system health
     */
    getSystemHealth(): Promise<any>;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): any;
    /**
     * Get memory statistics
     */
    getMemoryStats(): any;
    /**
     * Export canvas as image
     */
    exportAsImage(format?: 'png' | 'jpeg', quality?: number): string | null;
    /**
     * Save canvas state
     */
    saveCanvasState(): string | null;
    /**
     * Load canvas state
     */
    loadCanvasState(jsonState: string): Promise<void>;
    /**
     * Clear canvas
     */
    clearCanvas(): void;
    /**
     * Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Cleanup and destroy
     */
    destroy(): void;
}
export declare function initializeCanvasSystem(): Promise<CanvasSystemExample>;
