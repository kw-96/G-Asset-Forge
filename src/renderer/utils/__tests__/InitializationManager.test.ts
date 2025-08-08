/**
 * InitializationManager 单元测试
 */

import { InitializationManager } from '../InitializationManager';

// Mock DebugLogger
jest.mock('../DebugLogger', () => ({
  DebugLogger: {
    getInstance: () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }),
  },
}));

describe('InitializationManager', () => {
  let manager: InitializationManager;

  beforeEach(() => {
    manager = InitializationManager.getInstance();
    manager.reset(); // 重置状态
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = InitializationManager.getInstance();
      const instance2 = InitializationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化管理', () => {
    it('应该只允许初始化一次', async () => {
      const initFn = jest.fn().mockResolvedValue('success');
      
      const result1 = await manager.initializeOnce('test', initFn);
      const result2 = await manager.initializeOnce('test', initFn);
      
      expect(initFn).toHaveBeenCalledTimes(1);
      expect(result1).toBe('success');
      expect(result2).toBe('success');
    });

    it('应该处理初始化失败', async () => {
      const error = new Error('初始化失败');
      const initFn = jest.fn().mockRejectedValue(error);
      
      await expect(manager.initializeOnce('test', initFn)).rejects.toThrow('初始化失败');
      expect(manager.isInitialized('test')).toBe(false);
    });

    it('应该支持重试失败的初始化', async () => {
      const initFn = jest.fn()
        .mockRejectedValueOnce(new Error('第一次失败'))
        .mockResolvedValueOnce('成功');
      
      await expect(manager.initializeOnce('test', initFn)).rejects.toThrow('第一次失败');
      
      const result = await manager.initializeOnce('test', initFn);
      expect(result).toBe('成功');
      expect(initFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('状态查询', () => {
    it('应该正确报告初始化状态', async () => {
      expect(manager.isInitialized('test')).toBe(false);
      
      await manager.initializeOnce('test', () => Promise.resolve());
      
      expect(manager.isInitialized('test')).toBe(true);
    });

    it('应该返回所有已初始化的键', async () => {
      await manager.initializeOnce('key1', () => Promise.resolve());
      await manager.initializeOnce('key2', () => Promise.resolve());
      
      const keys = manager.getInitializedKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });
  });

  describe('超时处理', () => {
    it('应该在超时后取消初始化', async () => {
      const slowInitFn = () => new Promise(resolve => setTimeout(resolve, 2000));
      
      await expect(
        manager.initializeOnce('test', slowInitFn, { timeout: 100 })
      ).rejects.toThrow('初始化超时');
      
      expect(manager.isInitialized('test')).toBe(false);
    });

    it('应该在超时前完成初始化', async () => {
      const fastInitFn = () => new Promise(resolve => setTimeout(() => resolve('快速完成'), 50));
      
      const result = await manager.initializeOnce('test', fastInitFn, { timeout: 200 });
      
      expect(result).toBe('快速完成');
      expect(manager.isInitialized('test')).toBe(true);
    });
  });

  describe('重试机制', () => {
    it('应该根据配置进行重试', async () => {
      let attempts = 0;
      const initFn = jest.fn(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error(`尝试 ${attempts} 失败`));
        }
        return Promise.resolve('最终成功');
      });
      
      const result = await manager.initializeOnce('test', initFn, { 
        maxRetries: 3,
        retryDelay: 10 
      });
      
      expect(result).toBe('最终成功');
      expect(initFn).toHaveBeenCalledTimes(3);
    });

    it('应该在达到最大重试次数后失败', async () => {
      const initFn = jest.fn().mockRejectedValue(new Error('持续失败'));
      
      await expect(
        manager.initializeOnce('test', initFn, { maxRetries: 2 })
      ).rejects.toThrow('持续失败');
      
      expect(initFn).toHaveBeenCalledTimes(3); // 初始尝试 + 2次重试
    });
  });

  describe('并发处理', () => {
    it('应该处理并发初始化请求', async () => {
      const initFn = jest.fn(() => 
        new Promise(resolve => setTimeout(() => resolve('并发测试'), 100))
      );
      
      const promises = [
        manager.initializeOnce('test', initFn),
        manager.initializeOnce('test', initFn),
        manager.initializeOnce('test', initFn),
      ];
      
      const results = await Promise.all(promises);
      
      expect(initFn).toHaveBeenCalledTimes(1);
      expect(results).toEqual(['并发测试', '并发测试', '并发测试']);
    });
  });

  describe('重置功能', () => {
    it('应该重置所有初始化状态', async () => {
      await manager.initializeOnce('key1', () => Promise.resolve());
      await manager.initializeOnce('key2', () => Promise.resolve());
      
      expect(manager.getInitializedKeys()).toHaveLength(2);
      
      manager.reset();
      
      expect(manager.getInitializedKeys()).toHaveLength(0);
      expect(manager.isInitialized('key1')).toBe(false);
      expect(manager.isInitialized('key2')).toBe(false);
    });

    it('应该重置特定键的初始化状态', async () => {
      await manager.initializeOnce('key1', () => Promise.resolve());
      await manager.initializeOnce('key2', () => Promise.resolve());
      
      manager.reset('key1');
      
      expect(manager.isInitialized('key1')).toBe(false);
      expect(manager.isInitialized('key2')).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该处理初始化函数抛出的同步错误', async () => {
      const initFn = () => {
        throw new Error('同步错误');
      };
      
      await expect(manager.initializeOnce('test', initFn)).rejects.toThrow('同步错误');
    });

    it('应该处理初始化函数返回的rejected Promise', async () => {
      const initFn = () => Promise.reject(new Error('异步错误'));
      
      await expect(manager.initializeOnce('test', initFn)).rejects.toThrow('异步错误');
    });
  });

  describe('性能测试', () => {
    it('应该快速处理大量并发请求', async () => {
      const initFn = jest.fn(() => Promise.resolve('快速初始化'));
      
      const startTime = Date.now();
      const promises = Array.from({ length: 100 }, () => 
        manager.initializeOnce('performance-test', initFn)
      );
      
      await Promise.all(promises);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
      expect(initFn).toHaveBeenCalledTimes(1);
    });
  });
});