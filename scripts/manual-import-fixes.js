/**
 * 手动导入修复指南生成器
 * @description 生成需要手动修复的导入路径问题清单
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('📋 G-Asset Forge 手动导入修复指南');
console.log('='.repeat(60));

const rootDir = path.resolve(__dirname, '..');

/**
 * 获取文件中的所有导入和导出语句
 */
function getAllImportsAndExports(content) {
  const statements = [];
  
  // 匹配 import ... from '...'
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    statements.push({
      type: 'import',
      statement: match[0],
      path: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  // 匹配 export ... from '...'
  const exportRegex = /export\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = exportRegex.exec(content)) !== null) {
    statements.push({
      type: 'export',
      statement: match[0],
      path: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return statements;
}

/**
 * 验证导入路径是否存在
 */
function validateImportPath(importPath, filePath) {
  // 跳过外部依赖
  if (!importPath.startsWith('./') && !importPath.startsWith('../') && !importPath.startsWith('/')) {
    return { valid: true, type: 'external' };
  }
  
  const fileDir = path.dirname(filePath);
  let resolvedPath;
  
  if (importPath.startsWith('/')) {
    resolvedPath = path.join(rootDir, importPath);
  } else {
    resolvedPath = path.resolve(fileDir, importPath);
  }
  
  // 尝试不同的扩展名
  const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];
  
  for (const ext of possibleExtensions) {
    const fullPath = resolvedPath + ext;
    if (fs.existsSync(fullPath)) {
      return { valid: true, type: 'local', resolvedPath: fullPath };
    }
  }
  
  return { valid: false, type: 'local', attemptedPath: resolvedPath };
}

/**
 * 分析需要手动修复的问题
 */
function analyzeManualFixes() {
  console.log('\n📊 分析需要手动修复的导入问题...');
  
  const manualFixes = [];
  
  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        processDirectory(path.join(dir, file.name));
      } else if (file.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file.name))) {
        const filePath = path.join(dir, file.name);
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const statements = getAllImportsAndExports(content);
          
          const fileIssues = [];
          
          statements.forEach(stmt => {
            const validation = validateImportPath(stmt.path, filePath);
            
            if (!validation.valid) {
              fileIssues.push({
                line: stmt.line,
                type: stmt.type,
                statement: stmt.statement,
                path: stmt.path,
                category: categorizeIssue(stmt.path, filePath)
              });
            }
          });
          
          if (fileIssues.length > 0) {
            manualFixes.push({
              file: path.relative(rootDir, filePath),
              issues: fileIssues
            });
          }
          
        } catch (error) {
          // 忽略读取错误
        }
      }
    });
  }
  
  processDirectory(path.join(rootDir, 'src'));
  
  return manualFixes;
}

/**
 * 分类问题类型
 */
function categorizeIssue(importPath, filePath) {
  if (importPath.includes('preload')) {
    return 'preload-missing';
  }
  
  if (importPath.includes('theme') && importPath.includes('../ui/')) {
    return 'theme-path-incorrect';
  }
  
  if (importPath.includes('components') && !importPath.includes('ui/components')) {
    return 'component-path-outdated';
  }
  
  if (importPath.includes('utils') && !importPath.includes('logic/utils')) {
    return 'utils-path-outdated';
  }
  
  if (importPath.includes('managers') && !importPath.includes('logic/managers')) {
    return 'managers-path-outdated';
  }
  
  if (importPath.includes('engines') && !importPath.includes('logic/engines')) {
    return 'engines-path-outdated';
  }
  
  if (importPath.includes('contexts') && !importPath.includes('logic/contexts')) {
    return 'contexts-path-outdated';
  }
  
  if (importPath.includes('services') && !importPath.includes('logic/services')) {
    return 'services-path-outdated';
  }
  
  return 'unknown';
}

/**
 * 生成修复建议
 */
function generateFixSuggestion(issue, filePath) {
  const suggestions = [];
  
  switch (issue.category) {
    case 'preload-missing':
      suggestions.push('需要创建 preload.ts 文件或更新导入路径');
      suggestions.push('检查 src/main/preload.ts 是否存在');
      break;
      
    case 'theme-path-incorrect':
      suggestions.push('更新为: ../../renderer/ui/theme/...');
      suggestions.push('或使用路径别名: @theme/...');
      break;
      
    case 'component-path-outdated':
      suggestions.push('更新为: ui/components/business/...');
      suggestions.push('或使用路径别名: @business/...');
      break;
      
    case 'utils-path-outdated':
      suggestions.push('更新为: logic/utils/...');
      suggestions.push('或使用路径别名: @utils/...');
      break;
      
    case 'managers-path-outdated':
      suggestions.push('更新为: logic/managers/...');
      suggestions.push('或使用路径别名: @managers/...');
      break;
      
    case 'engines-path-outdated':
      suggestions.push('更新为: logic/engines/...');
      suggestions.push('或使用路径别名: @engines/...');
      break;
      
    case 'contexts-path-outdated':
      suggestions.push('更新为: logic/contexts/...');
      suggestions.push('或使用路径别名: @contexts/...');
      break;
      
    case 'services-path-outdated':
      suggestions.push('更新为: logic/services/...');
      suggestions.push('或使用路径别名: @services/...');
      break;
      
    default:
      suggestions.push('检查文件是否存在或路径是否正确');
      suggestions.push('考虑使用路径别名简化导入');
  }
  
  return suggestions;
}

/**
 * 生成修复指南文档
 */
function generateFixGuide(manualFixes) {
  const guidePath = path.join(rootDir, 'docs/MANUAL_IMPORT_FIXES.md');
  
  // 按类别分组问题
  const categorizedIssues = {};
  let totalIssues = 0;
  
  manualFixes.forEach(fileFix => {
    fileFix.issues.forEach(issue => {
      totalIssues++;
      if (!categorizedIssues[issue.category]) {
        categorizedIssues[issue.category] = [];
      }
      categorizedIssues[issue.category].push({
        file: fileFix.file,
        ...issue
      });
    });
  });
  
  let guide = `# 手动导入修复指南\n\n`;
  guide += `## 📊 概述\n\n`;
  guide += `- **需要手动修复的文件**: ${manualFixes.length}\n`;
  guide += `- **需要手动修复的问题**: ${totalIssues}\n`;
  guide += `- **生成时间**: ${new Date().toISOString()}\n\n`;
  
  guide += `## 🎯 修复优先级\n\n`;
  guide += `1. **高优先级**: preload文件缺失、主题路径错误\n`;
  guide += `2. **中优先级**: 组件路径过时、工具函数路径过时\n`;
  guide += `3. **低优先级**: 其他路径问题\n\n`;
  
  // 按类别生成修复指南
  Object.entries(categorizedIssues).forEach(([category, issues]) => {
    guide += `## 📁 ${getCategoryTitle(category)}\n\n`;
    guide += `**问题数量**: ${issues.length}\n\n`;
    
    // 显示前10个问题
    issues.slice(0, 10).forEach(issue => {
      guide += `### 📄 ${issue.file}\n\n`;
      guide += `**第${issue.line}行**: \`${issue.statement}\`\n\n`;
      guide += `**问题路径**: \`${issue.path}\`\n\n`;
      
      const suggestions = generateFixSuggestion(issue, issue.file);
      guide += `**修复建议**:\n`;
      suggestions.forEach(suggestion => {
        guide += `- ${suggestion}\n`;
      });
      guide += `\n`;
    });
    
    if (issues.length > 10) {
      guide += `*... 还有 ${issues.length - 10} 个类似问题*\n\n`;
    }
  });
  
  guide += `## 🔧 批量修复脚本\n\n`;
  guide += `对于重复性的路径修复，可以使用以下脚本模板：\n\n`;
  guide += `\`\`\`bash\n`;
  guide += `# 批量替换组件路径\n`;
  guide += `find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|\\.\\.\\./components/|ui/components/business/|g'\n\n`;
  guide += `# 批量替换工具函数路径\n`;
  guide += `find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|\\.\\.\\./utils/|logic/utils/|g'\n`;
  guide += `\`\`\`\n\n`;
  
  guide += `## 📋 路径别名参考\n\n`;
  guide += `使用路径别名可以简化导入路径：\n\n`;
  guide += `- \`@ui/*\` → \`src/renderer/ui/*\`\n`;
  guide += `- \`@business/*\` → \`src/renderer/ui/components/business/*\`\n`;
  guide += `- \`@logic/*\` → \`src/renderer/logic/*\`\n`;
  guide += `- \`@managers/*\` → \`src/renderer/logic/managers/*\`\n`;
  guide += `- \`@services/*\` → \`src/renderer/logic/services/*\`\n`;
  guide += `- \`@engines/*\` → \`src/renderer/logic/engines/*\`\n`;
  guide += `- \`@utils/*\` → \`src/renderer/logic/utils/*\`\n`;
  guide += `- \`@contexts/*\` → \`src/renderer/logic/contexts/*\`\n`;
  guide += `- \`@stores/*\` → \`src/renderer/stores/*\`\n`;
  guide += `- \`@hooks/*\` → \`src/renderer/hooks/*\`\n`;
  guide += `- \`@types/*\` → \`src/interfaces/types/*\`\n\n`;
  
  guide += `## ✅ 验证修复\n\n`;
  guide += `修复完成后，运行以下命令验证：\n\n`;
  guide += `\`\`\`bash\n`;
  guide += `node scripts/validate-and-fix-imports.js\n`;
  guide += `\`\`\`\n\n`;
  
  guide += `---\n\n`;
  guide += `*此文档由自动化脚本生成，请根据实际情况调整修复方案*\n`;
  
  // 确保docs目录存在
  const docsDir = path.dirname(guidePath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  fs.writeFileSync(guidePath, guide, 'utf8');
  console.log(`✅ 手动修复指南已生成: ${path.relative(rootDir, guidePath)}`);
  
  return guidePath;
}

/**
 * 获取类别标题
 */
function getCategoryTitle(category) {
  const titles = {
    'preload-missing': 'Preload文件缺失',
    'theme-path-incorrect': '主题路径错误',
    'component-path-outdated': '组件路径过时',
    'utils-path-outdated': '工具函数路径过时',
    'managers-path-outdated': '管理器路径过时',
    'engines-path-outdated': '引擎路径过时',
    'contexts-path-outdated': '上下文路径过时',
    'services-path-outdated': '服务路径过时',
    'unknown': '其他问题'
  };
  
  return titles[category] || category;
}

/**
 * 主函数
 */
function main() {
  const manualFixes = analyzeManualFixes();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 手动修复分析结果');
  console.log('='.repeat(60));
  
  if (manualFixes.length === 0) {
    console.log('🎉 没有需要手动修复的导入问题！');
    return;
  }
  
  console.log(`📁 需要手动修复的文件: ${manualFixes.length}`);
  
  let totalIssues = 0;
  const categoryStats = {};
  
  manualFixes.forEach(fileFix => {
    totalIssues += fileFix.issues.length;
    fileFix.issues.forEach(issue => {
      categoryStats[issue.category] = (categoryStats[issue.category] || 0) + 1;
    });
  });
  
  console.log(`🔧 需要手动修复的问题: ${totalIssues}`);
  
  console.log('\n📊 问题分类统计:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${getCategoryTitle(category)}: ${count}`);
  });
  
  const guidePath = generateFixGuide(manualFixes);
  
  console.log('\n💡 后续步骤:');
  console.log(`1. 查看修复指南: ${path.relative(rootDir, guidePath)}`);
  console.log('2. 按优先级逐步修复问题');
  console.log('3. 修复后运行验证脚本确认');
  
  return manualFixes;
}

// 运行分析
if (require.main === module) {
  main();
}

module.exports = { main };