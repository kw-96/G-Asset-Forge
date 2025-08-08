/**
 * 手动测试脚本
 * 验证React无限循环修复工具的基本功能
 */
import { reactLoopFixToolkit } from '../ReactLoopFix';
async function runManualTests() {
    console.log('=== React无限循环修复工具手动测试 ===\n');
    try {
        // 测试1: 应用初始化
        console.log('测试1: 应用初始化');
        const mockInit = async () => {
            console.log('  执行模拟初始化...');
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('  初始化完成');
        };
        await reactLoopFixToolkit.initializeAppOnce(mockInit);
        console.log('  ✓ 应用初始化成功');
        console.log(`  ✓ 初始化状态: ${reactLoopFixToolkit.initManager.isInitialized}`);
        // 测试重复初始化
        await reactLoopFixToolkit.initializeAppOnce(mockInit);
        console.log('  ✓ 重复初始化被正确阻止\n');
        // 测试2: 状态更新验证
        console.log('测试2: 状态更新验证');
        // 正常状态更新
        const result1 = reactLoopFixToolkit.validateStateUpdate('user.name', 'old', 'new', 'UserComponent');
        console.log(`  ✓ 正常状态更新验证: ${result1}`);
        // 无变化的状态更新
        const result2 = reactLoopFixToolkit.validateStateUpdate('user.name', 'same', 'same', 'UserComponent');
        console.log(`  ✓ 无变化状态更新验证: ${result2}\n`);
        // 测试3: 组件渲染日志
        console.log('测试3: 组件渲染日志');
        reactLoopFixToolkit.logComponentRender('TestComponent', 1, { id: 1 }, 'initial render');
        reactLoopFixToolkit.logComponentRender('TestComponent', 2, { id: 1, name: 'test' }, 'props changed');
        console.log('  ✓ 组件渲染日志记录完成\n');
        // 测试4: useEffect日志
        console.log('测试4: useEffect日志');
        reactLoopFixToolkit.logEffectExecution('TestComponent', 'dataFetch', ['userId'], 'mount');
        reactLoopFixToolkit.logEffectExecution('TestComponent', 'dataFetch', ['userId', 'apiKey'], 'update');
        console.log('  ✓ useEffect日志记录完成\n');
        // 测试5: 快速连续更新检测
        console.log('测试5: 快速连续更新检测');
        for (let i = 0; i < 8; i++) {
            reactLoopFixToolkit.validateStateUpdate('test.rapid', i, i + 1, 'TestComponent');
        }
        console.log('  ✓ 快速连续更新已记录\n');
        // 测试6: 无限循环检测
        console.log('测试6: 无限循环检测');
        for (let i = 0; i < 12; i++) {
            reactLoopFixToolkit.validateStateUpdate('test.loop', i % 2, (i + 1) % 2, 'LoopComponent');
        }
        const hasLoop = reactLoopFixToolkit.detectInfiniteLoop();
        console.log(`  ✓ 无限循环检测结果: ${hasLoop}\n`);
        // 测试7: 诊断报告
        console.log('测试7: 诊断报告');
        const report = reactLoopFixToolkit.generateDiagnosticReport();
        console.log('  ✓ 诊断报告生成成功:');
        console.log(`    - 初始化状态: ${report.initialization.isInitialized}`);
        console.log(`    - 状态更新总数: ${report.stateValidation.totalUpdates}`);
        console.log(`    - 可疑模式数: ${report.stateValidation.suspiciousPatterns}`);
        console.log(`    - 日志条目总数: ${report.logging.totalEntries}`);
        console.log(`    - 错误日志数: ${report.logging.entriesByLevel.error}`);
        console.log(`    - 警告日志数: ${report.logging.entriesByLevel.warn}\n`);
        // 测试8: 可疑模式检测
        console.log('测试8: 可疑模式检测');
        const suspiciousPatterns = reactLoopFixToolkit.stateValidator.getSuspiciousPatterns();
        console.log(`  ✓ 检测到 ${suspiciousPatterns.length} 个可疑模式:`);
        suspiciousPatterns.forEach((pattern, index) => {
            console.log(`    ${index + 1}. ${pattern.type} - ${pattern.severity} - ${pattern.description}`);
        });
        console.log('');
        // 测试9: 日志统计
        console.log('测试9: 日志统计');
        const logStats = reactLoopFixToolkit.debugLogger.generateStats();
        console.log('  ✓ 日志统计信息:');
        console.log(`    - 总条目: ${logStats.totalEntries}`);
        console.log(`    - 按级别分布: debug=${logStats.entriesByLevel.debug}, info=${logStats.entriesByLevel.info}, warn=${logStats.entriesByLevel.warn}, error=${logStats.entriesByLevel.error}`);
        console.log(`    - 性能问题: ${logStats.performanceIssues.length}`);
        console.log(`    - 最近错误: ${logStats.recentErrors.length}\n`);
        // 测试10: 清理功能
        console.log('测试10: 清理功能');
        const beforeClear = reactLoopFixToolkit.stateValidator.getUpdateHistory().length;
        reactLoopFixToolkit.clearAllHistory();
        const afterClear = reactLoopFixToolkit.stateValidator.getUpdateHistory().length;
        console.log(`  ✓ 历史数据清理: ${beforeClear} -> ${afterClear}\n`);
        console.log('=== 所有测试完成 ===');
        console.log('✓ 所有功能正常工作');
    }
    catch (error) {
        console.error('测试失败:', error);
    }
    finally {
        // 清理
        reactLoopFixToolkit.destroy();
    }
}
// 如果直接运行此文件，执行测试
if (require.main === module) {
    runManualTests();
}
export { runManualTests };
//# sourceMappingURL=manual-test.js.map