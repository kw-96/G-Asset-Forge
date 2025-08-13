/**
 * 代码质量检查脚本
 * 检查代码质量和一致性
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeQualityChecker {
  constructor() {
    this.issues = [];
    this.stats = {
      filesChecked: 0,
      issuesFound: 0,
      warningsFound: 0,
      errorsFound: 0,
    };
  }

  /**
   * 检查TypeScript类型安全
   */
  checkTypeScript() {
    console.log('检查TypeScript类型安全...');
    
    try {
      execSync('npx tsc --noEmit --project tsconfig.json', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      console.log('✓ TypeScript类型检查通过');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString();
      this.addIssue('error', 'TypeScript类型错误', output);
      console.log('✗ TypeScript类型检查失败');
    }
  }

  /**
   * 检查ESLint规则
   */
  checkESLint() {
    console.log('检查ESLint规则...');
    
    try {
      const output = execSync('npx eslint src --ext .ts,.tsx --format json', { 
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '..')
      });
      
      const results = JSON.parse(output.toString());
      let totalErrors = 0;
      let totalWarnings = 0;
      
      for (const result of results) {
        totalErrors += result.errorCount;
        totalWarnings += result.warningCount;
        
        if (result.messages.length > 0) {
          for (const message of result.messages) {
            this.addIssue(
              message.severity === 2 ? 'error' : 'warning',
              `ESLint: ${message.ruleId}`,
              `${result.filePath}:${message.line}:${message.column} - ${message.message}`
            );
          }
        }
      }
      
      if (totalErrors === 0 && totalWarnings === 0) {
        console.log('✓ ESLint检查通过');
      } else {
        console.log(`✗ ESLint发现 ${totalErrors} 个错误, ${totalWarnings} 个警告`);
      }
      
    } catch (error) {
      console.log('✗ ESLint检查失败:', error.message);
    }
  }

  /**
   * 检查代码复杂度
   */
  checkComplexity(dirPath) {
    console.log('检查代码复杂度...');
    
    const complexityThreshold = 10;
    const lengthThreshold = 200;
    
    this.scanFiles(dirPath, ['.ts', '.tsx'], (filePath, content) => {
      const lines = content.split('\n');
      
      // 检查文件长度
      if (lines.length > lengthThreshold) {
        this.addIssue(
          'warning',
          '文件过长',
          `${filePath} 有 ${lines.length} 行，建议拆分`
        );
      }
      
      // 检查函数复杂度（简单的圈复杂度估算）
      const functions = content.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || [];
      for (const func of functions) {
        const funcContent = this.extractFunctionContent(content, func);
        const complexity = this.calculateComplexity(funcContent);
        
        if (complexity > complexityThreshold) {
          this.addIssue(
            'warning',
            '函数复杂度过高',
            `${filePath} 中的函数复杂度为 ${complexity}，建议重构`
          );
        }
      }
    });
  }

  /**
   * 检查代码一致性
   */
  checkConsistency(dirPath) {
    console.log('检查代码一致性...');
    
    const patterns = {
      // 检查导入顺序
      importOrder: /^import.*from\s+['"`][^'"`]*['"`];$/gm,
      // 检查命名约定
      componentNaming: /^export\s+(const|function)\s+([A-Z][a-zA-Z0-9]*)/gm,
      // 检查Hook命名
      hookNaming: /^export\s+const\s+(use[A-Z][a-zA-Z0-9]*)/gm,
    };
    
    this.scanFiles(dirPath, ['.ts', '.tsx'], (filePath, content) => {
      // 检查组件命名
      const componentMatches = content.match(patterns.componentNaming);
      if (componentMatches) {
        for (const match of componentMatches) {
          const componentName = match.match(/([A-Z][a-zA-Z0-9]*)/)[1];
          const fileName = path.basename(filePath, path.extname(filePath));
          
          if (componentName !== fileName && !fileName.includes(componentName)) {
            this.addIssue(
              'warning',
              '组件命名不一致',
              `${filePath}: 组件名 ${componentName} 与文件名 ${fileName} 不匹配`
            );
          }
        }
      }
      
      // 检查Hook命名
      const hookMatches = content.match(patterns.hookNaming);
      if (hookMatches) {
        for (const match of hookMatches) {
          const hookName = match.match(/(use[A-Z][a-zA-Z0-9]*)/)[1];
          if (!hookName.startsWith('use')) {
            this.addIssue(
              'error',
              'Hook命名错误',
              `${filePath}: Hook ${hookName} 必须以 'use' 开头`
            );
          }
        }
      }
    });
  }

  /**
   * 检查性能问题
   */
  checkPerformance(dirPath) {
    console.log('检查潜在性能问题...');
    
    const performancePatterns = [
      {
        pattern: /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*,\s*\[\s*\]\s*\)/g,
        message: '空依赖数组的useEffect可能导致性能问题',
        severity: 'warning',
      },
      {
        pattern: /useState\(\s*{[\s\S]*?}\s*\)/g,
        message: '使用对象作为useState初始值可能导致不必要的重新渲染',
        severity: 'warning',
      },
      {
        pattern: /\.map\(\s*\([^)]*\)\s*=>\s*<[\s\S]*?>\s*\)/g,
        message: '在render中使用map可能需要key属性优化',
        severity: 'info',
      },
    ];
    
    this.scanFiles(dirPath, ['.ts', '.tsx'], (filePath, content) => {
      for (const { pattern, message, severity } of performancePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          this.addIssue(severity, '性能问题', `${filePath}: ${message}`);
        }
      }
    });
  }

  /**
   * 检查安全问题
   */
  checkSecurity(dirPath) {
    console.log('检查安全问题...');
    
    const securityPatterns = [
      {
        pattern: /dangerouslySetInnerHTML/g,
        message: '使用dangerouslySetInnerHTML可能存在XSS风险',
        severity: 'error',
      },
      {
        pattern: /eval\s*\(/g,
        message: '使用eval()存在安全风险',
        severity: 'error',
      },
      {
        pattern: /innerHTML\s*=/g,
        message: '直接设置innerHTML可能存在XSS风险',
        severity: 'warning',
      },
    ];
    
    this.scanFiles(dirPath, ['.ts', '.tsx', '.js', '.jsx'], (filePath, content) => {
      for (const { pattern, message, severity } of securityPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          this.addIssue(severity, '安全问题', `${filePath}: ${message}`);
        }
      }
    });
  }

  /**
   * 检查测试覆盖率
   */
  checkTestCoverage() {
    console.log('检查测试覆盖率...');
    
    try {
      // 检查是否有测试文件
      const testFiles = [];
      this.scanFiles(path.resolve(__dirname, '../src'), ['.test.ts', '.test.tsx'], (filePath) => {
        testFiles.push(filePath);
      });
      
      if (testFiles.length === 0) {
        this.addIssue('warning', '测试覆盖率', '没有找到测试文件');
      } else {
        console.log(`✓ 找到 ${testFiles.length} 个测试文件`);
      }
      
    } catch (error) {
      this.addIssue('error', '测试覆盖率检查失败', error.message);
    }
  }

  /**
   * 扫描文件
   */
  scanFiles(dirPath, extensions, callback) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', '.git'].includes(file)) {
          this.scanFiles(filePath, extensions, callback);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          callback(filePath, content);
          this.stats.filesChecked++;
        } catch (error) {
          this.addIssue('error', '文件读取失败', `${filePath}: ${error.message}`);
        }
      }
    }
  }

  /**
   * 添加问题
   */
  addIssue(severity, type, description) {
    this.issues.push({ severity, type, description });
    this.stats.issuesFound++;
    
    if (severity === 'error') {
      this.stats.errorsFound++;
    } else if (severity === 'warning') {
      this.stats.warningsFound++;
    }
  }

  /**
   * 计算函数复杂度
   */
  calculateComplexity(funcContent) {
    const complexityKeywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'catch', 'try'
    ];
    
    let complexity = 1; // 基础复杂度
    
    for (const keyword of complexityKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = funcContent.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  /**
   * 提取函数内容
   */
  extractFunctionContent(content, funcSignature) {
    const startIndex = content.indexOf(funcSignature);
    if (startIndex === -1) return '';
    
    let braceCount = 0;
    let inFunction = false;
    let funcContent = '';
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
      }
      
      if (inFunction) {
        funcContent += char;
      }
      
      if (inFunction && braceCount === 0) {
        break;
      }
    }
    
    return funcContent;
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n=== 代码质量检查报告 ===');
    console.log(`检查文件数: ${this.stats.filesChecked}`);
    console.log(`发现问题数: ${this.stats.issuesFound}`);
    console.log(`错误数: ${this.stats.errorsFound}`);
    console.log(`警告数: ${this.stats.warningsFound}`);
    
    if (this.issues.length > 0) {
      console.log('\n问题详情:');
      
      // 按严重程度分组
      const groupedIssues = this.issues.reduce((groups, issue) => {
        if (!groups[issue.severity]) {
          groups[issue.severity] = [];
        }
        groups[issue.severity].push(issue);
        return groups;
      }, {});
      
      for (const [severity, issues] of Object.entries(groupedIssues)) {
        console.log(`\n${severity.toUpperCase()}:`);
        for (const issue of issues) {
          console.log(`  [${issue.type}] ${issue.description}`);
        }
      }
    }
    
    // 生成建议
    const suggestions = this.generateSuggestions();
    if (suggestions.length > 0) {
      console.log('\n优化建议:');
      for (const suggestion of suggestions) {
        console.log(`  • ${suggestion}`);
      }
    }
    
    console.log('\n✅ 代码质量检查完成！');
  }

  /**
   * 生成优化建议
   */
  generateSuggestions() {
    const suggestions = [];
    
    if (this.stats.errorsFound > 0) {
      suggestions.push('优先修复所有错误级别的问题');
    }
    
    if (this.stats.warningsFound > 10) {
      suggestions.push('警告数量较多，建议逐步修复以提高代码质量');
    }
    
    const typeIssues = this.issues.filter(issue => issue.type.includes('TypeScript'));
    if (typeIssues.length > 0) {
      suggestions.push('修复TypeScript类型问题以提高类型安全性');
    }
    
    const performanceIssues = this.issues.filter(issue => issue.type.includes('性能'));
    if (performanceIssues.length > 0) {
      suggestions.push('优化性能问题以提高应用响应速度');
    }
    
    const securityIssues = this.issues.filter(issue => issue.type.includes('安全'));
    if (securityIssues.length > 0) {
      suggestions.push('立即修复安全问题以防止潜在风险');
    }
    
    return suggestions;
  }

  /**
   * 执行完整的质量检查
   */
  async check(rootPath) {
    console.log('=== 开始代码质量检查 ===\n');
    
    this.checkTypeScript();
    this.checkESLint();
    this.checkComplexity(rootPath);
    this.checkConsistency(rootPath);
    this.checkPerformance(rootPath);
    this.checkSecurity(rootPath);
    this.checkTestCoverage();
    
    this.generateReport();
    
    return this.stats.errorsFound === 0;
  }
}

// 执行检查
async function main() {
  const checker = new CodeQualityChecker();
  const rootPath = path.resolve(__dirname, '../src');
  
  try {
    const success = await checker.check(rootPath);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('质量检查过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { CodeQualityChecker };