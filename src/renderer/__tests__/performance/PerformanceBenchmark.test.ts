/**
 * 性能基准测试
 * 验证修复后的应用性能不受影响
 */

import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../../stores/appStore';
import { InitializationManager } from '../../utils/InitializationManager';
import { devDebugTools } from '../../utils/DevDebugTools';
import { radixUIPerformanceMonitor } from '../../utils/RadixUIPerformanceMonitor';

// Mock依赖
jest.mock('../../utils/DebugLogger');
jest.mock('../../utils/StateValidator');

describe('性能基准测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初始化性能', () => {
    it('应该在合理时间内完成初始化', async () => {
      const manager = InitializationManager.getInstance();
      manager.reset();
      
      const startTime = Date.now();
      
      await manager.initializeOnce('performance-test', async () => {
        // 模拟初始化工作
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'initialized';
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
      expect(manager.isInitialized('performance-test')).toBe(true);
    });

    it('应该高效处理大量并发初始化请求', async () => {
      const manager = InitializationManager.getInstance();
      manager.reset();
      
      const startTime = Date.now();
      
      // 创建100个并发初始化请求
      const promises = Array.from({ length: 100 }, (_, i) => 
        manager.initializeOnce(`test-${i}`, async () => {
          await new Promise(resolve => setTimeout(resolve, 1));
          return `result-${i}`;
        })
      );
      
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
      expect(results).toHaveLength(100);
      expect(results.every((result, i) => result === `result-${i}`)).toBe(true);
    });
  });

  describe('状态管理性能', () => {
    it('应该高效处理频繁的状态更新', async () => {
      const { result } = renderHook(() => useAppStore());
      
      const startTime = Date.now();
      
      // 执行1000次状态更新
      await act(async () => {
        for (let i = 0; i < 1000; i++) {
          result.current.setTheme(i % 2 === 0 ? 'light' : 'dark');
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
      expect(result.current.theme).toBe('light'); // 最终状态正确
    });

    it('应该高效处理批量状态更新', async () => {
      const { result } = renderHook(() => useAppStore());
      
      const startTime = Date.now();
      
      // 执行100次批量更新
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          result.current.batchUpdate((state) => {
            state.theme = i % 2 === 0 ? 'light' : 'dark';
            state.language = i % 2 === 0 ? 'zh-CN' : 'en-US';
          });
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // 批量更新应该更快
      expect(result.current.theme).toBe('light');
      expect(result.current.language).toBe('zh-CN');
    });
  });

  describe('调试工具性能', () => {
    it('应该高效记录大量调试日志', () => {
      devDebugTools.setEnabled(true);
      devDebugTools.clearLogs();
      
      const startTime = Date.now();
      
      // 记录1000条状态更新日志
      for (let i = 0; i < 1000; i++) {
        devDebugTools.logStateUpdate(
          `Component${i % 10}`,
          'setState',
          { count: i },
          { count: i + 1 }
        );
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
      
      const logs = devDebugTools.getStateUpdateLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.length).toBeLessThanOrEqual(1000);
    });

    it('应该高效记录性能指标', () => {
      devDebugTools.setEnabled(true);
      
      const startTime = Date.now();
      
      // 记录1000个性能指标
      for (let i = 0; i < 1000; i++) {
        devDebugTools.recordPerformanceMetrics(`Component${i % 10}`, Math.random() * 50);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // 应该在500ms内完成
      
      const metrics = devDebugTools.getPerformanceMetrics();
      expect(Array.isArray(metrics) ? metrics.length : 1).toBeGreaterThan(0);
    });

    it('应该快速生成调试报告', () => {
      devDebugTools.setEnabled(true);
      devDebugTools.clearLogs();
      
      // 添加一些测试数据
      for (let i = 0; i < 100; i++) {
        devDebugTools.logStateUpdate(`Component${i % 5}`, 'setState', {}, {});
        devDebugTools.recordPerformanceMetrics(`Component${i % 5}`, Math.random() * 50);
      }
      
      const startTime = Date.now();
      const report = devDebugTools.generateDebugReport();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
      
      expect(report.summary.totalStateUpdates).toBe(100);
      expect(report.summary.totalComponents).toBeGreaterThan(0);
    });
  });

  describe('Radix UI性能监控', () => {
    it('应该高效监控组件性能', () => {
      const startTime = Date.now();
      
      // 模拟1000次组件渲染监控
      for (let i = 0; i < 1000; i++) {
        const endMeasurement = radixUIPerformanceMonitor.startMonitoring(`Component${i % 10}`);
        // 模拟渲染时间
        setTimeout(() => endMeasurement(), 1);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // 应该在500ms内完成
    });

    it('应该快速生成性能报告', () => {
      // 添加一些测试数据
      for (let i = 0; i < 50; i++) {
        const endMeasurement = radixUIPerformanceMonitor.startMonitoring(`Component${i % 5}`);
        endMeasurement();
      }
      
      const startTime = Date.now();
      const report = radixUIPerformanceMonitor.generatePerformanceReport();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // 应该在50ms内完成
      
      expect(report.summary.totalComponents).toBeGreaterThan(0);
    });
  });

  describe('内存使用性能', () => {
    it('应该保持合理的内存使用', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 执行大量操作
      const manager = InitializationManager.getInstance();
      for (let i = 0; i < 1000; i++) {
        manager.initializeOnce(`test-${i}`, () => Promise.resolve(`result-${i}`));
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // 内存增长应该在合理范围内（小于10MB）
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('应该正确清理资源', () => {
      devDebugTools.setEnabled(true);
      
      // 添加大量数据
      for (let i = 0; i < 1000; i++) {
        devDebugTools.logStateUpdate(`Component${i}`, 'setState', {}, {});
        devDebugTools.recordPerformanceMetrics(`Component${i}`, Math.random() * 50);
      }
      
      const beforeClear = devDebugTools.getStateUpdateLogs().length;
      expect(beforeClear).toBeGreaterThan(0);
      
      // 清理资源
      devDebugTools.clearLogs();
      
      const afterClear = devDebugTools.getStateUpdateLogs().length;
      expect(afterClear).toBe(0);
    });
  });

  describe('并发性能', () => {
    it('应该高效处理并发状态更新', async () => {
      const { result } = renderHook(() => useAppStore());
      
      const startTime = Date.now();
      
      // 创建100个并发状态更新
      const promises = Array.from({ length: 100 }, (_, i) => 
        act(async () => {
          result.current.setTheme(i % 2 === 0 ? 'light' : 'dark');
          result.current.setLanguage(i % 2 === 0 ? 'zh-CN' : 'en-US');
        })
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该安全处理并发调试日志记录', () => {
      devDebugTools.setEnabled(true);
      devDebugTools.clearLogs();
      
      const startTime = Date.now();
      
      // 并发记录日志
      const promises = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve().then(() => {
          devDebugTools.logStateUpdate(`Component${i}`, 'setState', { i }, { i: i + 1 });
          devDebugTools.recordPerformanceMetrics(`Component${i}`, Math.random() * 50);
        })
      );
      
      return Promise.all(promises).then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(500); // 应该在500ms内完成
        
        const logs = devDebugTools.getStateUpdateLogs();
        expect(logs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('长期运行性能', () => {
    it('应该在长期运行中保持性能', async () => {
      const { result } = renderHook(() => useAppStore());
      devDebugTools.setEnabled(true);
      
      const iterations = 10;
      const operationsPerIteration = 100;
      const durations: number[] = [];
      
      for (let iteration = 0; iteration < iterations; iteration++) {
        const startTime = Date.now();
        
        await act(async () => {
          for (let i = 0; i < operationsPerIteration; i++) {
            result.current.setTheme(i % 2 === 0 ? 'light' : 'dark');
            devDebugTools.logStateUpdate('TestComponent', 'setState', { i }, { i: i + 1 });
          }
        });
        
        const endTime = Date.now();
        durations.push(endTime - startTime);
      }
      
      // 验证性能没有显著下降
      const firstHalf = durations.slice(0, iterations / 2);
      const secondHalf = durations.slice(iterations / 2);
      
      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d, 0) / secondHalf.length;
      
      // 后半部分的平均时间不应该比前半部分慢太多（允许20%的性能下降）
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.2);
    });
  });
});