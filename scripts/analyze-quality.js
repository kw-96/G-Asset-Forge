/**
 * 代码质量分析脚本
 * @description 分析代码质量、注释覆盖率和依赖关系
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('📊 G-Asset Forge 代码质量分析报告');
console.log('='.repeat(60));

const rootDir = path.resolve(__dirname, '..');

// 检查文件是否有JSDoc注释
function hasJSDocComment(content) {
  return /\/\*\*[\s\S]*?\*\//.test(content);
}

// 检查注释是否包含中文
function hasChineseComment(content) {
  const commentRegex = /\/\*\*[\s\S]*?\*\//g;
  const comments = content.match(commentRegex) || [];
  return comments.some(comment => /[\u4e00-\u9fa5]/.test(comment));
}

// 获取导入语句
function getImports(content) {
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// 检查文件中的所有TypeScript文件
function analyzeDirectory(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      analyzeDirectory(path.join(dir, file.name), callback);
    } else if (file.isFile() && ['.ts', '.tsx'].includes(path.extname(file.name))) {
      const filePath = path.join(dir, file.name);
      const content = fs.readFileSync(filePath, 'utf8');
      callback(filePath, content);
    }
  });
}

// 分析注释覆盖率
function analyzeComments() {
  console.log('\n📝 注释覆盖率分析:');
  
  let totalFiles = 0;
  let filesWithComments = 0;
  let filesWithChineseComments = 0;
  let totalLines = 0;
  let commentLines = 0;
  
  analyzeDirectory(path.join(rootDir, 'src'), (filePath, content) => {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
    
    totalFiles++;
    const lines = content.split('\n');
    totalLines += lines.length;
    
    // 统计注释行
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        commentLines++;
      }
    });
    
    if (hasJSDocComment(content)) {
      filesWithComments++;
    }
    
    if (hasChineseComment(content)) {
      filesWithChineseComments++;
    }
  });
  
  const commentCoverage = totalFiles > 0 ? (filesWithComments / totalFiles * 100).toFixed(1) : 0;
  const chineseCoverage = totalFiles > 0 ? (filesWithChineseComments / totalFiles * 100).toFixed(1) : 0;
  const commentRatio = totalLines > 0 ? (commentLines / totalLines * 100).toFixed(1) : 0;
  
  console.log(`  📄 总文件数: ${totalFiles}`);
  console.log(`  📝 有JSDoc注释的文件: ${filesWithComments} (${commentCoverage}%)`);
  console.log(`  🇨🇳 有中文注释的文件: ${filesWithChineseComments} (${chineseCoverage}%)`);
  console.log(`  📏 注释行比例: ${commentRatio}% (${commentLines}/${totalLines})`);
  
  return {
    totalFiles,
    filesWithComments,
    filesWithChineseComments,
    commentCoverage: parseFloat(commentCoverage),
    chineseCoverage: parseFloat(chineseCoverage),
    commentRatio: parseFloat(commentRatio)
  };
}

// 分析依赖关系
function analyzeDependencies() {
  console.log('\n🔗 依赖关系分析:');
  
  const dependencyMap = new Map();
  let totalImports = 0;
  let relativeImports = 0;
  let aliasImports = 0;
  let externalImports = 0;
  
  analyzeDirectory(path.join(rootDir, 'src'), (filePath, content) => {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
    
    const imports = getImports(content);
    const relativePath = path.relative(rootDir, filePath);
    
    dependencyMap.set(relativePath, imports);
    totalImports += imports.length;
    
    imports.forEach(imp => {
      if (imp.startsWith('./') || imp.startsWith('../')) {
        relativeImports++;
      } else if (imp.startsWith('@/') || imp.startsWith('@main/') || imp.startsWith('@renderer/')) {
        aliasImports++;
      } else {
        externalImports++;
      }
    });
  });
  
  console.log(`  📦 总导入数: ${totalImports}`);
  console.log(`  🔄 相对路径导入: ${relativeImports} (${(relativeImports/totalImports*100).toFixed(1)}%)`);
  console.log(`  🏷️ 路径别名导入: ${aliasImports} (${(aliasImports/totalImports*100).toFixed(1)}%)`);
  console.log(`  📚 外部依赖导入: ${externalImports} (${(externalImports/totalImports*100).toFixed(1)}%)`);
  
  return {
    totalImports,
    relativeImports,
    aliasImports,
    externalImports,
    dependencyMap
  };
}

// 检查架构违规
function checkArchitectureViolations() {
  console.log('\n🏗️ 架构规范检查:');
  
  const violations = [];
  
  analyzeDirectory(path.join(rootDir, 'src'), (filePath, content) => {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
    
    const imports = getImports(content);
    
    // 检查主进程是否导入渲染进程模块
    if (filePath.includes('/main/')) {
      imports.forEach(imp => {
        if (imp.includes('/renderer/')) {
          violations.push(`主进程导入渲染进程: ${filePath} -> ${imp}`);
        }
      });
    }
    
    // 检查UI组件是否直接导入业务逻辑
    if (filePath.includes('/ui/components/') && !filePath.includes('/business/')) {
      imports.forEach(imp => {
        if (imp.includes('/managers/') || imp.includes('/services/')) {
          violations.push(`UI组件直接导入业务逻辑: ${filePath} -> ${imp}`);
        }
      });
    }
    
    // 检查接口层是否导入具体实现
    if (filePath.includes('/interfaces/')) {
      imports.forEach(imp => {
        if (imp.includes('/managers/') || imp.includes('/services/') || imp.includes('/components/')) {
          violations.push(`接口层导入具体实现: ${filePath} -> ${imp}`);
        }
      });
    }
  });
  
  console.log(`  ✅ 架构规范检查: ${violations.length === 0 ? '通过' : `发现 ${violations.length} 个违规`}`);
  
  if (violations.length > 0) {
    console.log('  ⚠️ 违规详情:');
    violations.slice(0, 5).forEach(violation => {
      console.log(`    - ${violation}`);
    });
    if (violations.length > 5) {
      console.log(`    ... 还有 ${violations.length - 5} 个违规`);
    }
  }
  
  return violations;
}

// 分析代码复杂度
function analyzeComplexity() {
  console.log('\n📈 代码复杂度分析:');
  
  let totalFunctions = 0;
  let longFunctions = 0;
  let totalClasses = 0;
  let largeClasses = 0;
  let maxFunctionLength = 0;
  let maxClassLength = 0;
  
  analyzeDirectory(path.join(rootDir, 'src'), (filePath, content) => {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
    
    const lines = content.split('\n');
    
    // 简单的函数检测
    const functionMatches = content.match(/function\s+\w+|=\s*\([^)]*\)\s*=>/g) || [];
    totalFunctions += functionMatches.length;
    
    // 简单的类检测
    const classMatches = content.match(/class\s+\w+/g) || [];
    totalClasses += classMatches.length;
    
    // 估算函数和类的长度（简化版）
    let inFunction = false;
    let functionStart = 0;
    let braceCount = 0;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.includes('function ') || trimmed.includes('=>')) {
        if (!inFunction) {
          inFunction = true;
          functionStart = index;
          braceCount = 0;
        }
      }
      
      if (inFunction) {
        braceCount += (trimmed.match(/{/g) || []).length;
        braceCount -= (trimmed.match(/}/g) || []).length;
        
        if (braceCount <= 0 && index > functionStart) {
          const functionLength = index - functionStart + 1;
          maxFunctionLength = Math.max(maxFunctionLength, functionLength);
          
          if (functionLength > 50) {
            longFunctions++;
          }
          
          inFunction = false;
        }
      }
    });
    
    maxClassLength = Math.max(maxClassLength, lines.length);
    if (lines.length > 200) {
      largeClasses++;
    }
  });
  
  console.log(`  🔧 总函数数: ${totalFunctions}`);
  console.log(`  📏 长函数数 (>50行): ${longFunctions} (${totalFunctions > 0 ? (longFunctions/totalFunctions*100).toFixed(1) : 0}%)`);
  console.log(`  🏛️ 总类数: ${totalClasses}`);
  console.log(`  📐 大文件数 (>200行): ${largeClasses}`);
  console.log(`  📊 最长函数: ${maxFunctionLength} 行`);
  
  return {
    totalFunctions,
    longFunctions,
    totalClasses,
    largeClasses,
    maxFunctionLength
  };
}

// 主函数
function main() {
  const commentStats = analyzeComments();
  const dependencyStats = analyzeDependencies();
  const violations = checkArchitectureViolations();
  const complexityStats = analyzeComplexity();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 代码质量评分:');
  console.log('='.repeat(60));
  
  // 计算各项得分
  const commentScore = Math.min(100, commentStats.commentCoverage + commentStats.chineseCoverage / 2);
  const architectureScore = violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10);
  const complexityScore = Math.max(0, 100 - complexityStats.longFunctions * 5);
  const dependencyScore = dependencyStats.aliasImports / dependencyStats.totalImports * 100;
  
  console.log(`📝 注释质量得分: ${commentScore.toFixed(1)}/100`);
  console.log(`🏗️ 架构规范得分: ${architectureScore.toFixed(1)}/100`);
  console.log(`📈 代码复杂度得分: ${complexityScore.toFixed(1)}/100`);
  console.log(`🔗 依赖管理得分: ${dependencyScore.toFixed(1)}/100`);
  
  const overallScore = (commentScore + architectureScore + complexityScore + dependencyScore) / 4;
  console.log(`\n🎯 总体质量得分: ${overallScore.toFixed(1)}/100`);
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 质量评估结论:');
  console.log('='.repeat(60));
  
  if (overallScore >= 90) {
    console.log('🌟 优秀！代码质量非常高，架构清晰，注释完善。');
  } else if (overallScore >= 80) {
    console.log('✅ 良好！代码质量较高，有少量需要改进的地方。');
  } else if (overallScore >= 70) {
    console.log('⚠️ 中等！代码质量一般，需要重点改进注释和架构规范。');
  } else {
    console.log('❌ 需要改进！代码质量较低，需要大幅提升。');
  }
  
  return {
    overallScore,
    commentStats,
    dependencyStats,
    violations,
    complexityStats
  };
}

// 运行分析
if (require.main === module) {
  main();
}

module.exports = { main };