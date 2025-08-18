/**
 * 代码注释质量测试
 * @description 验证中文JSDoc注释的覆盖率和质量
 * @author 开发团队
 */
import * as fs from 'fs';
import * as path from 'path';

describe('代码注释质量测试', () => {
  const rootDir = path.resolve(__dirname, '../..');

  /**
   * 检查文件是否有文件头注释
   */
  const hasFileHeaderComment = (content: string): boolean => {
    const lines = content.split('\n');
    if (lines.length < 3) return false;
    
    return lines[0].includes('/**') && 
           lines.some(line => line.includes('@description')) &&
           lines.some(line => line.includes('@author'));
  };

  /**
   * 检查函数是否有JSDoc注释
   */
  const hasFunctionComment = (content: string, functionName: string): boolean => {
    const functionRegex = new RegExp(`(export\\s+)?(async\\s+)?function\\s+${functionName}|${functionName}\\s*[:=]\\s*(async\\s+)?\\(|${functionName}\\s*\\(`, 'g');
    const matches = content.match(functionRegex);
    
    if (!matches) return true; // 如果没有找到函数，认为通过
    
    // 检查函数前是否有JSDoc注释
    const functionIndex = content.indexOf(matches[0]);
    const beforeFunction = content.substring(0, functionIndex);
    const lastCommentIndex = beforeFunction.lastIndexOf('/**');
    
    if (lastCommentIndex === -1) return false;
    
    const commentEnd = content.indexOf('*/', lastCommentIndex);
    return commentEnd !== -1 && commentEnd < functionIndex;
  };

  /**
   * 检查类是否有JSDoc注释
   */
  const hasClassComment = (content: string, className: string): boolean => {
    const classRegex = new RegExp(`(export\\s+)?(abstract\\s+)?class\\s+${className}`, 'g');
    const matches = content.match(classRegex);
    
    if (!matches) return true; // 如果没有找到类，认为通过
    
    // 检查类前是否有JSDoc注释
    const classIndex = content.indexOf(matches[0]);
    const beforeClass = content.substring(0, classIndex);
    const lastCommentIndex = beforeClass.lastIndexOf('/**');
    
    if (lastCommentIndex === -1) return false;
    
    const commentEnd = content.indexOf('*/', lastCommentIndex);
    return commentEnd !== -1 && commentEnd < classIndex;
  };

  /**
   * 检查接口是否有JSDoc注释
   */
  const hasInterfaceComment = (content: string, interfaceName: string): boolean => {
    const interfaceRegex = new RegExp(`(export\\s+)?interface\\s+${interfaceName}`, 'g');
    const matches = content.match(interfaceRegex);
    
    if (!matches) return true; // 如果没有找到接口，认为通过
    
    // 检查接口前是否有JSDoc注释
    const interfaceIndex = content.indexOf(matches[0]);
    const beforeInterface = content.substring(0, interfaceIndex);
    const lastCommentIndex = beforeInterface.lastIndexOf('/**');
    
    if (lastCommentIndex === -1) return false;
    
    const commentEnd = content.indexOf('*/', lastCommentIndex);
    return commentEnd !== -1 && commentEnd < interfaceIndex;
  };

  /**
   * 检查注释是否包含中文
   */
  const hasChineseComment = (content: string): boolean => {
    const commentRegex = /\/\*\*[\s\S]*?\*\//g;
    const comments = content.match(commentRegex) || [];
    
    return comments.some(comment => /[\u4e00-\u9fa5]/.test(comment));
  };

  /**
   * 获取文件中的导出函数名
   */
  const getExportedFunctions = (content: string): string[] => {
    const functionRegex = /export\s+(async\s+)?function\s+(\w+)|export\s+const\s+(\w+)\s*[:=]\s*(async\s+)?\(/g;
    const functions: string[] = [];
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[2] || match[3]);
    }
    
    return functions;
  };

  /**
   * 获取文件中的导出类名
   */
  const getExportedClasses = (content: string): string[] => {
    const classRegex = /export\s+(abstract\s+)?class\s+(\w+)/g;
    const classes: string[] = [];
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[2]);
    }
    
    return classes;
  };

  /**
   * 获取文件中的导出接口名
   */
  const getExportedInterfaces = (content: string): string[] => {
    const interfaceRegex = /export\s+interface\s+(\w+)/g;
    const interfaces: string[] = [];
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      interfaces.push(match[1]);
    }
    
    return interfaces;
  };

  /**
   * 检查目录中的所有TypeScript文件
   */
  const checkDirectory = (dir: string, callback: (filePath: string, content: string) => void) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        checkDirectory(path.join(dir, file.name), callback);
      } else if (file.isFile() && ['.ts', '.tsx'].includes(path.extname(file.name))) {
        const filePath = path.join(dir, file.name);
        const content = fs.readFileSync(filePath, 'utf8');
        callback(filePath, content);
      }
    });
  };

  describe('文件头注释验证', () => {
    test('所有TypeScript文件应该有文件头注释', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        // 跳过测试文件和类型定义文件
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        if (!hasFileHeaderComment(content)) {
          violations.push(filePath);
        }
      });

      if (violations.length > 0) {
        console.warn('缺少文件头注释的文件:', violations.slice(0, 10));
      }

      // 允许一定数量的文件没有注释，但不应该太多
      expect(violations.length).toBeLessThan(20);
    });

    test('文件头注释应该包含必要的标签', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        if (hasFileHeaderComment(content)) {
          const headerMatch = content.match(/\/\*\*[\s\S]*?\*\//);
          if (headerMatch) {
            const header = headerMatch[0];
            
            if (!header.includes('@description')) {
              violations.push(`${filePath}: 缺少@description标签`);
            }
            if (!header.includes('@author')) {
              violations.push(`${filePath}: 缺少@author标签`);
            }
          }
        }
      });

      if (violations.length > 0) {
        console.warn('文件头注释标签不完整:', violations.slice(0, 10));
      }

      expect(violations.length).toBeLessThan(15);
    });
  });

  describe('函数注释验证', () => {
    test('导出的函数应该有JSDoc注释', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        const functions = getExportedFunctions(content);
        functions.forEach(funcName => {
          if (!hasFunctionComment(content, funcName)) {
            violations.push(`${filePath}: function ${funcName}`);
          }
        });
      });

      if (violations.length > 0) {
        console.warn('缺少注释的导出函数:', violations.slice(0, 10));
      }

      // 允许一定数量的函数没有注释
      expect(violations.length).toBeLessThan(30);
    });
  });

  describe('类注释验证', () => {
    test('导出的类应该有JSDoc注释', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        const classes = getExportedClasses(content);
        classes.forEach(className => {
          if (!hasClassComment(content, className)) {
            violations.push(`${filePath}: class ${className}`);
          }
        });
      });

      if (violations.length > 0) {
        console.warn('缺少注释的导出类:', violations.slice(0, 10));
      }

      expect(violations.length).toBeLessThan(10);
    });
  });

  describe('接口注释验证', () => {
    test('导出的接口应该有JSDoc注释', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        const interfaces = getExportedInterfaces(content);
        interfaces.forEach(interfaceName => {
          if (!hasInterfaceComment(content, interfaceName)) {
            violations.push(`${filePath}: interface ${interfaceName}`);
          }
        });
      });

      if (violations.length > 0) {
        console.warn('缺少注释的导出接口:', violations.slice(0, 10));
      }

      expect(violations.length).toBeLessThan(15);
    });
  });

  describe('中文注释验证', () => {
    test('注释应该包含中文说明', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        // 检查是否有JSDoc注释
        const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content);
        if (hasJSDoc && !hasChineseComment(content)) {
          violations.push(filePath);
        }
      });

      if (violations.length > 0) {
        console.info('建议添加中文注释的文件:', violations.slice(0, 5));
      }

      // 这是一个建议性检查，不强制要求
      expect(violations.length).toBeLessThan(50);
    });
  });

  describe('注释质量验证', () => {
    test('注释应该有合理的长度', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        const commentRegex = /\/\*\*[\s\S]*?\*\//g;
        const comments = content.match(commentRegex) || [];
        
        comments.forEach((comment, index) => {
          // 移除注释标记，只保留内容
          const commentContent = comment
            .replace(/\/\*\*|\*\/|\s*\*\s?/g, '')
            .trim();
          
          // 检查注释长度（排除只有标签的注释）
          if (commentContent.length > 0 && commentContent.length < 10 && 
              !commentContent.includes('@') && 
              !/^[\u4e00-\u9fa5]{2,}$/.test(commentContent)) {
            violations.push(`${filePath}: 注释 ${index + 1} 过短`);
          }
        });
      });

      if (violations.length > 0) {
        console.info('可能需要完善的注释:', violations.slice(0, 10));
      }

      // 这是一个建议性检查
      expect(violations.length).toBeLessThan(100);
    });

    test('注释应该避免拼写错误', () => {
      const commonTypos = [
        { wrong: '函数', correct: '函数' },
        { wrong: 'fucntion', correct: 'function' },
        { wrong: 'calss', correct: 'class' },
        { wrong: 'interfce', correct: 'interface' },
        { wrong: 'retrun', correct: 'return' },
      ];

      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        const commentRegex = /\/\*\*[\s\S]*?\*\//g;
        const comments = content.match(commentRegex) || [];
        
        comments.forEach(comment => {
          commonTypos.forEach(typo => {
            if (comment.includes(typo.wrong)) {
              violations.push(`${filePath}: "${typo.wrong}" 应该是 "${typo.correct}"`);
            }
          });
        });
      });

      expect(violations).toEqual([]);
    });
  });

  describe('注释覆盖率统计', () => {
    test('计算整体注释覆盖率', () => {
      let totalFiles = 0;
      let filesWithComments = 0;
      let totalExports = 0;
      let exportsWithComments = 0;
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.endsWith('.d.ts')) {
          return;
        }
        
        totalFiles++;
        
        if (hasFileHeaderComment(content)) {
          filesWithComments++;
        }
        
        // 统计导出项
        const functions = getExportedFunctions(content);
        const classes = getExportedClasses(content);
        const interfaces = getExportedInterfaces(content);
        
        totalExports += functions.length + classes.length + interfaces.length;
        
        functions.forEach(funcName => {
          if (hasFunctionComment(content, funcName)) {
            exportsWithComments++;
          }
        });
        
        classes.forEach(className => {
          if (hasClassComment(content, className)) {
            exportsWithComments++;
          }
        });
        
        interfaces.forEach(interfaceName => {
          if (hasInterfaceComment(content, interfaceName)) {
            exportsWithComments++;
          }
        });
      });
      
      const fileCoverageRate = totalFiles > 0 ? (filesWithComments / totalFiles) * 100 : 0;
      const exportCoverageRate = totalExports > 0 ? (exportsWithComments / totalExports) * 100 : 0;
      
      console.info(`注释覆盖率统计:`);
      console.info(`- 文件头注释覆盖率: ${fileCoverageRate.toFixed(1)}% (${filesWithComments}/${totalFiles})`);
      console.info(`- 导出项注释覆盖率: ${exportCoverageRate.toFixed(1)}% (${exportsWithComments}/${totalExports})`);
      
      // 期望达到一定的覆盖率
      expect(fileCoverageRate).toBeGreaterThan(60);
      expect(exportCoverageRate).toBeGreaterThan(50);
    });
  });
});