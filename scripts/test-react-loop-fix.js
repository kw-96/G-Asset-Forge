/**
 * React无限循环修复工具测试脚本
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('编译TypeScript文件...');

try {
  // 编译TypeScript文件
  execSync('npx tsc --project tsconfig.json', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  console.log('✓ TypeScript编译成功');
  console.log('\n运行React无限循环修复工具测试...\n');

  // 运行测试
  execSync('node dist/renderer/utils/__tests__/manual-test.js', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

} catch (error) {
  console.error('测试失败:', error.message);
  process.exit(1);
}