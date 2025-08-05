#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * 跨平台文件/目录删除工具
 */
class CleanupTool {
  constructor() {
    this.deletedCount = 0;
    this.skippedCount = 0;
  }

  /**
   * 删除单个目录或文件
   * @param {string} targetPath 要删除的路径
   */
  remove(targetPath) {
    try {
      const fullPath = path.resolve(targetPath);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed: ${targetPath}`);
        this.deletedCount++;
      } else {
        console.log(`⏭️  Skip: ${targetPath} (not found)`);
        this.skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error removing ${targetPath}:`, error.message);
    }
  }

  /**
   * 批量删除多个路径
   * @param {string[]} targets 要删除的路径数组
   */
  removeMultiple(targets) {
    console.log(`🧹 Starting cleanup process...`);
    targets.forEach(target => this.remove(target));
    this.showSummary();
  }

  /**
   * 显示清理摘要
   */
  showSummary() {
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   Deleted: ${this.deletedCount} items`);
    console.log(`   Skipped: ${this.skippedCount} items`);
    console.log(`✨ Cleanup completed!`);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const cleanup = new CleanupTool();

if (args.length === 0) {
  // 默认清理所有
  cleanup.removeMultiple(['dist', 'node_modules/.cache', '.webpack']);
} else if (args[0] === 'dist') {
  cleanup.removeMultiple(['dist']);
} else if (args[0] === 'cache') {
  cleanup.removeMultiple(['node_modules/.cache', '.webpack']);
} else if (args[0] === 'all') {
  cleanup.removeMultiple(['dist', 'node_modules/.cache', '.webpack', 'node_modules']);
} else {
  // 自定义路径
  cleanup.removeMultiple(args);
}