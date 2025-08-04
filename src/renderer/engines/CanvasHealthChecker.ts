import { fabric } from 'fabric';
import { EventEmitter } from 'events';
import { CanvasEngine } from './CanvasEngine';
import { MemoryManager } from './MemoryManager';

// Health check results
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
  memoryUsage: number; // MB
  fps: number;
  objectCount: number;
  canvasCount: number;
  renderTime: number; // ms
}

// Health check events
export enum HealthCheckEvent {
  HEALTH_CHECK_COMPLETE = 'health:check:complete',
  HEALTH_DEGRADED = 'health:degraded',
  HEALTH_RECOVERED = 'health:recovered'
}

/**
 * Canvas Health Checker
 * Monitors canvas system health and provides diagnostics
 */
export class CanvasHealthChecker extends EventEmitter {
  private canvasEngine: CanvasEngine;
  private memoryManager: MemoryManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastHealthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  private isRunning = false;

  constructor(canvasEngine: CanvasEngine, memoryManager: MemoryManager) {
    super();
    this.canvasEngine = canvasEngine;
    this.memoryManager = memoryManager;
  }

  /**
   * Start health monitoring
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isRunning) {
      console.warn('Health checker is already running');
      return;
    }

    this.isRunning = true;
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    console.log('Canvas health monitoring started');
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Canvas health monitoring stopped');
  }

  /**
   * Perform immediate health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const issues: HealthIssue[] = [];
    const metrics = this.collectMetrics();

    // Check memory usage
    this.checkMemoryHealth(metrics, issues);

    // Check performance
    this.checkPerformanceHealth(metrics, issues);

    // Check canvas state
    this.checkCanvasHealth(metrics, issues);

    // Check object count
    this.checkObjectHealth(metrics, issues);

    // Determine overall status
    const status = this.determineHealthStatus(issues);

    const result: HealthCheckResult = {
      status,
      issues,
      metrics,
      timestamp: new Date()
    };

    // Emit events based on status changes
    this.handleStatusChange(status);

    // Emit health check complete event
    this.emit(HealthCheckEvent.HEALTH_CHECK_COMPLETE, result);

    return result;
  }

  /**
   * Get current health status
   */
  getCurrentHealth(): HealthCheckResult | null {
    if (!this.isRunning) {
      return null;
    }
    // Return a synchronous health check
    return this.performHealthCheckSync();
  }

  /**
   * Destroy health checker
   */
  destroy(): void {
    this.stopMonitoring();
    this.removeAllListeners();
  }

  /**
   * Collect current metrics
   */
  private collectMetrics(): HealthMetrics {
    const memoryStats = this.memoryManager.getMemoryStats();
    const canvasIds = this.canvasEngine.getCanvasIds();
    
    let totalObjectCount = 0;
    let avgFps = 0;
    let avgRenderTime = 0;

    // Collect metrics from all canvases
    canvasIds.forEach(canvasId => {
      const metrics = this.canvasEngine.getPerformanceMetrics(canvasId);
      if (metrics) {
        totalObjectCount += metrics.objectCount;
        avgFps += metrics.fps;
        avgRenderTime += metrics.renderTime;
      }
    });

    if (canvasIds.length > 0) {
      avgFps = avgFps / canvasIds.length;
      avgRenderTime = avgRenderTime / canvasIds.length;
    }

    return {
      memoryUsage: memoryStats.totalMemory,
      fps: avgFps,
      objectCount: totalObjectCount,
      canvasCount: canvasIds.length,
      renderTime: avgRenderTime
    };
  }

  /**
   * Check memory health
   */
  private checkMemoryHealth(metrics: HealthMetrics, issues: HealthIssue[]): void {
    if (metrics.memoryUsage > 400) { // Critical: >400MB
      issues.push({
        type: 'memory',
        severity: 'high',
        message: `Critical memory usage: ${metrics.memoryUsage.toFixed(1)}MB`,
        suggestion: 'Consider reducing object count or clearing unused resources'
      });
    } else if (metrics.memoryUsage > 200) { // Warning: >200MB
      issues.push({
        type: 'memory',
        severity: 'medium',
        message: `High memory usage: ${metrics.memoryUsage.toFixed(1)}MB`,
        suggestion: 'Monitor memory usage and consider optimization'
      });
    } else if (metrics.memoryUsage > 100) { // Low warning: >100MB
      issues.push({
        type: 'memory',
        severity: 'low',
        message: `Elevated memory usage: ${metrics.memoryUsage.toFixed(1)}MB`,
        suggestion: 'Memory usage is within acceptable range but trending up'
      });
    }
  }

  /**
   * Check performance health
   */
  private checkPerformanceHealth(metrics: HealthMetrics, issues: HealthIssue[]): void {
    if (metrics.fps < 30) { // Critical: <30fps
      issues.push({
        type: 'performance',
        severity: 'high',
        message: `Critical FPS drop: ${metrics.fps.toFixed(1)}fps`,
        suggestion: 'Reduce canvas complexity or optimize rendering'
      });
    } else if (metrics.fps < 45) { // Warning: <45fps
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: `Low FPS: ${metrics.fps.toFixed(1)}fps`,
        suggestion: 'Consider performance optimizations'
      });
    } else if (metrics.fps < 55) { // Low warning: <55fps
      issues.push({
        type: 'performance',
        severity: 'low',
        message: `FPS below optimal: ${metrics.fps.toFixed(1)}fps`,
        suggestion: 'Performance is acceptable but could be improved'
      });
    }

    // Check render time
    if (metrics.renderTime > 50) { // Critical: >50ms
      issues.push({
        type: 'performance',
        severity: 'high',
        message: `Slow rendering: ${metrics.renderTime.toFixed(1)}ms per frame`,
        suggestion: 'Optimize canvas objects or reduce complexity'
      });
    } else if (metrics.renderTime > 25) { // Warning: >25ms
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: `Elevated render time: ${metrics.renderTime.toFixed(1)}ms per frame`,
        suggestion: 'Consider render optimizations'
      });
    }
  }

  /**
   * Check canvas health
   */
  private checkCanvasHealth(metrics: HealthMetrics, issues: HealthIssue[]): void {
    if (metrics.canvasCount > 5) { // Warning: >5 canvases
      issues.push({
        type: 'canvas',
        severity: 'medium',
        message: `High canvas count: ${metrics.canvasCount}`,
        suggestion: 'Consider consolidating canvases or implementing lazy loading'
      });
    } else if (metrics.canvasCount > 10) { // Critical: >10 canvases
      issues.push({
        type: 'canvas',
        severity: 'high',
        message: `Excessive canvas count: ${metrics.canvasCount}`,
        suggestion: 'Reduce number of active canvases to improve performance'
      });
    }

    // Check for orphaned canvases
    const canvasIds = this.canvasEngine.getCanvasIds();
    canvasIds.forEach(canvasId => {
      const canvas = this.canvasEngine.getCanvas(canvasId);
      if (!canvas) {
        issues.push({
          type: 'canvas',
          severity: 'medium',
          message: `Orphaned canvas reference: ${canvasId}`,
          suggestion: 'Clean up canvas references to prevent memory leaks'
        });
      }
    });
  }

  /**
   * Check object health
   */
  private checkObjectHealth(metrics: HealthMetrics, issues: HealthIssue[]): void {
    if (metrics.objectCount > 1000) { // Critical: >1000 objects
      issues.push({
        type: 'objects',
        severity: 'high',
        message: `Excessive object count: ${metrics.objectCount}`,
        suggestion: 'Consider object pooling or virtualization'
      });
    } else if (metrics.objectCount > 500) { // Warning: >500 objects
      issues.push({
        type: 'objects',
        severity: 'medium',
        message: `High object count: ${metrics.objectCount}`,
        suggestion: 'Monitor object creation and consider optimization'
      });
    } else if (metrics.objectCount > 200) { // Low warning: >200 objects
      issues.push({
        type: 'objects',
        severity: 'low',
        message: `Elevated object count: ${metrics.objectCount}`,
        suggestion: 'Object count is manageable but trending up'
      });
    }
  }

  /**
   * Determine overall health status
   */
  private determineHealthStatus(issues: HealthIssue[]): 'healthy' | 'warning' | 'critical' {
    const hasHighSeverity = issues.some(issue => issue.severity === 'high');
    const hasMediumSeverity = issues.some(issue => issue.severity === 'medium');

    if (hasHighSeverity) {
      return 'critical';
    } else if (hasMediumSeverity) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  /**
   * Handle status changes
   */
  private handleStatusChange(newStatus: 'healthy' | 'warning' | 'critical'): void {
    if (newStatus !== this.lastHealthStatus) {
      if (newStatus === 'healthy' && this.lastHealthStatus !== 'healthy') {
        this.emit(HealthCheckEvent.HEALTH_RECOVERED, { 
          previousStatus: this.lastHealthStatus,
          currentStatus: newStatus 
        });
      } else if (newStatus !== 'healthy' && this.lastHealthStatus === 'healthy') {
        this.emit(HealthCheckEvent.HEALTH_DEGRADED, { 
          previousStatus: this.lastHealthStatus,
          currentStatus: newStatus 
        });
      }
      
      this.lastHealthStatus = newStatus;
    }
  }

  /**
   * Perform synchronous health check
   */
  private performHealthCheckSync(): HealthCheckResult {
    const issues: HealthIssue[] = [];
    const metrics = this.collectMetrics();

    this.checkMemoryHealth(metrics, issues);
    this.checkPerformanceHealth(metrics, issues);
    this.checkCanvasHealth(metrics, issues);
    this.checkObjectHealth(metrics, issues);

    const status = this.determineHealthStatus(issues);

    return {
      status,
      issues,
      metrics,
      timestamp: new Date()
    };
  }
}