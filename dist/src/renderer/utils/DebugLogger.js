/**
 * 调试日志工具
 * 帮助开发时定位React无限循环和状态更新问题
 */
/**
 * 调试日志工具类
 * 提供结构化的日志记录和分析功能
 */
export class DebugLogger {
    constructor(options = {}) {
        this.logEntries = [];
        this.logLevelPriority = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        this.options = {
            enableConsoleOutput: options.enableConsoleOutput ?? true,
            enableStackTrace: options.enableStackTrace ?? false,
            maxLogEntries: options.maxLogEntries ?? 1000,
            logLevel: options.logLevel ?? 'debug',
            categories: options.categories ?? [],
            enableTimestamp: options.enableTimestamp ?? true,
            enableComponentTracking: options.enableComponentTracking ?? true,
        };
    }
    /**
     * 获取单例实例
     */
    static getInstance(options) {
        if (!DebugLogger.instance) {
            DebugLogger.instance = new DebugLogger(options);
        }
        return DebugLogger.instance;
    }
    /**
     * 记录调试信息
     */
    debug(category, message, data, componentName) {
        this.log('debug', category, message, data, componentName);
    }
    /**
     * 记录一般信息
     */
    info(category, message, data, componentName) {
        this.log('info', category, message, data, componentName);
    }
    /**
     * 记录警告信息
     */
    warn(category, message, data, componentName) {
        this.log('warn', category, message, data, componentName);
    }
    /**
     * 记录错误信息
     */
    error(category, message, data, componentName) {
        this.log('error', category, message, data, componentName);
    }
    /**
     * 记录React组件相关的日志
     */
    logComponent(componentName, action, details, level = 'debug') {
        this.log(level, 'component', `${componentName}: ${action}`, details, componentName);
    }
    /**
     * 记录状态更新相关的日志
     */
    logStateUpdate(statePath, prevValue, nextValue, componentName) {
        const data = {
            statePath,
            prevValue: this.sanitizeValue(prevValue),
            nextValue: this.sanitizeValue(nextValue),
            hasChanged: !this.isValueEqual(prevValue, nextValue),
        };
        this.log('debug', 'state', `状态更新: ${statePath}`, data, componentName);
    }
    /**
     * 记录useEffect相关的日志
     */
    logEffect(componentName, effectName, dependencies, action) {
        const data = {
            effectName,
            dependencies: dependencies.map(dep => this.sanitizeValue(dep)),
            dependencyCount: dependencies.length,
            action,
        };
        this.log('debug', 'effect', `${componentName} useEffect: ${effectName}`, data, componentName);
    }
    /**
     * 记录渲染相关的日志
     */
    logRender(componentName, renderCount, props, reason) {
        const data = {
            renderCount,
            props: props ? this.sanitizeValue(props) : undefined,
            reason,
        };
        this.log('debug', 'render', `${componentName} 渲染 #${renderCount}`, data, componentName);
    }
    /**
     * 记录性能相关的日志
     */
    logPerformance(operation, duration, details) {
        const data = {
            operation,
            duration,
            ...details,
        };
        const level = duration > 100 ? 'warn' : 'debug';
        this.log(level, 'performance', `${operation} 耗时 ${duration}ms`, data);
    }
    /**
     * 记录无限循环检测结果
     */
    logInfiniteLoopDetection(detected, details) {
        const level = detected ? 'error' : 'debug';
        const message = detected
            ? `检测到潜在无限循环: ${details.componentName || 'Unknown'}`
            : '无限循环检测通过';
        this.log(level, 'infinite-loop', message, details, details.componentName);
    }
    /**
     * 获取日志条目
     */
    getLogEntries(category, level, componentName, limit) {
        let entries = [...this.logEntries];
        // 按类别过滤
        if (category) {
            entries = entries.filter(entry => entry.category === category);
        }
        // 按级别过滤
        if (level) {
            const minPriority = this.logLevelPriority[level];
            entries = entries.filter(entry => this.logLevelPriority[entry.level] >= minPriority);
        }
        // 按组件名过滤
        if (componentName) {
            entries = entries.filter(entry => entry.componentName === componentName);
        }
        // 限制数量
        if (limit && limit > 0) {
            entries = entries.slice(-limit);
        }
        return entries;
    }
    /**
     * 清除日志
     */
    clearLogs() {
        this.logEntries = [];
        if (this.options.enableConsoleOutput) {
            console.log('[DebugLogger] 日志已清除');
        }
    }
    /**
     * 导出日志为文本
     */
    exportLogs(category, level) {
        const entries = this.getLogEntries(category, level);
        const lines = [];
        lines.push('=== Debug Logger 导出日志 ===');
        lines.push(`导出时间: ${new Date().toISOString()}`);
        lines.push(`总条目数: ${entries.length}`);
        lines.push('');
        entries.forEach((entry, index) => {
            const timestamp = new Date(entry.timestamp).toISOString();
            const component = entry.componentName ? ` [${entry.componentName}]` : '';
            lines.push(`${index + 1}. [${entry.level.toUpperCase()}] ${timestamp}${component}`);
            lines.push(`   类别: ${entry.category}`);
            lines.push(`   消息: ${entry.message}`);
            if (entry.data) {
                lines.push(`   数据: ${JSON.stringify(entry.data, null, 2)}`);
            }
            if (entry.stackTrace) {
                lines.push(`   调用栈: ${entry.stackTrace}`);
            }
            lines.push('');
        });
        return lines.join('\n');
    }
    /**
     * 生成日志统计报告
     */
    generateStats() {
        const stats = {
            totalEntries: this.logEntries.length,
            entriesByLevel: { debug: 0, info: 0, warn: 0, error: 0 },
            entriesByCategory: {},
            entriesByComponent: {},
            recentErrors: [],
            performanceIssues: [],
        };
        this.logEntries.forEach(entry => {
            // 按级别统计
            stats.entriesByLevel[entry.level]++;
            // 按类别统计
            stats.entriesByCategory[entry.category] = (stats.entriesByCategory[entry.category] || 0) + 1;
            // 按组件统计
            if (entry.componentName) {
                stats.entriesByComponent[entry.componentName] =
                    (stats.entriesByComponent[entry.componentName] || 0) + 1;
            }
            // 收集最近的错误
            if (entry.level === 'error' && stats.recentErrors.length < 10) {
                stats.recentErrors.push(entry);
            }
            // 收集性能问题
            if (entry.category === 'performance' && entry.data?.duration > 100) {
                stats.performanceIssues.push(entry);
            }
        });
        return stats;
    }
    /**
     * 设置日志选项
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }
    /**
     * 核心日志记录方法
     */
    log(level, category, message, data, componentName) {
        // 检查日志级别
        if (this.logLevelPriority[level] < this.logLevelPriority[this.options.logLevel]) {
            return;
        }
        // 检查类别过滤
        if (this.options.categories.length > 0 && !this.options.categories.includes(category)) {
            return;
        }
        // 创建日志条目
        const entry = {
            timestamp: Date.now(),
            level,
            category,
            message,
            data: data ? this.sanitizeValue(data) : undefined,
            stackTrace: this.options.enableStackTrace ? this.getStackTrace() : undefined,
            componentName: this.options.enableComponentTracking ? componentName : undefined,
        };
        // 添加到日志列表
        this.logEntries.push(entry);
        // 限制日志条目数量
        if (this.logEntries.length > this.options.maxLogEntries) {
            this.logEntries = this.logEntries.slice(-this.options.maxLogEntries);
        }
        // 控制台输出
        if (this.options.enableConsoleOutput) {
            this.outputToConsole(entry);
        }
    }
    /**
     * 输出到控制台
     */
    outputToConsole(entry) {
        const timestamp = this.options.enableTimestamp
            ? `[${new Date(entry.timestamp).toISOString()}] `
            : '';
        const component = entry.componentName ? ` [${entry.componentName}]` : '';
        const prefix = `${timestamp}[${entry.category.toUpperCase()}]${component}`;
        const message = `${prefix} ${entry.message}`;
        switch (entry.level) {
            case 'debug':
                console.debug(message, entry.data || '');
                break;
            case 'info':
                console.info(message, entry.data || '');
                break;
            case 'warn':
                console.warn(message, entry.data || '');
                break;
            case 'error':
                console.error(message, entry.data || '');
                if (entry.stackTrace) {
                    console.error('调用栈:', entry.stackTrace);
                }
                break;
        }
    }
    /**
     * 清理敏感数据
     */
    sanitizeValue(value) {
        if (value == null)
            return value;
        if (typeof value === 'function') {
            return '[Function]';
        }
        if (typeof value === 'object') {
            try {
                // 限制对象深度，避免循环引用
                return JSON.parse(JSON.stringify(value, null, 0));
            }
            catch {
                return '[无法序列化的对象]';
            }
        }
        return value;
    }
    /**
     * 比较两个值是否相等
     */
    isValueEqual(a, b) {
        if (a === b)
            return true;
        if (a == null || b == null)
            return a === b;
        if (typeof a !== typeof b)
            return false;
        if (typeof a === 'object') {
            try {
                return JSON.stringify(a) === JSON.stringify(b);
            }
            catch {
                return false;
            }
        }
        return false;
    }
    /**
     * 获取调用栈
     */
    getStackTrace() {
        try {
            throw new Error();
        }
        catch (error) {
            if (error instanceof Error && error.stack) {
                return error.stack.split('\n').slice(3, 8).join('\n'); // 跳过前几行，只保留相关部分
            }
            return '无法获取调用栈';
        }
    }
    /**
     * 销毁实例
     */
    destroy() {
        this.clearLogs();
        DebugLogger.instance = null;
    }
}
DebugLogger.instance = null;
// 导出默认实例
export const debugLogger = DebugLogger.getInstance();
// 导出便捷方法
export const logComponent = (componentName, action, details, level) => {
    debugLogger.logComponent(componentName, action, details, level);
};
export const logStateUpdate = (statePath, prevValue, nextValue, componentName) => {
    debugLogger.logStateUpdate(statePath, prevValue, nextValue, componentName);
};
export const logEffect = (componentName, effectName, dependencies, action) => {
    debugLogger.logEffect(componentName, effectName, dependencies, action);
};
export const logRender = (componentName, renderCount, props, reason) => {
    debugLogger.logRender(componentName, renderCount, props, reason);
};
export const logInfiniteLoop = (detected, details) => {
    debugLogger.logInfiniteLoopDetection(detected, details);
};
//# sourceMappingURL=DebugLogger.js.map