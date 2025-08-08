/**
 * ReactLoopFix 工具集单元测试
 */

import { ReactLoopFixToolkit } from '../ReactLoopFix';

describe('ReactLoopFixToolkit', () => {
  let toolkit: ReactLoopFixToolkit;

  beforeEach(() => {
    // 重置单例实例
    (ReactLoopFixToolkit as any).instance = null;
    toolkit = ReactLoopFixToolkit.getInstance();
  });

  afterEach(() => {
    toolkit.destroy();
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = ReactLoopFixToolkit.getInstance();
      const instance2 = ReactLoopFixToolkit.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('应用初始化', () => {
    it('应该成功初始化应用', async () => {
      const mockInit = jest.fn().mockResolvedValue(undefined);
      
      await toolkit.initializeAppOnce(mockInit);
      
      expect(mockInit).toHaveBeenCalledTimes(1);
      expect(toolkit.initManager.isInitialized).toBe(true);
    });

    it('应该防止重复初始化', async () => {
      const mockInit = jest.fn().mockResolvedValue(undefined);
      
      await toolkit.initializeAppOnce(mockInit);
      await toolkit.initializeAppOnce(mockInit);
      
      expect(mockInit).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理初始化错误', async () => {
      const mockInit = jest.fn().mockRejectedValue(new Error('初始化失败'));
      
      await expect(toolkit.initializeAppOnce(mockInit)).rejects.toThrow('初始化失败');
      expect(toolkit.initManager.hasFailed).toBe(true);
    });
  });

  describe('状态更新验证', () => {
    it('应该验证状态更新', () => {
      const result = toolkit.validateStateUpdate('test.value', 'old', 'new', 'TestComponent');
      expect(result).toBe(true);
      
      // 验证日志记录
      const logEntries = toolkit.debugLogger.getLogEntries('state');
      expect(logEntries).toHaveLength(1);
      expect(logEntries[0].data.statePath).toBe('test.value');
    });

    it('应该检测到值没有变化的情况', () => {
      const result = toolkit.validateStateUpdate('test.value', 'same', 'same', 'TestComponent');
      expect(result).toBe(false);
    });
  });

  describe('组件渲染日志', () => {
    it('应该记录组件渲染', () => {
      toolkit.logComponentRender('TestComponent', 3, { id: 1 }, 'props changed');
      
      const logEntries = toolkit.debugLogger.getLogEntries('render');
      expect(logEntries).toHaveLength(1);
      expect(logEntries[0].data.renderCount).toBe(3);
      expect(logEntries[0].data.reason).toBe('props changed');
    });
  });

  describe('useEffect执行日志', () => {
    it('应该记录useEffect执行', () => {
      toolkit.logEffectExecution('TestComponent', 'dataFetch', ['userId'], 'mount');
      
      const logEntries = toolkit.debugLogger.getLogEntries('effect');
      expect(logEntries).toHaveLength(1);
      expect(logEntries[0].data.effectName).toBe('dataFetch');
      expect(logEntries[0].data.action).toBe('mount');
    });
  });

  describe('无限循环检测', () => {
    it('应该检测到无限循环', () => {
      // 模拟无限循环
      for (let i = 0; i < 12; i++) {
        toolkit.validateStateUpdate('test.loop', i % 2, (i + 1) % 2);
      }
      
      const detected = toolkit.detectInfiniteLoop();
      expect(detected).toBe(true);
      
      // 验证日志记录
      const logEntries = toolkit.debugLogger.getLogEntries('infinite-loop');
      expect(logEntries.length).toBeGreaterThan(0);
    });

    it('应该在正常情况下不检测到无限循环', () => {
      toolkit.validateStateUpdate('test.normal1', 'a', 'b');
      toolkit.validateStateUpdate('test.normal2', 'c', 'd');
      
      const detected = toolkit.detectInfiniteLoop();
      expect(detected).toBe(false);
    });
  });

  describe('诊断报告', () => {
    it('应该生成完整的诊断报告', async () => {
      // 初始化应用
      const mockInit = jest.fn().mockResolvedValue(undefined);
      await toolkit.initializeAppOnce(mockInit);
      
      // 添加一些状态更新
      toolkit.validateStateUpdate('test.value1', 'old', 'new');
      toolkit.validateStateUpdate('test.value2', 'a', 'b');
      
      // 记录一些日志
      toolkit.logComponentRender('TestComponent', 1);
      
      const report = toolkit.generateDiagnosticReport();
      
      expect(report.initialization).toBeDefined();
      expect(report.initialization.isInitialized).toBe(true);
      
      expect(report.stateValidation).toBeDefined();
      expect(report.stateValidation.totalUpdates).toBe(2);
      
      expect(report.logging).toBeDefined();
      expect(report.logging.totalEntries).toBeGreaterThan(0);
    });
  });

  describe('历史数据管理', () => {
    it('应该清除所有历史数据', () => {
      // 添加一些数据
      toolkit.validateStateUpdate('test.value', 'old', 'new');
      toolkit.logComponentRender('TestComponent', 1);
      
      // 验证数据存在
      expect(toolkit.stateValidator.getUpdateHistory().length).toBeGreaterThan(0);
      expect(toolkit.debugLogger.getLogEntries().length).toBeGreaterThan(0);
      
      // 清除历史数据
      toolkit.clearAllHistory();
      
      // 验证数据已清除
      expect(toolkit.stateValidator.getUpdateHistory().length).toBe(0);
      expect(toolkit.debugLogger.getLogEntries().length).toBe(0);
    });

    it('应该重置所有工具', async () => {
      // 初始化应用
      const mockInit = jest.fn().mockResolvedValue(undefined);
      await toolkit.initializeAppOnce(mockInit);
      
      // 添加一些数据
      toolkit.validateStateUpdate('test.value', 'old', 'new');
      
      // 验证初始状态
      expect(toolkit.initManager.isInitialized).toBe(true);
      expect(toolkit.stateValidator.getUpdateHistory().length).toBeGreaterThan(0);
      
      // 重置所有工具
      toolkit.resetAll();
      
      // 验证重置后的状态
      expect(toolkit.initManager.isInitialized).toBe(false);
      expect(toolkit.stateValidator.getUpdateHistory().length).toBe(0);
    });
  });

  describe('警告回调集成', () => {
    it('应该在检测到可疑模式时记录警告日志', () => {
      // 触发快速连续更新以产生可疑模式
      for (let i = 0; i < 6; i++) {
        toolkit.validateStateUpdate('test.rapid', i, i + 1);
      }
      
      // 检查是否记录了警告日志
      const warningLogs = toolkit.debugLogger.getLogEntries(undefined, 'warn');
      const stateValidationWarnings = warningLogs.filter(log => 
        log.category === 'state-validation'
      );
      
      expect(stateValidationWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('工具集成', () => {
    it('应该正确集成所有工具', () => {
      expect(toolkit.initManager).toBeDefined();
      expect(toolkit.stateValidator).toBeDefined();
      expect(toolkit.debugLogger).toBeDefined();
    });

    it('应该提供统一的接口', () => {
      expect(typeof toolkit.initializeAppOnce).toBe('function');
      expect(typeof toolkit.validateStateUpdate).toBe('function');
      expect(typeof toolkit.logComponentRender).toBe('function');
      expect(typeof toolkit.logEffectExecution).toBe('function');
      expect(typeof toolkit.detectInfiniteLoop).toBe('function');
      expect(typeof toolkit.generateDiagnosticReport).toBe('function');
      expect(typeof toolkit.clearAllHistory).toBe('function');
      expect(typeof toolkit.resetAll).toBe('function');
    });
  });
});