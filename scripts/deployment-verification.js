/**
 * 部署验证脚本
 * 验证所有修复功能在开发环境中正常工作
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentVerifier {
  constructor() {
    this.verificationResults = [];
    this.stats = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warnings: 0,
    };
  }

  /**
   * 验证TypeScript编译
   */
  async verifyTypeScriptCompilation() {
    console.log('验证TypeScript编译...');
    
    try {
      execSync('npx tsc --noEmit --project tsconfig.json', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      this.addResult('TypeScript编译', true, 'TypeScript类型检查通过');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString();
      this.addResult('TypeScript编译', false, `TypeScript编译失败: ${output}`);
    }
  }

  /**
   * 验证构建过程
   */
  async verifyBuild() {
    console.log('验证构建过程...');
    
    try {
      // 清理之前的构建
      if (fs.existsSync(path.resolve(__dirname, '../dist'))) {
        execSync('npm run clean', { 
          stdio: 'pipe',
          cwd: path.resolve(__dirname, '..')
        });
      }
      
      // 执行构建
      execSync('npm run build', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      // 检查构建输出
      const distPath = path.resolve(__dirname, '../dist');
      if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        if (files.length > 0) {
          this.addResult('构建过程', true, `构建成功，生成 ${files.length} 个文件`);
        } else {
          this.addResult('构建过程', false, '构建目录为空');
        }
      } else {
        this.addResult('构建过程', false, '构建目录不存在');
      }
      
    } catch (error) {
      this.addResult('构建过程', false, `构建失败: ${error.message}`);
    }
  }

  /**
   * 验证核心修复组件
   */
  async verifyCoreComponents() {
    console.log('验证核心修复组件...');
    
    const coreComponents = [
      'src/renderer/utils/InitializationManager.ts',
      'src/renderer/utils/StateValidator.ts',
      'src/renderer/utils/DebugLogger.ts',
      'src/renderer/components/ErrorBoundary/EnhancedErrorBoundary.tsx',
      'src/renderer/utils/ErrorAnalyzer.ts',
      'src/renderer/utils/ErrorRecoveryManager.ts',
      'src/renderer/ui/components/Dropdown/StableDropdown.tsx',
      'src/renderer/utils/DevDebugTools.ts',
      'src/renderer/utils/RadixUIPerformanceMonitor.ts',
    ];
    
    let missingComponents = [];
    let existingComponents = [];
    
    for (const component of coreComponents) {
      const filePath = path.resolve(__dirname, '..', component);
      if (fs.existsSync(filePath)) {
        existingComponents.push(component);
      } else {
        missingComponents.push(component);
      }
    }
    
    if (missingComponents.length === 0) {
      this.addResult('核心组件', true, `所有 ${coreComponents.length} 个核心组件存在`);
    } else {
      this.addResult('核心组件', false, `缺少组件: ${missingComponents.join(', ')}`);
    }
  }

  /**
   * 验证测试覆盖
   */
  async verifyTestCoverage() {
    console.log('验证测试覆盖...');
    
    const testFiles = [];
    this.scanForTests(path.resolve(__dirname, '../src'), testFiles);
    
    const expectedTests = [
      'InitializationManager.test.ts',
      'appStore.test.ts',
      'AppContainer.test.tsx',
      'EnhancedErrorBoundary.test.tsx',
      'DevDebugTools.test.ts',
      'StableRadixUI.test.tsx',
    ];
    
    let foundTests = [];
    let missingTests = [];
    
    for (const expectedTest of expectedTests) {
      const found = testFiles.some(testFile => testFile.includes(expectedTest));
      if (found) {
        foundTests.push(expectedTest);
      } else {
        missingTests.push(expectedTest);
      }
    }
    
    if (missingTests.length === 0) {
      this.addResult('测试覆盖', true, `所有 ${expectedTests.length} 个关键测试存在`);
    } else {
      this.addResult('测试覆盖', false, `缺少测试: ${missingTests.join(', ')}`);
    }
  }

  /**
   * 验证性能基准
   */
  async verifyPerformanceBenchmarks() {
    console.log('验证性能基准...');
    
    try {
      // 运行性能基准测试
      const output = execSync('node scripts/verify-radix-ui-stability.js', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      const outputStr = output.toString();
      if (outputStr.includes('验证成功')) {
        this.addResult('性能基准', true, 'Radix UI稳定性验证通过');
      } else {
        this.addResult('性能基准', false, '性能基准验证失败');
      }
      
    } catch (error) {
      this.addResult('性能基准', false, `性能基准测试失败: ${error.message}`);
    }
  }

  /**
   * 验证错误边界功能
   */
  async verifyErrorBoundary() {
    console.log('验证错误边界功能...');
    
    try {
      const output = execSync('node scripts/verify-error-boundary-simple.js', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      const outputStr = output.toString();
      if (outputStr.includes('验证成功')) {
        this.addResult('错误边界', true, '错误边界功能验证通过');
      } else {
        this.addResult('错误边界', false, '错误边界功能验证失败');
      }
      
    } catch (error) {
      this.addResult('错误边界', false, `错误边界验证失败: ${error.message}`);
    }
  }

  /**
   * 验证代码质量
   */
  async verifyCodeQuality() {
    console.log('验证代码质量...');
    
    try {
      const output = execSync('node scripts/code-quality-check.js', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      const outputStr = output.toString();
      const errorCount = (outputStr.match(/错误数: (\d+)/)?.[1]) || '0';
      const warningCount = (outputStr.match(/警告数: (\d+)/)?.[1]) || '0';
      
      if (parseInt(errorCount) === 0) {
        this.addResult('代码质量', true, `代码质量检查通过 (${warningCount} 个警告)`);
        if (parseInt(warningCount) > 0) {
          this.stats.warnings += parseInt(warningCount);
        }
      } else {
        this.addResult('代码质量', false, `发现 ${errorCount} 个错误, ${warningCount} 个警告`);
      }
      
    } catch (error) {
      // 代码质量检查可能会因为警告而退出，但这不一定是失败
      const errorStr = error.message || '';
      if (errorStr.includes('错误数: 0')) {
        this.addResult('代码质量', true, '代码质量检查通过（有警告）');
      } else {
        this.addResult('代码质量', false, `代码质量检查失败: ${error.message}`);
      }
    }
  }

  /**
   * 验证文档完整性
   */
  async verifyDocumentation() {
    console.log('验证文档完整性...');
    
    const requiredDocs = [
      'README.md',
      'src/renderer/components/ErrorBoundary/README.md',
      'src/renderer/ui/components/RadixUI/README.md',
    ];
    
    let missingDocs = [];
    let existingDocs = [];
    
    for (const doc of requiredDocs) {
      const docPath = path.resolve(__dirname, '..', doc);
      if (fs.existsSync(docPath)) {
        existingDocs.push(doc);
      } else {
        missingDocs.push(doc);
      }
    }
    
    if (missingDocs.length === 0) {
      this.addResult('文档完整性', true, `所有 ${requiredDocs.length} 个文档存在`);
    } else {
      this.addResult('文档完整性', false, `缺少文档: ${missingDocs.join(', ')}`);
    }
  }

  /**
   * 验证环境兼容性
   */
  async verifyEnvironmentCompatibility() {
    console.log('验证环境兼容性...');
    
    const nodeVersion = process.version;
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    
    // 检查Node.js版本
    const nodeVersionNum = parseInt(nodeVersion.substring(1));
    if (nodeVersionNum >= 16) {
      this.addResult('Node.js版本', true, `Node.js ${nodeVersion} 兼容`);
    } else {
      this.addResult('Node.js版本', false, `Node.js ${nodeVersion} 版本过低，建议升级到16+`);
    }
    
    // 检查npm版本
    const npmVersionNum = parseInt(npmVersion.split('.')[0]);
    if (npmVersionNum >= 7) {
      this.addResult('npm版本', true, `npm ${npmVersion} 兼容`);
    } else {
      this.addResult('npm版本', false, `npm ${npmVersion} 版本过低，建议升级到7+`);
    }
    
    // 检查操作系统
    const platform = process.platform;
    const supportedPlatforms = ['win32', 'darwin', 'linux'];
    
    if (supportedPlatforms.includes(platform)) {
      this.addResult('操作系统', true, `${platform} 平台支持`);
    } else {
      this.addResult('操作系统', false, `${platform} 平台可能不受支持`);
    }
  }

  /**
   * 扫描测试文件
   */
  scanForTests(dirPath, testFiles) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', '.git'].includes(file)) {
          this.scanForTests(filePath, testFiles);
        }
      } else if (file.includes('.test.') || file.includes('.spec.')) {
        testFiles.push(filePath);
      }
    }
  }

  /**
   * 添加验证结果
   */
  addResult(category, passed, message) {
    this.verificationResults.push({
      category,
      passed,
      message,
      timestamp: new Date().toISOString(),
    });
    
    this.stats.totalChecks++;
    if (passed) {
      this.stats.passedChecks++;
    } else {
      this.stats.failedChecks++;
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log('\n=== 部署验证报告 ===');
    console.log(`总检查项: ${this.stats.totalChecks}`);
    console.log(`通过检查: ${this.stats.passedChecks}`);
    console.log(`失败检查: ${this.stats.failedChecks}`);
    console.log(`警告数量: ${this.stats.warnings}`);
    
    const successRate = (this.stats.passedChecks / this.stats.totalChecks * 100).toFixed(1);
    console.log(`成功率: ${successRate}%`);
    
    console.log('\n详细结果:');
    for (const result of this.verificationResults) {
      const status = result.passed ? '✓' : '✗';
      console.log(`  ${status} ${result.category}: ${result.message}`);
    }
    
    // 生成建议
    const suggestions = this.generateSuggestions();
    if (suggestions.length > 0) {
      console.log('\n部署建议:');
      for (const suggestion of suggestions) {
        console.log(`  • ${suggestion}`);
      }
    }
    
    // 生成JSON报告
    this.generateJSONReport();
    
    console.log('\n✅ 部署验证完成！');
    
    return this.stats.failedChecks === 0;
  }

  /**
   * 生成建议
   */
  generateSuggestions() {
    const suggestions = [];
    
    if (this.stats.failedChecks > 0) {
      suggestions.push('修复所有失败的检查项后再进行部署');
    }
    
    if (this.stats.warnings > 10) {
      suggestions.push('考虑修复代码质量警告以提高稳定性');
    }
    
    const failedCategories = this.verificationResults
      .filter(r => !r.passed)
      .map(r => r.category);
    
    if (failedCategories.includes('TypeScript编译')) {
      suggestions.push('优先修复TypeScript类型错误');
    }
    
    if (failedCategories.includes('构建过程')) {
      suggestions.push('检查构建配置和依赖项');
    }
    
    if (failedCategories.includes('核心组件')) {
      suggestions.push('确保所有核心修复组件都已正确实现');
    }
    
    return suggestions;
  }

  /**
   * 生成JSON报告
   */
  generateJSONReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      results: this.verificationResults,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      suggestions: this.generateSuggestions(),
    };
    
    const reportPath = path.resolve(__dirname, '../deployment-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  }

  /**
   * 执行完整的部署验证
   */
  async verify() {
    console.log('=== 开始部署验证 ===\n');
    
    await this.verifyEnvironmentCompatibility();
    await this.verifyTypeScriptCompilation();
    await this.verifyCoreComponents();
    await this.verifyTestCoverage();
    await this.verifyErrorBoundary();
    await this.verifyPerformanceBenchmarks();
    await this.verifyCodeQuality();
    await this.verifyDocumentation();
    await this.verifyBuild();
    
    return this.generateReport();
  }
}

// 执行验证
async function main() {
  const verifier = new DeploymentVerifier();
  
  try {
    const success = await verifier.verify();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('部署验证过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { DeploymentVerifier };