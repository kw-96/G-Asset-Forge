/**
 * 状态验证器
 * 检测和防止React组件状态更新的无限循环
 */
/**
 * 状态验证器类
 * 监控状态更新，检测潜在的无限循环模式
 */
export class StateValidator {
    constructor(options = {}) {
        this.updateHistory = [];
        this.suspiciousPatterns = [];
        this.warningCallbacks = [];
        this.options = {
            maxHistorySize: options.maxHistorySize ?? 100,
            rapidUpdateThreshold: options.rapidUpdateThreshold ?? 10,
            rapidUpdateWindow: options.rapidUpdateWindow ?? 1000, // 1秒
            circularDependencyDepth: options.circularDependencyDepth ?? 5,
            enableStackTrace: options.enableStackTrace ?? false,
            enableLogging: options.enableLogging ?? true,
        };
    }
    /**
     * 验证状态更新
     * 在状态更新前调用此方法进行验证
     */
    validateStateUpdate(statePath, prevValue, nextValue, componentName) {
        // 如果值没有实际变化，建议跳过更新
        if (this.isValueEqual(prevValue, nextValue)) {
            this.log(`状态路径 ${statePath} 的值没有变化，建议跳过更新`);
            return false;
        }
        // 记录状态更新
        const update = {
            timestamp: Date.now(),
            statePath,
            prevValue: this.cloneValue(prevValue),
            nextValue: this.cloneValue(nextValue),
            componentName,
            stackTrace: this.options.enableStackTrace ? this.getStackTrace() : undefined,
        };
        this.recordUpdate(update);
        // 检测可疑模式
        this.detectSuspiciousPatterns();
        return true;
    }
    /**
     * 检测无限循环
     * 分析更新历史，查找循环模式
     */
    detectInfiniteLoop(updateHistory) {
        const history = updateHistory || this.updateHistory;
        if (history.length < 3) {
            return false;
        }
        // 检查最近的更新是否形成循环
        const recentUpdates = history.slice(-10); // 检查最近10次更新
        const pathCounts = new Map();
        for (const update of recentUpdates) {
            const count = pathCounts.get(update.statePath) || 0;
            pathCounts.set(update.statePath, count + 1);
        }
        // 如果同一个状态路径在短时间内更新过多次，可能是无限循环
        for (const [path, count] of pathCounts) {
            if (count >= this.options.rapidUpdateThreshold) {
                this.log(`检测到潜在无限循环: ${path} 在短时间内更新了 ${count} 次`);
                return true;
            }
        }
        return false;
    }
    /**
     * 记录可疑的状态更新
     */
    logSuspiciousUpdates(updates) {
        if (updates.length === 0)
            return;
        this.log('=== 可疑状态更新报告 ===');
        updates.forEach((update, index) => {
            this.log(`${index + 1}. ${update.statePath} (${update.componentName || 'Unknown'})`);
            this.log(`   时间: ${new Date(update.timestamp).toISOString()}`);
            this.log(`   前值: ${JSON.stringify(update.prevValue)}`);
            this.log(`   后值: ${JSON.stringify(update.nextValue)}`);
            if (update.stackTrace) {
                this.log(`   调用栈: ${update.stackTrace}`);
            }
        });
    }
    /**
     * 获取状态更新历史
     */
    getUpdateHistory() {
        return [...this.updateHistory];
    }
    /**
     * 获取可疑模式列表
     */
    getSuspiciousPatterns() {
        return [...this.suspiciousPatterns];
    }
    /**
     * 清除历史记录
     */
    clearHistory() {
        this.updateHistory = [];
        this.suspiciousPatterns = [];
        this.log('状态更新历史已清除');
    }
    /**
     * 添加警告回调
     */
    onWarning(callback) {
        this.warningCallbacks.push(callback);
    }
    /**
     * 移除警告回调
     */
    removeWarning(callback) {
        const index = this.warningCallbacks.indexOf(callback);
        if (index > -1) {
            this.warningCallbacks.splice(index, 1);
        }
    }
    /**
     * 生成状态验证报告
     */
    generateReport() {
        const recentUpdates = this.updateHistory.slice(-10);
        const recommendations = [];
        // 分析并生成建议
        if (this.suspiciousPatterns.length > 0) {
            recommendations.push('检测到可疑的状态更新模式，建议检查组件的useEffect依赖');
        }
        const rapidUpdates = this.suspiciousPatterns.filter(p => p.type === 'rapid_updates');
        if (rapidUpdates.length > 0) {
            recommendations.push('检测到快速连续更新，建议使用防抖或批量更新');
        }
        const circularDeps = this.suspiciousPatterns.filter(p => p.type === 'circular_dependency');
        if (circularDeps.length > 0) {
            recommendations.push('检测到循环依赖，建议重新设计状态结构');
        }
        return {
            totalUpdates: this.updateHistory.length,
            suspiciousPatterns: this.suspiciousPatterns.length,
            recentUpdates,
            recommendations,
        };
    }
    /**
     * 记录状态更新
     */
    recordUpdate(update) {
        this.updateHistory.push(update);
        // 限制历史记录大小
        if (this.updateHistory.length > this.options.maxHistorySize) {
            this.updateHistory = this.updateHistory.slice(-this.options.maxHistorySize);
        }
    }
    /**
     * 检测可疑模式
     */
    detectSuspiciousPatterns() {
        this.detectRapidUpdates();
        this.detectCircularDependencies();
        this.detectInfiniteLoopPattern();
    }
    /**
     * 检测快速连续更新
     */
    detectRapidUpdates() {
        const now = Date.now();
        const windowStart = now - this.options.rapidUpdateWindow;
        const recentUpdates = this.updateHistory.filter(update => update.timestamp >= windowStart);
        if (recentUpdates.length >= this.options.rapidUpdateThreshold) {
            const pathCounts = new Map();
            recentUpdates.forEach(update => {
                const count = pathCounts.get(update.statePath) || 0;
                pathCounts.set(update.statePath, count + 1);
            });
            for (const [path, count] of pathCounts) {
                if (count >= this.options.rapidUpdateThreshold) {
                    const pattern = {
                        type: 'rapid_updates',
                        detectedAt: now,
                        affectedPaths: [path],
                        severity: count > 20 ? 'high' : count > 15 ? 'medium' : 'low',
                        description: `状态路径 ${path} 在 ${this.options.rapidUpdateWindow}ms 内更新了 ${count} 次`,
                        updateCount: count,
                    };
                    this.addSuspiciousPattern(pattern);
                }
            }
        }
    }
    /**
     * 检测循环依赖
     */
    detectCircularDependencies() {
        if (this.updateHistory.length < this.options.circularDependencyDepth) {
            return;
        }
        const recentUpdates = this.updateHistory.slice(-this.options.circularDependencyDepth);
        const pathSequence = recentUpdates.map(update => update.statePath);
        // 检查是否有重复的路径序列
        for (let i = 0; i < pathSequence.length - 1; i++) {
            for (let j = i + 1; j < pathSequence.length; j++) {
                if (pathSequence[i] === pathSequence[j]) {
                    const cyclePaths = pathSequence.slice(i, j);
                    const pattern = {
                        type: 'circular_dependency',
                        detectedAt: Date.now(),
                        affectedPaths: cyclePaths,
                        severity: 'medium',
                        description: `检测到循环依赖: ${cyclePaths.join(' -> ')}`,
                        updateCount: cyclePaths.length,
                    };
                    this.addSuspiciousPattern(pattern);
                    return;
                }
            }
        }
    }
    /**
     * 检测无限循环模式
     */
    detectInfiniteLoopPattern() {
        if (this.detectInfiniteLoop()) {
            const pattern = {
                type: 'infinite_loop',
                detectedAt: Date.now(),
                affectedPaths: Array.from(new Set(this.updateHistory.slice(-10).map(u => u.statePath))),
                severity: 'high',
                description: '检测到潜在的无限循环模式',
                updateCount: this.updateHistory.length,
            };
            this.addSuspiciousPattern(pattern);
        }
    }
    /**
     * 添加可疑模式
     */
    addSuspiciousPattern(pattern) {
        // 避免重复添加相同的模式
        const exists = this.suspiciousPatterns.some(existing => existing.type === pattern.type &&
            existing.affectedPaths.join(',') === pattern.affectedPaths.join(',') &&
            (Date.now() - existing.detectedAt) < 5000 // 5秒内不重复报告
        );
        if (!exists) {
            this.suspiciousPatterns.push(pattern);
            this.log(`检测到可疑模式: ${pattern.description}`);
            // 触发警告回调
            this.warningCallbacks.forEach(callback => {
                try {
                    callback(pattern);
                }
                catch (error) {
                    console.error('警告回调执行失败:', error);
                }
            });
        }
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
     * 克隆值（用于历史记录）
     */
    cloneValue(value) {
        if (value == null || typeof value !== 'object') {
            return value;
        }
        try {
            return JSON.parse(JSON.stringify(value));
        }
        catch {
            return '[无法序列化的对象]';
        }
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
                return error.stack.split('\n').slice(2, 5).join('\n'); // 只保留前几行
            }
            return '无法获取调用栈';
        }
    }
    /**
     * 日志输出
     */
    log(message) {
        if (this.options.enableLogging) {
            console.log(`[StateValidator] ${message}`);
        }
    }
}
// 导出默认实例
export const stateValidator = new StateValidator();
//# sourceMappingURL=StateValidator.js.map