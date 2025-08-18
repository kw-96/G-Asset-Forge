/**
 * 文件迁移分析脚本
 * @description 分析需要迁移到新架构的原有文件
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('🔄 G-Asset Forge 文件迁移分析报告');
console.log('='.repeat(60));

const rootDir = path.resolve(__dirname, '..');

// 需要迁移的文件映射
const migrationMap = {
  // 原有组件 -> 新架构位置
  'src/renderer/components/': {
    target: 'src/renderer/ui/components/business/',
    description: '业务组件迁移到UI业务层'
  },
  
  // 原有工具 -> 新架构位置  
  'src/renderer/tools/': {
    target: 'src/renderer/logic/managers/tools/',
    description: '工具类迁移到逻辑层管理器'
  },
  
  // 原有管理器 -> 新架构位置
  'src/renderer/managers/': {
    target: 'src/renderer/logic/managers/',
    description: '管理器迁移到逻辑层'
  },
  
  // 原有引擎 -> 新架构位置
  'src/renderer/engines/': {
    target: 'src/renderer/logic/engines/',
    description: '引擎适配器整合'
  },
  
  // 原有核心 -> 新架构位置
  'src/renderer/core/': {
    target: 'src/renderer/logic/managers/',
    description: '核心功能迁移到逻辑层'
  },
  
  // 原有工具函数 -> 新架构位置
  'src/renderer/utils/': {
    target: 'src/renderer/logic/utils/',
    description: '工具函数迁移到逻辑层'
  },
  
  // 原有类型 -> 新架构位置
  'src/renderer/types/': {
    target: 'src/interfaces/types/',
    description: '类型定义迁移到接口层'
  },
  
  // 原有全局类型 -> 新架构位置
  'src/types/': {
    target: 'src/interfaces/types/',
    description: '全局类型定义迁移'
  },
  
  // 原有工具 -> 新架构位置
  'src/utils/': {
    target: 'src/renderer/logic/utils/',
    description: '共享工具函数迁移'
  }
};

// 检查目录中的文件
function analyzeDirectory(dir, targetDir, description) {
  if (!fs.existsSync(dir)) {
    console.log(`  ❌ 源目录不存在: ${dir}`);
    return { files: [], totalSize: 0 };
  }
  
  const files = [];
  let totalSize = 0;
  
  function scanDir(currentDir, relativePath = '') {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item.name);
      const relativeItemPath = path.join(relativePath, item.name);
      
      if (item.isDirectory()) {
        scanDir(itemPath, relativeItemPath);
      } else if (item.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(item.name))) {
        const stats = fs.statSync(itemPath);
        files.push({
          path: itemPath,
          relativePath: relativeItemPath,
          size: stats.size,
          target: path.join(targetDir, relativeItemPath)
        });
        totalSize += stats.size;
      }
    });
  }
  
  scanDir(dir);
  
  return { files, totalSize };
}

// 分析所有需要迁移的文件
function analyzeMigration() {
  console.log('\n📁 需要迁移的文件分析:');
  
  let totalFiles = 0;
  let totalSize = 0;
  const migrationPlan = [];
  
  Object.entries(migrationMap).forEach(([sourceDir, config]) => {
    const sourcePath = path.join(rootDir, sourceDir);
    const targetPath = path.join(rootDir, config.target);
    
    console.log(`\n📂 ${sourceDir} -> ${config.target}`);
    console.log(`   ${config.description}`);
    
    const analysis = analyzeDirectory(sourcePath, targetPath, config.description);
    
    if (analysis.files.length > 0) {
      console.log(`   📄 文件数: ${analysis.files.length}`);
      console.log(`   📏 总大小: ${(analysis.files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1)} KB`);
      
      // 显示前5个文件
      analysis.files.slice(0, 5).forEach(file => {
        console.log(`     - ${file.relativePath}`);
      });
      
      if (analysis.files.length > 5) {
        console.log(`     ... 还有 ${analysis.files.length - 5} 个文件`);
      }
      
      migrationPlan.push({
        source: sourceDir,
        target: config.target,
        description: config.description,
        files: analysis.files
      });
      
      totalFiles += analysis.files.length;
      totalSize += analysis.files.reduce((sum, f) => sum + f.size, 0);
    } else {
      console.log(`   ✅ 无需迁移或已迁移`);
    }
  });
  
  return { migrationPlan, totalFiles, totalSize };
}

// 检查冲突文件
function checkConflicts(migrationPlan) {
  console.log('\n⚠️ 潜在冲突检查:');
  
  const conflicts = [];
  
  migrationPlan.forEach(plan => {
    plan.files.forEach(file => {
      if (fs.existsSync(file.target)) {
        conflicts.push({
          source: file.path,
          target: file.target,
          type: 'file_exists'
        });
      }
    });
  });
  
  if (conflicts.length > 0) {
    console.log(`  🚨 发现 ${conflicts.length} 个潜在冲突:`);
    conflicts.slice(0, 10).forEach(conflict => {
      console.log(`    - ${conflict.source} -> ${conflict.target}`);
    });
    if (conflicts.length > 10) {
      console.log(`    ... 还有 ${conflicts.length - 10} 个冲突`);
    }
  } else {
    console.log(`  ✅ 无冲突文件`);
  }
  
  return conflicts;
}

// 生成迁移脚本
function generateMigrationScript(migrationPlan) {
  console.log('\n📝 生成迁移脚本...');
  
  let script = `#!/bin/bash
# G-Asset Forge 文件迁移脚本
# 自动生成于 ${new Date().toISOString()}

echo "🔄 开始文件迁移..."

`;

  migrationPlan.forEach(plan => {
    script += `
# ${plan.description}
echo "📂 迁移: ${plan.source} -> ${plan.target}"
mkdir -p "${plan.target}"

`;
    
    plan.files.forEach(file => {
      const sourceRel = path.relative(rootDir, file.path);
      const targetRel = path.relative(rootDir, file.target);
      
      script += `# 迁移: ${file.relativePath}
if [ -f "${sourceRel}" ]; then
  mkdir -p "$(dirname "${targetRel}")"
  cp "${sourceRel}" "${targetRel}"
  echo "  ✅ ${file.relativePath}"
fi

`;
    });
  });
  
  script += `
echo "🎉 文件迁移完成!"
echo "⚠️ 请检查迁移后的文件并更新导入路径"
`;

  fs.writeFileSync(path.join(rootDir, 'scripts/migrate-files.sh'), script);
  console.log('  📄 迁移脚本已生成: scripts/migrate-files.sh');
}

// 主函数
function main() {
  const { migrationPlan, totalFiles, totalSize } = analyzeMigration();
  const conflicts = checkConflicts(migrationPlan);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 迁移统计:');
  console.log('='.repeat(60));
  
  console.log(`📄 需要迁移的文件总数: ${totalFiles}`);
  console.log(`📏 需要迁移的文件总大小: ${(totalSize / 1024).toFixed(1)} KB`);
  console.log(`⚠️ 潜在冲突数: ${conflicts.length}`);
  console.log(`📂 迁移目标数: ${migrationPlan.length}`);
  
  if (totalFiles > 0) {
    generateMigrationScript(migrationPlan);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 迁移建议:');
    console.log('='.repeat(60));
    
    console.log('1. 🔍 仔细检查迁移计划，确认文件归属正确');
    console.log('2. 🚨 处理潜在冲突，决定是否覆盖或合并');
    console.log('3. 🔄 运行迁移脚本: bash scripts/migrate-files.sh');
    console.log('4. 🔗 更新所有导入路径和引用');
    console.log('5. 🧪 运行测试确保功能正常');
    console.log('6. 🗑️ 清理原有文件和空目录');
  } else {
    console.log('\n✅ 所有文件已正确迁移到新架构中！');
  }
  
  return { migrationPlan, totalFiles, totalSize, conflicts };
}

// 运行分析
if (require.main === module) {
  main();
}

module.exports = { main };