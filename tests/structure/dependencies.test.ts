/**
 * 依赖关系验证测试
 * @description 验证模块间的依赖关系是否合理
 * @author 开发团队
 */
import * as fs from 'fs';
import * as path from 'path';

describe('依赖关系验证', () => {
  const rootDir = path.resolve(__dirname, '../..');

  /**
   * 获取文件的导入依赖
   */
  const getFileDependencies = (filePath: string): string[] => {
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const dependencies: string[] = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }
    
    return dependencies;
  };

  /**
   * 解析相对路径为绝对路径
   */
  const resolveImportPath = (basePath: string, importPath: string): string => {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      return path.resolve(path.dirname(basePath), importPath);
    }
    
    // 处理路径别名
    if (importPath.startsWith('@/')) {
      return path.join(rootDir, 'src', importPath.slice(2));
    }
    if (importPath.startsWith('@main/')) {
      return path.join(rootDir, 'src/main', importPath.slice(6));
    }
    if (importPath.startsWith('@renderer/')) {
      return path.join(rootDir, 'src/renderer', importPath.slice(10));
    }
    
    return importPath; // 外部依赖
  };

  describe('分层架构依赖验证', () => {
    test('UI界面层不应该直接依赖业务逻辑层', () => {
      const uiComponentsDir = path.join(rootDir, 'src/renderer/ui/components');
      const violations: string[] = [];

      if (!fs.existsSync(uiComponentsDir)) return;

      const checkUIComponents = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            // 跳过business目录，因为业务组件可以依赖逻辑层
            if (file.name !== 'business') {
              checkUIComponents(path.join(dir, file.name));
            }
          } else if (['.ts', '.tsx'].includes(path.extname(file.name))) {
            const filePath = path.join(dir, file.name);
            const dependencies = getFileDependencies(filePath);
            
            dependencies.forEach(dep => {
              // 检查是否直接导入了managers或services
              if (dep.includes('/managers/') || dep.includes('/services/')) {
                violations.push(`${filePath} -> ${dep}`);
              }
            });
          }
        });
      };

      checkUIComponents(uiComponentsDir);
      expect(violations).toEqual([]);
    });

    test('原子组件不应该依赖分子组件', () => {
      const atomsDir = path.join(rootDir, 'src/renderer/ui/components/atoms');
      const violations: string[] = [];

      if (!fs.existsSync(atomsDir)) return;

      const checkAtoms = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkAtoms(path.join(dir, file.name));
          } else if (['.ts', '.tsx'].includes(path.extname(file.name))) {
            const filePath = path.join(dir, file.name);
            const dependencies = getFileDependencies(filePath);
            
            dependencies.forEach(dep => {
              if (dep.includes('/molecules/') || dep.includes('/organisms/')) {
                violations.push(`${filePath} -> ${dep}`);
              }
            });
          }
        });
      };

      checkAtoms(atomsDir);
      expect(violations).toEqual([]);
    });

    test('服务层不应该依赖UI层', () => {
      const servicesDir = path.join(rootDir, 'src/renderer/logic/services');
      const violations: string[] = [];

      if (!fs.existsSync(servicesDir)) return;

      const checkServices = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkServices(path.join(dir, file.name));
          } else if (['.ts', '.tsx'].includes(path.extname(file.name))) {
            const filePath = path.join(dir, file.name);
            const dependencies = getFileDependencies(filePath);
            
            dependencies.forEach(dep => {
              if (dep.includes('/ui/') || dep.includes('/components/')) {
                violations.push(`${filePath} -> ${dep}`);
              }
            });
          }
        });
      };

      checkServices(servicesDir);
      expect(violations).toEqual([]);
    });
  });

  describe('主进程与渲染进程隔离验证', () => {
    test('主进程不应该导入渲染进程模块', () => {
      const mainDir = path.join(rootDir, 'src/main');
      const violations: string[] = [];

      if (!fs.existsSync(mainDir)) return;

      const checkMainProcess = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkMainProcess(path.join(dir, file.name));
          } else if (file.name.endsWith('.ts')) {
            const filePath = path.join(dir, file.name);
            const dependencies = getFileDependencies(filePath);
            
            dependencies.forEach(dep => {
              const resolvedPath = resolveImportPath(filePath, dep);
              if (resolvedPath.includes('/renderer/')) {
                violations.push(`${filePath} -> ${dep}`);
              }
            });
          }
        });
      };

      checkMainProcess(mainDir);
      expect(violations).toEqual([]);
    });

    test('渲染进程不应该直接导入主进程模块', () => {
      const rendererDir = path.join(rootDir, 'src/renderer');
      const violations: string[] = [];

      if (!fs.existsSync(rendererDir)) return;

      const checkRendererProcess = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkRendererProcess(path.join(dir, file.name));
          } else if (['.ts', '.tsx'].includes(path.extname(file.name))) {
            const filePath = path.join(dir, file.name);
            const dependencies = getFileDependencies(filePath);
            
            dependencies.forEach(dep => {
              const resolvedPath = resolveImportPath(filePath, dep);
              if (resolvedPath.includes('/main/')) {
                violations.push(`${filePath} -> ${dep}`);
              }
            });
          }
        });
      };

      checkRendererProcess(rendererDir);
      expect(violations).toEqual([]);
    });
  });

  describe('接口层依赖验证', () => {
    test('接口层不应该依赖具体实现', () => {
      const interfacesDir = path.join(rootDir, 'src/interfaces');
      const violations: string[] = [];

      if (!fs.existsSync(interfacesDir)) return;

      const checkInterfaces = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkInterfaces(path.join(dir, file.name));
          } else if (file.name.endsWith('.ts')) {
            const filePath = path.join(dir, file.name);
            const dependencies = getFileDependencies(filePath);
            
            dependencies.forEach(dep => {
              // 接口层不应该导入具体的实现类
              if (dep.includes('/managers/') || dep.includes('/services/') || 
                  dep.includes('/components/')) {
                violations.push(`${filePath} -> ${dep}`);
              }
            });
          }
        });
      };

      checkInterfaces(interfacesDir);
      expect(violations).toEqual([]);
    });

    test('类型定义应该被正确导入', () => {
      const typesDir = path.join(rootDir, 'src/interfaces/types');
      const usageCount = new Map<string, number>();

      if (!fs.existsSync(typesDir)) return;

      // 统计类型文件的使用情况
      const countTypeUsage = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            countTypeUsage(path.join(dir, file.name));
          } else if (['.ts', '.tsx'].includes(path.extname(file.name))) {
            const filePath = path.join(dir, file.name);
            const dependencies = getFileDependencies(filePath);
            
            dependencies.forEach(dep => {
              if (dep.includes('/interfaces/types/')) {
                const count = usageCount.get(dep) || 0;
                usageCount.set(dep, count + 1);
              }
            });
          }
        });
      };

      countTypeUsage(path.join(rootDir, 'src'));

      // 检查是否有未使用的类型定义
      const typeFiles = fs.readdirSync(typesDir);
      const unusedTypes: string[] = [];

      typeFiles.forEach(file => {
        if (file.endsWith('.ts') && file !== 'index.ts') {
          const typePath = `/interfaces/types/${file}`;
          if (!usageCount.has(typePath)) {
            unusedTypes.push(file);
          }
        }
      });

      if (unusedTypes.length > 0) {
        console.info('可能未使用的类型定义:', unusedTypes);
      }

      // 允许一些未使用的类型定义（可能是为将来准备的）
      expect(unusedTypes.length).toBeLessThan(5);
    });
  });

  describe('状态管理依赖验证', () => {
    test('Store不应该相互直接依赖', () => {
      const storesDir = path.join(rootDir, 'src/renderer/stores');
      const violations: string[] = [];

      if (!fs.existsSync(storesDir)) return;

      const storeFiles = fs.readdirSync(storesDir).filter(file => 
        file.endsWith('.ts') && file !== 'index.ts'
      );

      storeFiles.forEach(storeFile => {
        const filePath = path.join(storesDir, storeFile);
        const dependencies = getFileDependencies(filePath);
        
        dependencies.forEach(dep => {
          // 检查是否导入了其他store文件
          const otherStores = storeFiles.filter(f => f !== storeFile);
          otherStores.forEach(otherStore => {
            if (dep.includes(otherStore.replace('.ts', ''))) {
              violations.push(`${storeFile} -> ${dep}`);
            }
          });
        });
      });

      expect(violations).toEqual([]);
    });

    test('组件应该通过hooks使用Store', () => {
      const componentsDir = path.join(rootDir, 'src/renderer/ui/components');
      const violations: string[] = [];

      if (!fs.existsSync(componentsDir)) return;

      const checkComponents = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkComponents(path.join(dir, file.name));
          } else if (file.name.endsWith('.tsx')) {
            const filePath = path.join(dir, file.name);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // 检查是否直接导入了store而不是通过hooks
            if (content.includes('Store') && !content.includes('useStore')) {
              const dependencies = getFileDependencies(filePath);
              dependencies.forEach(dep => {
                if (dep.includes('/stores/') && !dep.includes('hooks')) {
                  violations.push(`${filePath} -> ${dep}`);
                }
              });
            }
          }
        });
      };

      checkComponents(componentsDir);

      // 这是一个建议性检查
      if (violations.length > 0) {
        console.info('建议通过hooks使用Store的组件:', violations.slice(0, 5));
      }
    });
  });

  describe('工具和引擎依赖验证', () => {
    test('工具类不应该相互依赖', () => {
      const toolsDir = path.join(rootDir, 'src/renderer/logic/managers/tools');
      const violations: string[] = [];

      if (!fs.existsSync(toolsDir)) return;

      const toolFiles = fs.readdirSync(toolsDir).filter(file => 
        file.endsWith('Tool.ts')
      );

      toolFiles.forEach(toolFile => {
        const filePath = path.join(toolsDir, toolFile);
        const dependencies = getFileDependencies(filePath);
        
        dependencies.forEach(dep => {
          // 检查是否导入了其他工具类
          const otherTools = toolFiles.filter(f => f !== toolFile);
          otherTools.forEach(otherTool => {
            if (dep.includes(otherTool.replace('.ts', ''))) {
              violations.push(`${toolFile} -> ${dep}`);
            }
          });
        });
      });

      expect(violations).toEqual([]);
    });

    test('引擎适配器应该实现统一接口', () => {
      const enginesDir = path.join(rootDir, 'src/renderer/logic/engines');
      const adaptersDir = path.join(enginesDir, 'adapters');
      
      if (!fs.existsSync(adaptersDir)) return;

      const adapterFiles = fs.readdirSync(adaptersDir).filter(file => 
        file.endsWith('Adapter.ts')
      );

      adapterFiles.forEach(adapterFile => {
        const filePath = path.join(adaptersDir, adapterFile);
        const dependencies = getFileDependencies(filePath);
        
        // 检查是否导入了引擎接口
        const hasEngineInterface = dependencies.some(dep => 
          dep.includes('EngineInterface') || dep.includes('/core/')
        );
        
        expect(hasEngineInterface).toBe(true);
      });
    });
  });
});