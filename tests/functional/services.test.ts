/**
 * 服务层功能测试
 * @description 测试核心服务的功能是否正常工作
 * @author 开发团队
 */
import { IPCService } from '../../src/main/services/IPCService';
import { LoggingService } from '../../src/main/services/LoggingService';
import { FileService } from '../../src/main/services/FileService';

// Mock Electron APIs
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
  dialog: {
    showOpenDialog: jest.fn(),
    showSaveDialog: jest.fn(),
  },
}));

// Mock fs-extra
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  copy: jest.fn(),
  move: jest.fn(),
  remove: jest.fn(),
  stat: jest.fn(),
  readdir: jest.fn(),
  pathExists: jest.fn(),
  createWriteStream: jest.fn(() => ({
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  })),
}));

describe('服务层功能测试', () => {
  describe('IPC服务测试', () => {
    let ipcService: IPCService;

    beforeEach(() => {
      ipcService = new IPCService();
    });

    afterEach(async () => {
      await ipcService.cleanup();
    });

    test('应该能够初始化IPC服务', async () => {
      await expect(ipcService.initialize()).resolves.not.toThrow();
    });

    test('应该能够注册IPC路由', () => {
      const route = {
        channel: 'test:channel',
        type: 'handle' as const,
        handler: jest.fn(),
        description: '测试路由',
      };

      expect(() => ipcService.registerRoute(route)).not.toThrow();
    });

    test('应该能够批量注册路由', () => {
      const routes = [
        {
          channel: 'test:channel1',
          type: 'handle' as const,
          handler: jest.fn(),
          description: '测试路由1',
        },
        {
          channel: 'test:channel2',
          type: 'on' as const,
          handler: jest.fn(),
          description: '测试路由2',
        },
      ];

      expect(() => ipcService.registerRoutes(routes)).not.toThrow();
    });

    test('应该能够移除路由', () => {
      const route = {
        channel: 'test:remove',
        type: 'handle' as const,
        handler: jest.fn(),
        description: '待移除的路由',
      };

      ipcService.registerRoute(route);
      expect(() => ipcService.removeRoute('test:remove')).not.toThrow();
    });

    test('应该能够获取路由统计信息', () => {
      const route = {
        channel: 'test:stats',
        type: 'handle' as const,
        handler: jest.fn(),
        description: '统计测试路由',
      };

      ipcService.registerRoute(route);
      const stats = ipcService.getRouteStats();

      expect(stats).toHaveProperty('totalRoutes');
      expect(stats).toHaveProperty('routesByType');
      expect(stats).toHaveProperty('routeList');
      expect(stats.totalRoutes).toBeGreaterThan(0);
    });

    test('应该能够获取速率限制统计', () => {
      const stats = ipcService.getRateLimitStats();

      expect(stats).toHaveProperty('activeEntries');
      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('topChannels');
    });
  });

  describe('日志服务测试', () => {
    let loggingService: LoggingService;

    beforeEach(() => {
      loggingService = new LoggingService({
        enableFile: false, // 测试时禁用文件输出
        enableConsole: false, // 测试时禁用控制台输出
      });
    });

    afterEach(async () => {
      await loggingService.cleanup();
    });

    test('应该能够初始化日志服务', async () => {
      await expect(loggingService.initialize()).resolves.not.toThrow();
    });

    test('应该能够记录不同级别的日志', async () => {
      await loggingService.initialize();

      expect(() => loggingService.debug('调试信息')).not.toThrow();
      expect(() => loggingService.info('信息日志')).not.toThrow();
      expect(() => loggingService.warn('警告信息')).not.toThrow();
      expect(() => loggingService.error('错误信息')).not.toThrow();
      expect(() => loggingService.fatal('致命错误')).not.toThrow();
    });

    test('应该能够记录带数据的日志', async () => {
      await loggingService.initialize();

      const testData = { key: 'value', number: 123 };
      expect(() => loggingService.info('测试数据', testData)).not.toThrow();
    });

    test('应该能够记录分类日志', async () => {
      await loggingService.initialize();

      expect(() => loggingService.performance('测试操作', 100)).not.toThrow();
      expect(() => loggingService.ipc('IPC测试')).not.toThrow();
      expect(() => loggingService.canvas('画布测试')).not.toThrow();
      expect(() => loggingService.tools('工具测试')).not.toThrow();
      expect(() => loggingService.assets('素材测试')).not.toThrow();
      expect(() => loggingService.project('项目测试')).not.toThrow();
    });

    test('应该能够查询日志', async () => {
      await loggingService.initialize();

      loggingService.info('测试日志1');
      loggingService.warn('测试日志2');
      loggingService.error('测试日志3');

      const logs = await loggingService.queryLogs({ limit: 10 });
      expect(Array.isArray(logs)).toBe(true);
    });

    test('应该能够获取统计信息', async () => {
      await loggingService.initialize();

      const stats = loggingService.getStats();
      expect(stats).toHaveProperty('bufferSize');
      expect(stats).toHaveProperty('isInitialized');
      expect(stats).toHaveProperty('config');
      expect(stats).toHaveProperty('memoryUsage');
    });

    test('应该能够强制刷新日志', async () => {
      await loggingService.initialize();

      loggingService.info('待刷新的日志');
      await expect(loggingService.flush()).resolves.not.toThrow();
    });
  });

  describe('文件服务测试', () => {
    let fileService: FileService;

    beforeEach(() => {
      fileService = new FileService();
      
      // Mock fs-extra methods
      const fs = require('fs-extra');
      fs.readFile.mockResolvedValue('test content');
      fs.writeFile.mockResolvedValue(undefined);
      fs.copy.mockResolvedValue(undefined);
      fs.move.mockResolvedValue(undefined);
      fs.remove.mockResolvedValue(undefined);
      fs.stat.mockResolvedValue({
        size: 1024,
        mtime: new Date(),
        isDirectory: () => false,
        isFile: () => true,
      });
      fs.readdir.mockResolvedValue(['file1.txt', 'file2.txt']);
      fs.pathExists.mockResolvedValue(true);
      fs.ensureDir.mockResolvedValue(undefined);
    });

    afterEach(async () => {
      await fileService.cleanup();
    });

    test('应该能够初始化文件服务', async () => {
      await expect(fileService.initialize()).resolves.not.toThrow();
    });

    test('应该能够读取文件', async () => {
      await fileService.initialize();

      const result = await fileService.readFile('/mock/path/test.txt');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test content');
    });

    test('应该能够写入文件', async () => {
      await fileService.initialize();

      const result = await fileService.writeFile('/mock/path/test.txt', 'new content');
      expect(result.success).toBe(true);
    });

    test('应该能够复制文件', async () => {
      await fileService.initialize();

      const result = await fileService.copyFile('/mock/source.txt', '/mock/target.txt');
      expect(result.success).toBe(true);
    });

    test('应该能够移动文件', async () => {
      await fileService.initialize();

      const result = await fileService.moveFile('/mock/source.txt', '/mock/target.txt');
      expect(result.success).toBe(true);
    });

    test('应该能够删除文件', async () => {
      await fileService.initialize();

      const result = await fileService.deleteFile('/mock/path/test.txt');
      expect(result.success).toBe(true);
    });

    test('应该能够获取文件信息', async () => {
      await fileService.initialize();

      const result = await fileService.getFileInfo('/mock/path/test.txt');
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('path');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('size');
    });

    test('应该能够列出目录内容', async () => {
      await fileService.initialize();

      const result = await fileService.listDirectory('/mock/path');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('应该能够显示文件对话框', async () => {
      await fileService.initialize();

      const { dialog } = require('electron');
      dialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/mock/selected/file.txt'],
      });

      const result = await fileService.showOpenDialog();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['/mock/selected/file.txt']);
    });

    test('应该能够显示保存对话框', async () => {
      await fileService.initialize();

      const { dialog } = require('electron');
      dialog.showSaveDialog.mockResolvedValue({
        canceled: false,
        filePath: '/mock/save/file.txt',
      });

      const result = await fileService.showSaveDialog();
      expect(result.success).toBe(true);
      expect(result.data).toBe('/mock/save/file.txt');
    });

    test('应该能够获取缓存统计信息', async () => {
      await fileService.initialize();

      const stats = fileService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(stats).toHaveProperty('maxSize');
    });
  });

  describe('服务集成测试', () => {
    test('服务应该能够协同工作', async () => {
      const ipcService = new IPCService();
      const loggingService = new LoggingService({ enableFile: false, enableConsole: false });
      const fileService = new FileService();

      // 初始化所有服务
      await Promise.all([
        ipcService.initialize(),
        loggingService.initialize(),
        fileService.initialize(),
      ]);

      // 测试服务间的协作
      loggingService.info('服务集成测试开始');
      
      const route = {
        channel: 'integration:test',
        type: 'handle' as const,
        handler: async () => {
          loggingService.info('IPC路由被调用');
          return { success: true, message: '集成测试成功' };
        },
        description: '集成测试路由',
      };

      ipcService.registerRoute(route);

      // 清理所有服务
      await Promise.all([
        ipcService.cleanup(),
        loggingService.cleanup(),
        fileService.cleanup(),
      ]);

      expect(true).toBe(true); // 如果没有抛出异常，测试通过
    });
  });
});