import { fileOperationOptimizer } from './FileOperationOptimizer';
import path from 'path-browserify';

export interface PerformanceTestResult {
  testName: string;
  passed: boolean;
  actualValue: number;
  expectedValue: number;
  unit: string;
  details?: string;
}

export interface PerformanceTestSuite {
  suiteName: string;
  results: PerformanceTestResult[];
  overallPassed: boolean;
  executionTime: number;
}

/**
 * 性能测试运行器
 * 用于验证文件操作性能是否达到预期目标
 */
export class PerformanceTestRunner {
  private testDataPath: string;

  constructor(testDataPath: string = './test-data') {
    this.testDataPath = testDataPath;
  }

  /**
   * 运行完整的性能测试套件
   */
  async runFullTestSuite(): Promise<PerformanceTestSuite> {
    const startTime = performance.now();
    const results: PerformanceTestResult[] = [];

    console.log('开始运行性能测试套件...');

    try {
      // 测试1: 文件保存性能 - 目标1秒内完成
      const saveTest = await this.testFileSavePerformance();
      results.push(saveTest);

      // 测试2: 文件加载性能 - 目标2秒内完成
      const loadTest = await this.testFileLoadPerformance();
      results.push(loadTest);

      // 测试3: 大文件处理性能
      const largeFileTest = await this.testLargeFilePerformance();
      results.push(largeFileTest);

      // 测试4: 并发操作性能
      const concurrentTest = await this.testConcurrentOperations();
      results.push(concurrentTest);

      // 测试5: 缓存效率测试
      const cacheTest = await this.testCacheEfficiency();
      results.push(cacheTest);

      // 测试6: 错误恢复性能
      const errorRecoveryTest = await this.testErrorRecovery();
      results.push(errorRecoveryTest);

    } catch (error) {
      console.error('性能测试执行失败:', error);
      results.push({
        testName: '测试套件执行',
        passed: false,
        actualValue: 0,
        expectedValue: 1,
        unit: 'success',
        details: `测试执行失败: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    const executionTime = performance.now() - startTime;
    const overallPassed = results.every(result => result.passed);

    const suite: PerformanceTestSuite = {
      suiteName: '文件操作性能测试',
      results,
      overallPassed,
      executionTime
    };

    console.log(`性能测试套件完成: ${overallPassed ? '通过' : '失败'} (${executionTime.toFixed(2)}ms)`);
    return suite;
  }

  /**
   * 测试文件保存性能
   */
  private async testFileSavePerformance(): Promise<PerformanceTestResult> {
    const testData = this.generateTestData(1024); // 1KB测试数据
    const testFilePath = path.join(this.testDataPath, 'save-test.json');

    try {
      const metrics = await fileOperationOptimizer.saveFile(testFilePath, testData, {
        timeout: 2000,
        maxRetries: 1
      });

      return {
        testName: '文件保存性能',
        passed: metrics.duration <= 1000,
        actualValue: metrics.duration,
        expectedValue: 1000,
        unit: 'ms',
        details: `保存${testData.length}字节数据耗时${metrics.duration.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        testName: '文件保存性能',
        passed: false,
        actualValue: 0,
        expectedValue: 1000,
        unit: 'ms',
        details: `保存失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 测试文件加载性能
   */
  private async testFileLoadPerformance(): Promise<PerformanceTestResult> {
    const testData = this.generateTestData(1024); // 1KB测试数据
    const testFilePath = path.join(this.testDataPath, 'load-test.json');

    try {
      // 先保存测试文件
      await fileOperationOptimizer.saveFile(testFilePath, testData);

      // 测试加载性能
      const { metrics } = await fileOperationOptimizer.loadFile(testFilePath, {
        timeout: 3000,
        maxRetries: 1
      });

      return {
        testName: '文件加载性能',
        passed: metrics.duration <= 2000,
        actualValue: metrics.duration,
        expectedValue: 2000,
        unit: 'ms',
        details: `加载${testData.length}字节数据耗时${metrics.duration.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        testName: '文件加载性能',
        passed: false,
        actualValue: 0,
        expectedValue: 2000,
        unit: 'ms',
        details: `加载失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 测试大文件处理性能
   */
  private async testLargeFilePerformance(): Promise<PerformanceTestResult> {
    const largeTestData = this.generateTestData(1024 * 100); // 100KB测试数据
    const testFilePath = path.join(this.testDataPath, 'large-file-test.json');

    try {
      const metrics = await fileOperationOptimizer.saveFile(testFilePath, largeTestData, {
        timeout: 5000,
        maxRetries: 1
      });

      // 大文件保存应该在3秒内完成
      return {
        testName: '大文件处理性能',
        passed: metrics.duration <= 3000,
        actualValue: metrics.duration,
        expectedValue: 3000,
        unit: 'ms',
        details: `保存${largeTestData.length}字节大文件耗时${metrics.duration.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        testName: '大文件处理性能',
        passed: false,
        actualValue: 0,
        expectedValue: 3000,
        unit: 'ms',
        details: `大文件处理失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 测试并发操作性能
   */
  private async testConcurrentOperations(): Promise<PerformanceTestResult> {
    const testData = this.generateTestData(512); // 512字节测试数据
    const concurrentCount = 5;
    const startTime = performance.now();

    try {
      const promises = Array.from({ length: concurrentCount }, (_, index) => {
        const testFilePath = path.join(this.testDataPath, `concurrent-test-${index}.json`);
        return fileOperationOptimizer.saveFile(testFilePath, testData, {
          timeout: 3000,
          maxRetries: 1
        });
      });

      await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      // 并发操作应该在2秒内完成
      return {
        testName: '并发操作性能',
        passed: totalTime <= 2000,
        actualValue: totalTime,
        expectedValue: 2000,
        unit: 'ms',
        details: `${concurrentCount}个并发操作耗时${totalTime.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        testName: '并发操作性能',
        passed: false,
        actualValue: 0,
        expectedValue: 2000,
        unit: 'ms',
        details: `并发操作失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 测试缓存效率
   */
  private async testCacheEfficiency(): Promise<PerformanceTestResult> {
    const testData = this.generateTestData(1024);
    const testFilePath = path.join(this.testDataPath, 'cache-test.json');

    try {
      // 先保存文件
      await fileOperationOptimizer.saveFile(testFilePath, testData);

      // 第一次加载（从磁盘）
      const { metrics: firstLoad } = await fileOperationOptimizer.loadFile(testFilePath, {
        cacheEnabled: true
      });

      // 第二次加载（从缓存）
      const { metrics: secondLoad } = await fileOperationOptimizer.loadFile(testFilePath, {
        cacheEnabled: true
      });

      // 缓存加载应该比第一次快至少50%
      const speedImprovement = (firstLoad.duration - secondLoad.duration) / firstLoad.duration;
      const passed = speedImprovement >= 0.5 || secondLoad.duration < 50; // 缓存加载应该很快

      return {
        testName: '缓存效率',
        passed,
        actualValue: speedImprovement * 100,
        expectedValue: 50,
        unit: '%',
        details: `首次加载${firstLoad.duration.toFixed(2)}ms，缓存加载${secondLoad.duration.toFixed(2)}ms，提升${(speedImprovement * 100).toFixed(1)}%`
      };
    } catch (error) {
      return {
        testName: '缓存效率',
        passed: false,
        actualValue: 0,
        expectedValue: 50,
        unit: '%',
        details: `缓存测试失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 测试错误恢复性能
   */
  private async testErrorRecovery(): Promise<PerformanceTestResult> {
    const testData = this.generateTestData(1024);
    const invalidPath = '/invalid/path/that/does/not/exist/test.json';

    try {
      const startTime = performance.now();
      
      try {
        await fileOperationOptimizer.saveFile(invalidPath, testData, {
          timeout: 1000,
          maxRetries: 2
        });
        // 如果没有抛出错误，说明测试失败
        return {
          testName: '错误恢复性能',
          passed: false,
          actualValue: 0,
          expectedValue: 1,
          unit: 'success',
          details: '预期操作失败但实际成功了'
        };
      } catch (error) {
        const recoveryTime = performance.now() - startTime;
        
        // 错误恢复应该在3秒内完成（包括重试）
        return {
          testName: '错误恢复性能',
          passed: recoveryTime <= 3000,
          actualValue: recoveryTime,
          expectedValue: 3000,
          unit: 'ms',
          details: `错误恢复耗时${recoveryTime.toFixed(2)}ms，错误: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    } catch (error) {
      return {
        testName: '错误恢复性能',
        passed: false,
        actualValue: 0,
        expectedValue: 3000,
        unit: 'ms',
        details: `错误恢复测试失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * 生成测试数据
   */
  private generateTestData(sizeInBytes: number): string {
    const data = {
      id: 'test-' + Date.now(),
      timestamp: new Date().toISOString(),
      content: 'A'.repeat(Math.max(0, sizeInBytes - 100)), // 预留100字节给其他字段
      metadata: {
        size: sizeInBytes,
        type: 'performance-test',
        version: '1.0.0'
      }
    };

    return JSON.stringify(data);
  }

  /**
   * 清理测试文件
   */
  async cleanupTestFiles(): Promise<void> {
    try {
      const fs = await import('fs-extra');
      if (await fs.pathExists(this.testDataPath)) {
        await fs.remove(this.testDataPath);
        console.log('测试文件已清理');
      }
    } catch (error) {
      console.warn('清理测试文件失败:', error);
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(suite: PerformanceTestSuite): string {
    const lines: string[] = [];
    
    lines.push(`=== ${suite.suiteName} ===`);
    lines.push(`执行时间: ${suite.executionTime.toFixed(2)}ms`);
    lines.push(`整体结果: ${suite.overallPassed ? '通过' : '失败'}`);
    lines.push('');

    suite.results.forEach((result, index) => {
      lines.push(`${index + 1}. ${result.testName}`);
      lines.push(`   结果: ${result.passed ? '通过' : '失败'}`);
      lines.push(`   实际值: ${result.actualValue}${result.unit}`);
      lines.push(`   期望值: ≤${result.expectedValue}${result.unit}`);
      if (result.details) {
        lines.push(`   详情: ${result.details}`);
      }
      lines.push('');
    });

    return lines.join('\n');
  }
}

// 创建全局实例
export const performanceTestRunner = new PerformanceTestRunner();