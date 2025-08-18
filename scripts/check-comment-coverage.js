/**
 * 中文JSDoc注释覆盖率检查工具
 * @description 检查项目中中文JSDoc注释的覆盖率和质量
 * @author 开发团队
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * 注释覆盖率统计结果接口
 * @typedef {Object} CoverageStats
 * @property {number} totalFiles - 总文件数
 * @property {number} filesWithHeader - 有文件头注释的文件数
 * @property {number} totalExportedFunctions - 导出函数总数
 * @property {number} functionsWithComments - 有注释的函数数
 * @property {number} totalExportedClasses - 导出类总数
 * @property {number} classesWithComments - 有注释的类数
 * @property {number} totalExportedInterfaces - 导出接口总数
 * @property {number} interfacesWithComments - 有注释的接口数
 * @property {number} chineseCommentCount - 中文注释数量
 * @property {number} englishCommentCount - 英文注释数量
 */

/**
 * 检查文件是否包含中文字符
 * @param text 要检查的文本
 * @returns 是否包含中文字符
 */
function containsChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 提取文件中的JSDoc注释
 * @param content 文件内容
 * @returns JSDoc注释数组
 */
function extractJSDocComments(content) {
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  return content.match(jsdocRegex) || [];
}

/**
 * 检查文件是否有文件头注释
 * @param content 文件内容
 * @returns 是否有文件头注释
 */
function hasFileHeader(content) {
  const lines = content.split('\n');
  const firstNonEmptyLine = lines.find(line => line.trim() !== '');
  return firstNonEmptyLine && firstNonEmptyLine.trim().startsWith('/**');
}

/**
 * 统计导出的函数数量
 * @param content 文件内容
 * @returns 导出函数数量
 */
function countExportedFunctions(content) {
  const exportFunctionRegex = /export\s+(async\s+)?function\s+\w+|export\s+const\s+\w+\s*=\s*(async\s+)?\(/g;
  return (content.match(exportFunctionRegex) || []).length;
}

/**
 * 统计导出的类数量
 * @param content 文件内容
 * @returns 导出类数量
 */
function countExportedClasses(content) {
  const exportClassRegex = /export\s+(abstract\s+)?class\s+\w+/g;
  return (content.match(exportClassRegex) || []).length;
}

/**
 * 统计导出的接口数量
 * @param content 文件内容
 * @returns 导出接口数量
 */
function countExportedInterfaces(content) {
  const exportInterfaceRegex = /export\s+interface\s+\w+/g;
  return (content.match(exportInterfaceRegex) || []).length;
}

/**
 * 分析单个文件的注释覆盖率
 * @param filePath 文件路径
 * @returns 文件注释统计信息
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const comments = extractJSDocComments(content);
  
  const stats = {
    filePath,
    hasFileHeader: hasFileHeader(content),
    totalComments: comments.length,
    chineseComments: comments.filter(comment => containsChinese(comment)).length,
    englishComments: comments.filter(comment => !containsChinese(comment)).length,
    exportedFunctions: countExportedFunctions(content),
    exportedClasses: countExportedClasses(content),
    exportedInterfaces: countExportedInterfaces(content),
    comments: comments
  };
  
  return stats;
}

/**
 * 检查项目的注释覆盖率
 * @param srcDir 源代码目录
 * @returns 覆盖率统计结果
 */
function checkCommentCoverage(srcDir = 'src') {
  console.log('🔍 开始检查中文JSDoc注释覆盖率...\n');
  
  // 查找所有TypeScript文件
  const pattern = path.join(srcDir, '**/*.{ts,tsx}');
  const files = glob.sync(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx'
    ]
  });
  
  console.log(`📁 找到 ${files.length} 个TypeScript文件\n`);
  
  const stats = {
    totalFiles: files.length,
    filesWithHeader: 0,
    totalExportedFunctions: 0,
    functionsWithComments: 0,
    totalExportedClasses: 0,
    classesWithComments: 0,
    totalExportedInterfaces: 0,
    interfacesWithComments: 0,
    chineseCommentCount: 0,
    englishCommentCount: 0
  };
  
  const fileResults = [];
  
  files.forEach(file => {
    const result = analyzeFile(file);
    fileResults.push(result);
    
    // 统计总数
    if (result.hasFileHeader) stats.filesWithHeader++;
    stats.totalExportedFunctions += result.exportedFunctions;
    stats.totalExportedClasses += result.exportedClasses;
    stats.totalExportedInterfaces += result.exportedInterfaces;
    stats.chineseCommentCount += result.chineseComments;
    stats.englishCommentCount += result.englishComments;
    
    // 简单估算有注释的导出项（这里简化处理）
    if (result.totalComments > 0) {
      stats.functionsWithComments += Math.min(result.totalComments, result.exportedFunctions);
      stats.classesWithComments += Math.min(result.totalComments, result.exportedClasses);
      stats.interfacesWithComments += Math.min(result.totalComments, result.exportedInterfaces);
    }
  });
  
  // 计算覆盖率
  const fileHeaderCoverage = (stats.filesWithHeader / stats.totalFiles * 100).toFixed(2);
  const functionCoverage = stats.totalExportedFunctions > 0 
    ? (stats.functionsWithComments / stats.totalExportedFunctions * 100).toFixed(2) 
    : '0.00';
  const classCoverage = stats.totalExportedClasses > 0 
    ? (stats.classesWithComments / stats.totalExportedClasses * 100).toFixed(2) 
    : '0.00';
  const interfaceCoverage = stats.totalExportedInterfaces > 0 
    ? (stats.interfacesWithComments / stats.totalExportedInterfaces * 100).toFixed(2) 
    : '0.00';
  const chineseRatio = stats.chineseCommentCount + stats.englishCommentCount > 0
    ? (stats.chineseCommentCount / (stats.chineseCommentCount + stats.englishCommentCount) * 100).toFixed(2)
    : '0.00';
  
  // 输出统计结果
  console.log('📊 注释覆盖率统计结果:');
  console.log('================================');
  console.log(`📄 文件头注释覆盖率: ${fileHeaderCoverage}% (${stats.filesWithHeader}/${stats.totalFiles})`);
  console.log(`🔧 导出函数注释覆盖率: ${functionCoverage}% (${stats.functionsWithComments}/${stats.totalExportedFunctions})`);
  console.log(`🏗️  导出类注释覆盖率: ${classCoverage}% (${stats.classesWithComments}/${stats.totalExportedClasses})`);
  console.log(`📋 导出接口注释覆盖率: ${interfaceCoverage}% (${stats.interfacesWithComments}/${stats.totalExportedInterfaces})`);
  console.log(`🇨🇳 中文注释比例: ${chineseRatio}% (${stats.chineseCommentCount}/${stats.chineseCommentCount + stats.englishCommentCount})`);
  console.log('================================\n');
  
  // 显示需要改进的文件
  const filesNeedingImprovement = fileResults.filter(result => 
    !result.hasFileHeader || 
    (result.exportedFunctions > 0 && result.totalComments === 0) ||
    (result.exportedClasses > 0 && result.totalComments === 0) ||
    (result.exportedInterfaces > 0 && result.totalComments === 0) ||
    result.englishComments > result.chineseComments
  );
  
  if (filesNeedingImprovement.length > 0) {
    console.log('⚠️  需要改进注释的文件:');
    console.log('================================');
    filesNeedingImprovement.forEach(result => {
      const issues = [];
      if (!result.hasFileHeader) issues.push('缺少文件头注释');
      if (result.exportedFunctions > 0 && result.totalComments === 0) issues.push('导出函数缺少注释');
      if (result.exportedClasses > 0 && result.totalComments === 0) issues.push('导出类缺少注释');
      if (result.exportedInterfaces > 0 && result.totalComments === 0) issues.push('导出接口缺少注释');
      if (result.englishComments > result.chineseComments) issues.push('英文注释多于中文注释');
      
      console.log(`📁 ${result.filePath}`);
      console.log(`   问题: ${issues.join(', ')}`);
      console.log(`   统计: 导出函数${result.exportedFunctions}个, 导出类${result.exportedClasses}个, 导出接口${result.exportedInterfaces}个`);
      console.log(`   注释: 总计${result.totalComments}个, 中文${result.chineseComments}个, 英文${result.englishComments}个\n`);
    });
  }
  
  // 质量评估
  const overallScore = (
    parseFloat(fileHeaderCoverage) * 0.2 +
    parseFloat(functionCoverage) * 0.3 +
    parseFloat(classCoverage) * 0.2 +
    parseFloat(interfaceCoverage) * 0.2 +
    parseFloat(chineseRatio) * 0.1
  ).toFixed(2);
  
  console.log(`🎯 总体注释质量评分: ${overallScore}/100`);
  
  if (overallScore >= 90) {
    console.log('✅ 注释质量优秀！');
  } else if (overallScore >= 70) {
    console.log('⚠️  注释质量良好，还有改进空间');
  } else {
    console.log('❌ 注释质量需要大幅改进');
  }
  
  return {
    stats,
    fileResults,
    filesNeedingImprovement,
    overallScore: parseFloat(overallScore)
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  const srcDir = process.argv[2] || 'src';
  checkCommentCoverage(srcDir);
}

module.exports = {
  checkCommentCoverage,
  analyzeFile,
  containsChinese
};