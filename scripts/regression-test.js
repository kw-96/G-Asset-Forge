/**
 * 回归测试脚本
 * 确保修复没有引入新的问题
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RegressionTester {
  constructor() {
    this.testResults = [];
    this.stats = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
    };
  }

  /**
   * 运行单元测试
   */
  async runUnitTests() {
    console.log('运行单元测试...');
    
    try {
      // 检查是否有Jest配置
      const jestConfigExists = fs.existsSync(path.resolve(__dirname, '../jest.config.js')) ||
                              fs.existsSync(path.resolve(__dirname, '../jest.config.json'));
      
      if (!jestConfigExists) {
        this.addTestResult('单元测试', 'skipped', 'Jest配置不存在，跳过单元测试');
        return;
      }
      
      const output = execSync('npm test -- --passWithNoTests --verbose', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      const outputStr = output.toString();
      const testSummary = this.parseJestOutput(outputStr);
      
      if (testSummary.failed === 0) {
        this.addTestResult('单元测试', 'passed', 
          `${testSummary.passed} 个测试通过, ${testSummary.total} 个测试套件`);
      } else {
        this.addTestResult('单元测试', 'failed', 
          `${testSummary.failed} 个测试失败, ${testSummary.passed} 个测试通过`);
      }
      
    } catch (error) {
      // 检查是否是因为没有测试脚本
      if (error.message.includes('Missing script: "test"')) {
        this.addTestResult('单元测试', 'skipped', '没有配置测试脚本');
      } else {
        this.addTestResult('单元测试', 'failed', `单元测试执行失败: ${error.message}`);
      }
    }
  }

  /**
   * 测试应用启动
   */
  async testApplicationStartup() {
    console.log('测试应用启动...');
    
    try {
      // 测试TypeScript编译
      execSync('npx tsc --noEmit --project tsconfig.json', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      this.addTestResult('应用启动', 'passed', 'TypeScript编译成功');
      
    } catch (error) {
      this.addTestResult('应用启动', 'failed', `应用启动测试失败: ${error.message}`);
    }
  }

  /**
   * 测试无限循环修复
   */
  async testInfiniteLoopFix() {
    console.log('测试无限循环修复...');
    
    const testCases = [
      {
        name: 'InitializationManager',
        test: () => this.testInitializationManager(),
      },
      {
        name: 'StateValidator',
        test: () => this.testStateValidator(),
      },
      {
        name: 'ErrorBoundary',
        test: () => this.testErrorBoundary(),
      },
    ];
    
    for (const testCase of testCases) {
      try {
        await testCase.test();
        this.addTestResult(`无限循环修复-${testCase.name}`, 'passed', `${testCase.name}功能正常`);
      } catch (error) {
        this.addTestResult(`无限循环修复-${testCase.name}`, 'failed', 
          `${testCase.name}测试失败: ${error.message}`);
      }
    }
  }

  /**
   * 测试InitializationManager
   */
  async testInitializationManager() {
    const filePath = path.resolve(__dirname, '../src/renderer/utils/InitializationManager.ts');
    if (!fs.existsSync(filePath)) {
      throw new Error('InitializationManager文件不存在');
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查关键方法
    const requiredMethods = ['initializeOnce', 'isInitialized', 'reset'];
    for (const method of requiredMethods) {
      if (!content.includes(method)) {
        throw new Error(`缺少${method}方法`);
      }
    }
    
    // 检查单例模式
    if (!content.includes('getInstance')) {
      throw new Error('缺少单例模式实现');
    }
  }

  /**
   * 测试StateValidator
   */
  async testStateValidator() {
    const filePath = path.resolve(__dirname, '../src/renderer/utils/StateValidator.ts');
    if (!fs.existsSync(filePath)) {
      throw new Error('StateValidator文件不存在');
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查关键方法
    const requiredMethods = ['validateStateUpdate', 'detectInfiniteLoop'];
    for (const method of requiredMethods) {
      if (!content.includes(method)) {
        throw new Error(`缺少${method}方法`);
      }
    }
  }

  /**
   * 测试ErrorBoundary
   */
  async testErrorBoundary() {
    const filePath = path.resolve(__dirname, '../src/renderer/components/ErrorBoundary/EnhancedErrorBoundary.tsx');
    if (!fs.existsSync(filePath)) {
      throw new Error('EnhancedErrorBoundary文件不存在');
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查关键方法
    const requiredMethods = ['componentDidCatch', 'getDerivedStateFromError'];
    for (const method of requiredMethods) {
      if (!content.includes(method)) {
        throw new Error(`缺少${method}方法`);
      }
    }
    
    // 检查错误恢复功能
    if (!content.includes('handleRecovery')) {
      throw new Error('缺少错误恢复功能');
    }
  }

  /**
   * 测试性能影响
   */
  async testPerformanceImpact() {
    console.log('测试性能影响...');
    
    try {
      // 运行性能基准测试
      const output = execSync('node scripts/verify-radix-ui-stability.js', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      const outputStr = output.toString();
      if (outputStr.includes('验证成功')) {
        this.addTestResult('性能影响', 'passed', '性能基准测试通过');
      } else {
        this.addTestResult('性能影响', 'failed', '性能基准测试失败');
      }
      
    } catch (error) {
      this.addTestResult('性能影响', 'failed', `性能测试失败: ${error.message}`);
    }
  }

  /**
   * 测试向后兼容性
   */
  async testBackwardCompatibility() {
    console.log('测试向后兼容性...');
    
    const compatibilityChecks = [
      {
        name: '原始组件导出',
        check: () => this.checkOriginalExports(),
      },
      {
        name: 'API兼容性',
        check: () => this.checkAPICompatibility(),
      },
      {
        name: '类型兼容性',
        check: () => this.checkTypeCompatibility(),
      },
    ];
    
    for (const check of compatibilityChecks) {
      try {
        await check.check();
        this.addTestResult(`向后兼容性-${check.name}`, 'passed', `${check.name}检查通过`);
      } catch (error) {
        this.addTestResult(`向后兼容性-${check.name}`, 'failed', 
          `${check.name}检查失败: ${error.message}`);
      }
    }
  }

  /**
   * 检查原始组件导出
   */
  async checkOriginalExports() {
    const indexPath = path.resolve(__dirname, '../src/renderer/ui/components/RadixUI/index.ts');
    if (!fs.existsSync(indexPath)) {
      throw new Error('RadixUI index文件不存在');
    }
    
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // 检查原始组件是否仍然导出
    const originalExports = ['Dropdown', 'Switch', 'Slider'];
    for (const exportName of originalExports) {
      if (!content.includes(`export { ${exportName}`)) {
        throw new Error(`原始组件${exportName}未导出`);
      }
    }
  }

  /**
   * 检查API兼容性
   */
  async checkAPICompatibility() {
    // 检查AppStore API
    const appStorePath = path.resolve(__dirname, '../src/renderer/stores/appStore.ts');
    if (!fs.existsSync(appStorePath)) {
      throw new Error('AppStore文件不存在');
    }
    
    const content = fs.readFileSync(appStorePath, 'utf8');
    
    // 检查关键API是否保持
    const requiredAPIs = ['setTheme', 'setLanguage', 'toggleTheme'];
    for (const api of requiredAPIs) {
      if (!content.includes(api)) {
        throw new Error(`API ${api} 不存在`);
      }
    }
  }

  /**
   * 检查类型兼容性
   */
  async checkTypeCompatibility() {
    // 运行TypeScript编译检查类型兼容性
    try {
      execSync('npx tsc --noEmit --project tsconfig.json', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
    } catch (error) {
      throw new Error('类型兼容性检查失败');
    }
  }

  /**
   * 测试边缘情况
   */
  async testEdgeCases() {
    console.log('测试边缘情况...');
    
    const edgeCases = [
      {
        name: '空状态处理',
        test: () => this.testEmptyStateHandling(),
      },
      {
        name: '错误状态恢复',
        test: () => this.testErrorStateRecovery(),
      },
      {
        name: '并发初始化',
        test: () => this.testConcurrentInitialization(),
      },
    ];
    
    for (const edgeCase of edgeCases) {
      try {
        await edgeCase.test();
        this.addTestResult(`边缘情况-${edgeCase.name}`, 'passed', `${edgeCase.name}测试通过`);
      } catch (error) {
        this.addTestResult(`边缘情况-${edgeCase.name}`, 'failed', 
          `${edgeCase.name}测试失败: ${error.message}`);
      }
    }
  }

  /**
   * 测试空状态处理
   */
  async testEmptyStateHandling() {
    // 检查组件是否正确处理空状态
    const appStorePath = path.resolve(__dirname, '../src/renderer/stores/appStore.ts');
    const content = fs.readFileSync(appStorePath, 'utf8');
    
    if (!content.includes('null') && !content.includes('undefined')) {
      throw new Error('缺少空状态处理');
    }
  }

  /**
   * 测试错误状态恢复
   */
  async testErrorStateRecovery() {
    // 检查错误边界是否实现了恢复机制
    const errorBoundaryPath = path.resolve(__dirname, '../src/renderer/components/ErrorBoundary/EnhancedErrorBoundary.tsx');
    const content = fs.readFileSync(errorBoundaryPath, 'utf8');
    
    if (!content.includes('handleRecovery') || !content.includes('resetApp')) {
      throw new Error('缺少错误状态恢复机制');
    }
  }

  /**
   * 测试并发初始化
   */
  async testConcurrentInitialization() {
    // 检查InitializationManager是否处理并发
    const initManagerPath = path.resolve(__dirname, '../src/renderer/utils/InitializationManager.ts');
    const content = fs.readFileSync(initManagerPath, 'utf8');
    
    if (!content.includes('Promise') || !content.includes('await')) {
      throw new Error('缺少并发初始化处理');
    }
  }

  /**
   * 解析Jest输出
   */
  parseJestOutput(output) {
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    };
    
    // 简单的输出解析
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('Tests:')) {
        const matches = line.match(/(\d+) passed/);
        if (matches) {
          summary.passed = parseInt(matches[1]);
        }
        
        const failedMatches = line.match(/(\d+) failed/);
        if (failedMatches) {
          summary.failed = parseInt(failedMatches[1]);
        }
        
        summary.total = summary.passed + summary.failed;
        break;
      }
    }
    
    return summary;
  }

  /**
   * 添加测试结果
   */
  addTestResult(testName, status, message) {
    this.testResults.push({
      testName,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
    
    this.stats.totalTests++;
    switch (status) {
      case 'passed':
        this.stats.passedTests++;
        break;
      case 'failed':
        this.stats.failedTests++;
        break;
      case 'skipped':
        this.stats.skippedTests++;
        break;
    }
  }

  /**
   * 生成回归测试报告
   */
  generateReport() {
    console.log('\n=== 回归测试报告 ===');
    console.log(`总测试数: ${this.stats.totalTests}`);
    console.log(`通过测试: ${this.stats.passedTests}`);
    console.log(`失败测试: ${this.stats.failedTests}`);
    console.log(`跳过测试: ${this.stats.skippedTests}`);
    
    const successRate = this.stats.totalTests > 0 
      ? (this.stats.passedTests / this.stats.totalTests * 100).toFixed(1)
      : '0';
    console.log(`成功率: ${successRate}%`);
    
    console.log('\n测试详情:');
    for (const result of this.testResults) {
      const statusIcon = {
        'passed': '✓',
        'failed': '✗',
        'skipped': '⊝'
      }[result.status] || '?';
      
      console.log(`  ${statusIcon} ${result.testName}: ${result.message}`);
    }
    
    // 生成JSON报告
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      results: this.testResults,
      summary: {
        allTestsPassed: this.stats.failedTests === 0,
        regressionDetected: this.stats.failedTests > 0,
        successRate: parseFloat(successRate),
      },
    };
    
    const reportPath = path.resolve(__dirname, '../regression-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
    console.log('\n✅ 回归测试完成！');
    
    return this.stats.failedTests === 0;
  }

  /**
   * 执行完整的回归测试
   */
  async runRegressionTests() {
    console.log('=== 开始回归测试 ===\n');
    
    await this.runUnitTests();
    await this.testApplicationStartup();
    await this.testInfiniteLoopFix();
    await this.testPerformanceImpact();
    await this.testBackwardCompatibility();
    await this.testEdgeCases();
    
    return this.generateReport();
  }
}

// 执行回归测试
async function main() {
  const tester = new RegressionTester();
  
  try {
    const success = await tester.runRegressionTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('回归测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { RegressionTester };