// 轻量化 React 无限循环工具包占位实现

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, ...args: any[]) {
  // 只在开发模式下输出日志到控制台
  if (process.env['NODE_ENV'] === 'development') {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](...args);
  }
}

export const reactLoopFixToolkit = {
  debugLogger: {
    debug(_tag: string, _msg: string, _data?: any, _source?: string) {
      log('debug', '[调试]', _tag, _msg, _data, _source);
    },
    info(_tag: string, _msg: string, _data?: any, _source?: string) {
      log('info', '[信息]', _tag, _msg, _data, _source);
    },
    warn(_tag: string, _msg: string, _data?: any, _source?: string) {
      log('warn', '[警告]', _tag, _msg, _data, _source);
    },
    error(_tag: string, _msg: string, _data?: any, _source?: string) {
      log('error', '[错误]', _tag, _msg, _data, _source);
    },
    logRender(_componentName: string, _count: number, _data?: any, _reason?: string) {
      // 渲染信息不在控制台显示
      // log('debug', '[渲染]', componentName, count, data, reason);
    },
  },

  generateDiagnosticReport() {
    return {
      createdAt: new Date().toISOString(),
      loopsDetected: false,
      notes: '诊断占位',
    };
  },

  detectInfiniteLoop(): boolean {
    return false;
  },

  resetAll() {
    // no-op
  },
};


