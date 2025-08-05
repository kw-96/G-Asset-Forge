import { EventEmitter } from '../utils/EventEmitter';
import { CanvasEngine } from './CanvasEngine';
import { MemoryManager } from './MemoryManager';
export interface HealthCheckResult {
    status: 'healthy' | 'warning' | 'critical';
    issues: HealthIssue[];
    metrics: HealthMetrics;
    timestamp: Date;
}
export interface HealthIssue {
    type: 'memory' | 'performance' | 'canvas' | 'objects';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion?: string;
}
export interface HealthMetrics {
    memoryUsage: number;
    fps: number;
    objectCount: number;
    canvasCount: number;
    renderTime: number;
}
export declare enum HealthCheckEvent {
    HEALTH_CHECK_COMPLETE = "health:check:complete",
    HEALTH_DEGRADED = "health:degraded",
    HEALTH_RECOVERED = "health:recovered"
}
/**
 * Canvas Health Checker
 * Monitors canvas system health and provides diagnostics
 */
export declare class CanvasHealthChecker extends EventEmitter {
    private canvasEngine;
    private memoryManager;
    private checkInterval;
    private lastHealthStatus;
    private isRunning;
    constructor(canvasEngine: CanvasEngine, memoryManager: MemoryManager);
    /**
     * Start health monitoring
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * Stop health monitoring
     */
    stopMonitoring(): void;
    /**
     * Perform immediate health check
     */
    performHealthCheck(): Promise<HealthCheckResult>;
    /**
     * Get current health status
     */
    getCurrentHealth(): HealthCheckResult | null;
    /**
     * Destroy health checker
     */
    destroy(): void;
    /**
     * Collect current metrics
     */
    private collectMetrics;
    /**
     * Check memory health
     */
    private checkMemoryHealth;
    /**
     * Check performance health
     */
    private checkPerformanceHealth;
    /**
     * Check canvas health
     */
    private checkCanvasHealth;
    /**
     * Check object health
     */
    private checkObjectHealth;
    /**
     * Determine overall health status
     */
    private determineHealthStatus;
    /**
     * Handle status changes
     */
    private handleStatusChange;
    /**
     * Perform synchronous health check
     */
    private performHealthCheckSync;
}
//# sourceMappingURL=CanvasHealthChecker.d.ts.map