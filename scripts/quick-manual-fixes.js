/**
 * 快速手动修复脚本
 * @description 处理一些常见的手动修复问题
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('⚡ G-Asset Forge 快速手动修复');
console.log('='.repeat(50));

const rootDir = path.resolve(__dirname, '..');

/**
 * 修复规则定义
 */
const quickFixRules = [
  // 修复主题路径
  {
    name: '修复主题路径错误',
    pattern: /from\s+['"]\.\.\/ui\/theme([^'"]*)['"]/g,
    replacement: "from '../../renderer/ui/theme$1'",
    files: ['**/*.ts', '**/*.tsx']
  },
  {
    name: '修复主题路径错误 (interfaces)',
    pattern: /from\s+['"]\.\.\/ui\/theme([^'"]*)['"]/g,
    replacement: "from '../renderer/ui/theme$1'",
    files: ['src/interfaces/**/*.ts']
  },
  
  // 修复preload路径
  {
    name: '修复preload路径',
    pattern: /from\s+['"]\.\.\/main\/preload['"]/g,
    replacement: "from '../../main/preload'",
    files: ['src/interfaces/**/*.ts']
  },
  
  // 修复管理器路径
  {
    name: '修复管理器路径 (相对路径)',
    pattern: /from\s+['"]\.\.\/managers\/([^'"]+)['"]/g,
    replacement: "from '../logic/managers/$1'",
    files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx']
  },
  {
    name: '修复管理器路径 (深层相对路径)',
    pattern: /from\s+['"]\.\.\/\.\.\/managers\/([^'"]+)['"]/g,
    replacement: "from '../../logic/managers/$1'",
    files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx']
  },
  
  // 修复组件路径
  {
    name: '修复组件路径错误',
    pattern: /from\s+['"]\.\.\/components\/([^'"]+)['"]/g,
    replacement: "from '../ui/components/business/$1'",
    files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx']
  },
  
  // 修复工具函数路径
  {
    name: '修复工具函数路径',
    pattern: /from\s+['"]\.\.\/utils\/([^'"]+)['"]/g,
    replacement: "from '../logic/utils/$1'",
    files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx']
  }
];

/**
 * 检查文件是否匹配模式
 */
function matchesPattern(filePath, patterns) {
  return patterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath.replace(/\\/g, '/'));
  });
}

/**
 * 应用修复规则到文件
 */
function applyFixesToFile(filePath, rules) {
  if (!fs.existsSync(filePath)) {
    return { success: false, error: '文件不存在' };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let appliedFixes = [];
  
  rules.forEach(rule => {
    if (matchesPattern(filePath, rule.files)) {
      const matches = [...newContent.matchAll(rule.pattern)];
      
      if (matches.length > 0) {
        newContent = newContent.replace(rule.pattern, rule.replacement);
        appliedFixes.push({
          rule: rule.name,
          matches: matches.length
        });
      }
    }
  });
  
  return {
    success: true,
    changed: appliedFixes.length > 0,
    appliedFixes,
    newContent
  };
}

/**
 * 分析可快速修复的问题
 */
function analyzeQuickFixes() {
  console.log('\n📊 分析可快速修复的问题...');
  
  const results = {
    totalFiles: 0,
    processedFiles: 0,
    fixableFiles: 0,
    totalFixes: 0,
    fixesByRule: {},
    errors: []
  };
  
  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        processDirectory(path.join(dir, file.name));
      } else if (file.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file.name))) {
        const filePath = path.join(dir, file.name);
        results.totalFiles++;
        
        try {
          const fixResult = applyFixesToFile(filePath, quickFixRules);
          results.processedFiles++;
          
          if (fixResult.success && fixResult.changed) {
            results.fixableFiles++;
            results.totalFixes += fixResult.appliedFixes.reduce((sum, fix) => sum + fix.matches, 0);
            
            fixResult.appliedFixes.forEach(fix => {
              results.fixesByRule[fix.rule] = (results.fixesByRule[fix.rule] || 0) + fix.matches;
            });
            
            console.log(`  ⚡ ${path.relative(rootDir, filePath)}: ${fixResult.appliedFixes.length} 种修复`);
          }
        } catch (error) {
          results.errors.push({
            file: path.relative(rootDir, filePath),
            error: error.message
          });
        }
      }
    });
  }
  
  processDirectory(path.join(rootDir, 'src'));
  
  return results;
}

/**
 * 应用快速修复
 */
function applyQuickFixes() {
  console.log('\n⚡ 应用快速修复...');
  
  let fixedFiles = 0;
  let appliedFixes = 0;
  
  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        processDirectory(path.join(dir, file.name));
      } else if (file.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file.name))) {
        const filePath = path.join(dir, file.name);
        
        try {
          const fixResult = applyFixesToFile(filePath, quickFixRules);
          
          if (fixResult.success && fixResult.changed) {
            // 写入修复后的内容
            fs.writeFileSync(filePath, fixResult.newContent, 'utf8');
            fixedFiles++;
            appliedFixes += fixResult.appliedFixes.reduce((sum, fix) => sum + fix.matches, 0);
            
            console.log(`    ✅ ${path.relative(rootDir, filePath)}: ${fixResult.appliedFixes.length} 种修复已应用`);
          }
        } catch (error) {
          console.log(`    ❌ ${path.relative(rootDir, filePath)}: ${error.message}`);
        }
      }
    });
  }
  
  processDirectory(path.join(rootDir, 'src'));
  
  return { fixedFiles, appliedFixes };
}

/**
 * 生成修复报告
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 快速修复分析报告');
  console.log('='.repeat(50));
  
  console.log(`📄 总文件数: ${results.totalFiles}`);
  console.log(`🔍 已处理文件: ${results.processedFiles}`);
  console.log(`⚡ 可快速修复的文件: ${results.fixableFiles}`);
  console.log(`🔧 可快速修复的问题: ${results.totalFixes}`);
  console.log(`❌ 处理错误: ${results.errors.length}`);
  
  if (Object.keys(results.fixesByRule).length > 0) {
    console.log('\n📊 修复类型统计:');
    Object.entries(results.fixesByRule).forEach(([rule, count]) => {
      console.log(`  ${rule}: ${count}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ 处理错误:');
    results.errors.slice(0, 5).forEach(error => {
      console.log(`  - ${error.file}: ${error.error}`);
    });
  }
}

/**
 * 主函数
 */
function main() {
  const results = analyzeQuickFixes();
  generateReport(results);
  
  if (results.totalFixes > 0) {
    console.log('\n' + '='.repeat(50));
    console.log('🚨 发现可快速修复的问题！');
    console.log('='.repeat(50));
    console.log(`📁 可修复的文件: ${results.fixableFiles}`);
    console.log(`⚡ 可修复的问题: ${results.totalFixes}`);
    console.log('\n如需应用快速修复，请运行: node scripts/quick-manual-fixes.js --fix');
    
    // 检查是否有修复参数
    if (process.argv.includes('--fix')) {
      console.log('\n⚡ 开始应用快速修复...');
      const applyResults = applyQuickFixes();
      
      console.log('\n' + '='.repeat(50));
      console.log('🎉 快速修复完成！');
      console.log('='.repeat(50));
      console.log(`📁 修复文件数: ${applyResults.fixedFiles}`);
      console.log(`⚡ 应用修复数: ${applyResults.appliedFixes}`);
      
      console.log('\n🔍 建议运行完整验证:');
      console.log('node scripts/validate-and-fix-imports.js');
    }
  } else {
    console.log('\n✅ 没有可快速修复的问题！');
  }
  
  return results;
}

// 运行快速修复
if (require.main === module) {
  main();
}

module.exports = { main };