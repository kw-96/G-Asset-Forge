/**
 * 整理恢复文件脚本
 * @description 将恢复和新建的文件整理到重构后的架构中
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('📁 G-Asset Forge 文件架构整理');
console.log('='.repeat(60));

const rootDir = path.resolve(__dirname, '..');

/**
 * 文件移动规则
 * 从当前位置 -> 目标位置
 */
const fileMoveRules = [
  // ViewControl 移动到正确位置
  {
    from: 'src/renderer/engines/ViewControl.ts',
    to: 'src/renderer/logic/engines/ViewControl.ts',
    reason: '视图控制器应该在logic/engines目录下'
  },
  
  // ErrorBoundary 组件移动到business组件目录
  {
    from: 'src/renderer/components/ErrorBoundary',
    to: 'src/renderer/ui/components/business/ErrorBoundary',
    reason: 'ErrorBoundary是业务组件，应该在business目录下'
  },
  
  // 核心文件移动到logic目录
  {
    from: 'src/renderer/core',
    to: 'src/renderer/logic/core',
    reason: '核心逻辑文件应该在logic目录下'
  },
  
  // App-test 移动到正确位置
  {
    from: 'src/renderer/App-test.tsx',
    to: 'src/renderer/ui/components/business/App/App-test.tsx',
    reason: '测试组件应该和App组件在同一目录'
  }
];

/**
 * 导入路径更新规则
 */
const importUpdateRules = [
  // ViewControl 路径更新
  {
    pattern: /from\s+['"]\.\.\/\.\.\/engines\/ViewControl['"]/g,
    replacement: "from '../ViewControl'",
    description: 'ViewControl路径更新'
  },
  {
    pattern: /from\s+['"]\.\.\/ViewControl['"]/g,
    replacement: "from './ViewControl'",
    description: 'ViewControl同级路径更新'
  },
  
  // ErrorBoundary 路径更新
  {
    pattern: /from\s+['"]\.\/components\/ErrorBoundary['"]/g,
    replacement: "from './ui/components/business/ErrorBoundary'",
    description: 'ErrorBoundary路径更新'
  },
  
  // 核心文件路径更新
  {
    pattern: /from\s+['"]\.\.\/\.\.\/core\/([^'"]+)['"]/g,
    replacement: "from '../logic/core/$1'",
    description: '核心文件路径更新'
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/core\/([^'"]+)['"]/g,
    replacement: "from '../../logic/core/$1'",
    description: '核心文件深层路径更新'
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/core\/([^'"]+)['"]/g,
    replacement: "from '../../../logic/core/$1'",
    description: '核心文件更深层路径更新'
  },
  
  // App-test 路径更新
  {
    pattern: /from\s+['"]\.\/App-test['"]/g,
    replacement: "from './App-test'",
    description: 'App-test路径更新'
  }
];

/**
 * 移动文件或目录
 */
function moveFileOrDirectory(fromPath, toPath) {
  const fullFromPath = path.join(rootDir, fromPath);
  const fullToPath = path.join(rootDir, toPath);
  
  if (!fs.existsSync(fullFromPath)) {
    console.log(`  ⚠️ 源文件不存在: ${fromPath}`);
    return false;
  }
  
  // 确保目标目录存在
  const targetDir = path.dirname(fullToPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 如果目标已存在，先备份
  if (fs.existsSync(fullToPath)) {
    const backupPath = `${fullToPath}.backup.${Date.now()}`;
    fs.renameSync(fullToPath, backupPath);
    console.log(`  📦 备份现有文件: ${path.relative(rootDir, backupPath)}`);
  }
  
  try {
    // 移动文件或目录
    fs.renameSync(fullFromPath, fullToPath);
    console.log(`  ✅ 移动成功: ${fromPath} → ${toPath}`);
    return true;
  } catch (error) {
    console.log(`  ❌ 移动失败: ${fromPath} - ${error.message}`);
    return false;
  }
}

/**
 * 更新文件中的导入路径
 */
function updateImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { success: false, error: '文件不存在' };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changes = [];
  
  importUpdateRules.forEach(rule => {
    const matches = [...newContent.matchAll(rule.pattern)];
    if (matches.length > 0) {
      newContent = newContent.replace(rule.pattern, rule.replacement);
      changes.push({
        rule: rule.description,
        matches: matches.length
      });
    }
  });
  
  if (changes.length > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return { success: true, changes };
  }
  
  return { success: true, changes: [] };
}

/**
 * 递归更新目录中所有文件的导入路径
 */
function updateImportsInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  let totalUpdates = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      totalUpdates += updateImportsInDirectory(fullPath);
    } else if (file.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file.name))) {
      const result = updateImportsInFile(fullPath);
      if (result.success && result.changes.length > 0) {
        console.log(`    🔧 ${path.relative(rootDir, fullPath)}: ${result.changes.length} 个更新`);
        totalUpdates += result.changes.length;
      }
    }
  });
  
  return totalUpdates;
}

/**
 * 执行文件移动
 */
function executeFileMoves() {
  console.log('\n📁 执行文件移动...');
  
  const results = {
    totalMoves: fileMoveRules.length,
    successfulMoves: 0,
    failedMoves: 0,
    details: []
  };
  
  fileMoveRules.forEach(rule => {
    console.log(`\n🔄 移动: ${rule.from} → ${rule.to}`);
    console.log(`   理由: ${rule.reason}`);
    
    const success = moveFileOrDirectory(rule.from, rule.to);
    
    if (success) {
      results.successfulMoves++;
      results.details.push({ ...rule, status: 'success' });
    } else {
      results.failedMoves++;
      results.details.push({ ...rule, status: 'failed' });
    }
  });
  
  return results;
}

/**
 * 执行导入路径更新
 */
function executeImportUpdates() {
  console.log('\n🔧 更新导入路径...');
  
  const srcDir = path.join(rootDir, 'src');
  const totalUpdates = updateImportsInDirectory(srcDir);
  
  return { totalUpdates };
}

/**
 * 生成整理报告
 */
function generateReport(moveResults, importResults) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 文件架构整理报告');
  console.log('='.repeat(60));
  
  console.log(`📁 文件移动结果:`);
  console.log(`  总移动数: ${moveResults.totalMoves}`);
  console.log(`  成功移动: ${moveResults.successfulMoves}`);
  console.log(`  失败移动: ${moveResults.failedMoves}`);
  
  console.log(`\n🔧 导入路径更新结果:`);
  console.log(`  总更新数: ${importResults.totalUpdates}`);
  
  if (moveResults.details.length > 0) {
    console.log('\n📋 移动详情:');
    moveResults.details.forEach(detail => {
      const icon = detail.status === 'success' ? '✅' : '❌';
      console.log(`  ${icon} ${detail.from} → ${detail.to}`);
    });
  }
  
  const successRate = moveResults.totalMoves > 0 ? 
    (moveResults.successfulMoves / moveResults.totalMoves * 100).toFixed(1) : 100;
  
  console.log(`\n🎯 整理成功率: ${successRate}%`);
  
  if (moveResults.successfulMoves > 0 || importResults.totalUpdates > 0) {
    console.log('\n🎉 文件架构整理完成！');
    console.log('\n🔍 建议运行验证脚本检查结果:');
    console.log('node scripts/validate-and-fix-imports.js');
  } else {
    console.log('\n⚠️ 没有文件被移动或更新');
  }
}

/**
 * 主函数
 */
function main() {
  // 执行文件移动
  const moveResults = executeFileMoves();
  
  // 执行导入路径更新
  const importResults = executeImportUpdates();
  
  // 生成报告
  generateReport(moveResults, importResults);
  
  return { moveResults, importResults };
}

// 运行整理
if (require.main === module) {
  main();
}

module.exports = { main };