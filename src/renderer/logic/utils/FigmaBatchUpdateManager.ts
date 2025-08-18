/**
 * Figma风格批量更新管理器
 * 优化界面更新性能，确保60fps流畅渲染
 */

// 更新优先级枚举
export enum UpdatePriority {
  HIGH = 'high',      // 用户交互相关，需要立即执行
  NORMAL = 'normal',  // 常规UI更新
  LOW = 'low'         // 后台任务，可以延迟执行
}

// 更新任务接口
export interface UpdateTask {
  id: string;
  priority: UpdatePriority;
  callback: () => void | Promise<void>;
  timestamp: number;
  timeout?: number;
  dependencies?: string[];
  category?: 'canvas' | 'ui' | 'data' | 'animation';
}

// 批量更新配置接口
export interface BatchUpdateConfig {
  maxBatchSize: number;
  frameTimeLimit: number; // 每帧最大执行时间(毫秒)
  highPriorityTimeSlice: number; // 高优先级任务时间片
  normalPriorityTimeSlice: number; // 普通优先级任务时间片
  lowPriorityTimeSlice: number; // 低优先级任务时间片
  enableProfiling: boolean; // 是否启用性能分析
}

// 性能统计接口
export interface PerformanceStats {
  totalTasks: number;
  completedTasks: number;
  averageExecutionTime: number;
  frameDrops: number;
  queueSize: number;
  lastFrameTime: number;
}

// 默认配置
const DEFAULT_CONFIG: BatchUpdateConfig = {
  maxBatchSize: 50,
  frameTimeLimit: 16, // 60fps = 16.67ms per frame
  highPriorityTimeSlice: 8,
  normalPriorityTimeSlice: 6,
  lowPriorityTimeSlice: 2,
  enableProfiling: process.env['NODE_ENV'] === 'development'
};

/**
 * Figma风格批量更新管理器类
 */
export class FigmaBatchUpdateManager {
  private config: BatchUpdateConfig;
  private taskQueues: Map<UpdatePriority, UpdateTask[]>;
  private pendingTasks: Map<string, UpdateTask>;
  private isProcessing: boolean;
  private frameId: number | null;
  private stats: PerformanceStats;
  private listeners: Set<(stats: PerformanceStats) => void>;
  private lastFrameStart: number;
  
  constructor(config: Partial<BatchUpdateConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.taskQueues = new Map([
      [UpdatePriority.HIGH, []],
      [UpdatePriority.NORMAL, []],
      [UpdatePriority.LOW, []]
    ]);
    this.pendingTasks = new Map();
    this.isProcessing = false;
    this.frameId = null;
    this.listeners = new Set();
    this.lastFrameStart = 0;
    
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      averageExecutionTime: 0,
      frameDrops: 0,
      queueSize: 0,
      lastFrameTime: 0
    };
    
    // 绑定方法
    this.processFrame = this.processFrame.bind(this);
  }
  
  /**
   * 添加更新任务
   */
  addTask(task: Omit<UpdateTask, 'timestamp'>): string {
    const fullTask: UpdateTask = {
      ...task,
      timestamp: performance.now()
    };
    
    // 检查依赖关系
    if (fullTask.dependencies?.length) {
      const unmetDependencies = fullTask.dependencies.filter(
        dep => this.pendingTasks.has(dep)
      );
      
      if (unmetDependencies.length > 0) {
        // 等待依赖完成
        this.pendingTasks.set(fullTask.id, fullTask);
        return fullTask.id;
      }
    }
    
    // 添加到对应优先级队列
    const queue = this.taskQueues.get(fullTask.priority);
    if (queue) {
      queue.push(fullTask);
      this.stats.totalTasks++;
      this.updateQueueSize();
    }
    
    // 启动处理循环
    this.scheduleProcessing();
    
    return fullTask.id;
  }
  
  /**
   * 添加画布更新任务
   */
  addCanvasUpdate(id: string, callback: () => void, priority: UpdatePriority = UpdatePriority.HIGH): string {
    return this.addTask({
      id,
      priority,
      callback,
      category: 'canvas'
    });
  }
  
  /**
   * 添加UI更新任务
   */
  addUIUpdate(id: string, callback: () => void, priority: UpdatePriority = UpdatePriority.NORMAL): string {
    return this.addTask({
      id,
      priority,
      callback,
      category: 'ui'
    });
  }
  
  /**
   * 添加数据更新任务
   */
  addDataUpdate(id: string, callback: () => void, priority: UpdatePriority = UpdatePriority.LOW): string {
    return this.addTask({
      id,
      priority,
      callback,
      category: 'data'
    });
  }
  
  /**
   * 添加动画更新任务
   */
  addAnimationUpdate(id: string, callback: () => void): string {
    return this.addTask({
      id,
      priority: UpdatePriority.HIGH,
      callback,
      category: 'animation'
    });
  }
  
  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    // 从待处理任务中移除
    if (this.pendingTasks.has(taskId)) {
      this.pendingTasks.delete(taskId);
      return true;
    }
    
    // 从队列中移除
    for (const queue of this.taskQueues.values()) {
      const index = queue.findIndex(task => task.id === taskId);
      if (index !== -1) {
        queue.splice(index, 1);
        this.updateQueueSize();
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 清空所有任务
   */
  clearAllTasks(): void {
    for (const queue of this.taskQueues.values()) {
      queue.length = 0;
    }
    this.pendingTasks.clear();
    this.updateQueueSize();
  }
  
  /**
   * 清空指定优先级的任务
   */
  clearTasksByPriority(priority: UpdatePriority): void {
    const queue = this.taskQueues.get(priority);
    if (queue) {
      queue.length = 0;
      this.updateQueueSize();
    }
  }
  
  /**
   * 清空指定类别的任务
   */
  clearTasksByCategory(category: string): void {
    for (const queue of this.taskQueues.values()) {
      for (let i = queue.length - 1; i >= 0; i--) {
        if (queue[i]?.category === category) {
          queue.splice(i, 1);
        }
      }
    }
    this.updateQueueSize();
  }
  
  /**
   * 获取队列状态
   */
  getQueueStatus(): { [key in UpdatePriority]: number } {
    return {
      [UpdatePriority.HIGH]: this.taskQueues.get(UpdatePriority.HIGH)?.length || 0,
      [UpdatePriority.NORMAL]: this.taskQueues.get(UpdatePriority.NORMAL)?.length || 0,
      [UpdatePriority.LOW]: this.taskQueues.get(UpdatePriority.LOW)?.length || 0
    };
  }
  
  /**
   * 获取性能统计
   */
  getStats(): PerformanceStats {
    return { ...this.stats };
  }
  
  /**
   * 添加性能监听器
   */
  addStatsListener(listener: (stats: PerformanceStats) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * 调度处理
   */
  private scheduleProcessing(): void {
    if (!this.isProcessing && this.frameId === null) {
      this.frameId = requestAnimationFrame(this.processFrame);
    }
  }
  
  /**
   * 处理一帧的任务
   */
  private processFrame(): void {
    this.frameId = null;
    this.isProcessing = true;
    this.lastFrameStart = performance.now();
    
    const frameStartTime = this.lastFrameStart;
    let remainingTime = this.config.frameTimeLimit;
    
    try {
      // 按优先级处理任务
      remainingTime = this.processPriorityQueue(UpdatePriority.HIGH, remainingTime, this.config.highPriorityTimeSlice);
      remainingTime = this.processPriorityQueue(UpdatePriority.NORMAL, remainingTime, this.config.normalPriorityTimeSlice);
      remainingTime = this.processPriorityQueue(UpdatePriority.LOW, remainingTime, this.config.lowPriorityTimeSlice);
      
      // 处理待处理任务
      this.processPendingTasks();
      
    } catch (error) {
      console.error('批量更新处理错误:', error);
    } finally {
      this.isProcessing = false;
      
      // 更新性能统计
      const frameTime = performance.now() - frameStartTime;
      this.stats.lastFrameTime = frameTime;
      
      if (frameTime > this.config.frameTimeLimit) {
        this.stats.frameDrops++;
      }
      
      this.updateQueueSize();
      this.notifyListeners();
      
      // 如果还有任务，继续调度
      if (this.hasRemainingTasks()) {
        this.scheduleProcessing();
      }
    }
  }
  
  /**
   * 处理指定优先级的任务队列
   */
  private processPriorityQueue(priority: UpdatePriority, remainingTime: number, timeSlice: number): number {
    const queue = this.taskQueues.get(priority);
    if (!queue || queue.length === 0) {
      return remainingTime;
    }
    
    const allocatedTime = Math.min(remainingTime, timeSlice);
    const startTime = performance.now();
    
    while (queue.length > 0 && (performance.now() - startTime) < allocatedTime) {
      const task = queue.shift();
      if (task) {
        this.executeTask(task);
      }
    }
    
    return remainingTime - (performance.now() - startTime);
  }
  
  /**
   * 执行单个任务
   */
  private async executeTask(task: UpdateTask): Promise<void> {
    const startTime = performance.now();
    
    try {
      // 检查任务是否超时
      if (task.timeout && (startTime - task.timestamp) > task.timeout) {
        console.warn(`任务 ${task.id} 已超时，跳过执行`);
        return;
      }
      
      // 执行任务
      await task.callback();
      
      // 更新统计
      this.stats.completedTasks++;
      const executionTime = performance.now() - startTime;
      this.stats.averageExecutionTime = 
        (this.stats.averageExecutionTime * (this.stats.completedTasks - 1) + executionTime) / this.stats.completedTasks;
      
      // 性能分析
      if (this.config.enableProfiling && executionTime > 5) {
        console.log(`任务 ${task.id} 执行时间: ${executionTime.toFixed(2)}ms`);
      }
      
    } catch (error) {
      console.error(`任务 ${task.id} 执行失败:`, error);
    }
  }
  
  /**
   * 处理待处理任务
   */
  private processPendingTasks(): void {
    const readyTasks: UpdateTask[] = [];
    
    for (const [taskId, task] of this.pendingTasks.entries()) {
      const unmetDependencies = task.dependencies?.filter(
        dep => this.pendingTasks.has(dep)
      ) || [];
      
      if (unmetDependencies.length === 0) {
        readyTasks.push(task);
        this.pendingTasks.delete(taskId);
      }
    }
    
    // 将就绪的任务添加到对应队列
    for (const task of readyTasks) {
      const queue = this.taskQueues.get(task.priority);
      if (queue) {
        queue.push(task);
      }
    }
  }
  
  /**
   * 检查是否还有剩余任务
   */
  private hasRemainingTasks(): boolean {
    for (const queue of this.taskQueues.values()) {
      if (queue.length > 0) return true;
    }
    return this.pendingTasks.size > 0;
  }
  
  /**
   * 更新队列大小统计
   */
  private updateQueueSize(): void {
    let totalSize = 0;
    for (const queue of this.taskQueues.values()) {
      totalSize += queue.length;
    }
    totalSize += this.pendingTasks.size;
    this.stats.queueSize = totalSize;
  }
  
  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.stats);
      } catch (error) {
        console.error('性能监听器错误:', error);
      }
    }
  }
  
  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    
    this.clearAllTasks();
    this.listeners.clear();
    this.isProcessing = false;
  }
}

// 创建全局实例
export const figmaBatchUpdateManager = new FigmaBatchUpdateManager();

// 便捷方法
export const addCanvasUpdate = (id: string, callback: () => void, priority?: UpdatePriority) => 
  figmaBatchUpdateManager.addCanvasUpdate(id, callback, priority);

export const addUIUpdate = (id: string, callback: () => void, priority?: UpdatePriority) => 
  figmaBatchUpdateManager.addUIUpdate(id, callback, priority);

export const addDataUpdate = (id: string, callback: () => void, priority?: UpdatePriority) => 
  figmaBatchUpdateManager.addDataUpdate(id, callback, priority);

export const addAnimationUpdate = (id: string, callback: () => void) => 
  figmaBatchUpdateManager.addAnimationUpdate(id, callback);

// React Hook
export const useBatchUpdateManager = () => {
  return {
    addTask: figmaBatchUpdateManager.addTask.bind(figmaBatchUpdateManager),
    addCanvasUpdate: figmaBatchUpdateManager.addCanvasUpdate.bind(figmaBatchUpdateManager),
    addUIUpdate: figmaBatchUpdateManager.addUIUpdate.bind(figmaBatchUpdateManager),
    addDataUpdate: figmaBatchUpdateManager.addDataUpdate.bind(figmaBatchUpdateManager),
    addAnimationUpdate: figmaBatchUpdateManager.addAnimationUpdate.bind(figmaBatchUpdateManager),
    cancelTask: figmaBatchUpdateManager.cancelTask.bind(figmaBatchUpdateManager),
    getStats: figmaBatchUpdateManager.getStats.bind(figmaBatchUpdateManager),
    getQueueStatus: figmaBatchUpdateManager.getQueueStatus.bind(figmaBatchUpdateManager)
  };
};

export default FigmaBatchUpdateManager;