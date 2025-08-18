/**
 * 性能基准测试
 * @description 验证关键功能的性能指标
 * @author 开发团队
 */
import { performance } from 'perf_hooks';

// Mock Electron APIs for performance testing
jest.mock('electron', () => ({
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  BrowserWindow: {
    getAllWindows: jest.fn(() => []),
    fromWebContents: jest.fn(),
  },
  app: {
    getPath: jest.fn((name) => `/mock/path/${name}`),
  },
}));

// Mock fs-extra for performance testing
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('mock content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({
    size: 1024,
    mtime: new Date(),
    isDirectory: () => false,
    isFile: () => true,
  }),
  createWriteStream: jest.fn(() => ({
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  })),
}));

describe('性能基准测试', () => {
  /**
   * 测量函数执行时间
   */
  const measureTime = async (fn: () => Promise<any> | any): Promise<number> => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  };

  /**
   * 测量内存使用
   */
  const measureMemory = (): NodeJS.MemoryUsage => {
    return process.memoryUsage();
  };

  describe('服务初始化性能', () => {
    test('IPC服务初始化应该在合理时间内完成', async () => {
      const { IPCService } = await import('../../src/main/services/IPCService');
      const ipcService = new IPCService();
      
      const initTime = await measureTime(async () => {
        await ipcService.initialize();
      });
      
      console.info(`IPC服务初始化时间: ${initTime.toFixed(2)}ms`);
      
      // IPC服务初始化应该在100ms内完成
      expect(initTime).toBeLessThan(100);
      
      await ipcService.cleanup();
    });

    test('日志服务初始化应该在合理时间内完成', async () => {
      const { LoggingService } = await import('../../src/main/services/LoggingService');
      const loggingService = new LoggingService({
        enableFile: false,
        enableConsole: false,
      });
      
      const initTime = await measureTime(async () => {
        await loggingService.initialize();
      });
      
      console.info(`日志服务初始化时间: ${initTime.toFixed(2)}ms`);
      
      // 日志服务初始化应该在50ms内完成
      expect(initTime).toBeLessThan(50);
      
      await loggingService.cleanup();
    });

    test('文件服务初始化应该在合理时间内完成', async () => {
      const { FileService } = await import('../../src/main/services/FileService');
      const fileService = new FileService();
      
      const initTime = await measureTime(async () => {
        await fileService.initialize();
      });
      
      console.info(`文件服务初始化时间: ${initTime.toFixed(2)}ms`);
      
      // 文件服务初始化应该在200ms内完成
      expect(initTime).toBeLessThan(200);
      
      await fileService.cleanup();
    });
  });

  describe('IPC通信性能', () => {
    test('IPC路由注册应该高效', async () => {
      const { IPCService } = await import('../../src/main/services/IPCService');
      const ipcService = new IPCService();
      await ipcService.initialize();
      
      const routes = Array.from({ length: 100 }, (_, i) => ({
        channel: `test:channel${i}`,
        type: 'handle' as const,
        handler: jest.fn(),
        description: `测试路由${i}`,
      }));
      
      const registerTime = await measureTime(() => {
        ipcService.registerRoutes(routes);
      });
      
      console.info(`注册100个IPC路由时间: ${registerTime.toFixed(2)}ms`);
      
      // 注册100个路由应该在10ms内完成
      expect(registerTime).toBeLessThan(10);
      
      await ipcService.cleanup();
    });

    test('IPC路由查找应该高效', async () => {
      const { IPCService } = await import('../../src/main/services/IPCService');
      const ipcService = new IPCService();
      await ipcService.initialize();
      
      // 注册大量路由
      const routes = Array.from({ length: 1000 }, (_, i) => ({
        channel: `test:channel${i}`,
        type: 'handle' as const,
        handler: jest.fn(),
        description: `测试路由${i}`,
      }));
      
      ipcService.registerRoutes(routes);
      
      const lookupTime = await measureTime(() => {
        // 模拟路由查找操作
        for (let i = 0; i < 100; i++) {
          ipcService.getRouteStats();
        }
      });
      
      console.info(`100次路由统计查询时间: ${lookupTime.toFixed(2)}ms`);
      
      // 100次查询应该在5ms内完成
      expect(lookupTime).toBeLessThan(5);
      
      await ipcService.cleanup();
    });
  });

  describe('日志记录性能', () => {
    test('日志记录应该高效', async () => {
      const { LoggingService } = await import('../../src/main/services/LoggingService');
      const loggingService = new LoggingService({
        enableFile: false,
        enableConsole: false,
      });
      await loggingService.initialize();
      
      const logCount = 1000;
      const logTime = await measureTime(() => {
        for (let i = 0; i < logCount; i++) {
          loggingService.info(`测试日志消息 ${i}`, { index: i });
        }
      });
      
      console.info(`记录${logCount}条日志时间: ${logTime.toFixed(2)}ms`);
      console.info(`平均每条日志: ${(logTime / logCount).toFixed(3)}ms`);
      
      // 1000条日志应该在100ms内完成
      expect(logTime).toBeLessThan(100);
      
      await loggingService.cleanup();
    });

    test('日志查询应该高效', async () => {
      const { LoggingService } = await import('../../src/main/services/LoggingService');
      const loggingService = new LoggingService({
        enableFile: false,
        enableConsole: false,
      });
      await loggingService.initialize();
      
      // 先记录一些日志
      for (let i = 0; i < 100; i++) {
        loggingService.info(`测试日志 ${i}`);
      }
      
      const queryTime = await measureTime(async () => {
        for (let i = 0; i < 10; i++) {
          await loggingService.queryLogs({ limit: 50 });
        }
      });
      
      console.info(`10次日志查询时间: ${queryTime.toFixed(2)}ms`);
      
      // 10次查询应该在20ms内完成
      expect(queryTime).toBeLessThan(20);
      
      await loggingService.cleanup();
    });
  });

  describe('文件操作性能', () => {
    test('文件读取应该高效', async () => {
      const { FileService } = await import('../../src/main/services/FileService');
      const fileService = new FileService();
      await fileService.initialize();
      
      const readCount = 50;
      const readTime = await measureTime(async () => {
        const promises = Array.from({ length: readCount }, (_, i) => 
          fileService.readFile(`/mock/test${i}.txt`)
        );
        await Promise.all(promises);
      });
      
      console.info(`并发读取${readCount}个文件时间: ${readTime.toFixed(2)}ms`);
      console.info(`平均每个文件: ${(readTime / readCount).toFixed(2)}ms`);
      
      // 50个文件并发读取应该在500ms内完成
      expect(readTime).toBeLessThan(500);
      
      await fileService.cleanup();
    });

    test('文件写入应该高效', async () => {
      const { FileService } = await import('../../src/main/services/FileService');
      const fileService = new FileService();
      await fileService.initialize();
      
      const writeCount = 20;
      const testContent = 'x'.repeat(1024); // 1KB内容
      
      const writeTime = await measureTime(async () => {
        const promises = Array.from({ length: writeCount }, (_, i) => 
          fileService.writeFile(`/mock/output${i}.txt`, testContent)
        );
        await Promise.all(promises);
      });
      
      console.info(`并发写入${writeCount}个文件时间: ${writeTime.toFixed(2)}ms`);
      console.info(`平均每个文件: ${(writeTime / writeCount).toFixed(2)}ms`);
      
      // 20个文件并发写入应该在1000ms内完成
      expect(writeTime).toBeLessThan(1000);
      
      await fileService.cleanup();
    });
  });

  describe('内存使用性能', () => {
    test('服务初始化不应该消耗过多内存', async () => {
      const initialMemory = measureMemory();
      
      // 初始化所有服务
      const { IPCService } = await import('../../src/main/services/IPCService');
      const { LoggingService } = await import('../../src/main/services/LoggingService');
      const { FileService } = await import('../../src/main/services/FileService');
      
      const ipcService = new IPCService();
      const loggingService = new LoggingService({ enableFile: false, enableConsole: false });
      const fileService = new FileService();
      
      await Promise.all([
        ipcService.initialize(),
        loggingService.initialize(),
        fileService.initialize(),
      ]);
      
      const afterInitMemory = measureMemory();
      const memoryIncrease = afterInitMemory.heapUsed - initialMemory.heapUsed;
      
      console.info(`服务初始化内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // 服务初始化内存增长应该小于10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      
      // 清理服务
      await Promise.all([
        ipcService.cleanup(),
        loggingService.cleanup(),
        fileService.cleanup(),
      ]);
    });

    test('大量操作后内存应该稳定', async () => {
      const { LoggingService } = await import('../../src/main/services/LoggingService');
      const loggingService = new LoggingService({
        enableFile: false,
        enableConsole: false,
      });
      await loggingService.initialize();
      
      const initialMemory = measureMemory();
      
      // 执行大量日志操作
      for (let i = 0; i < 1000; i++) {
        loggingService.info(`大量操作测试 ${i}`, { data: 'x'.repeat(100) });
        
        if (i % 100 === 0) {
          await loggingService.flush();
        }
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = measureMemory();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      console.info(`大量操作后内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // 大量操作后内存增长应该小于50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      await loggingService.cleanup();
    });
  });

  describe('并发性能', () => {
    test('并发IPC操作应该高效', async () => {
      const { IPCService } = await import('../../src/main/services/IPCService');
      const ipcService = new IPCService();
      await ipcService.initialize();
      
      const concurrentOperations = 100;
      const concurrentTime = await measureTime(async () => {
        const promises = Array.from({ length: concurrentOperations }, (_, i) => {
          return new Promise<void>((resolve) => {
            const route = {
              channel: `concurrent:test${i}`,
              type: 'handle' as const,
              handler: jest.fn(),
              description: `并发测试路由${i}`,
            };
            
            ipcService.registerRoute(route);
            ipcService.removeRoute(`concurrent:test${i}`);
            resolve();
          });
        });
        
        await Promise.all(promises);
      });
      
      console.info(`${concurrentOperations}个并发IPC操作时间: ${concurrentTime.toFixed(2)}ms`);
      
      // 100个并发操作应该在50ms内完成
      expect(concurrentTime).toBeLessThan(50);
      
      await ipcService.cleanup();
    });

    test('并发日志记录应该高效', async () => {
      const { LoggingService } = await import('../../src/main/services/LoggingService');
      const loggingService = new LoggingService({
        enableFile: false,
        enableConsole: false,
      });
      await loggingService.initialize();
      
      const concurrentLogs = 500;
      const concurrentTime = await measureTime(async () => {
        const promises = Array.from({ length: concurrentLogs }, (_, i) => {
          return new Promise<void>((resolve) => {
            loggingService.info(`并发日志 ${i}`, { index: i });
            resolve();
          });
        });
        
        await Promise.all(promises);
      });
      
      console.info(`${concurrentLogs}条并发日志时间: ${concurrentTime.toFixed(2)}ms`);
      
      // 500条并发日志应该在100ms内完成
      expect(concurrentTime).toBeLessThan(100);
      
      await loggingService.cleanup();
    });
  });

  describe('性能基准总结', () => {
    test('生成性能报告', () => {
      const performanceReport = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        benchmarks: {
          serviceInitialization: {
            ipc: '< 100ms',
            logging: '< 50ms',
            file: '< 200ms',
          },
          operations: {
            ipcRouteRegistration: '< 10ms (100 routes)',
            logRecording: '< 100ms (1000 logs)',
            fileReading: '< 500ms (50 files)',
            fileWriting: '< 1000ms (20 files)',
          },
          memory: {
            serviceInitialization: '< 10MB',
            heavyOperations: '< 50MB',
          },
          concurrency: {
            ipcOperations: '< 50ms (100 concurrent)',
            logRecording: '< 100ms (500 concurrent)',
          },
        },
      };
      
      console.info('性能基准报告:', JSON.stringify(performanceReport, null, 2));
      
      // 确保报告生成成功
      expect(performanceReport.timestamp).toBeDefined();
      expect(performanceReport.environment.nodeVersion).toBeDefined();
    });
  });
});