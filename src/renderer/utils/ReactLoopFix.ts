// 轻量化 React 无限循环工具包占位实现

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, ...args: any[]) {
  // 将日志输出到控制台，避免引入额外依赖
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](...args);
}

export const reactLoopFixToolkit = {
  debugLogger: {
    debug(_tag: string, _msg: string, _data?: any, _source?: string) {
      log('debug', '[debug]', _tag, _msg, _data, _source);
    },
    info(_tag: string, _msg: string, _data?: any, _source?: string) {
      log('info', '[info]', _tag, _msg, _data, _source);
    },
    warn(_tag: string, _msg: string, _data?: any, _source?: string) {
      log('warn', '[warn]', _tag, _msg, _data, _source);
    },
    error(_tag: string, _msg: string, _data?: any, _source?: string) {
      log('error', '[error]', _tag, _msg, _data, _source);
    },
    logRender(componentName: string, count: number, data?: any, reason?: string) {
      log('debug', '[render]', componentName, count, data, reason);
    },
  },

  generateDiagnosticReport() {
    return {
      createdAt: new Date().toISOString(),
      loopsDetected: false,
      notes: 'diagnostic placeholder',
    };
  },

  detectInfiniteLoop(): boolean {
    return false;
  },

  resetAll() {
    // no-op
  },
};


