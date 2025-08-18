/**
 * 智能文件迁移脚本
 * @description 智能合并和迁移原有文件到新架构
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('🤖 G-Asset Forge 智能文件迁移');
console.log('='.repeat(50));

const rootDir = path.resolve(__dirname, '..');

// 开始迁移业务组件
async function migrateBusinessComponents() {
  console.log('\n📱 迁移业务组件...');
  
  const sourceDir = path.join(rootDir, 'src/renderer/components');
  const targetDir = path.join(rootDir, 'src/renderer/ui/components/business');
  
  if (!fs.existsSync(sourceDir)) {
    console.log('  ❌ 源目录不存在');
    return;
  }
  
  // 确保目标目录存在
  fs.mkdirSync(targetDir, { recursive: true });
  
  // 获取所有组件目录
  const componentDirs = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`  📂 发现 ${componentDirs.length} 个组件目录`);
  
  for (const componentDir of componentDirs) {
    const sourcePath = path.join(sourceDir, componentDir);
    const targetPath = path.join(targetDir, componentDir);
    
    try {
      // 复制整个组件目录
      await copyDirectory(sourcePath, targetPath);
      console.log(`    ✅ ${componentDir}`);
    } catch (error) {
      console.log(`    ❌ ${componentDir}: ${error.message}`);
    }
  }
}

// 迁移工具函数
async function migrateUtils() {
  console.log('\n🔧 迁移工具函数...');
  
  const sourceDir = path.join(rootDir, 'src/renderer/utils');
  const targetDir = path.join(rootDir, 'src/renderer/logic/utils');
  
  if (!fs.existsSync(sourceDir)) {
    console.log('  ❌ 源目录不存在');
    return;
  }
  
  // 确保目标目录存在
  fs.mkdirSync(targetDir, { recursive: true });
  
  // 获取所有文件和目录
  const items = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item.name);
    const targetPath = path.join(targetDir, item.name);
    
    try {
      if (item.isDirectory()) {
        await copyDirectory(sourcePath, targetPath);
      } else if (item.isFile() && ['.ts', '.tsx'].includes(path.extname(item.name))) {
        await copyFile(sourcePath, targetPath);
      }
      console.log(`    ✅ ${item.name}`);
    } catch (error) {
      console.log(`    ❌ ${item.name}: ${error.message}`);
    }
  }
}

// 迁移管理器
async function migrateManagers() {
  console.log('\n👔 迁移管理器...');
  
  const sourceDir = path.join(rootDir, 'src/renderer/managers');
  const targetDir = path.join(rootDir, 'src/renderer/logic/managers');
  
  if (!fs.existsSync(sourceDir)) {
    console.log('  ❌ 源目录不存在');
    return;
  }
  
  // 获取所有管理器目录
  const managerDirs = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const managerDir of managerDirs) {
    const sourcePath = path.join(sourceDir, managerDir);
    const targetPath = path.join(targetDir, managerDir);
    
    // 检查目标是否已存在
    if (fs.existsSync(targetPath)) {
      console.log(`    ⚠️ ${managerDir}: 目标已存在，跳过`);
      continue;
    }
    
    try {
      await copyDirectory(sourcePath, targetPath);
      console.log(`    ✅ ${managerDir}`);
    } catch (error) {
      console.log(`    ❌ ${managerDir}: ${error.message}`);
    }
  }
}

// 迁移核心功能
async function migrateCore() {
  console.log('\n🏗️ 迁移核心功能...');
  
  const sourceDir = path.join(rootDir, 'src/renderer/core');
  const targetDir = path.join(rootDir, 'src/renderer/logic/managers');
  
  if (!fs.existsSync(sourceDir)) {
    console.log('  ❌ 源目录不存在');
    return;
  }
  
  // 获取核心功能目录
  const coreDirs = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const coreDir of coreDirs) {
    const sourcePath = path.join(sourceDir, coreDir);
    const targetPath = path.join(targetDir, coreDir);
    
    // 检查目标是否已存在
    if (fs.existsSync(targetPath)) {
      console.log(`    ⚠️ ${coreDir}: 目标已存在，跳过`);
      continue;
    }
    
    try {
      await copyDirectory(sourcePath, targetPath);
      console.log(`    ✅ ${coreDir}`);
    } catch (error) {
      console.log(`    ❌ ${coreDir}: ${error.message}`);
    }
  }
  
  // 迁移核心文件
  const coreFiles = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && ['.ts', '.tsx'].includes(path.extname(dirent.name)))
    .map(dirent => dirent.name);
  
  for (const coreFile of coreFiles) {
    if (coreFile === 'index.ts') continue; // 跳过索引文件，避免冲突
    
    const sourcePath = path.join(sourceDir, coreFile);
    const targetPath = path.join(targetDir, coreFile);
    
    try {
      await copyFile(sourcePath, targetPath);
      console.log(`    ✅ ${coreFile}`);
    } catch (error) {
      console.log(`    ❌ ${coreFile}: ${error.message}`);
    }
  }
}

// 迁移引擎文件
async function migrateEngines() {
  console.log('\n🚀 迁移引擎文件...');
  
  const sourceDir = path.join(rootDir, 'src/renderer/engines');
  const targetDir = path.join(rootDir, 'src/renderer/logic/engines');
  
  if (!fs.existsSync(sourceDir)) {
    console.log('  ❌ 源目录不存在');
    return;
  }
  
  // 获取所有引擎文件和目录
  const items = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  for (const item of items) {
    // 跳过已存在的文件
    if (['index.ts', 'core', 'adapters'].includes(item.name)) {
      console.log(`    ⚠️ ${item.name}: 已存在，跳过`);
      continue;
    }
    
    const sourcePath = path.join(sourceDir, item.name);
    const targetPath = path.join(targetDir, item.name);
    
    try {
      if (item.isDirectory()) {
        await copyDirectory(sourcePath, targetPath);
      } else if (item.isFile() && ['.ts', '.tsx'].includes(path.extname(item.name))) {
        await copyFile(sourcePath, targetPath);
      }
      console.log(`    ✅ ${item.name}`);
    } catch (error) {
      console.log(`    ❌ ${item.name}: ${error.message}`);
    }
  }
}

// 迁移类型定义
async function migrateTypes() {
  console.log('\n📝 迁移类型定义...');
  
  const sources = [
    { from: 'src/renderer/types', to: 'src/interfaces/types' },
    { from: 'src/types', to: 'src/interfaces/types' }
  ];
  
  for (const { from, to } of sources) {
    const sourceDir = path.join(rootDir, from);
    const targetDir = path.join(rootDir, to);
    
    if (!fs.existsSync(sourceDir)) {
      console.log(`  ❌ ${from}: 源目录不存在`);
      continue;
    }
    
    const typeFiles = fs.readdirSync(sourceDir, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && ['.ts', '.d.ts'].includes(path.extname(dirent.name)))
      .map(dirent => dirent.name);
    
    for (const typeFile of typeFiles) {
      const sourcePath = path.join(sourceDir, typeFile);
      const targetPath = path.join(targetDir, typeFile);
      
      // 检查是否已存在
      if (fs.existsSync(targetPath)) {
        console.log(`    ⚠️ ${typeFile}: 已存在，跳过`);
        continue;
      }
      
      try {
        await copyFile(sourcePath, targetPath);
        console.log(`    ✅ ${typeFile}`);
      } catch (error) {
        console.log(`    ❌ ${typeFile}: ${error.message}`);
      }
    }
  }
}

// 复制文件
async function copyFile(source, target) {
  // 确保目标目录存在
  fs.mkdirSync(path.dirname(target), { recursive: true });
  
  // 复制文件
  fs.copyFileSync(source, target);
}

// 复制目录
async function copyDirectory(source, target) {
  // 确保目标目录存在
  fs.mkdirSync(target, { recursive: true });
  
  const items = fs.readdirSync(source, { withFileTypes: true });
  
  for (const item of items) {
    const sourcePath = path.join(source, item.name);
    const targetPath = path.join(target, item.name);
    
    if (item.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// 主函数
async function main() {
  try {
    await migrateBusinessComponents();
    await migrateUtils();
    await migrateManagers();
    await migrateCore();
    await migrateEngines();
    await migrateTypes();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 文件迁移完成！');
    console.log('\n📋 后续步骤:');
    console.log('1. 🔗 更新导入路径');
    console.log('2. 🧪 运行测试验证功能');
    console.log('3. 🗑️ 清理原有文件');
    console.log('4. 📝 更新文档');
    
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
  }
}

// 运行迁移
if (require.main === module) {
  main();
}

module.exports = { main };