/**
 * 代码规范测试
 * @description 验证代码是否符合项目的编码规范
 * @author 开发团队
 */
import * as fs from 'fs';
import * as path from 'path';

describe('代码规范测试', () => {
  const rootDir = path.resolve(__dirname, '../..');

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

  describe('命名规范验证', () => {
    test('变量和函数应该使用camelCase', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        // 检查变量声明
        const variableRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let match;
        
        while ((match = variableRegex.exec(content)) !== null) {
          const varName = match[1];
          
          // 跳过常量（全大写）和私有变量（下划线开头）
          if (varName === varName.toUpperCase() || varName.startsWith('_')) {
            continue;
          }
          
          // 检查是否是camelCase
          if (!/^[a-z][a-zA-Z0-9]*$/.test(varName)) {
            violations.push(`${filePath}: 变量 "${varName}" 应该使用camelCase`);
          }
        }
        
        // 检查函数声明
        const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:async\s+)?\(/g;
        
        while ((match = functionRegex.exec(content)) !== null) {
          const funcName = match[1] || match[2];
          
          // 跳过构造函数和私有函数
          if (funcName.startsWith('_') || /^[A-Z]/.test(funcName)) {
            continue;
          }
          
          // 检查是否是camelCase
          if (!/^[a-z][a-zA-Z0-9]*$/.test(funcName)) {
            violations.push(`${filePath}: 函数 "${funcName}" 应该使用camelCase`);
          }
        }
      });

      if (violations.length > 0) {
        console.warn('命名规范违规:', violations.slice(0, 10));
      }

      expect(violations.length).toBeLessThan(20);
    });

    test('类和接口应该使用PascalCase', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        // 检查类声明
        const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let match;
        
        while ((match = classRegex.exec(content)) !== null) {
          const className = match[1];
          
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(className)) {
            violations.push(`${filePath}: 类 "${className}" 应该使用PascalCase`);
          }
        }
        
        // 检查接口声明
        const interfaceRegex = /(?:export\s+)?interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        
        while ((match = interfaceRegex.exec(content)) !== null) {
          const interfaceName = match[1];
          
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(interfaceName)) {
            violations.push(`${filePath}: 接口 "${interfaceName}" 应该使用PascalCase`);
          }
        }
        
        // 检查类型别名
        const typeRegex = /(?:export\s+)?type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        
        while ((match = typeRegex.exec(content)) !== null) {
          const typeName = match[1];
          
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(typeName)) {
            violations.push(`${filePath}: 类型 "${typeName}" 应该使用PascalCase`);
          }
        }
      });

      if (violations.length > 0) {
        console.warn('PascalCase命名违规:', violations.slice(0, 10));
      }

      expect(violations.length).toBeLessThan(10);
    });

    test('常量应该使用UPPER_SNAKE_CASE', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        // 检查常量声明（通过上下文判断）
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          
          // 检查明显的常量声明
          if (trimmed.startsWith('const ') && trimmed.includes('=')) {
            const match = trimmed.match(/const\s+([A-Z_][A-Z0-9_]*)\s*=/);
            if (match) {
              const constName = match[1];
              
              // 检查是否符合UPPER_SNAKE_CASE
              if (!/^[A-Z][A-Z0-9_]*$/.test(constName)) {
                violations.push(`${filePath}:${index + 1}: 常量 "${constName}" 应该使用UPPER_SNAKE_CASE`);
              }
            }
          }
        });
      });

      if (violations.length > 0) {
        console.info('常量命名建议:', violations.slice(0, 5));
      }

      // 这是一个建议性检查
      expect(violations.length).toBeLessThan(30);
    });
  });

  describe('代码格式验证', () => {
    test('应该使用一致的缩进', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        const lines = content.split('\n');
        let inconsistentIndentation = false;
        
        lines.forEach((line, index) => {
          if (line.trim() === '') return; // 跳过空行
          
          const leadingSpaces = line.match(/^(\s*)/)?.[1] || '';
          
          // 检查是否混用了空格和制表符
          if (leadingSpaces.includes(' ') && leadingSpaces.includes('\t')) {
            inconsistentIndentation = true;
          }
        });
        
        if (inconsistentIndentation) {
          violations.push(`${filePath}: 混用了空格和制表符进行缩进`);
        }
      });

      if (violations.length > 0) {
        console.warn('缩进不一致的文件:', violations);
      }

      expect(violations.length).toBe(0);
    });

    test('应该使用分号结尾', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          
          // 检查需要分号的语句
          if (trimmed && 
              !trimmed.startsWith('//') && 
              !trimmed.startsWith('/*') && 
              !trimmed.startsWith('*') && 
              !trimmed.endsWith('{') && 
              !trimmed.endsWith('}') && 
              !trimmed.endsWith(',') && 
              !trimmed.endsWith(';') &&
              (trimmed.includes('=') || 
               trimmed.startsWith('const ') || 
               trimmed.startsWith('let ') || 
               trimmed.startsWith('var ') ||
               trimmed.startsWith('return ') ||
               trimmed.startsWith('throw ') ||
               trimmed.startsWith('break') ||
               trimmed.startsWith('continue'))) {
            
            violations.push(`${filePath}:${index + 1}: 缺少分号`);
          }
        });
      });

      if (violations.length > 0) {
        console.info('可能缺少分号的行:', violations.slice(0, 10));
      }

      // 这是一个建议性检查，因为TypeScript允许省略分号
      expect(violations.length).toBeLessThan(50);
    });

    test('应该使用一致的引号', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        const singleQuotes = (content.match(/'/g) || []).length;
        const doubleQuotes = (content.match(/"/g) || []).length;
        
        // 如果文件中同时使用了大量的单引号和双引号，可能不一致
        if (singleQuotes > 10 && doubleQuotes > 10 && 
            Math.abs(singleQuotes - doubleQuotes) / Math.max(singleQuotes, doubleQuotes) < 0.8) {
          violations.push(`${filePath}: 可能混用了单引号和双引号`);
        }
      });

      if (violations.length > 0) {
        console.info('引号使用可能不一致的文件:', violations);
      }

      // 这是一个建议性检查
      expect(violations.length).toBeLessThan(10);
    });
  });

  describe('代码复杂度验证', () => {
    test('函数长度应该合理', () => {
      const violations: string[] = [];
      const maxFunctionLength = 100; // 最大函数行数
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        const lines = content.split('\n');
        let inFunction = false;
        let functionStart = 0;
        let braceCount = 0;
        let functionName = '';
        
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          
          // 检测函数开始
          const functionMatch = trimmed.match(/(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s+)?\(|(\w+)\s*\(.*\)\s*{)/);
          if (functionMatch && !inFunction) {
            inFunction = true;
            functionStart = index;
            braceCount = 0;
            functionName = functionMatch[1] || functionMatch[2] || functionMatch[3] || 'anonymous';
          }
          
          if (inFunction) {
            // 计算大括号
            braceCount += (trimmed.match(/{/g) || []).length;
            braceCount -= (trimmed.match(/}/g) || []).length;
            
            // 函数结束
            if (braceCount <= 0 && index > functionStart) {
              const functionLength = index - functionStart + 1;
              
              if (functionLength > maxFunctionLength) {
                violations.push(`${filePath}: 函数 "${functionName}" 长度 ${functionLength} 行，建议不超过 ${maxFunctionLength} 行`);
              }
              
              inFunction = false;
            }
          }
        });
      });

      if (violations.length > 0) {
        console.info('函数长度建议:', violations.slice(0, 5));
      }

      // 这是一个建议性检查
      expect(violations.length).toBeLessThan(20);
    });

    test('嵌套层级应该合理', () => {
      const violations: string[] = [];
      const maxNestingLevel = 5; // 最大嵌套层级
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        const lines = content.split('\n');
        let currentLevel = 0;
        let maxLevel = 0;
        
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          
          // 增加嵌套层级的关键字
          if (trimmed.includes('{') || 
              trimmed.startsWith('if ') || 
              trimmed.startsWith('for ') || 
              trimmed.startsWith('while ') || 
              trimmed.startsWith('switch ') ||
              trimmed.startsWith('try ')) {
            currentLevel++;
            maxLevel = Math.max(maxLevel, currentLevel);
          }
          
          if (trimmed.includes('}')) {
            currentLevel = Math.max(0, currentLevel - 1);
          }
        });
        
        if (maxLevel > maxNestingLevel) {
          violations.push(`${filePath}: 最大嵌套层级 ${maxLevel}，建议不超过 ${maxNestingLevel}`);
        }
      });

      if (violations.length > 0) {
        console.info('嵌套层级建议:', violations.slice(0, 5));
      }

      // 这是一个建议性检查
      expect(violations.length).toBeLessThan(15);
    });
  });

  describe('TypeScript特定规范', () => {
    test('应该使用明确的类型注解', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        // 检查函数参数是否有类型注解
        const functionRegex = /function\s+\w+\s*\(([^)]*)\)|(\w+)\s*\(([^)]*)\)\s*[:=]/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
          const params = match[1] || match[3];
          
          if (params && params.trim() && !params.includes(':') && !params.includes('...')) {
            violations.push(`${filePath}: 函数参数缺少类型注解`);
          }
        }
      });

      if (violations.length > 0) {
        console.info('类型注解建议:', violations.slice(0, 10));
      }

      // 这是一个建议性检查
      expect(violations.length).toBeLessThan(50);
    });

    test('应该避免使用any类型', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        const anyUsages = content.match(/:\s*any\b/g);
        if (anyUsages && anyUsages.length > 0) {
          violations.push(`${filePath}: 使用了 ${anyUsages.length} 次 any 类型`);
        }
      });

      if (violations.length > 0) {
        console.info('any类型使用情况:', violations.slice(0, 10));
      }

      // 允许适量使用any，但不应该过多
      expect(violations.length).toBeLessThan(30);
    });

    test('应该使用接口而不是类型别名定义对象结构', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        // 检查类型别名定义对象结构
        const typeRegex = /type\s+\w+\s*=\s*{/g;
        const typeMatches = content.match(typeRegex);
        
        if (typeMatches && typeMatches.length > 0) {
          violations.push(`${filePath}: 建议使用interface而不是type定义对象结构`);
        }
      });

      if (violations.length > 0) {
        console.info('类型定义建议:', violations.slice(0, 5));
      }

      // 这是一个建议性检查
      expect(violations.length).toBeLessThan(20);
    });
  });

  describe('代码质量统计', () => {
    test('统计代码质量指标', () => {
      let totalFiles = 0;
      let totalLines = 0;
      let commentLines = 0;
      let emptyLines = 0;
      let codeLines = 0;
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        if (filePath.includes('.test.') || filePath.includes('.spec.')) return;
        
        totalFiles++;
        const lines = content.split('\n');
        totalLines += lines.length;
        
        lines.forEach(line => {
          const trimmed = line.trim();
          
          if (trimmed === '') {
            emptyLines++;
          } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            commentLines++;
          } else {
            codeLines++;
          }
        });
      });
      
      const commentRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;
      const avgLinesPerFile = totalFiles > 0 ? totalLines / totalFiles : 0;
      
      console.info(`代码质量统计:`);
      console.info(`- 总文件数: ${totalFiles}`);
      console.info(`- 总行数: ${totalLines}`);
      console.info(`- 代码行数: ${codeLines}`);
      console.info(`- 注释行数: ${commentLines}`);
      console.info(`- 空行数: ${emptyLines}`);
      console.info(`- 注释比例: ${commentRatio.toFixed(1)}%`);
      console.info(`- 平均每文件行数: ${avgLinesPerFile.toFixed(1)}`);
      
      // 基本的质量指标检查
      expect(totalFiles).toBeGreaterThan(0);
      expect(commentRatio).toBeGreaterThan(5); // 至少5%的注释
      expect(avgLinesPerFile).toBeLessThan(500); // 平均文件不超过500行
    });
  });
});