// @ts-nocheck
import { CanvasEngine } from './CanvasEngine';
import { MemoryManager } from './MemoryManager';
import { ViewControl } from './ViewControl';
import { CanvasHealthChecker } from './CanvasHealthChecker';
import { SimpleCanvasValidator } from './SimpleCanvasValidator';
/**
 * Canvas Initialization Manager
 * Handles the complete initialization of the canvas system
 */
export class CanvasInitializer {
    constructor() {
        this.initializedSystems = new Map();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!CanvasInitializer.instance) {
            CanvasInitializer.instance = new CanvasInitializer();
        }
        return CanvasInitializer.instance;
    }
    /**
     * Initialize complete canvas system
     */
    async initializeCanvasSystem(options) {
        const { containerId, width, height, backgroundColor = '#ffffff', enablePerformanceMonitoring = true, enableHealthChecking = true, memoryLimits = {
            maxCanvasMemory: 100,
            maxTotalMemory: 500,
            warningThreshold: 80,
            criticalThreshold: 120,
            gcThreshold: 150
        }, viewControlOptions = {
            minZoom: 0.1,
            maxZoom: 5.0,
            zoomStep: 0.1,
            panSensitivity: 1.0,
            smoothPanning: true,
            constrainPan: true
        } } = options;
        try {
            // Check if already initialized
            if (this.initializedSystems.has(containerId)) {
                console.warn(`Canvas system for ${containerId} is already initialized`);
                return this.initializedSystems.get(containerId);
            }
            console.log(`Initializing canvas system for ${containerId}...`);
            // 1. Perform basic validation
            const validation = await SimpleCanvasValidator.validateBasicRequirements();
            if (!validation.isValid) {
                const report = await SimpleCanvasValidator.generateSimpleReport();
                console.error('Canvas validation failed:', report);
                throw new Error(`Canvas validation failed: ${validation.issues.join(', ')}`);
            }
            // 2. Validate container (already checked in initialization check, but double-check)
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container with id "${containerId}" not found`);
            }
            // 3. Initialize Canvas Engine
            const canvasEngine = new CanvasEngine();
            // 4. Initialize Memory Manager
            const memoryManager = new MemoryManager(memoryLimits);
            // 5. Create Canvas
            const canvas = await canvasEngine.createCanvas(containerId, {
                width,
                height,
                backgroundColor,
                preserveObjectStacking: true,
                selection: true,
                renderOnAddRemove: true
            });
            // 6. Initialize View Control
            const viewControl = new ViewControl(canvas, container, viewControlOptions);
            // 7. Register canvas with memory manager
            memoryManager.registerCanvas(containerId, canvas);
            // 8. Initialize Health Checker
            const healthChecker = new CanvasHealthChecker(canvasEngine, memoryManager);
            // 9. Start monitoring if enabled
            if (enablePerformanceMonitoring) {
                // Performance monitoring is automatically started by CanvasEngine
                console.log('Performance monitoring enabled');
            }
            if (enableHealthChecking) {
                healthChecker.startMonitoring(5000); // Check every 5 seconds
                console.log('Health checking enabled');
            }
            // 10. Setup system event handlers
            this.setupSystemEventHandlers(canvasEngine, memoryManager, healthChecker, containerId);
            // 11. Apply initial optimizations
            this.applyInitialOptimizations(canvas);
            const systemComponents = {
                canvas,
                canvasEngine,
                memoryManager,
                viewControl,
                healthChecker,
                container
            };
            // Store initialized system
            this.initializedSystems.set(containerId, systemComponents);
            console.log(`Canvas system initialized successfully for ${containerId}`);
            return systemComponents;
        }
        catch (error) {
            console.error(`Failed to initialize canvas system for ${containerId}:`, error);
            throw error;
        }
    }
    /**
     * Get initialized canvas system
     */
    getCanvasSystem(containerId) {
        return this.initializedSystems.get(containerId) || null;
    }
    /**
     * Destroy canvas system
     */
    destroyCanvasSystem(containerId) {
        const system = this.initializedSystems.get(containerId);
        if (!system) {
            console.warn(`No canvas system found for ${containerId}`);
            return;
        }
        try {
            console.log(`Destroying canvas system for ${containerId}...`);
            // Stop health monitoring
            system.healthChecker.destroy();
            // Destroy view control
            system.viewControl.destroy();
            // Unregister from memory manager
            system.memoryManager.unregisterCanvas(containerId);
            // Destroy canvas
            system.canvasEngine.destroyCanvas(containerId);
            // Destroy memory manager
            system.memoryManager.destroy();
            // Remove from initialized systems
            this.initializedSystems.delete(containerId);
            console.log(`Canvas system destroyed successfully for ${containerId}`);
        }
        catch (error) {
            console.error(`Error destroying canvas system for ${containerId}:`, error);
        }
    }
    /**
     * Destroy all canvas systems
     */
    destroyAllCanvasSystems() {
        const containerIds = Array.from(this.initializedSystems.keys());
        containerIds.forEach(containerId => {
            this.destroyCanvasSystem(containerId);
        });
    }
    /**
     * Get system health for all initialized canvases
     */
    async getSystemHealth() {
        const healthResults = {};
        for (const [containerId, system] of this.initializedSystems) {
            try {
                healthResults[containerId] = await system.healthChecker.performHealthCheck();
            }
            catch (error) {
                healthResults[containerId] = {
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        }
        return healthResults;
    }
    /**
     * Setup system event handlers
     */
    setupSystemEventHandlers(canvasEngine, memoryManager, healthChecker, containerId) {
        // Canvas engine events
        canvasEngine.on('canvas:created', (event) => {
            console.log(`Canvas created: ${event.canvasId}`);
        });
        canvasEngine.on('memory:warning', (event) => {
            console.warn(`Memory warning for ${containerId}:`, event.usage, 'MB');
        });
        // Memory manager events
        memoryManager.on('memory:warning', (stats) => {
            console.warn(`Memory usage warning for ${containerId}:`, stats);
        });
        memoryManager.on('memory:critical', (stats) => {
            console.error(`Critical memory usage for ${containerId}:`, stats);
        });
        // Health checker events
        healthChecker.on('health:degraded', (event) => {
            console.warn(`System health degraded for ${containerId}:`, event);
        });
        healthChecker.on('health:recovered', (event) => {
            console.log(`System health recovered for ${containerId}:`, event);
        });
    }
    /**
     * Apply initial optimizations
     */
    applyInitialOptimizations(canvas) {
        // Enable performance optimizations
        canvas.enableRetinaScaling = true;
        canvas.imageSmoothingEnabled = true;
        canvas.skipTargetFind = false;
        canvas.perPixelTargetFind = true;
        // Set reasonable defaults for better performance
        canvas.renderOnAddRemove = true;
        canvas.stateful = true;
        // Apply CSS optimizations to canvas element
        const canvasElement = canvas.getElement();
        if (canvasElement) {
            canvasElement.style.imageRendering = 'auto';
            canvasElement.style.imageRendering = 'crisp-edges';
            canvasElement.style.imageRendering = '-webkit-optimize-contrast';
        }
    }
    /**
     * Validate initialization options
     */
    validateOptions(options) {
        if (!options.containerId) {
            throw new Error('Container ID is required');
        }
        if (options.width <= 0 || options.height <= 0) {
            throw new Error('Canvas width and height must be positive numbers');
        }
        if (options.memoryLimits) {
            const { maxCanvasMemory, maxTotalMemory, warningThreshold, criticalThreshold } = options.memoryLimits;
            if (maxCanvasMemory <= 0 || maxTotalMemory <= 0) {
                throw new Error('Memory limits must be positive numbers');
            }
            if (warningThreshold >= criticalThreshold) {
                throw new Error('Warning threshold must be less than critical threshold');
            }
        }
    }
}
CanvasInitializer.instance = null;
// Export singleton instance
export const canvasInitializer = CanvasInitializer.getInstance();
//# sourceMappingURL=CanvasInitializer.js.map