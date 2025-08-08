/**
 * DebugLogger 单元测试
 */

import { DebugLogger } from '../DebugLogger';

describe('DebugLogger', () => {
  let logger: DebugLogger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // 重置单例实例
    (DebugLogger as any).instance = null;
    logger = DebugLogger.getInstance({
      enableConsoleOutput: false, // 测试时禁用控制台输出
      maxLogEntries: 100,
    });
    
    // 监听控制台输出
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    logger.destroy();
    consoleSpy.mockRestore();
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = DebugLogger.getInstance();
      const instance2 = DebugLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('基本日志记录', () => {
    it('应该记录debug级别的日志', () => {
      logger.debug('test', '这是一条debug消息', { data: 'test' }, 'TestComponent');
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('debug');
      expect(entries[0].category).toBe('test');
      expect(entries[0].message).toBe('这是一条debug消息');
      expect(entries[0].componentName).toBe('TestComponent');
    });

    it('应该记录不同级别的日志', () => {
      logger.debug('test', 'debug消息');
      logger.info('test', 'info消息');
      logger.warn('test', 'warn消息');
      logger.error('test', 'error消息');
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(4);
      expect(entries.map(e => e.level)).toEqual(['debug', 'info', 'warn', 'error']);
    });

    it('应该正确记录时间戳', () => {
      const beforeTime = Date.now();
      logger.info('test', '时间戳测试');
      const afterTime = Date.now();
      
      const entries = logger.getLogEntries();
      expect(entries[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(entries[0].timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('专用日志方法', () => {
    it('应该记录组件相关日志', () => {
      logger.logComponent('TestComponent', 'mounted', { props: { id: 1 } }, 'info');
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe('component');
      expect(entries[0].message).toBe('TestComponent: mounted');
      expect(entries[0].level).toBe('info');
    });

    it('应该记录状态更新日志', () => {
      logger.logStateUpdate('user.name', 'oldName', 'newName', 'UserComponent');
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe('state');
      expect(entries[0].data.statePath).toBe('user.name');
      expect(entries[0].data.prevValue).toBe('oldName');
      expect(entries[0].data.nextValue).toBe('newName');
      expect(entries[0].data.hasChanged).toBe(true);
    });

    it('应该记录useEffect日志', () => {
      logger.logEffect('TestComponent', 'dataFetch', ['userId', 'apiKey'], 'mount');
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe('effect');
      expect(entries[0].data.effectName).toBe('dataFetch');
      expect(entries[0].data.action).toBe('mount');
      expect(entries[0].data.dependencyCount).toBe(2);
    });

    it('应该记录渲染日志', () => {
      logger.logRender('TestComponent', 5, { id: 1, name: 'test' }, 'props changed');
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe('render');
      expect(entries[0].data.renderCount).toBe(5);
      expect(entries[0].data.reason).toBe('props changed');
    });

    it('应该记录性能日志', () => {
      logger.logPerformance('api', 'fetchUserData', 150, { userId: 123 });
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe('performance');
      expect(entries[0].level).toBe('warn'); // 因为耗时>100ms
      expect(entries[0].data.duration).toBe(150);
    });

    it('应该记录无限循环检测日志', () => {
      logger.logInfiniteLoopDetection(true, {
        componentName: 'TestComponent',
        statePath: 'test.value',
        updateCount: 15,
      });
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe('infinite-loop');
      expect(entries[0].level).toBe('error');
      expect(entries[0].message).toContain('检测到潜在无限循环');
    });
  });

  describe('日志过滤', () => {
    beforeEach(() => {
      logger.debug('component', 'debug消息', null, 'ComponentA');
      logger.info('state', 'info消息', null, 'ComponentB');
      logger.warn('performance', 'warn消息', null, 'ComponentA');
      logger.error('api', 'error消息', null, 'ComponentC');
    });

    it('应该按类别过滤日志', () => {
      const componentEntries = logger.getLogEntries('component');
      expect(componentEntries).toHaveLength(1);
      expect(componentEntries[0].category).toBe('component');
    });

    it('应该按级别过滤日志', () => {
      const warnAndAbove = logger.getLogEntries(undefined, 'warn');
      expect(warnAndAbove).toHaveLength(2);
      expect(warnAndAbove.every(e => ['warn', 'error'].includes(e.level))).toBe(true);
    });

    it('应该按组件名过滤日志', () => {
      const componentAEntries = logger.getLogEntries(undefined, undefined, 'ComponentA');
      expect(componentAEntries).toHaveLength(2);
      expect(componentAEntries.every(e => e.componentName === 'ComponentA')).toBe(true);
    });

    it('应该限制返回的日志数量', () => {
      const limitedEntries = logger.getLogEntries(undefined, undefined, undefined, 2);
      expect(limitedEntries).toHaveLength(2);
    });
  });

  describe('日志级别控制', () => {
    it('应该根据日志级别过滤输出', () => {
      const warnLogger = DebugLogger.getInstance({ logLevel: 'warn' });
      
      warnLogger.debug('test', 'debug消息'); // 应该被过滤
      warnLogger.info('test', 'info消息');   // 应该被过滤
      warnLogger.warn('test', 'warn消息');   // 应该记录
      warnLogger.error('test', 'error消息'); // 应该记录
      
      const entries = warnLogger.getLogEntries();
      expect(entries).toHaveLength(2);
      expect(entries.map(e => e.level)).toEqual(['warn', 'error']);
    });
  });

  describe('历史记录管理', () => {
    it('应该限制日志条目数量', () => {
      const smallLogger = DebugLogger.getInstance({ maxLogEntries: 3 });
      
      for (let i = 0; i < 5; i++) {
        smallLogger.info('test', `消息 ${i}`);
      }
      
      const entries = smallLogger.getLogEntries();
      expect(entries).toHaveLength(3);
      // 应该保留最新的3条
      expect(entries.map(e => e.message)).toEqual(['消息 2', '消息 3', '消息 4']);
    });

    it('应该能够清除日志', () => {
      logger.info('test', '测试消息');
      expect(logger.getLogEntries()).toHaveLength(1);
      
      logger.clearLogs();
      expect(logger.getLogEntries()).toHaveLength(0);
    });
  });

  describe('日志导出', () => {
    beforeEach(() => {
      logger.info('component', '组件加载', { id: 1 }, 'TestComponent');
      logger.warn('performance', '性能警告', { duration: 200 });
      logger.error('api', 'API错误', { status: 500 });
    });

    it('应该导出所有日志为文本', () => {
      const exported = logger.exportLogs();
      
      expect(exported).toContain('Debug Logger 导出日志');
      expect(exported).toContain('总条目数: 3');
      expect(exported).toContain('组件加载');
      expect(exported).toContain('性能警告');
      expect(exported).toContain('API错误');
    });

    it('应该按类别导出日志', () => {
      const exported = logger.exportLogs('performance');
      
      expect(exported).toContain('总条目数: 1');
      expect(exported).toContain('性能警告');
      expect(exported).not.toContain('组件加载');
    });
  });

  describe('统计信息', () => {
    beforeEach(() => {
      logger.debug('component', 'debug消息', null, 'ComponentA');
      logger.info('state', 'info消息', null, 'ComponentB');
      logger.warn('performance', '性能警告', { duration: 150 });
      logger.error('api', 'API错误', null, 'ComponentA');
    });

    it('应该生成正确的统计信息', () => {
      const stats = logger.generateStats();
      
      expect(stats.totalEntries).toBe(4);
      expect(stats.entriesByLevel.debug).toBe(1);
      expect(stats.entriesByLevel.info).toBe(1);
      expect(stats.entriesByLevel.warn).toBe(1);
      expect(stats.entriesByLevel.error).toBe(1);
      
      expect(stats.entriesByCategory.component).toBe(1);
      expect(stats.entriesByCategory.state).toBe(1);
      expect(stats.entriesByCategory.performance).toBe(1);
      expect(stats.entriesByCategory.api).toBe(1);
      
      expect(stats.entriesByComponent.ComponentA).toBe(2);
      expect(stats.entriesByComponent.ComponentB).toBe(1);
      
      expect(stats.recentErrors).toHaveLength(1);
      expect(stats.performanceIssues).toHaveLength(1);
    });
  });

  describe('数据清理', () => {
    it('应该正确清理函数类型的数据', () => {
      const testFunction = () => {};
      logger.info('test', '函数测试', { func: testFunction });
      
      const entries = logger.getLogEntries();
      expect(entries[0].data.func).toBe('[Function]');
    });

    it('应该处理循环引用的对象', () => {
      const obj: any = { name: 'test' };
      obj.self = obj; // 创建循环引用
      
      logger.info('test', '循环引用测试', obj);
      
      const entries = logger.getLogEntries();
      expect(entries[0].data).toBe('[无法序列化的对象]');
    });

    it('应该正确处理null和undefined', () => {
      logger.info('test', 'null测试', null);
      logger.info('test', 'undefined测试', undefined);
      
      const entries = logger.getLogEntries();
      expect(entries[0].data).toBeNull();
      expect(entries[1].data).toBeUndefined();
    });
  });

  describe('选项配置', () => {
    it('应该能够更新选项', () => {
      logger.setOptions({ logLevel: 'error' });
      
      logger.debug('test', 'debug消息'); // 应该被过滤
      logger.error('test', 'error消息'); // 应该记录
      
      const entries = logger.getLogEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('error');
    });
  });
});