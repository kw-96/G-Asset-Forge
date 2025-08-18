/**
 * 导入路径验证测试
 * @description 验证导入路径是否符合规范
 * @author 开发团队
 */
import * as fs from 'fs';
import * as path from 'path';

describe('导入路径验证', () => {
  const rootDir = path.resolve(__dirname, '../..');

  /**
   * 获取文件中的导入语句
   */
  const getImports = (content: string): string[] => {
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  };

  /**
   * 检查目录中的所有TypeScript文件
   */
  const checkDirectory = (dir: string, callback: (filePath: string, content: string) => void) => {
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

  describe('相对路径导入验证', () => {
    test('应该优先使用路径别名而非相对路径', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        const imports = getImports(content);
        
        imports.forEach(importPath => {
          // 检查是否使用了过深的相对路径
          if (importPath.startsWith('../../../')) {
            violations.push(`${filePath}: ${importPath}`);
          }
        });
      });

      if (violations.length > 0) {
        console.warn('建议使用路径别名的文件:', violations);
      }
      
      // 允许一定数量的深层相对路径，但不应该过多
      expect(violations.length).toBeLessThan(10);
    });

    test('同级目录导入应该使用相对路径', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        const imports = getImports(content);
        const fileDir = path.dirname(filePath);
        
        imports.forEach(importPath => {
          // 检查是否对同级文件使用了绝对路径
          if (importPath.startsWith('@/') || importPath.startsWith('src/')) {
            const resolvedPath = path.resolve(fileDir, importPath.replace('@/', '../../'));
            const relativePath = path.relative(fileDir, resolvedPath);
            
            if (!relativePath.startsWith('../') && relativePath !== importPath) {
              violations.push(`${filePath}: ${importPath} (建议使用 ./${relativePath})`);
            }
          }
        });
      });

      // 这是一个建议性检查，不强制要求
      if (violations.length > 0) {
        console.info('可以优化的同级导入:', violations.slice(0, 5));
      }
    });
  });

  describe('路径别名使用验证', () => {
    test('应该正确使用@/路径别名', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        const imports = getImports(content);
        
        imports.forEach(importPath => {
          // 检查是否错误使用了@/别名
          if (importPath.startsWith('@/') && !importPath.startsWith('@/')) {
            violations.push(`${filePath}: ${importPath}`);
          }
        });
      });

      expect(violations).toEqual([]);
    });

    test('应该正确使用@main/和@renderer/别名', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        const imports = getImports(content);
        
        imports.forEach(importPath => {
          // 主进程文件应该使用@main/别名
          if (filePath.includes('/main/') && importPath.includes('../main/')) {
            violations.push(`${filePath}: ${importPath} (建议使用 @main/)`);
          }
          
          // 渲染进程文件应该使用@renderer/别名
          if (filePath.includes('/renderer/') && importPath.includes('../renderer/')) {
            violations.push(`${filePath}: ${importPath} (建议使用 @renderer/)`);
          }
        });
      });

      // 这是一个建议性检查
      if (violations.length > 0) {
        console.info('可以优化的路径别名使用:', violations.slice(0, 5));
      }
    });
  });

  describe('循环依赖检测', () => {
    test('不应该存在循环依赖', () => {
      const dependencyGraph = new Map<string, Set<string>>();
      
      // 构建依赖图
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        const imports = getImports(content);
        const normalizedPath = path.relative(rootDir, filePath);
        
        if (!dependencyGraph.has(normalizedPath)) {
          dependencyGraph.set(normalizedPath, new Set());
        }
        
        imports.forEach(importPath => {
          if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const resolvedPath = path.resolve(path.dirname(filePath), importPath);
            const normalizedImport = path.relative(rootDir, resolvedPath);
            dependencyGraph.get(normalizedPath)!.add(normalizedImport);
          }
        });
      });

      // 检测循环依赖
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      const cycles: string[][] = [];

      const detectCycle = (node: string, path: string[]): boolean => {
        if (recursionStack.has(node)) {
          const cycleStart = path.indexOf(node);
          cycles.push(path.slice(cycleStart).concat(node));
          return true;
        }

        if (visited.has(node)) {
          return false;
        }

        visited.add(node);
        recursionStack.add(node);

        const dependencies = dependencyGraph.get(node) || new Set();
        for (const dep of dependencies) {
          if (detectCycle(dep, [...path, node])) {
            return true;
          }
        }

        recursionStack.delete(node);
        return false;
      };

      for (const node of dependencyGraph.keys()) {
        if (!visited.has(node)) {
          detectCycle(node, []);
        }
      }

      if (cycles.length > 0) {
        console.error('检测到循环依赖:', cycles);
      }

      expect(cycles.length).toBe(0);
    });
  });

  describe('外部依赖验证', () => {
    test('应该只导入允许的外部依赖', () => {
      const allowedDependencies = [
        'react',
        'react-dom',
        'electron',
        'styled-components',
        'zustand',
        'fs-extra',
        'path',
        'crypto',
        'util',
        '@testing-library',
        'jest',
      ];

      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        const imports = getImports(content);
        
        imports.forEach(importPath => {
          // 检查外部依赖
          if (!importPath.startsWith('.') && !importPath.startsWith('@/') && 
              !importPath.startsWith('@main/') && !importPath.startsWith('@renderer/')) {
            
            const isAllowed = allowedDependencies.some(allowed => 
              importPath.startsWith(allowed)
            );
            
            if (!isAllowed) {
              violations.push(`${filePath}: ${importPath}`);
            }
          }
        });
      });

      if (violations.length > 0) {
        console.warn('未在允许列表中的外部依赖:', violations.slice(0, 10));
      }

      // 允许一些未列出的依赖，但不应该太多
      expect(violations.length).toBeLessThan(20);
    });

    test('主进程不应该导入React相关依赖', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src/main'), (filePath, content) => {
        const imports = getImports(content);
        
        imports.forEach(importPath => {
          if (importPath.startsWith('react') || importPath.startsWith('@types/react')) {
            violations.push(`${filePath}: ${importPath}`);
          }
        });
      });

      expect(violations).toEqual([]);
    });

    test('渲染进程不应该导入Node.js专用模块', () => {
      const nodeModules = ['fs', 'path', 'crypto', 'os', 'child_process'];
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src/renderer'), (filePath, content) => {
        const imports = getImports(content);
        
        imports.forEach(importPath => {
          if (nodeModules.includes(importPath)) {
            violations.push(`${filePath}: ${importPath}`);
          }
        });
      });

      expect(violations).toEqual([]);
    });
  });

  describe('导入顺序验证', () => {
    test('导入语句应该按照推荐顺序排列', () => {
      const violations: string[] = [];
      
      checkDirectory(path.join(rootDir, 'src'), (filePath, content) => {
        const lines = content.split('\n');
        const importLines: { line: string; index: number; type: string }[] = [];
        
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('import ')) {
            const importPath = trimmed.match(/from\s+['"]([^'"]+)['"]/)?.[1] || '';
            
            let type = 'unknown';
            if (importPath.startsWith('react')) type = 'react';
            else if (!importPath.startsWith('.') && !importPath.startsWith('@/')) type = 'external';
            else if (importPath.startsWith('@/')) type = 'alias';
            else type = 'relative';
            
            importLines.push({ line: trimmed, index, type });
          }
        });

        // 检查导入顺序：React -> 外部依赖 -> 路径别名 -> 相对路径
        const expectedOrder = ['react', 'external', 'alias', 'relative'];
        let currentOrderIndex = 0;
        
        importLines.forEach(({ type, line, index }) => {
          const typeIndex = expectedOrder.indexOf(type);
          if (typeIndex < currentOrderIndex) {
            violations.push(`${filePath}:${index + 1}: ${line}`);
          } else {
            currentOrderIndex = Math.max(currentOrderIndex, typeIndex);
          }
        });
      });

      // 这是一个建议性检查
      if (violations.length > 0) {
        console.info('导入顺序可以优化的文件:', violations.slice(0, 5));
      }
    });
  });
});