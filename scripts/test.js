/**
 * 测试运行脚本
 * @description 提供不同类型的测试运行命令
 * @author 开发团队
 */
const { spawn } = require('child_process');
const path = require('path');

/**
 * 运行命令
 */
const runCommand = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
};

/**
 * 主函数
 */
async function main() {
  const testType = process.argv[2] || 'all';
  
  console.log(`🧪 运行测试: ${testType}`);
  
  try {
    switch (testType) {
      case 'structure':
        console.log('📁 运行结构验证测试...');
        await runCommand('npx', ['jest', 'tests/structure', '--verbose']);
        break;
        
      case 'functional':
        console.log('⚙️ 运行功能测试...');
        await runCommand('npx', ['jest', 'tests/functional', '--verbose']);
        break;
        
      case 'quality':
        console.log('✨ 运行代码质量测试...');
        await runCommand('npx', ['jest', 'tests/quality', '--verbose']);
        break;
        
      case 'coverage':
        console.log('📊 运行覆盖率测试...');
        await runCommand('npx', ['jest', '--coverage', '--verbose']);
        break;
        
      case 'watch':
        console.log('👀 运行监视模式测试...');
        await runCommand('npx', ['jest', '--watch', '--verbose']);
        break;
        
      case 'ci':
        console.log('🚀 运行CI测试...');
        await runCommand('npx', ['jest', '--ci', '--coverage', '--watchAll=false']);
        break;
        
      case 'all':
      default:
        console.log('🎯 运行所有测试...');
        await runCommand('npx', ['jest', '--verbose']);
        break;
    }
    
    console.log('✅ 测试完成!');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { runCommand };