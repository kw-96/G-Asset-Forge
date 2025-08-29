#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n🔧 ${step}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// 获取项目根目录
const rootDir = path.resolve(__dirname, '..');

// 需要清理的目录和文件
const cleanTargets = {
  build: ['dist', 'build', '.vite', 'tsconfig.tsbuildinfo'],
  cache: ['node_modules/.cache', '.pnpm-store', '.eslintcache'],
  temp: ['*.log', '*.tmp', '.temp'],
};

// 子包列表
const packages = [
  'packages/common',
  'packages/core',
  'packages/components',
  'packages/geo',
  'packages/icons',
  'apps/g-asset-forge',
  'apps/g-asset-forge-multiplayer',
  'apps/workbench',
  'apps/backend',
];

// 删除目录或文件
function removePath(targetPath) {
  try {
    if (fs.existsSync(targetPath)) {
      if (fs.lstatSync(targetPath).isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        logSuccess(`已删除目录: ${targetPath}`);
      } else {
        fs.unlinkSync(targetPath);
        logSuccess(`已删除文件: ${targetPath}`);
      }
    }
  } catch (error) {
    logWarning(`删除失败 ${targetPath}: ${error.message}`);
  }
}

// 清理指定目录
function cleanDirectory(dirPath, targets) {
  if (!fs.existsSync(dirPath)) return;

  targets.forEach((target) => {
    const fullPath = path.join(dirPath, target);
    if (target.includes('*')) {
      // 处理通配符
      const dir = path.dirname(fullPath);
      const pattern = path.basename(fullPath);
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          files.forEach((file) => {
            if (file.match(pattern.replace('*', '.*'))) {
              removePath(path.join(dir, file));
            }
          });
        } catch (error) {
          logWarning(`读取目录失败 ${dir}: ${error.message}`);
        }
      }
    } else {
      removePath(fullPath);
    }
  });
}

// 快速清理：只清理构建输出
function quickClean() {
  logStep('执行快速清理（构建输出）');

  // 清理根目录
  cleanDirectory(rootDir, cleanTargets.build);

  // 清理子包
  packages.forEach((pkg) => {
    const pkgPath = path.join(rootDir, pkg);
    if (fs.existsSync(pkgPath)) {
      cleanDirectory(pkgPath, cleanTargets.build);
    }
  });

  logSuccess('快速清理完成！');
}

// 标准清理：清理构建输出和依赖缓存
function standardClean() {
  logStep('执行标准清理（构建输出 + 依赖缓存）');

  quickClean();

  // 清理缓存目录
  cleanDirectory(rootDir, cleanTargets.cache);

  // 清理子包缓存
  packages.forEach((pkg) => {
    const pkgPath = path.join(rootDir, pkg);
    if (fs.existsSync(pkgPath)) {
      cleanDirectory(pkgPath, cleanTargets.cache);
    }
  });

  logSuccess('标准清理完成！');
}

// 深度清理：清理所有可能的缓存
function deepClean() {
  logStep('执行深度清理（所有缓存）');

  standardClean();

  // 清理临时文件
  cleanDirectory(rootDir, cleanTargets.temp);

  // 清理子包临时文件
  packages.forEach((pkg) => {
    const pkgPath = path.join(rootDir, pkg);
    if (fs.existsSync(pkgPath)) {
      cleanDirectory(pkgPath, cleanTargets.temp);
    }
  });

  // 清理pnpm全局缓存（可选）
  try {
    log('正在清理pnpm全局缓存...', 'yellow');
    execSync('pnpm store prune', { stdio: 'inherit' });
    logSuccess('pnpm全局缓存清理完成！');
  } catch (error) {
    logWarning('pnpm全局缓存清理失败，可能需要手动执行: pnpm store prune');
  }

  logSuccess('深度清理完成！');
}

// 清理特定包
function cleanPackage(packageName) {
  const pkgPath = path.join(rootDir, packageName);
  if (!fs.existsSync(pkgPath)) {
    logError(`包 ${packageName} 不存在！`);
    return;
  }

  logStep(`清理包: ${packageName}`);
  cleanDirectory(pkgPath, [...cleanTargets.build, ...cleanTargets.cache]);
  logSuccess(`包 ${packageName} 清理完成！`);
}

// 显示帮助信息
function showHelp() {
  log('\n🧹 G-Asset Forge 构建缓存清理工具', 'magenta');
  log('=====================================\n', 'magenta');

  log('使用方法:', 'cyan');
  log('  node scripts/clean.js [选项]\n', 'reset');

  log('选项:', 'cyan');
  log('  quick, q     快速清理（只清理构建输出）', 'reset');
  log('  standard, s  标准清理（构建输出 + 依赖缓存）', 'reset');
  log('  deep, d      深度清理（所有缓存）', 'reset');
  log('  package <pkg> 清理特定包', 'reset');
  log('  help, h      显示此帮助信息', 'reset');

  log('\n示例:', 'cyan');
  log('  node scripts/clean.js quick', 'reset');
  log('  node scripts/clean.js package packages/core', 'reset');
  log('  node scripts/clean.js deep', 'reset');

  log('\n注意:', 'yellow');
  log('  - 深度清理会删除所有缓存，可能需要重新安装依赖', 'yellow');
  log('  - 建议先尝试快速清理，如果问题仍然存在再使用标准清理', 'yellow');
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === 'h') {
    showHelp();
    return;
  }

  switch (command) {
    case 'quick':
    case 'q':
      quickClean();
      break;

    case 'standard':
    case 's':
      standardClean();
      break;

    case 'deep':
    case 'd':
      logWarning('即将执行深度清理，这会删除所有缓存！');
      log('确认继续吗？(y/N): ', 'yellow');
      process.stdin.once('data', (data) => {
        const input = data.toString().trim().toLowerCase();
        if (input === 'y' || input === 'yes') {
          deepClean();
        } else {
          log('已取消深度清理', 'yellow');
        }
        process.exit(0);
      });
      return;

    case 'package':
      if (!args[1]) {
        logError('请指定要清理的包名！');
        showHelp();
        return;
      }
      cleanPackage(args[1]);
      break;

    default:
      logError(`未知命令: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  quickClean,
  standardClean,
  deepClean,
  cleanPackage,
};
