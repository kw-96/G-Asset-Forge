/**
 * 架构结构验证测试
 * @description 验证项目架构是否符合设计规范
 * @author 开发团队
 */
import * as fs from 'fs';
import * as path from 'path';

describe('项目架构结构验证', () => {
  const rootDir = path.resolve(__dirname, '../..');
  
  describe('目录结构验证', () => {
    test('应该存在主要的目录结构', () => {
      const expectedDirs = [
        'src',
        'src/main',
        'src/renderer',
        'src/interfaces',
        'tests',
        'assets',
        'docs',
        '.kiro',
      ];

      expectedDirs.forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });

    test('主进程目录结构应该正确', () => {
      const mainDirs = [
        'src/main/core',
        'src/main/managers',
        'src/main/services',
        'src/main/handlers',
        'src/main/utils',
      ];

      mainDirs.forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });

    test('渲染进程目录结构应该正确', () => {
      const rendererDirs = [
        'src/renderer/ui',
        'src/renderer/logic',
        'src/renderer/stores',
        'src/renderer/components',
      ];

      rendererDirs.forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });

    test('UI组件目录结构应该正确', () => {
      const uiDirs = [
        'src/renderer/ui/components/atoms',
        'src/renderer/ui/components/molecules',
        'src/renderer/ui/components/layout',
        'src/renderer/ui/theme',
      ];

      uiDirs.forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });

    test('逻辑层目录结构应该正确', () => {
      const logicDirs = [
        'src/renderer/logic/managers',
        'src/renderer/logic/services',
        'src/renderer/logic/engines',
      ];

      logicDirs.forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });

    test('接口层目录结构应该正确', () => {
      const interfaceDirs = [
        'src/interfaces/api',
        'src/interfaces/types',
        'src/interfaces/schemas',
      ];

      interfaceDirs.forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });
  });

  describe('核心文件验证', () => {
    test('应该存在核心配置文件', () => {
      const coreFiles = [
        'package.json',
        'tsconfig.json',
        '.eslintrc.js',
        'jest.config.js',
        'webpack.common.js',
        'webpack.main.config.js',
        'webpack.renderer.config.js',
      ];

      coreFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
      });
    });

    test('应该存在主进程核心文件', () => {
      const mainFiles = [
        'src/main/main.ts',
        'src/main/core/Application.ts',
        'src/main/core/Lifecycle.ts',
        'src/main/core/Bootstrap.ts',
      ];

      mainFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
      });
    });

    test('应该存在渲染进程核心文件', () => {
      const rendererFiles = [
        'src/renderer/App.tsx',
        'src/renderer/index.tsx',
        'src/renderer/components/App/AppContainer.tsx',
      ];

      rendererFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
      });
    });

    test('应该存在服务层文件', () => {
      const serviceFiles = [
        'src/main/services/IPCService.ts',
        'src/main/services/LoggingService.ts',
        'src/main/services/FileService.ts',
        'src/main/services/index.ts',
      ];

      serviceFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
      });
    });

    test('应该存在管理器文件', () => {
      const managerFiles = [
        'src/main/managers/WindowManager.ts',
        'src/main/managers/SecurityManager.ts',
        'src/main/managers/MenuManager.ts',
      ];

      managerFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
      });
    });
  });

  describe('索引文件验证', () => {
    test('应该存在必要的索引文件', () => {
      const indexFiles = [
        'src/interfaces/index.ts',
        'src/interfaces/api/index.ts',
        'src/interfaces/types/index.ts',
        'src/interfaces/schemas/index.ts',
        'src/renderer/ui/components/index.ts',
        'src/renderer/stores/index.ts',
        'src/renderer/logic/services/index.ts',
        'src/renderer/logic/managers/index.ts',
      ];

      indexFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.statSync(filePath).isFile()).toBe(true);
      });
    });

    test('索引文件应该包含导出语句', () => {
      const indexFiles = [
        'src/interfaces/index.ts',
        'src/renderer/ui/components/index.ts',
        'src/renderer/stores/index.ts',
      ];

      indexFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toMatch(/export/);
      });
    });
  });

  describe('文件命名规范验证', () => {
    test('TypeScript文件应该使用正确的扩展名', () => {
      const checkDirectory = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkDirectory(path.join(dir, file.name));
          } else if (file.isFile()) {
            const ext = path.extname(file.name);
            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
              // TypeScript文件应该使用.ts或.tsx扩展名
              if (file.name.includes('component') || file.name.includes('Component')) {
                expect(['.tsx', '.jsx'].includes(ext)).toBe(true);
              }
            }
          }
        });
      };

      checkDirectory(path.join(rootDir, 'src'));
    });

    test('组件文件应该使用PascalCase命名', () => {
      const componentDirs = [
        'src/renderer/ui/components/atoms',
        'src/renderer/ui/components/molecules',
        'src/renderer/ui/components/layout',
        'src/renderer/components',
      ];

      componentDirs.forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath, { withFileTypes: true });
          
          files.forEach(file => {
            if (file.isDirectory()) {
              // 组件目录应该使用PascalCase
              expect(file.name).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
            }
          });
        }
      });
    });

    test('服务和管理器文件应该使用正确的后缀', () => {
      const serviceDir = path.join(rootDir, 'src/main/services');
      const managerDir = path.join(rootDir, 'src/main/managers');

      if (fs.existsSync(serviceDir)) {
        const serviceFiles = fs.readdirSync(serviceDir);
        serviceFiles.forEach(file => {
          if (file.endsWith('.ts') && file !== 'index.ts') {
            expect(file).toMatch(/Service\.ts$/);
          }
        });
      }

      if (fs.existsSync(managerDir)) {
        const managerFiles = fs.readdirSync(managerDir);
        managerFiles.forEach(file => {
          if (file.endsWith('.ts') && file !== 'index.ts') {
            expect(file).toMatch(/Manager\.ts$/);
          }
        });
      }
    });
  });

  describe('依赖关系验证', () => {
    test('主进程文件不应该导入渲染进程模块', () => {
      const checkMainFiles = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkMainFiles(path.join(dir, file.name));
          } else if (file.isFile() && file.name.endsWith('.ts')) {
            const filePath = path.join(dir, file.name);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // 检查是否有导入渲染进程模块的语句
            const rendererImports = content.match(/from\s+['"].*renderer.*['"]/g);
            expect(rendererImports).toBeNull();
          }
        });
      };

      const mainDir = path.join(rootDir, 'src/main');
      if (fs.existsSync(mainDir)) {
        checkMainFiles(mainDir);
      }
    });

    test('UI组件不应该直接导入业务逻辑', () => {
      const checkUIFiles = (dir: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        files.forEach(file => {
          if (file.isDirectory()) {
            checkUIFiles(path.join(dir, file.name));
          } else if (file.isFile() && ['.ts', '.tsx'].includes(path.extname(file.name))) {
            const filePath = path.join(dir, file.name);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // UI组件不应该直接导入managers或services
            const businessImports = content.match(/from\s+['"].*\/(managers|services)\/.*['"]/g);
            if (businessImports) {
              // 业务组件可以导入服务
              const isBusiness = filePath.includes('/business/');
              if (!isBusiness) {
                expect(businessImports).toBeNull();
              }
            }
          }
        });
      };

      const uiDir = path.join(rootDir, 'src/renderer/ui/components');
      if (fs.existsSync(uiDir)) {
        checkUIFiles(uiDir);
      }
    });
  });
});