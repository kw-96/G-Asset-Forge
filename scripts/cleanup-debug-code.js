/**
 * 清理调试代码脚本
 * 移除不再需要的调试代码和临时修复
 */

const fs = require('fs');
const path = require('path');

class DebugCodeCleaner {
  constructor() {
    this.cleanupPatterns = [
      // 临时调试日志
      /console\.log\(['"`]DEBUG:.*?['"`].*?\);?\s*\n?/g,
      /console\.log\(['"`]TEMP:.*?['"`].*?\);?\s*\n?/g,
      /console\.log\(['"`]FIXME:.*?['"`].*?\);?\s*\n?/g,
      
      // 临时注释
      /\/\/ TEMP:.*?\n/g,
      /\/\/ DEBUG:.*?\n/g,
      /\/\/ FIXME:.*?\n/g,
      
      // 临时变量
      /const\s+temp\w*\s*=.*?;\s*\n/g,
      /let\s+debug\w*\s*=.*?;\s*\n/g,
      
      // 空的try-catch块
      /try\s*{\s*}\s*catch\s*\([^)]*\)\s*{\s*}/g,
    ];
    
    this.filesToClean = [];
    this.cleanupReport = {
      filesProcessed: 0,
      linesRemoved: 0,
      patternsFound: {},
    };
  }

  /**
   * 扫描目录查找需要清理的文件
   */
  scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // 跳过node_modules和dist目录
        if (!['node_modules', 'dist', '.git'].includes(file)) {
          this.scanDirectory(filePath, extensions);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        this.filesToClean.push(filePath);
      }
    }
  }

  /**
   * 清理单个文件
   */
  cleanFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let cleanedContent = originalContent;
      let linesRemoved = 0;
      
      // 应用清理模式
      for (const pattern of this.cleanupPatterns) {
        const matches = cleanedContent.match(pattern);
        if (matches) {
          const patternName = pattern.toString();
          this.cleanupReport.patternsFound[patternName] = 
            (this.cleanupReport.patternsFound[patternName] || 0) + matches.length;
          
          linesRemoved += matches.length;
          cleanedContent = cleanedContent.replace(pattern, '');
        }
      }
      
      // 清理多余的空行
      cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      // 如果内容有变化，写回文件
      if (cleanedContent !== originalContent) {
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        console.log(`✓ 清理文件: ${filePath} (移除 ${linesRemoved} 行)`);
        this.cleanupReport.linesRemoved += linesRemoved;
      }
      
      this.cleanupReport.filesProcessed++;
      
    } catch (error) {
      console.error(`✗ 清理文件失败: ${filePath}`, error.message);
    }
  }

  /**
   * 清理特定的调试导入
   */
  cleanDebugImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let cleanedContent = content;
      
      // 移除临时调试导入
      const debugImportPatterns = [
        /import.*?from\s+['"`].*?debug.*?['"`];\s*\n/gi,
        /import.*?from\s+['"`].*?temp.*?['"`];\s*\n/gi,
        /import.*?from\s+['"`].*?test.*?['"`];\s*\n/gi,
      ];
      
      for (const pattern of debugImportPatterns) {
        cleanedContent = cleanedContent.replace(pattern, '');
      }
      
      if (cleanedContent !== content) {
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        console.log(`✓ 清理调试导入: ${filePath}`);
      }
      
    } catch (error) {
      console.error(`✗ 清理调试导入失败: ${filePath}`, error.message);
    }
  }

  /**
   * 优化导入语句
   */
  optimizeImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let optimizedContent = content;
      
      // 合并同一模块的导入
      const importGroups = {};
      const importRegex = /import\s+{([^}]+)}\s+from\s+['"`]([^'"`]+)['"`];/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const imports = match[1].trim();
        const module = match[2];
        
        if (!importGroups[module]) {
          importGroups[module] = [];
        }
        importGroups[module].push(imports);
      }
      
      // 重新构建优化的导入
      for (const [module, imports] of Object.entries(importGroups)) {
        if (imports.length > 1) {
          const combinedImports = imports.join(', ');
          const newImport = `import { ${combinedImports} } from '${module}';`;
          
          // 替换原有的多个导入
          for (const importStr of imports) {
            const oldImport = `import { ${importStr} } from '${module}';`;
            optimizedContent = optimizedContent.replace(oldImport, '');
          }
          
          // 添加合并后的导入
          const firstImportPos = optimizedContent.indexOf(`from '${module}'`);
          if (firstImportPos !== -1) {
            const lineStart = optimizedContent.lastIndexOf('\n', firstImportPos) + 1;
            optimizedContent = optimizedContent.substring(0, lineStart) + 
                             newImport + '\n' + 
                             optimizedContent.substring(lineStart);
          }
        }
      }
      
      if (optimizedContent !== content) {
        fs.writeFileSync(filePath, optimizedContent, 'utf8');
        console.log(`✓ 优化导入: ${filePath}`);
      }
      
    } catch (error) {
      console.error(`✗ 优化导入失败: ${filePath}`, error.message);
    }
  }

  /**
   * 执行完整的清理流程
   */
  async cleanup(rootPath) {
    console.log('=== 开始代码清理 ===\n');
    
    // 扫描文件
    console.log('扫描文件...');
    this.scanDirectory(rootPath);
    console.log(`找到 ${this.filesToClean.length} 个文件需要处理\n`);
    
    // 清理文件
    console.log('清理调试代码...');
    for (const filePath of this.filesToClean) {
      this.cleanFile(filePath);
      this.cleanDebugImports(filePath);
    }
    
    console.log('\n优化导入语句...');
    for (const filePath of this.filesToClean) {
      this.optimizeImports(filePath);
    }
    
    // 生成报告
    this.generateReport();
  }

  /**
   * 生成清理报告
   */
  generateReport() {
    console.log('\n=== 清理报告 ===');
    console.log(`处理文件数: ${this.cleanupReport.filesProcessed}`);
    console.log(`移除行数: ${this.cleanupReport.linesRemoved}`);
    
    if (Object.keys(this.cleanupReport.patternsFound).length > 0) {
      console.log('\n发现的模式:');
      for (const [pattern, count] of Object.entries(this.cleanupReport.patternsFound)) {
        console.log(`  ${pattern}: ${count} 次`);
      }
    }
    
    console.log('\n✅ 代码清理完成！');
  }
}

// 执行清理
async function main() {
  const cleaner = new DebugCodeCleaner();
  const rootPath = path.resolve(__dirname, '../src');
  
  try {
    await cleaner.cleanup(rootPath);
  } catch (error) {
    console.error('清理过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { DebugCodeCleaner };