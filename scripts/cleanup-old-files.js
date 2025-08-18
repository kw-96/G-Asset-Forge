/**
 * 清理旧文件脚本
 * @description 清理已迁移到新架构的旧文件和目录
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('🧹 G-Asset Forge 旧文件清理');
console.log('='.repeat(50));

const rootDir = path.resolve(__dirname, '..');

// 需要清理的旧目录列表
const oldDirectories = [
  'src/renderer/components',
  'src/renderer/contexts', 
  'src/renderer/core',
  'src/renderer/engines',
  'src/renderer/managers',
  'src/renderer/tools',
  'src/renderer/types',
  'src/renderer/utils',
  'src/types',
  'src/utils'
];

// 需要保留的重要文件（即使在旧目录中）
const preserveFiles = [
  'src/renderer/contexts/LayoutContext.tsx', // 可能还在使用
];

/**
 * 检查目录是否为空
 */
function isDirectoryEmpty(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  } catch (error) {
    return true; // 目录不存在视为空
  }
}

/**
 * 递归删除目录
 */
function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }
  
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`    ❌ 删除失败: ${error.message}`);
    return false;
  }
}

/**
 * 分析旧目录内容
 */
function analyzeOldDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return { exists: false, files: 0, size: 0 };
  }
  
  let fileCount = 0;
  let totalSize = 0;
  
  function scanDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          scanDir(itemPath);
        } else if (item.isFile()) {
          fileCount++;
          try {
            const stats = fs.statSync(itemPath);
            totalSize += stats.size;
          } catch (error) {
            // 忽略无法访问的文件
          }
        }
      });
    } catch (error) {
      // 忽略无法访问的目录
    }
  }
  
  scanDir(dirPath);
  
  return { exists: true, files: fileCount, size: totalSize };
}

/**
 * 检查文件是否已迁移到新位置
 */
function checkMigrationStatus(oldPath) {
  // 映射旧路径到新路径
  const migrationMap = {
    'src/renderer/components': 'src/renderer/ui/components/business',
    'src/renderer/tools': 'src/renderer/logic/managers/tools',
    'src/renderer/managers': 'src/renderer/logic/managers',
    'src/renderer/engines': 'src/renderer/logic/engines',
    'src/renderer/core': 'src/renderer/logic/managers',
    'src/renderer/utils': 'src/renderer/logic/utils',
    'src/renderer/types': 'src/interfaces/types',
    'src/types': 'src/interfaces/types',
    'src/utils': 'src/renderer/logic/utils'
  };
  
  const newPath = migrationMap[oldPath];
  if (!newPath) {
    return { migrated: false, newPath: null };
  }
  
  const newFullPath = path.join(rootDir, newPath);
  const exists = fs.existsSync(newFullPath);
  
  return { migrated: exists, newPath: newPath };
}

/**
 * 主清理函数
 */
function main() {
  console.log('\n📊 分析旧目录状态:');
  
  let totalFiles = 0;
  let totalSize = 0;
  const cleanupPlan = [];
  
  oldDirectories.forEach(dirPath => {
    const fullPath = path.join(rootDir, dirPath);
    const analysis = analyzeOldDirectory(fullPath);
    const migration = checkMigrationStatus(dirPath);
    
    console.log(`\n📂 ${dirPath}`);
    
    if (!analysis.exists) {
      console.log('    ✅ 目录不存在');
      return;
    }
    
    console.log(`    📄 文件数: ${analysis.files}`);
    console.log(`    📏 大小: ${(analysis.size / 1024).toFixed(1)} KB`);
    console.log(`    🔄 迁移状态: ${migration.migrated ? '✅ 已迁移' : '❌ 未迁移'}`);
    
    if (migration.migrated) {
      console.log(`    📍 新位置: ${migration.newPath}`);
    }
    
    totalFiles += analysis.files;
    totalSize += analysis.size;
    
    cleanupPlan.push({
      path: dirPath,
      fullPath: fullPath,
      analysis: analysis,
      migration: migration,
      canCleanup: migration.migrated && analysis.files > 0
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 清理统计:');
  console.log(`📄 旧文件总数: ${totalFiles}`);
  console.log(`📏 旧文件总大小: ${(totalSize / 1024).toFixed(1)} KB`);
  
  const canCleanup = cleanupPlan.filter(item => item.canCleanup);
  console.log(`🗑️ 可清理目录: ${canCleanup.length}/${cleanupPlan.length}`);
  
  if (canCleanup.length === 0) {
    console.log('\n✅ 没有需要清理的目录！');
    return;
  }
  
  console.log('\n⚠️ 即将清理的目录:');
  canCleanup.forEach(item => {
    console.log(`  - ${item.path} (${item.analysis.files} 文件, ${(item.analysis.size / 1024).toFixed(1)} KB)`);
  });
  
  console.log('\n🚨 警告: 此操作将永久删除这些文件！');
  console.log('请确保所有文件都已正确迁移到新位置。');
  console.log('\n如需执行清理，请运行: node scripts/cleanup-old-files.js --confirm');
  
  // 检查是否有确认参数
  if (process.argv.includes('--confirm')) {
    console.log('\n🧹 开始清理...');
    
    let cleanedCount = 0;
    let cleanedSize = 0;
    
    canCleanup.forEach(item => {
      console.log(`\n🗑️ 清理: ${item.path}`);
      
      if (removeDirectory(item.fullPath)) {
        console.log('    ✅ 清理完成');
        cleanedCount++;
        cleanedSize += item.analysis.size;
      } else {
        console.log('    ❌ 清理失败');
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 清理完成！');
    console.log(`📂 已清理目录: ${cleanedCount}`);
    console.log(`💾 释放空间: ${(cleanedSize / 1024).toFixed(1)} KB`);
    
    // 检查是否还有空的父目录需要清理
    console.log('\n🔍 检查空目录...');
    const parentDirs = ['src/renderer', 'src'];
    
    parentDirs.forEach(parentDir => {
      const parentPath = path.join(rootDir, parentDir);
      if (fs.existsSync(parentPath)) {
        try {
          const items = fs.readdirSync(parentPath);
          const emptySubdirs = items.filter(item => {
            const itemPath = path.join(parentPath, item);
            const stat = fs.statSync(itemPath);
            return stat.isDirectory() && isDirectoryEmpty(itemPath);
          });
          
          emptySubdirs.forEach(emptyDir => {
            const emptyPath = path.join(parentPath, emptyDir);
            if (removeDirectory(emptyPath)) {
              console.log(`    🗑️ 清理空目录: ${parentDir}/${emptyDir}`);
            }
          });
        } catch (error) {
          // 忽略错误
        }
      }
    });
    
  } else {
    console.log('\n💡 提示: 如果确认要清理，请添加 --confirm 参数');
  }
}

// 运行清理分析
if (require.main === module) {
  main();
}

module.exports = { main };