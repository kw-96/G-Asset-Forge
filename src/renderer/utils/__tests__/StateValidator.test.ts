/**
 * StateValidator 单元测试
 */

import { StateValidator } from '../StateValidator';

describe('StateValidator', () => {
  let validator: StateValidator;

  beforeEach(() => {
    validator = new StateValidator({
      enableLogging: false, // 测试时禁用日志
      rapidUpdateThreshold: 5,
      rapidUpdateWindow: 1000,
    });
  });

  describe('状态更新验证', () => {
    it('应该检测到值没有变化的情况', () => {
      const result = validator.validateStateUpdate('test.value', 'same', 'same');
      expect(result).toBe(false);
    });

    it('应该允许值有变化的更新', () => {
      const result = validator.validateStateUpdate('test.value', 'old', 'new');
      expect(result).toBe(true);
    });

    it('应该正确比较对象值', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const obj3 = { a: 1, b: 3 };

      expect(validator.validateStateUpdate('test.obj', obj1, obj2)).toBe(false);
      expect(validator.validateStateUpdate('test.obj', obj1, obj3)).toBe(true);
    });

    it('应该记录状态更新历史', () => {
      validator.validateStateUpdate('test.value', 'old', 'new', 'TestComponent');
      
      const history = validator.getUpdateHistory();
      expect(history).toHaveLength(1);
      expect(history[0].statePath).toBe('test.value');
      expect(history[0].prevValue).toBe('old');
      expect(history[0].nextValue).toBe('new');
      expect(history[0].componentName).toBe('TestComponent');
    });
  });

  describe('快速连续更新检测', () => {
    it('应该检测到快速连续更新', () => {
      // 快速连续更新同一个状态路径
      for (let i = 0; i < 6; i++) {
        validator.validateStateUpdate('test.rapid', i, i + 1);
      }

      const patterns = validator.getSuspiciousPatterns();
      const rapidUpdates = patterns.filter(p => p.type === 'rapid_updates');
      expect(rapidUpdates.length).toBeGreaterThan(0);
    });

    it('应该正确设置可疑模式的严重程度', () => {
      // 大量快速更新
      for (let i = 0; i < 25; i++) {
        validator.validateStateUpdate('test.severity', i, i + 1);
      }

      const patterns = validator.getSuspiciousPatterns();
      const highSeverity = patterns.find(p => p.severity === 'high');
      expect(highSeverity).toBeDefined();
    });
  });

  describe('无限循环检测', () => {
    it('应该检测到无限循环模式', () => {
      // 模拟无限循环：同一个状态路径频繁更新
      for (let i = 0; i < 12; i++) {
        validator.validateStateUpdate('test.loop', i % 2, (i + 1) % 2);
      }

      const hasLoop = validator.detectInfiniteLoop();
      expect(hasLoop).toBe(true);
    });

    it('应该在正常更新时不报告无限循环', () => {
      validator.validateStateUpdate('test.normal1', 'a', 'b');
      validator.validateStateUpdate('test.normal2', 'c', 'd');
      validator.validateStateUpdate('test.normal3', 'e', 'f');

      const hasLoop = validator.detectInfiniteLoop();
      expect(hasLoop).toBe(false);
    });
  });

  describe('循环依赖检测', () => {
    it('应该检测到循环依赖', () => {
      // 模拟循环依赖：A -> B -> C -> A
      validator.validateStateUpdate('state.A', 1, 2);
      validator.validateStateUpdate('state.B', 1, 2);
      validator.validateStateUpdate('state.C', 1, 2);
      validator.validateStateUpdate('state.A', 2, 3); // 回到A，形成循环

      const patterns = validator.getSuspiciousPatterns();
      const circularDeps = patterns.filter(p => p.type === 'circular_dependency');
      expect(circularDeps.length).toBeGreaterThan(0);
    });
  });

  describe('警告回调', () => {
    it('应该触发警告回调', (done) => {
      validator.onWarning((pattern) => {
        expect(pattern.type).toBe('rapid_updates');
        done();
      });

      // 触发快速更新警告
      for (let i = 0; i < 6; i++) {
        validator.validateStateUpdate('test.callback', i, i + 1);
      }
    });

    it('应该能够移除警告回调', () => {
      const callback = jest.fn();
      validator.onWarning(callback);
      validator.removeWarning(callback);

      // 触发快速更新
      for (let i = 0; i < 6; i++) {
        validator.validateStateUpdate('test.remove', i, i + 1);
      }

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('历史记录管理', () => {
    it('应该限制历史记录大小', () => {
      const smallValidator = new StateValidator({ maxHistorySize: 5 });

      // 添加超过限制的记录
      for (let i = 0; i < 10; i++) {
        smallValidator.validateStateUpdate(`test.${i}`, i, i + 1);
      }

      const history = smallValidator.getUpdateHistory();
      expect(history.length).toBe(5);
    });

    it('应该能够清除历史记录', () => {
      validator.validateStateUpdate('test.clear', 'old', 'new');
      expect(validator.getUpdateHistory().length).toBe(1);

      validator.clearHistory();
      expect(validator.getUpdateHistory().length).toBe(0);
      expect(validator.getSuspiciousPatterns().length).toBe(0);
    });
  });

  describe('报告生成', () => {
    it('应该生成正确的验证报告', () => {
      // 添加一些更新
      validator.validateStateUpdate('test.report1', 'a', 'b');
      validator.validateStateUpdate('test.report2', 'c', 'd');

      // 触发可疑模式
      for (let i = 0; i < 6; i++) {
        validator.validateStateUpdate('test.suspicious', i, i + 1);
      }

      const report = validator.generateReport();
      expect(report.totalUpdates).toBeGreaterThan(0);
      expect(report.suspiciousPatterns).toBeGreaterThan(0);
      expect(report.recentUpdates.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('可疑更新日志', () => {
    it('应该记录可疑更新', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const loggingValidator = new StateValidator({ enableLogging: true });

      const updates = [
        {
          timestamp: Date.now(),
          statePath: 'test.suspicious',
          prevValue: 'old',
          nextValue: 'new',
          componentName: 'TestComponent',
        },
      ];

      loggingValidator.logSuspiciousUpdates(updates);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});