/**
 * 启动性能监控器
 * 监控应用启动过程中的各个阶段性能
 */

export interface StartupMetrics {
  totalStartupTime: number;
  firstPaintTime: number;
  firstContentfulPaintTime: number;
  domContentLoadedTime: number;
  windowLoadTime: number;
  firstInteractionTime: number;
  timeToInteractive: number;
  resourceLoadTime: number;
  componentMountTime: number;
  initialRenderTime: number;
}

export interface StartupPhase {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  critical: boolean;
  description: string;
}

export class StartupPerformanceMonitor {
  private static instance: StartupPerformanceMonitor;
  private startTime: number;
  private phases: Map<string, StartupPhase>;
  private metrics: Partial<StartupMetrics>;
  private isMonitoring: boolean;

  private constructor() {
    this.startTime = performance.now();
    this.phases = new Map();
    this.metrics = {};
    this.isMonitoring = false;
  }

  static getInstance(): StartupPerformanceMonitor {
    if (!StartupPerformanceMonitor.instance) {
      StartupPerformanceMonitor.instance = new StartupPerformanceMonitor();
    }
    return StartupPerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.startTime = performance.now();
    this.startPhase('app-initialization', '应用初始化', true);
    console.log('启动性能监控已开始');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;
    this.endPhase('app-initialization');
    this.metrics.totalStartupTime = performance.now() - this.startTime;
    console.log('启动性能监控已停止');
  }

  startPhase(name: string, description: string, critical: boolean = false): void {
    const phase: StartupPhase = {
      name,
      startTime: performance.now(),
      critical,
      description
    };
    this.phases.set(name, phase);
    performance.mark(`${name}-start`);
  }

  endPhase(name: string): void {
    const phase = this.phases.get(name);
    if (!phase) return;
    
    const endTime = performance.now();
    phase.endTime = endTime;
    phase.duration = endTime - phase.startTime;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    console.log(`启动阶段 "${phase.description}" 完成: ${phase.duration.toFixed(2)}ms`);
  }

  getMetrics(): StartupMetrics {
    return {
      totalStartupTime: this.metrics.totalStartupTime || 0,
      firstPaintTime: this.metrics.firstPaintTime || 0,
      firstContentfulPaintTime: this.metrics.firstContentfulPaintTime || 0,
      domContentLoadedTime: this.metrics.domContentLoadedTime || 0,
      windowLoadTime: this.metrics.windowLoadTime || 0,
      firstInteractionTime: this.metrics.firstInteractionTime || 0,
      timeToInteractive: this.metrics.timeToInteractive || 0,
      resourceLoadTime: this.metrics.resourceLoadTime || 0,
      componentMountTime: this.metrics.componentMountTime || 0,
      initialRenderTime: this.metrics.initialRenderTime || 0,
    };
  }

  isStartupTargetMet(): boolean {
    const totalTime = this.metrics.totalStartupTime || 0;
    return totalTime <= 5000; // 5秒目标
  }
}

export const startupPerformanceMonitor = StartupPerformanceMonitor.getInstance();