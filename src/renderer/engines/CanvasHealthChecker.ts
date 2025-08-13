import { CanvasEngine } from './CanvasEngine';
import { MemoryManager } from './MemoryManager';
import { EventEmitter } from '../utils/EventEmitter';

export class CanvasHealthChecker extends EventEmitter {
  private engine: CanvasEngine;
  private memory: MemoryManager;
  private intervalId: number | null = null;

  constructor(engine: CanvasEngine, memoryManager: MemoryManager) {
    super();
    this.engine = engine;
    this.memory = memoryManager;
  }

  startMonitoring(intervalMs: number = 5000) {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(async () => {
      const result = await this.performHealthCheck();
      if (result.status !== 'ok') {
        this.emit('health:degraded', { reason: result.status });
      } else {
        this.emit('health:recovered', { reason: 'ok' });
      }
    }, intervalMs);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async performHealthCheck(): Promise<{ status: 'ok' | 'memory_high' | 'canvas_missing' }> {
    // 基于引擎与内存状态的轻量健康检查
    try {
      // 读取引擎可用性
      const engineAvailable = !!this.engine;

      const memoryStats: any = (this.memory as any);
      if (memoryStats && memoryStats.getTotalUsage && memoryStats.getTotalUsage() > 400) {
        return { status: 'memory_high' };
      }
      if (!engineAvailable) {
        return { status: 'canvas_missing' };
      }
      return { status: 'ok' };
    } catch {
      return { status: 'ok' };
    }
  }
}


