/**
 * 日志服务 - 统一的日志管理系统
 * @description 提供完整的日志记录、存储、轮转和查询功能
 * @author 开发团队
 */
import * as fs from 'fs-extra';
import * as path from 'path';
import { app } from 'electron';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

/**
 * 日志级别名称映射
 */
export const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

/**
 * 日志条目接口
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  data?: any;
  category?: string;
  source?: string;
  pid: number;
  memory?: {
    used: number;
    total: number;
  };
}

/**
 * 日志服务配置接口
 */
export interface LoggingServiceConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableMemoryTracking: boolean;
  maxFileSize: number;
  maxFiles: number;
  logDirectory: string;
  dateFormat: string;
  enableCompression: boolean;
  flushInterval: number;
  categories: string[];
}

/**
 * 默认日志服务配置
 */
const DEFAULT_LOGGING_CONFIG: LoggingServiceConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  enableMemoryTracking: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  logDirectory: path.join(app.getPath('userData'), 'logs'),
  dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
  enableCompression: true,
  flushInterval: 5000, // 5秒
  categories: ['app', 'ipc', 'canvas', 'tools', 'assets', 'project', 'performance'],
};

/**
 * 日志服务类
 * @description 提供完整的日志管理功能
 */
export class LoggingService {
  private config: LoggingServiceConfig;
  private isInitialized = false;
  private logBuffer: LogEntry[] = [];
  private currentLogFile: string | null = null;
  private flushTimer: NodeJS.Timeout | null = null;
  private fileWriteStream: fs.WriteStream | null = null;

  constructor(config: Partial<LoggingServiceConfig> = {}) {
    this.config = { ...DEFAULT_LOGGING_CONFIG, ...config };
  }

  /**
   * 初始化日志服务
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[logging-service] 日志服务已经初始化');
      return;
    }

    try {
      console.info('[logging-service] 开始初始化日志服务');

      // 创建日志目录
      if (this.config.enableFile) {
        await this.ensureLogDirectory();
        await this.initializeLogFile();
      }

      // 启动定时刷新
      this.startFlushTimer();

      // 设置进程退出处理
      this.setupExitHandlers();

      this.isInitialized = true;
      this.info('日志服务初始化完成', { config: this.config });

    } catch (error) {
      console.error('[logging-service] 日志服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 记录调试日志
   */
  public debug(message: string, data?: any, category = 'app'): void {
    this.log(LogLevel.DEBUG, message, data, category);
  }

  /**
   * 记录信息日志
   */
  public info(message: string, data?: any, category = 'app'): void {
    this.log(LogLevel.INFO, message, data, category);
  }

  /**
   * 记录警告日志
   */
  public warn(message: string, data?: any, category = 'app'): void {
    this.log(LogLevel.WARN, message, data, category);
  }

  /**
   * 记录错误日志
   */
  public error(message: string, error?: any, category = 'app'): void {
    let errorData = error;
    
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.log(LogLevel.ERROR, message, errorData, category);
  }

  /**
   * 记录致命错误日志
   */
  public fatal(message: string, error?: any, category = 'app'): void {
    let errorData = error;
    
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.log(LogLevel.FATAL, message, errorData, category);
  }

  /**
   * 记录性能日志
   */
  public performance(operation: string, duration: number, data?: any): void {
    this.info(`性能监控: ${operation}`, {
      duration: `${duration}ms`,
      ...data,
    }, 'performance');
  }

  /**
   * 记录IPC日志
   */
  public ipc(message: string, data?: any): void {
    this.debug(message, data, 'ipc');
  }

  /**
   * 记录画布日志
   */
  public canvas(message: string, data?: any): void {
    this.debug(message, data, 'canvas');
  }

  /**
   * 记录工具日志
   */
  public tools(message: string, data?: any): void {
    this.debug(message, data, 'tools');
  }

  /**
   * 记录素材日志
   */
  public assets(message: string, data?: any): void {
    this.debug(message, data, 'assets');
  }

  /**
   * 记录项目日志
   */
  public project(message: string, data?: any): void {
    this.debug(message, data, 'project');
  }

  /**
   * 获取日志统计信息
   */
  public getStats() {
    return {
      bufferSize: this.logBuffer.length,
      currentLogFile: this.currentLogFile,
      isInitialized: this.isInitialized,
      config: this.config,
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * 查询日志
   */
  public async queryLogs(options: {
    level?: LogLevel;
    category?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  } = {}): Promise<LogEntry[]> {
    const { level, category, startTime, endTime, limit = 100 } = options;
    
    // 从缓冲区查询
    let results = [...this.logBuffer];

    // 应用过滤条件
    if (level !== undefined) {
      results = results.filter(entry => entry.level >= level);
    }

    if (category) {
      results = results.filter(entry => entry.category === category);
    }

    if (startTime) {
      results = results.filter(entry => new Date(entry.timestamp) >= startTime);
    }

    if (endTime) {
      results = results.filter(entry => new Date(entry.timestamp) <= endTime);
    }

    // 按时间倒序排列并限制数量
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return results.slice(0, limit);
  }

  /**
   * 清理旧日志文件
   */
  public async cleanupOldLogs(): Promise<void> {
    if (!this.config.enableFile) return;

    try {
      const files = await fs.readdir(this.config.logDirectory);
      const logFiles = files
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDirectory, file),
          stat: fs.statSync(path.join(this.config.logDirectory, file)),
        }))
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

      // 删除超出数量限制的文件
      if (logFiles.length > this.config.maxFiles) {
        const filesToDelete = logFiles.slice(this.config.maxFiles);
        
        for (const file of filesToDelete) {
          await fs.remove(file.path);
          this.info(`删除旧日志文件: ${file.name}`);
        }
      }

    } catch (error) {
      this.error('清理旧日志文件失败', error);
    }
  }

  /**
   * 强制刷新日志缓冲区
   */
  public async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      if (this.config.enableFile && this.fileWriteStream) {
        const logLines = this.logBuffer.map(entry => this.formatLogEntry(entry));
        
        for (const line of logLines) {
          this.fileWriteStream.write(line + '\n');
        }
      }

      this.logBuffer = [];

    } catch (error) {
      console.error('[logging-service] 刷新日志缓冲区失败:', error);
    }
  }

  /**
   * 清理日志服务
   */
  public async cleanup(): Promise<void> {
    console.info('[logging-service] 清理日志服务');

    try {
      // 停止定时器
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }

      // 刷新缓冲区
      await this.flush();

      // 关闭文件流
      if (this.fileWriteStream) {
        this.fileWriteStream.end();
        this.fileWriteStream = null;
      }

      this.isInitialized = false;
      console.info('[logging-service] 日志服务清理完成');

    } catch (error) {
      console.error('[logging-service] 日志服务清理失败:', error);
    }
  }

  // 私有方法

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, data?: any, category = 'app'): void {
    if (!this.isInitialized || level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LOG_LEVEL_NAMES[level],
      message,
      data,
      category,
      source: 'main',
      pid: process.pid,
    };

    // 添加内存信息
    if (this.config.enableMemoryTracking) {
      const memUsage = process.memoryUsage();
      entry.memory = {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      };
    }

    // 输出到控制台
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // 添加到缓冲区
    this.logBuffer.push(entry);

    // 如果是致命错误，立即刷新
    if (level === LogLevel.FATAL) {
      this.flush();
    }
  }

  /**
   * 输出到控制台
   */
  private logToConsole(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
    }
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleString('zh-CN');
    const level = entry.levelName.padEnd(5);
    const category = entry.category ? `[${entry.category}]` : '';
    const memory = entry.memory ? ` (${entry.memory.used}MB)` : '';
    
    let formatted = `${timestamp} ${level} ${category} ${entry.message}${memory}`;
    
    if (entry.data) {
      formatted += ` ${JSON.stringify(entry.data)}`;
    }
    
    return formatted;
  }

  /**
   * 确保日志目录存在
   */
  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.ensureDir(this.config.logDirectory);
    } catch (error) {
      console.error('[logging-service] 创建日志目录失败:', error);
      throw error;
    }
  }

  /**
   * 初始化日志文件
   */
  private async initializeLogFile(): Promise<void> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `app-${dateStr}.log`;
    this.currentLogFile = path.join(this.config.logDirectory, filename);

    try {
      // 检查文件大小，如果超过限制则轮转
      if (await fs.pathExists(this.currentLogFile)) {
        const stats = await fs.stat(this.currentLogFile);
        if (stats.size > this.config.maxFileSize) {
          await this.rotateLogFile();
        }
      }

      // 创建写入流
      this.fileWriteStream = fs.createWriteStream(this.currentLogFile, { flags: 'a' });
      
      this.fileWriteStream.on('error', (error) => {
        console.error('[logging-service] 日志文件写入错误:', error);
      });

    } catch (error) {
      console.error('[logging-service] 初始化日志文件失败:', error);
      throw error;
    }
  }

  /**
   * 轮转日志文件
   */
  private async rotateLogFile(): Promise<void> {
    if (!this.currentLogFile) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = this.currentLogFile.replace('.log', `-${timestamp}.log`);
      
      await fs.move(this.currentLogFile, rotatedFile);
      
      // 如果启用压缩，压缩旧文件
      if (this.config.enableCompression) {
        // 这里可以添加压缩逻辑
      }

      this.info(`日志文件已轮转: ${path.basename(rotatedFile)}`);

    } catch (error) {
      console.error('[logging-service] 日志文件轮转失败:', error);
    }
  }

  /**
   * 启动定时刷新
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 设置进程退出处理
   */
  private setupExitHandlers(): void {
    const cleanup = () => {
      this.flush();
    };

    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', (error) => {
      this.fatal('未捕获的异常', error);
      cleanup();
    });
  }
}

// 创建全局日志服务实例
export const loggingService = new LoggingService();

// 兼容现有的logger接口
export const logger = {
  debug: (message: string, data?: any) => loggingService.debug(message, data),
  info: (message: string, data?: any) => loggingService.info(message, data),
  warn: (message: string, data?: any) => loggingService.warn(message, data),
  error: (message: string, error?: any) => loggingService.error(message, error),
  fatal: (message: string, error?: any) => loggingService.fatal(message, error),
};