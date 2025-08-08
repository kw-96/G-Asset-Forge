/**
 * DevDebugTools 单元测试
 */

import { DevDebugTools } from '../DevDebugTools';

// Mock依赖
jest.mock('../ReactLoopFix', () => ({
  reactLoopFixToolkit: {
    debugLogger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
  },
}));

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    },
    now: jest.fn(() => Date.now()),
  },
});

describe('DevDebugTools', () => {
  let debugTools: DevDebugTools;

  beforeEach(() => {
    debugTools = DevDebugTools.getInstance();
    debugTools.clearLogs();
    jest.clearAllMocks();
  });

  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = DevDebugTools.getInstance();
      const instance2 = DevDebugTools.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('启用/禁用功能', () => {
    it('应该正确启用调试工具', () => {
      debugTools.setEnabled(true);
      
      // 验证日志记录功能
      debugTools.logStateUpdate('TestComponent', 'setState', { count: 0 }, { count: 1 });
      
      const logs = debugTools.getStateUpdateLogs();
      expect(logs).toHaveLength(1);
    });

    it('应该在禁用时不记录日志', () => {
      debugTools.setEnabled(false);
      
      debugTools.logStateUpdate('TestComponent', 'setState', { count: 0 }, { count: 1 });
      
      const logs = debugTools.getStateUpdateLogs();
      expect(logs).toHaveLength(0);
    });
  });

  describe('状态更新日志', () => {
    beforeEach(() => {
      debugTools.setEnabled(true);
    });

    it('应该记录状态更新', () => {
      debugTools.logStateUpdate('TestComponent', 'setState', { count: 0 }, { count: 1 });
      
      const logs = debugTools.getStateUpdateLogs();
      expect(logs).toHaveLength(1);
      
      const log = logs[0];
      expect(log.component).toBe('TestComponent');
      expect(log.action).toBe('setState');
      expect(log.oldState).toEqual({ count: 0 });
      expect(log.newState).toEqual({ count: 1 });
      expect(log.renderCount).toBe(1);
    });

    it('应该检测可疑的状态更新模式', () => {
      // 快速连续的状态更新
      for (let i = 0; i < 15; i++) {
        debugTools.logStateUpdate('TestComponent', 'setState', { count: i }, { count: i + 1 });
      }
      
      const warnings = debugTools.getInfiniteLoopWarnings();
      expect(warnings.length).toBeGreaterThan(0);
      
      const warning = warnings.find(w => w.component === 'TestComponent');
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('high');
    });

    it('应该限制日志大小', () => {
      debugTools.setEnabled(true);
      
      // 添加大量日志
      for (let i = 0; i < 1200; i++) {
        debugTools.logStateUpdate(`Component${i}`, 'setState', {}, {});
      }
      
      const logs = debugTools.getStateUpdateLogs();
      expect(logs.length).toBeLessThanOrEqual(500); // 应该被限制
    });

    it('应该按组件过滤日志', () => {
      debugTools.logStateUpdate('Component1', 'setState', {}, {});
      debugTools.logStateUpdate('Component2', 'setState', {}, {});
      debugTools.logStateUpdate('Component1', 'setState', {}, {});
      
      const component1Logs = debugTools.getStateUpdateLogs('Component1');
      expect(component1Logs).toHaveLength(2);
      
      const component2Logs = debugTools.getStateUpdateLogs('Component2');
      expect(component2Logs).toHaveLength(1);
    });
  });

  describe('性能指标记录', () => {
    beforeEach(() => {
      debugTools.setEnabled(true);
    });

    it('应该记录性能指标', () => {
      debugTools.recordPerformanceMetrics('TestComponent', 25.5);
      
      const metrics = debugTools.getPerformanceMetrics('TestComponent');
      expect(metrics).toBeDefined();
      
      if (Array.isArray(metrics)) {
        expect(metrics).toHaveLength(1);
      } else {
        expect(metrics?.componentName).toBe('TestComponent');
        expect(metrics?.renderCount).toBe(1);
        expect(metrics?.lastRenderTime).toBe(25.5);
      }
    });

    it('应该检测性能问题', () => {
      // 记录慢渲染
      debugTools.recordPerformanceMetrics('SlowComponent', 100); // 100ms
      
      const warnings = debugTools.getInfiniteLoopWarnings();
      const performanceWarning = warnings.find(w => 
        w.component === 'SlowComponent' && w.message.includes('性能异常')
      );
      
      expect(performanceWarning).toBeDefined();
    });

    it('应该计算平均渲染时间', () => {
      debugTools.recordPerformanceMetrics('TestComponent', 10);
      debugTools.recordPerformanceMetrics('TestComponent', 20);
      debugTools.recordPerformanceMetrics('TestComponent', 30);
      
      const metrics = debugTools.getPerformanceMetrics('TestComponent');
      if (!Array.isArray(metrics)) {
        expect(metrics?.averageRenderTime).toBe(20);
        expect(metrics?.renderCount).toBe(3);
      }
    });
  });

  describe('无限循环警告', () => {
    beforeEach(() => {
      debugTools.setEnabled(true);
    });

    it('应该创建无限循环警告', () => {
      debugTools.createInfiniteLoopWarning(
        'TestComponent',
        '检测到无限循环',
        'critical',
        ['检查useEffect依赖']
      );
      
      const warnings = debugTools.getInfiniteLoopWarnings();
      expect(warnings).toHaveLength(1);
      
      const warning = warnings[0];
      expect(warning.component).toBe('TestComponent');
      expect(warning.message).toBe('检测到无限循环');
      expect(warning.severity).toBe('critical');
      expect(warning.suggestions).toContain('检查useEffect依赖');
    });

    it('应该按组件过滤警告', () => {
      debugTools.createInfiniteLoopWarning('Component1', '警告1', 'medium');
      debugTools.createInfiniteLoopWarning('Component2', '警告2', 'high');
      debugTools.createInfiniteLoopWarning('Component1', '警告3', 'low');
      
      const component1Warnings = debugTools.getInfiniteLoopWarnings('Component1');
      expect(component1Warnings).toHaveLength(2);
      
      const component2Warnings = debugTools.getInfiniteLoopWarnings('Component2');
      expect(component2Warnings).toHaveLength(1);
    });

    it('应该限制警告数量', () => {
      // 添加大量警告
      for (let i = 0; i < 120; i++) {
        debugTools.createInfiniteLoopWarning(`Component${i}`, `警告${i}`, 'medium');
      }
      
      const warnings = debugTools.getInfiniteLoopWarnings();
      expect(warnings.length).toBeLessThanOrEqual(50); // 应该被限制
    });
  });

  describe('调试报告生成', () => {
    beforeEach(() => {
      debugTools.setEnabled(true);
    });

    it('应该生成完整的调试报告', () => {
      // 添加一些测试数据
      debugTools.logStateUpdate('Component1', 'setState', {}, {});
      debugTools.recordPerformanceMetrics('Component1', 25);
      debugTools.createInfiniteLoopWarning('Component1', '测试警告', 'medium');
      
      const report = debugTools.generateDebugReport();
      
      expect(report.summary.totalStateUpdates).toBe(1);
      expect(report.summary.totalComponents).toBe(1);
      expect(report.summary.totalWarnings).toBe(1);
      expect(report.recentStateUpdates).toHaveLength(1);
      expect(report.performanceMetrics).toHaveLength(1);
      expect(report.recentWarnings).toHaveLength(1);
    });

    it('应该生成优化建议', () => {
      // 创建性能问题
      for (let i = 0; i < 5; i++) {
        debugTools.recordPerformanceMetrics('SlowComponent', 100);
      }
      
      // 创建严重警告
      debugTools.createInfiniteLoopWarning('CriticalComponent', '严重问题', 'critical');
      
      const report = debugTools.generateDebugReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(rec => rec.includes('严重'))).toBe(true);
    });
  });

  describe('清理功能', () => {
    beforeEach(() => {
      debugTools.setEnabled(true);
    });

    it('应该清除所有日志', () => {
      debugTools.logStateUpdate('TestComponent', 'setState', {}, {});
      debugTools.recordPerformanceMetrics('TestComponent', 25);
      debugTools.createInfiniteLoopWarning('TestComponent', '测试警告', 'medium');
      
      debugTools.clearLogs();
      
      expect(debugTools.getStateUpdateLogs()).toHaveLength(0);
      expect(debugTools.getPerformanceMetrics()).toHaveLength(0);
      expect(debugTools.getInfiniteLoopWarnings()).toHaveLength(0);
    });
  });

  describe('错误处理', () => {
    beforeEach(() => {
      debugTools.setEnabled(true);
    });

    it('应该处理循环引用的状态', () => {
      const circularState: any = { name: 'test' };
      circularState.self = circularState;
      
      expect(() => {
        debugTools.logStateUpdate('TestComponent', 'setState', {}, circularState);
      }).not.toThrow();
      
      const logs = debugTools.getStateUpdateLogs();
      expect(logs).toHaveLength(1);
    });

    it('应该处理包含函数的状态', () => {
      const stateWithFunction = {
        data: 'test',
        callback: () => console.log('test'),
      };
      
      expect(() => {
        debugTools.logStateUpdate('TestComponent', 'setState', {}, stateWithFunction);
      }).not.toThrow();
      
      const logs = debugTools.getStateUpdateLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].newState.callback).toBe('[Function]');
    });

    it('应该处理Error对象', () => {
      const stateWithError = {
        error: new Error('测试错误'),
      };
      
      expect(() => {
        debugTools.logStateUpdate('TestComponent', 'setState', {}, stateWithError);
      }).not.toThrow();
      
      const logs = debugTools.getStateUpdateLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].newState.error).toContain('[Error: 测试错误]');
    });
  });

  describe('内存监控', () => {
    beforeEach(() => {
      debugTools.setEnabled(true);
    });

    it('应该监控内存使用', (done) => {
      // Mock高内存使用
      Object.defineProperty(global.performance, 'memory', {
        value: {
          usedJSHeapSize: 150 * 1024 * 1024, // 150MB
        },
      });
      
      // 等待内存监控触发
      setTimeout(() => {
        const warnings = debugTools.getInfiniteLoopWarnings();
        const memoryWarning = warnings.find(w => w.component === 'Memory');
        expect(memoryWarning).toBeDefined();
        done();
      }, 100);
    });
  });
});