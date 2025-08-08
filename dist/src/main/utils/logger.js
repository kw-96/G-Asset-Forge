/**
 * 应用程序日志工具
 * 提供统一的日志记录接口
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor() {
        // 根据环境设置日志级别
        this.logLevel = process.env['NODE_ENV'] === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    }
    shouldLog(level) {
        return level >= this.logLevel;
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] ${message}`;
        if (args.length > 0) {
            console.log(formattedMessage, ...args);
        }
        else {
            console.log(formattedMessage);
        }
    }
    debug(message, ...args) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.formatMessage('DEBUG', message, ...args);
        }
    }
    info(message, ...args) {
        if (this.shouldLog(LogLevel.INFO)) {
            this.formatMessage('INFO', message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.shouldLog(LogLevel.WARN)) {
            this.formatMessage('WARN', message, ...args);
        }
    }
    error(message, ...args) {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.formatMessage('ERROR', message, ...args);
        }
    }
}
// 导出单例实例
export const logger = new Logger();
//# sourceMappingURL=logger.js.map