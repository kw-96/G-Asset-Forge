/**
 * UI增强功能管理器
 * 单例模式管理所有UI增强功能的启用、禁用和状态
 */

import { UIFeature } from '../../ui/business/UIIntegration';
import { unifiedPerformanceMonitor } from './performance/UnifiedPerformanceMonitor';
// import { figmaBatchUpdateManager } from './FigmaBatchUpdateManager';
import { figmaNotifications } from '../../ui/components/organisms/Figma/FigmaNotification';

// 性能指标接口
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  interactionDelay: number;
  timestamp: number;
}

// 功能状态接口
interface FeatureState {
  enabled: boolean;
  initialized: boolean;
  lastError?: string;
  initializationTime?: number;
}

/**
 * UI增强功能管理器
 */
export class UIEnhancementManager {
  private static instance: UIEnhancementManager;
  private features: Map<UIFeature, FeatureState> = new Map();
  private performanceMonitoringActive = false;
  private performanceMetrics: PerformanceMetrics = {
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    interactionDelay: 0,
    timestamp: Date.now()
  };
  private performanceObserver?: PerformanceObserver;
  private fpsCounter = new FPSCounter();

  private constructor() {
    this.initializeFeatureStates();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): UIEnhancementManager {
    if (!UIEnhancementManager.instance) {
      UIEnhancementManager.instance = new UIEnhancementManager();
    }
    return UIEnhancementManager.instance;
  }

  /**
   * 初始化功能状态
   */
  private initializeFeatureStates(): void {
    Object.values(UIFeature).forEach(feature => {
      this.features.set(feature, {
        enabled: false,
        initialized: false
      });
    });
  }

  /**
   * 启用功能
   */
  async enableFeature(feature: UIFeature): Promise<void> {
    try {
      const state = this.features.get(feature);
      if (!state) {
        throw new Error(`未知功能: ${feature}`);
      }

      if (state.enabled) {
        return; // 已经启用
      }

      const startTime = performance.now();
      
      // 根据功能类型执行相应的初始化逻辑
      await this.initializeFeature(feature);

      const initTime = performance.now() - startTime;
      
      this.features.set(feature, {
        enabled: true,
        initialized: true,
        initializationTime: initTime
      });

      console.log(`UI功能 ${feature} 已启用 (${initTime.toFixed(2)}ms)`);
      // 关闭“功能已启用”通知弹窗
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.features.set(feature, {
        enabled: false,
        initialized: false,
        lastError: errorMessage
      });
      
      // 显示功能错误通知
      this.showFeatureError(feature, errorMessage);
      
      throw error;
    }
  }

  /**
   * 禁用功能
   */
  disableFeature(feature: UIFeature): void {
    const state = this.features.get(feature);
    if (!state || !state.enabled) {
      return; // 已经禁用或不存在
    }

    try {
      // 执行功能清理逻辑
      this.cleanupFeature(feature);

      this.features.set(feature, {
        enabled: false,
        initialized: false
      });

      console.log(`UI功能 ${feature} 已禁用`);
    } catch (error) {
      console.error(`禁用功能 ${feature} 时出错:`, error);
    }
  }

  /**
   * 检查功能是否启用
   */
  isFeatureEnabled(feature: UIFeature): boolean {
    const state = this.features.get(feature);
    return state?.enabled ?? false;
  }

  /**
   * 获取所有启用的功能
   */
  getEnabledFeatures(): UIFeature[] {
    return Array.from(this.features.entries())
      .filter(([, state]) => state.enabled)
      .map(([feature]) => feature);
  }

  /**
   * 获取功能状态
   */
  getFeatureState(feature: UIFeature): FeatureState | undefined {
    return this.features.get(feature);
  }

  /**
   * 禁用所有功能
   */
  disableAllFeatures(): void {
    this.getEnabledFeatures().forEach(feature => {
      this.disableFeature(feature);
    });
  }

  /**
   * 启动性能监控
   */
  startPerformanceMonitoring(): void {
    if (this.performanceMonitoringActive) {
      return;
    }

    this.performanceMonitoringActive = true;
    
    // 启动内置FPS计数器
    this.fpsCounter.start();
    this.startPerformanceObserver();
    this.startMemoryMonitoring();
    
    // 启动统一性能监控器
    try {
      unifiedPerformanceMonitor.startMonitoring();
      
      // 添加性能报告监听器
      unifiedPerformanceMonitor.addReportListener((report) => {
        this.handlePerformanceReport(report);
      });
      
      console.log('性能监控已启动 (包含Figma监控器)');
    } catch (error) {
      console.warn('Figma性能监控器启动失败:', error);
      console.log('性能监控已启动 (仅内置监控)');
    }
  }

  /**
   * 停止性能监控
   */
  stopPerformanceMonitoring(): void {
    if (!this.performanceMonitoringActive) {
      return;
    }

    this.performanceMonitoringActive = false;
    this.fpsCounter.stop();
    this.performanceObserver?.disconnect();
    
    // 停止统一性能监控器
    try {
      unifiedPerformanceMonitor.stopMonitoring();
    } catch (error) {
      console.warn('停止统一性能监控器失败:', error);
    }

    console.log('性能监控已停止');
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    if (!this.performanceMonitoringActive) {
      return this.performanceMetrics;
    }

    // 合并内置监控和统一监控的数据
    const unifiedMetrics = unifiedPerformanceMonitor.getMetrics();
    
    return {
      fps: (unifiedMetrics.fps ?? this.fpsCounter.getFPS()) as number,
      memoryUsage: (unifiedMetrics.memoryUsage ?? this.getMemoryUsage()) as number,
      renderTime: (unifiedMetrics.canvasRenderTime ?? this.performanceMetrics.renderTime) as number,
      interactionDelay: (unifiedMetrics.userInteractionDelay ?? this.performanceMetrics.interactionDelay) as number,
      timestamp: Date.now()
    };
  }

  /**
   * 初始化特定功能
   */
  private async initializeFeature(feature: UIFeature): Promise<void> {
    switch (feature) {
      case UIFeature.PERFORMANCE_MONITORING:
        // 性能监控功能已在管理器中实现
        break;
        
      case UIFeature.ACCESSIBILITY:
        await this.initializeAccessibility();
        break;
        
      case UIFeature.CUSTOM_LAYOUT:
        await this.initializeCustomLayout();
        break;
        
      case UIFeature.BATCH_UPDATES:
        await this.initializeBatchUpdates();
        break;
        
      case UIFeature.NOTIFICATIONS:
        await this.initializeNotifications();
        break;
        
      case UIFeature.ANIMATIONS:
        await this.initializeAnimations();
        break;
        
      case UIFeature.VIRTUALIZATION:
        await this.initializeVirtualization();
        break;
        
      case UIFeature.INTERACTIVE_COMPONENTS:
        await this.initializeInteractiveComponents();
        break;
        
      case UIFeature.TOOLTIPS:
        await this.initializeTooltips();
        break;
        
      case UIFeature.TRANSITIONS:
        await this.initializeTransitions();
        break;
        
      default:
        throw new Error(`未实现的功能初始化: ${feature}`);
    }
  }

  /**
   * 清理特定功能
   */
  private cleanupFeature(feature: UIFeature): void {
    switch (feature) {
      case UIFeature.PERFORMANCE_MONITORING:
        this.stopPerformanceMonitoring();
        break;
        
      case UIFeature.ACCESSIBILITY:
        this.cleanupAccessibility();
        break;
        
      case UIFeature.ANIMATIONS:
        this.cleanupAnimations();
        break;
        
      // 其他功能的清理逻辑
      default:
        // 默认清理逻辑
        break;
    }
  }

  /**
   * 初始化无障碍功能
   */
  private async initializeAccessibility(): Promise<void> {
    // 检查是否支持无障碍API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      console.log('无障碍功能已初始化');
    }
  }

  /**
   * 初始化自定义布局功能
   */
  private async initializeCustomLayout(): Promise<void> {
    // 加载布局配置
    console.log('自定义布局功能已初始化');
  }

  /**
   * 初始化批量更新功能
   */
  private async initializeBatchUpdates(): Promise<void> {
    try {
      // 批量更新管理器为按需使用，无需显式启动
      console.log('批量更新功能已初始化');
    } catch (error) {
      console.warn('批量更新管理器启动失败:', error);
      throw error;
    }
  }

  /**
   * 初始化通知功能
   */
  private async initializeNotifications(): Promise<void> {
    try {
      // 初始化通知系统
      console.log('通知功能已初始化');
      // 关闭“UI增强功能已启用”全局提示
    } catch (error) {
      console.warn('通知系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化动画功能
   */
  private async initializeAnimations(): Promise<void> {
    // 检查用户是否偏好减少动画
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-enabled', '1');
    }
    console.log('动画功能已初始化');
  }

  /**
   * 初始化虚拟化功能
   */
  private async initializeVirtualization(): Promise<void> {
    console.log('虚拟化功能已初始化');
  }

  /**
   * 初始化交互组件功能
   */
  private async initializeInteractiveComponents(): Promise<void> {
    console.log('交互组件功能已初始化');
  }

  /**
   * 初始化工具提示功能
   */
  private async initializeTooltips(): Promise<void> {
    console.log('工具提示功能已初始化');
  }

  /**
   * 初始化过渡动画功能
   */
  private async initializeTransitions(): Promise<void> {
    console.log('过渡动画功能已初始化');
  }

  /**
   * 清理无障碍功能
   */
  private cleanupAccessibility(): void {
    console.log('无障碍功能已清理');
  }

  /**
   * 清理动画功能
   */
  private cleanupAnimations(): void {
    document.documentElement.style.removeProperty('--animation-enabled');
    console.log('动画功能已清理');
  }

  /**
   * 启动性能观察器
   */
  private startPerformanceObserver(): void {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }

    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let totalRenderTime = 0;
      let renderCount = 0;

      entries.forEach(entry => {
        if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
          totalRenderTime += entry.duration;
          renderCount++;
        }
      });

      if (renderCount > 0) {
        this.performanceMetrics.renderTime = totalRenderTime / renderCount;
      }
    });

    try {
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('性能观察器启动失败:', error);
    }
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    const updateMemoryUsage = () => {
      if (this.performanceMonitoringActive) {
        this.performanceMetrics.memoryUsage = this.getMemoryUsage();
        setTimeout(updateMemoryUsage, 5000); // 每5秒更新一次
      }
    };
    updateMemoryUsage();
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  /**
   * 处理性能报告
   */
  private handlePerformanceReport(report: any): void {
    // 更新性能指标
    this.performanceMetrics = {
      fps: (report?.metrics?.canvasFPS ?? this.performanceMetrics.fps) as number,
      memoryUsage: (report?.metrics?.memoryUsage ?? this.performanceMetrics.memoryUsage) as number,
      renderTime: (report?.metrics?.canvasRenderTime ?? this.performanceMetrics.renderTime) as number,
      interactionDelay: (report?.metrics?.userInteractionDelay ?? this.performanceMetrics.interactionDelay) as number,
      timestamp: Date.now()
    };

    // 检查是否需要性能优化
    this.checkPerformanceThresholds(this.performanceMetrics);
  }

  /**
   * 检查性能阈值并触发优化
   */
  private checkPerformanceThresholds(metrics: PerformanceMetrics): void {
    const thresholds = {
      fps: { warning: 30, critical: 15 },
      memoryUsage: { warning: 200, critical: 400 },
      renderTime: { warning: 16.67, critical: 33.33 },
      interactionDelay: { warning: 100, critical: 300 }
    };

    // 首次指标为0时跳过（避免误报）
    if (!metrics || metrics.fps === 0) {
      return;
    }

    let needsOptimization = false;
    const issues: string[] = [];

    if (metrics.fps < thresholds.fps.critical) {
      needsOptimization = true;
      issues.push(`FPS过低: ${metrics.fps}`);
    }

    if (metrics.memoryUsage > thresholds.memoryUsage.critical) {
      needsOptimization = true;
      issues.push(`内存使用过高: ${metrics.memoryUsage}MB`);
    }

    if (metrics.renderTime > thresholds.renderTime.critical) {
      needsOptimization = true;
      issues.push(`渲染时间过长: ${metrics.renderTime.toFixed(2)}ms`);
    }

    if (metrics.interactionDelay > thresholds.interactionDelay.critical) {
      needsOptimization = true;
      issues.push(`交互延迟过高: ${metrics.interactionDelay.toFixed(2)}ms`);
    }

    if (needsOptimization) {
      // 降低噪音：仅记录调试日志，默认不弹窗
      console.debug('性能问题检测到:', issues);
      this.triggerPerformanceOptimization(issues);
    }
  }

  /**
   * 触发性能优化
   */
  private triggerPerformanceOptimization(issues: string[]): void {
    console.log('触发性能优化:', issues);

    // 禁用非关键动画
    if (this.isFeatureEnabled(UIFeature.ANIMATIONS)) {
      this.disableFeature(UIFeature.ANIMATIONS);
      console.log('已禁用动画以提升性能');
    }

    // 启用批量更新
    if (!this.isFeatureEnabled(UIFeature.BATCH_UPDATES)) {
      this.enableFeature(UIFeature.BATCH_UPDATES);
      console.log('已启用批量更新以提升性能');
    }

    // 默认不展示性能警告弹窗，避免干扰
  }

  /**
   * 测量交互延迟
   */
  measureInteractionDelay(interactionType: string): () => void {
    if (!this.performanceMonitoringActive) {
      return () => {};
    }

    return unifiedPerformanceMonitor.measureInteractionDelay(interactionType);
  }

  /**
   * 测量画布渲染性能
   */
  measureCanvasRender(): () => void {
    if (!this.performanceMonitoringActive) {
      return () => {};
    }

    const start = performance.now();
    return () => {
      // 使用监控器记录一次渲染测量（零回调，仅用于触发事件）
      try { unifiedPerformanceMonitor.measureCanvasRender(() => {}); } catch {}
      this.performanceMetrics.renderTime = performance.now() - start;
    };
  }

  /**
   * 测量工具切换性能
   */
  measureToolSwitch(toolName: string): () => void {
    if (!this.performanceMonitoringActive) {
      return () => {};
    }

    const start = performance.now();
    return () => {
      try { unifiedPerformanceMonitor.measureToolSwitch(toolName, () => {}); } catch {}
      // 将工具切换时间映射到交互延迟指标
      this.performanceMetrics.interactionDelay = performance.now() - start;
    };
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): any {
    if (!this.performanceMonitoringActive) {
      return null;
    }

    return unifiedPerformanceMonitor.generateReport();
  }

  /**
   * 显示通知
   */
  showNotification(options: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'ghost'; shortcut?: string }>;
  }): void {
    if (!this.isFeatureEnabled(UIFeature.NOTIFICATIONS)) {
      console.log('通知功能未启用，跳过通知:', options.title);
      return;
    }

    try {
      figmaNotifications.show({
        type: options.type,
        title: options.title,
        message: options.message,
        duration: options.duration || 4000,
        actions: options.actions ?? []
      });
    } catch (error) {
      console.error('显示通知失败:', error);
      // 降级到控制台输出
      console.log(`[${options.type.toUpperCase()}] ${options.title}: ${options.message}`);
    }
  }

  /**
   * 显示性能警告通知
   */
  showPerformanceWarning(issues: string[]): void {
    this.showNotification({
      type: 'warning',
      title: '性能警告',
      message: `检测到性能问题: ${issues.join(', ')}`,
      duration: 6000,
      actions: [
        {
          label: '优化设置',
          onClick: () => {
            console.log('打开性能优化设置');
            // 这里可以打开性能设置界面
          }
        },
        {
          label: '忽略',
          onClick: () => {
            console.log('忽略性能警告');
          }
        }
      ]
    });
  }

  /**
   * 显示功能错误通知
   */
  showFeatureError(feature: UIFeature, error: string): void {
    const featureNames: Record<UIFeature, string> = {
      [UIFeature.PERFORMANCE_MONITORING]: '性能监控',
      [UIFeature.ACCESSIBILITY]: '无障碍功能',
      [UIFeature.CUSTOM_LAYOUT]: '自定义布局',
      [UIFeature.BATCH_UPDATES]: '批量更新',
      [UIFeature.NOTIFICATIONS]: '通知系统',
      [UIFeature.ANIMATIONS]: '动画效果',
      [UIFeature.VIRTUALIZATION]: '虚拟化列表',
      [UIFeature.INTERACTIVE_COMPONENTS]: '交互组件',
      [UIFeature.TOOLTIPS]: '工具提示',
      [UIFeature.TRANSITIONS]: '过渡动画'
    };

    this.showNotification({
      type: 'error',
      title: `${featureNames[feature] || feature}功能错误`,
      message: error,
      duration: 8000,
      actions: [
        {
          label: '重试',
          onClick: () => {
            this.enableFeature(feature);
          }
        },
        {
          label: '禁用功能',
          onClick: () => {
            this.disableFeature(feature);
          }
        }
      ]
    });
  }

  /**
   * 显示功能恢复通知
   */
  showFeatureRecovery(feature: UIFeature): void {
    const featureNames: Record<UIFeature, string> = {
      [UIFeature.PERFORMANCE_MONITORING]: '性能监控',
      [UIFeature.ACCESSIBILITY]: '无障碍功能',
      [UIFeature.CUSTOM_LAYOUT]: '自定义布局',
      [UIFeature.BATCH_UPDATES]: '批量更新',
      [UIFeature.NOTIFICATIONS]: '通知系统',
      [UIFeature.ANIMATIONS]: '动画效果',
      [UIFeature.VIRTUALIZATION]: '虚拟化列表',
      [UIFeature.INTERACTIVE_COMPONENTS]: '交互组件',
      [UIFeature.TOOLTIPS]: '工具提示',
      [UIFeature.TRANSITIONS]: '过渡动画'
    };

    this.showNotification({
      type: 'success',
      title: '功能已恢复',
      message: `${featureNames[feature] || feature}功能已成功恢复`,
      duration: 3000
    });
  }
}

/**
 * FPS计数器
 */
class FPSCounter {
  private fps = 0;
  private frameCount = 0;
  private lastTime = 0;
  private animationId?: number;
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  getFPS(): number {
    return this.fps;
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.animationId = requestAnimationFrame(this.tick);
  };
}

export default UIEnhancementManager;