/**
 * 恢复缺失文件脚本
 * @description 从远程仓库恢复导入修复指南中提到的缺失文件
 * @author 开发团队
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 G-Asset Forge 缺失文件恢复');
console.log('='.repeat(50));

const rootDir = path.resolve(__dirname, '..');

/**
 * 需要恢复的关键文件列表（基于导入修复指南）
 */
const missingFiles = [
  // 测试文件
  'src/renderer/App-test.tsx',
  
  // ErrorBoundary组件
  'src/renderer/components/ErrorBoundary/index.ts',
  'src/renderer/components/ErrorBoundary/EnhancedErrorBoundary.tsx',
  
  // 引擎相关文件
  'src/renderer/engines/ViewControl.ts',
  'src/renderer/core/canvas/canvas-manager.ts',
  'src/renderer/core/tools/tool-types.ts',
  
  // Tools相关文件
  'src/renderer/ui/business/Tools/ToolPanel.tsx',
  'src/renderer/ui/business/Tools/ToolProperties.tsx',
  
  // GlobalStyles
  'src/renderer/ui/styles/GlobalStyles.tsx',
  
  // 其他关键文件
  'src/renderer/logic/managers/assets/AssetLibraryManager.ts',
  'src/renderer/logic/managers/assets/AssetSearchEngine.ts'
];

/**
 * 检查文件是否存在于远程仓库
 */
function checkFileInRemote(filePath) {
  try {
    execSync(`git show G-Asset-Forge/main:${filePath}`, { 
      cwd: rootDir, 
      stdio: 'pipe' 
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 从远程仓库恢复文件
 */
function restoreFileFromRemote(filePath) {
  try {
    console.log(`  🔄 恢复: ${filePath}`);
    
    // 确保目录存在
    const dir = path.dirname(path.join(rootDir, filePath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 从远程仓库获取文件内容
    const content = execSync(`git show G-Asset-Forge/main:${filePath}`, { 
      cwd: rootDir, 
      encoding: 'utf8' 
    });
    
    // 写入文件
    fs.writeFileSync(path.join(rootDir, filePath), content, 'utf8');
    
    console.log(`    ✅ 成功恢复: ${filePath}`);
    return true;
  } catch (error) {
    console.log(`    ❌ 恢复失败: ${filePath} - ${error.message}`);
    return false;
  }
}

/**
 * 创建基本的缺失文件（如果远程也没有）
 */
function createBasicFile(filePath) {
  const dir = path.dirname(path.join(rootDir, filePath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  let content = '';
  
  if (filePath.endsWith('App-test.tsx')) {
    content = `/**
 * App测试组件
 * @description 应用程序测试组件
 */
import React from 'react';

const AppTest: React.FC = () => {
  return (
    <div>
      <h1>App Test Component</h1>
      <p>这是一个测试组件</p>
    </div>
  );
};

export default AppTest;
`;
  } else if (filePath.includes('ErrorBoundary/index.ts')) {
    content = `/**
 * ErrorBoundary组件导出
 */
export { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
export { EnhancedErrorBoundary as default } from './EnhancedErrorBoundary';
`;
  } else if (filePath.includes('ErrorBoundary/EnhancedErrorBoundary.tsx')) {
    content = `/**
 * 增强错误边界组件
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>出现了错误</h2>
          <p>应用程序遇到了一个错误，请刷新页面重试。</p>
          {this.state.error && (
            <details style={{ marginTop: '10px' }}>
              <summary>错误详情</summary>
              <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '10px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
`;
  } else if (filePath.includes('ViewControl.ts')) {
    content = `/**
 * 视图控制器
 */
export interface ViewControlOptions {
  zoom: number;
  pan: { x: number; y: number };
}

export class ViewControl {
  private zoom: number = 1;
  private pan: { x: number; y: number } = { x: 0, y: 0 };

  constructor(options?: Partial<ViewControlOptions>) {
    if (options) {
      this.zoom = options.zoom || 1;
      this.pan = options.pan || { x: 0, y: 0 };
    }
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(0.1, Math.min(5, zoom));
  }

  getZoom(): number {
    return this.zoom;
  }

  setPan(x: number, y: number): void {
    this.pan = { x, y };
  }

  getPan(): { x: number; y: number } {
    return { ...this.pan };
  }
}
`;
  } else if (filePath.includes('canvas-manager.ts')) {
    content = `/**
 * 画布管理器
 */
export enum CanvasEngineType {
  SUIKA = 'suika',
  H5_EDITOR = 'h5-editor'
}

export interface CanvasManagerOptions {
  engineType: CanvasEngineType;
  container: HTMLElement;
}

export class CanvasManager {
  private engineType: CanvasEngineType;
  private container: HTMLElement;

  constructor(options: CanvasManagerOptions) {
    this.engineType = options.engineType;
    this.container = options.container;
  }

  getEngineType(): CanvasEngineType {
    return this.engineType;
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}
`;
  } else if (filePath.includes('tool-types.ts')) {
    content = `/**
 * 工具类型定义
 */
export enum ToolType {
  SELECT = 'select',
  TEXT = 'text',
  BRUSH = 'brush',
  SHAPE = 'shape',
  IMAGE = 'image',
  CROP = 'crop'
}

export interface IToolConfig {
  type: ToolType;
  name: string;
  icon: string;
  shortcut?: string;
}

export interface IToolProperties {
  [key: string]: any;
}

export interface ITool {
  type: ToolType;
  config: IToolConfig;
  properties: IToolProperties;
  activate(): void;
  deactivate(): void;
  onMouseDown?(event: MouseEvent): void;
  onMouseMove?(event: MouseEvent): void;
  onMouseUp?(event: MouseEvent): void;
}
`;
  } else if (filePath.includes('ToolPanel.tsx')) {
    content = `/**
 * 工具面板组件
 */
import React from 'react';

export interface ToolPanelProps {
  className?: string;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ className }) => {
  return (
    <div className={className}>
      <h3>工具面板</h3>
      <p>工具选择面板</p>
    </div>
  );
};
`;
  } else if (filePath.includes('ToolProperties.tsx')) {
    content = `/**
 * 工具属性组件
 */
import React from 'react';

export interface ToolPropertiesProps {
  className?: string;
}

export const ToolProperties: React.FC<ToolPropertiesProps> = ({ className }) => {
  return (
    <div className={className}>
      <h3>工具属性</h3>
      <p>工具属性配置面板</p>
    </div>
  );
};
`;
  } else if (filePath.includes('AssetLibraryManager.ts')) {
    content = `/**
 * 素材库管理器
 */
export interface IAssetCategoryInfo {
  id: string;
  name: string;
  count: number;
}

export class AssetLibraryManager {
  private categories: IAssetCategoryInfo[] = [];

  getCategories(): IAssetCategoryInfo[] {
    return this.categories;
  }

  addCategory(category: IAssetCategoryInfo): void {
    this.categories.push(category);
  }
}
`;
  } else if (filePath.includes('AssetSearchEngine.ts')) {
    content = `/**
 * 素材搜索引擎
 */
export interface IAdvancedFilter {
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class AssetSearchEngine {
  search(query: string, filters?: IAdvancedFilter): any[] {
    // 搜索逻辑实现
    return [];
  }
}
`;
  } else {
    // 默认的TypeScript文件
    content = `/**
 * ${path.basename(filePath, path.extname(filePath))}
 * @description 自动生成的文件
 */

// TODO: 实现具体功能
export {};
`;
  }
  
  fs.writeFileSync(path.join(rootDir, filePath), content, 'utf8');
  console.log(`    ✅ 创建基本文件: ${filePath}`);
  return true;
}

/**
 * 主函数
 */
function main() {
  console.log('\n📊 分析需要恢复的文件...');
  
  const results = {
    totalFiles: missingFiles.length,
    restoredFromRemote: 0,
    createdBasic: 0,
    failed: 0,
    details: []
  };
  
  missingFiles.forEach(filePath => {
    console.log(`\n🔍 处理: ${filePath}`);
    
    // 检查文件是否已存在
    if (fs.existsSync(path.join(rootDir, filePath))) {
      console.log(`    ⏭️ 文件已存在，跳过: ${filePath}`);
      return;
    }
    
    // 尝试从远程恢复
    if (checkFileInRemote(filePath)) {
      if (restoreFileFromRemote(filePath)) {
        results.restoredFromRemote++;
        results.details.push({ file: filePath, action: 'restored' });
      } else {
        results.failed++;
        results.details.push({ file: filePath, action: 'failed' });
      }
    } else {
      // 创建基本文件
      console.log(`    ⚠️ 远程仓库中不存在，创建基本文件: ${filePath}`);
      if (createBasicFile(filePath)) {
        results.createdBasic++;
        results.details.push({ file: filePath, action: 'created' });
      } else {
        results.failed++;
        results.details.push({ file: filePath, action: 'failed' });
      }
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 文件恢复结果');
  console.log('='.repeat(50));
  
  console.log(`📄 总文件数: ${results.totalFiles}`);
  console.log(`🔄 从远程恢复: ${results.restoredFromRemote}`);
  console.log(`🆕 创建基本文件: ${results.createdBasic}`);
  console.log(`❌ 失败: ${results.failed}`);
  
  if (results.details.length > 0) {
    console.log('\n📋 详细结果:');
    results.details.forEach(detail => {
      const icon = detail.action === 'restored' ? '🔄' : 
                   detail.action === 'created' ? '🆕' : '❌';
      console.log(`  ${icon} ${detail.file} (${detail.action})`);
    });
  }
  
  const successCount = results.restoredFromRemote + results.createdBasic;
  if (successCount > 0) {
    console.log('\n🎉 文件恢复完成！');
    console.log('\n🔍 建议运行验证脚本检查结果:');
    console.log('node scripts/validate-and-fix-imports.js');
  } else {
    console.log('\n⚠️ 没有文件被恢复');
  }
  
  return results;
}

// 运行恢复
if (require.main === module) {
  main();
}

module.exports = { main };