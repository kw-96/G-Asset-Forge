/**
 * 项目结构分析脚本
 * @description 分析项目架构和重构完成情况
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');

console.log('🔍 G-Asset Forge 项目架构重构分析报告');
console.log('='.repeat(60));

const rootDir = path.resolve(__dirname, '..');

// 检查目录结构
function checkDirectories() {
  console.log('\n📁 主要目录结构检查:');
  
  const expectedDirs = [
    'src',
    'src/main',
    'src/renderer', 
    'src/interfaces',
    'tests',
    'assets',
    'docs',
    '.kiro'
  ];

  let dirScore = 0;
  expectedDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    const exists = fs.existsSync(dirPath);
    console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
    if (exists) dirScore++;
  });

  console.log('\n🏗️ 分层架构检查:');
  const layerDirs = [
    'src/main/core',
    'src/main/managers', 
    'src/main/services',
    'src/main/handlers',
    'src/renderer/ui',
    'src/renderer/logic',
    'src/renderer/stores',
    'src/interfaces/api',
    'src/interfaces/types',
    'src/interfaces/schemas'
  ];

  let layerScore = 0;
  layerDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    const exists = fs.existsSync(dirPath);
    console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
    if (exists) layerScore++;
  });

  return { dirScore, totalDirs: expectedDirs.length, layerScore, totalLayers: layerDirs.length };
}

// 检查核心文件
function checkCoreFiles() {
  console.log('\n📄 核心文件检查:');
  
  const coreFiles = [
    'src/main/main.ts',
    'src/main/core/Application.ts',
    'src/main/services/IPCService.ts',
    'src/main/services/LoggingService.ts',
    'src/main/services/FileService.ts',
    'src/renderer/App.tsx',
    'src/renderer/ui/components/index.ts',
    'src/interfaces/index.ts',
    'jest.config.js',
    'package.json'
  ];

  let fileScore = 0;
  coreFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (exists) fileScore++;
  });

  return { fileScore, totalFiles: coreFiles.length };
}

// 检查UI组件结构
function checkUIComponents() {
  console.log('\n🎨 UI组件结构检查:');
  
  const uiDirs = [
    'src/renderer/ui/components/atoms',
    'src/renderer/ui/components/molecules',
    'src/renderer/ui/components/layout',
    'src/renderer/ui/components/business',
    'src/renderer/ui/theme'
  ];

  let uiScore = 0;
  uiDirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    const exists = fs.existsSync(dirPath);
    console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
    if (exists) uiScore++;
  });

  return { uiScore, totalUI: uiDirs.length };
}

// 检查服务层
function checkServices() {
  console.log('\n⚙️ 服务层检查:');
  
  const services = [
    'src/main/services/IPCService.ts',
    'src/main/services/LoggingService.ts', 
    'src/main/services/FileService.ts',
    'src/renderer/logic/services/ToolService.ts',
    'src/renderer/logic/services/ProjectService.ts',
    'src/renderer/logic/services/AssetService.ts'
  ];

  let serviceScore = 0;
  services.forEach(service => {
    const servicePath = path.join(rootDir, service);
    const exists = fs.existsSync(servicePath);
    console.log(`  ${exists ? '✅' : '❌'} ${service}`);
    if (exists) serviceScore++;
  });

  return { serviceScore, totalServices: services.length };
}

// 检查测试文件
function checkTests() {
  console.log('\n🧪 测试文件检查:');
  
  const testFiles = [
    'tests/setup.ts',
    'tests/structure/architecture.test.ts',
    'tests/functional/services.test.ts',
    'tests/quality/comments.test.ts',
    'jest.config.js'
  ];

  let testScore = 0;
  testFiles.forEach(test => {
    const testPath = path.join(rootDir, test);
    const exists = fs.existsSync(testPath);
    console.log(`  ${exists ? '✅' : '❌'} ${test}`);
    if (exists) testScore++;
  });

  return { testScore, totalTests: testFiles.length };
}

// 统计代码文件
function countCodeFiles() {
  console.log('\n📊 代码文件统计:');
  
  let tsFiles = 0;
  let tsxFiles = 0;
  let totalLines = 0;

  function countInDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        countInDir(path.join(dir, file.name));
      } else if (file.isFile()) {
        const ext = path.extname(file.name);
        if (ext === '.ts') {
          tsFiles++;
          const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
          totalLines += content.split('\n').length;
        } else if (ext === '.tsx') {
          tsxFiles++;
          const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
          totalLines += content.split('\n').length;
        }
      }
    });
  }

  countInDir(path.join(rootDir, 'src'));
  countInDir(path.join(rootDir, 'tests'));

  console.log(`  📝 TypeScript文件: ${tsFiles}`);
  console.log(`  🎨 React组件文件: ${tsxFiles}`);
  console.log(`  📏 总代码行数: ${totalLines}`);

  return { tsFiles, tsxFiles, totalLines };
}

// 主函数
function main() {
  const dirResults = checkDirectories();
  const fileResults = checkCoreFiles();
  const uiResults = checkUIComponents();
  const serviceResults = checkServices();
  const testResults = checkTests();
  const codeStats = countCodeFiles();

  console.log('\n' + '='.repeat(60));
  console.log('📈 重构完成度评估:');
  console.log('='.repeat(60));

  const dirCompletion = (dirResults.dirScore / dirResults.totalDirs * 100).toFixed(1);
  const layerCompletion = (dirResults.layerScore / dirResults.totalLayers * 100).toFixed(1);
  const fileCompletion = (fileResults.fileScore / fileResults.totalFiles * 100).toFixed(1);
  const uiCompletion = (uiResults.uiScore / uiResults.totalUI * 100).toFixed(1);
  const serviceCompletion = (serviceResults.serviceScore / serviceResults.totalServices * 100).toFixed(1);
  const testCompletion = (testResults.testScore / testResults.totalTests * 100).toFixed(1);

  console.log(`📁 目录结构完成度: ${dirCompletion}% (${dirResults.dirScore}/${dirResults.totalDirs})`);
  console.log(`🏗️ 分层架构完成度: ${layerCompletion}% (${dirResults.layerScore}/${dirResults.totalLayers})`);
  console.log(`📄 核心文件完成度: ${fileCompletion}% (${fileResults.fileScore}/${fileResults.totalFiles})`);
  console.log(`🎨 UI组件完成度: ${uiCompletion}% (${uiResults.uiScore}/${uiResults.totalUI})`);
  console.log(`⚙️ 服务层完成度: ${serviceCompletion}% (${serviceResults.serviceScore}/${serviceResults.totalServices})`);
  console.log(`🧪 测试架构完成度: ${testCompletion}% (${testResults.testScore}/${testResults.totalTests})`);

  const overallCompletion = (
    (dirResults.dirScore / dirResults.totalDirs +
     dirResults.layerScore / dirResults.totalLayers +
     fileResults.fileScore / fileResults.totalFiles +
     uiResults.uiScore / uiResults.totalUI +
     serviceResults.serviceScore / serviceResults.totalServices +
     testResults.testScore / testResults.totalTests) / 6 * 100
  ).toFixed(1);

  console.log(`\n🎯 总体重构完成度: ${overallCompletion}%`);

  console.log('\n' + '='.repeat(60));
  console.log('📋 重构总结:');
  console.log('='.repeat(60));

  if (overallCompletion >= 90) {
    console.log('🎉 重构基本完成！项目架构已成功转换为分层架构。');
  } else if (overallCompletion >= 70) {
    console.log('✅ 重构进展良好，主要架构已建立，需要完善细节。');
  } else if (overallCompletion >= 50) {
    console.log('⚠️ 重构进行中，核心架构已建立，需要继续完善。');
  } else {
    console.log('❌ 重构刚开始，需要继续按计划执行。');
  }

  return {
    overallCompletion: parseFloat(overallCompletion),
    details: {
      directories: dirCompletion,
      layers: layerCompletion,
      files: fileCompletion,
      ui: uiCompletion,
      services: serviceCompletion,
      tests: testCompletion
    },
    codeStats
  };
}

// 运行分析
if (require.main === module) {
  main();
}

module.exports = { main };