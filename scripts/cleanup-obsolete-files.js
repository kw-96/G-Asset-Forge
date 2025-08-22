/**
 * 清理废弃文件脚本 - 移除Suika集成后不再需要的文件
 * @description 清理重复功能的文件和组件，确保项目结构清晰
 */

const fs = require('fs');
const path = require('path');

// 需要清理的废弃文件列表
const OBSOLETE_FILES = [
  // 重复的适配器文件 (已被Suika核心替代)
  'src/renderer/ui/business/common/SuikaGridAdapter.tsx',
  'src/renderer/ui/business/common/SuikaRulerAdapter.tsx', 
  'src/renderer/ui/business/common/SuikaRefLineAdapter.tsx',
  'src/renderer/ui/business/common/ZoomPanContainer.tsx',
  'src/renderer/ui/business/common/CanvasContainer.tsx',
  
  // 重复的工具管理器 (已被Suika工具系统替代)
  'src/renderer/logic/managers/tools/SuikaToolIntegration.ts',
  
  // 重复的上下文文件 (已被Suika核心替代)
  'src/renderer/ui/business/common/CanvasCoordinateContext.tsx',
  'src/renderer/ui/business/common/CanvasCoordinateProvider.tsx',
  'src/renderer/ui/business/common/CanvasDisplayContext.tsx',
  
  // 重复的工具文件 (已被Suika核心替代)
  'src/renderer/ui/business/common/utils.ts',
  
  // UIIntegration目录 (功能已直接集成到组件中)
  'src/renderer/business/UIIntegration',
];

// 需要清理的废弃目录列表
const OBSOLETE_DIRECTORIES = [
  'src/renderer/business/UIIntegration',
  'src/renderer/ui/business/common', // 如果为空则删除
];

/**
 * 检查文件是否存在
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * 删除文件
 */
function deleteFile(filePath) {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✓ 已删除文件: ${filePath}`);
      return true;
    } else {
      console.log(`- 文件不存在: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ 删除文件失败: ${filePath}`, error.message);
    return false;
  }
}

/**
 * 删除目录
 */
function deleteDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(dirPath);
        
        // 递归删除目录中的所有文件
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const fileStats = fs.statSync(filePath);
          
          if (fileStats.isDirectory()) {
            deleteDirectory(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
        }
        
        // 删除空目录
        fs.rmdirSync(dirPath);
        console.log(`✓ 已删除目录: ${dirPath}`);
        return true;
      }
    } else {
      console.log(`- 目录不存在: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ 删除目录失败: ${dirPath}`, error.message);
    return false;
  }
}

/**
 * 检查目录是否为空
 */
function isDirectoryEmpty(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return true;
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  } catch (error) {
    return false;
  }
}

/**
 * 生成清理报告
 */
function generateCleanupReport(deletedFiles, deletedDirs, errors) {
  const report = `# Suika集成后的文件清理报告

## 清理时间
${new Date().toLocaleString('zh-CN')}

## 已删除的文件 (${deletedFiles.length})
${deletedFiles.map(file => `- ${file}`).join('\n')}

## 已删除的目录 (${deletedDirs.length})
${deletedDirs.map(dir => `- ${dir}`).join('\n')}

## 清理错误 (${errors.length})
${errors.map(error => `- ${error}`).join('\n')}

## 清理说明

### 为什么删除这些文件？

1. **适配器文件**: Suika核心已经内置了网格、标尺、参考线功能，不再需要React适配器
2. **工具集成文件**: 直接使用Suika的工具管理器，不需要额外的集成层
3. **上下文文件**: Suika核心管理坐标系统，不需要React上下文
4. **UIIntegration目录**: UI增强功能已直接集成到组件中

### 保留的文件

- \`SuikaCanvasComponent.tsx\`: 统一的Suika画布组件
- \`SuikaIntegratedCanvas.tsx\`: 完整的Suika UI集成
- \`SuikaIntegratedLayout.tsx\`: Suika风格的布局系统
- \`FigmaToolbar.tsx\`: 集成Suika工具的Figma风格工具栏

### 下一步

1. 检查是否有其他文件引用了已删除的文件
2. 更新导入语句，使用新的Suika集成组件
3. 测试所有功能是否正常工作
`;

  fs.writeFileSync('docs/SUIKA_CLEANUP_REPORT.md', report);
  console.log('\n📄 清理报告已生成: docs/SUIKA_CLEANUP_REPORT.md');
}

/**
 * 主清理函数
 */
function main() {
  console.log('🧹 开始清理Suika集成后的废弃文件...\n');

  const deletedFiles = [];
  const deletedDirs = [];
  const errors = [];

  // 清理废弃文件
  console.log('📁 清理废弃文件:');
  for (const file of OBSOLETE_FILES) {
    if (deleteFile(file)) {
      deletedFiles.push(file);
    }
  }

  // 清理废弃目录
  console.log('\n📂 清理废弃目录:');
  for (const dir of OBSOLETE_DIRECTORIES) {
    if (deleteDirectory(dir)) {
      deletedDirs.push(dir);
    }
  }

  // 检查并清理空目录
  console.log('\n🗂️  检查空目录:');
  const potentialEmptyDirs = [
    'src/renderer/ui/business/common',
    'src/renderer/business',
    'src/renderer/logic/managers/tools',
  ];

  for (const dir of potentialEmptyDirs) {
    if (isDirectoryEmpty(dir)) {
      if (deleteDirectory(dir)) {
        deletedDirs.push(dir);
      }
    } else if (fs.existsSync(dir)) {
      console.log(`- 目录不为空，保留: ${dir}`);
    }
  }

  // 生成清理报告
  generateCleanupReport(deletedFiles, deletedDirs, errors);

  console.log(`\n✅ 清理完成!`);
  console.log(`   删除文件: ${deletedFiles.length}`);
  console.log(`   删除目录: ${deletedDirs.length}`);
  console.log(`   错误数量: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n⚠️  清理过程中遇到错误，请检查清理报告');
  }

  console.log('\n🔍 请检查以下事项:');
  console.log('   1. 确认没有其他文件引用已删除的文件');
  console.log('   2. 更新相关的导入语句');
  console.log('   3. 运行测试确保功能正常');
}

// 运行清理脚本
if (require.main === module) {
  main();
}

module.exports = {
  deleteFile,
  deleteDirectory,
  isDirectoryEmpty,
  OBSOLETE_FILES,
  OBSOLETE_DIRECTORIES,
};