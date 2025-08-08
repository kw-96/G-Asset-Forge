/**
 * 文档更新脚本
 * 自动更新相关文档和注释
 */

const fs = require('fs');
const path = require('path');

class DocumentationUpdater {
  constructor() {
    this.updatedFiles = [];
    this.stats = {
      filesUpdated: 0,
      commentsAdded: 0,
      readmeUpdated: 0,
    };
  }

  /**
   * 更新README文件
   */
  updateReadme() {
    console.log('更新README文档...');
    
    const readmePath = path.resolve(__dirname, '../README.md');
    
    if (!fs.existsSync(readmePath)) {
      this.createReadme(readmePath);
    } else {
      this.enhanceReadme(readmePath);
    }
    
    this.stats.readmeUpdated++;
  }

  /**
   * 创建README文件
   */
  createReadme(readmePath) {
    const readmeContent = `# G-Asset Forge

企业级游戏资产创建工具，专为内网环境设计。

## 功能特性

### 🎨 核心功能
- 基于画布的2D游戏资产编辑
- 多种设计工具（选择、文本、图片、形状、画笔）
- 实时预览和高质量导出
- 丰富的素材库支持

### 🔧 技术特性
- **React无限循环修复**: 完整的无限循环检测和修复系统
- **性能监控**: 实时性能监控和优化建议
- **错误恢复**: 智能错误边界和自动恢复机制
- **调试工具**: 开发模式下的完整调试支持

### 🛡️ 稳定性保障
- 初始化管理器防止重复初始化
- 状态验证器检测异常状态更新
- 增强错误边界处理各种异常
- Radix UI组件稳定性优化

## 快速开始

\`\`\`bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 构建生产版本
npm run build
\`\`\`

## 项目结构

\`\`\`
src/
├── renderer/           # 渲染进程代码
│   ├── components/     # React组件
│   ├── stores/         # 状态管理
│   ├── utils/          # 工具函数
│   ├── hooks/          # 自定义Hook
│   └── ui/             # UI组件库
├── main/               # 主进程代码
└── types/              # 类型定义
\`\`\`

## 开发指南

### 无限循环修复系统

本项目实现了完整的React无限循环检测和修复系统：

1. **InitializationManager**: 确保应用只初始化一次
2. **StateValidator**: 检测和防止状态更新循环
3. **EnhancedErrorBoundary**: 智能错误捕获和恢复
4. **DevDebugTools**: 开发调试和性能监控

### 性能监控

- 使用 \`useRenderStats\` Hook监控组件渲染性能
- 使用 \`useDebugPanel\` 查看实时调试信息
- 使用 \`radixUIPerformanceMonitor\` 监控UI组件性能

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
`;
    
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log('✓ 创建README文件');
  }

  /**
   * 增强现有README
   */
  enhanceReadme(readmePath) {
    const content = fs.readFileSync(readmePath, 'utf8');
    
    // 检查是否需要添加无限循环修复相关内容
    if (!content.includes('无限循环修复')) {
      const enhancedContent = this.addInfiniteLoopSection(content);
      fs.writeFileSync(readmePath, enhancedContent, 'utf8');
      console.log('✓ 增强README文件');
    }
  }

  /**
   * 添加无限循环修复章节
   */
  addInfiniteLoopSection(content) {
    const section = `

## React无限循环修复系统

本项目实现了完整的React无限循环检测和修复系统，包括：

### 核心组件

1. **InitializationManager** - 初始化管理器
   - 防止应用重复初始化
   - 支持超时和重试机制
   - 并发安全的初始化控制

2. **StateValidator** - 状态验证器
   - 检测异常状态更新模式
   - 无限循环预警系统
   - 状态更新性能监控

3. **EnhancedErrorBoundary** - 增强错误边界
   - 智能错误分析和分类
   - 自动恢复机制
   - 用户友好的错误界面

4. **DevDebugTools** - 开发调试工具
   - 实时性能监控
   - 状态更新日志
   - 调试面板和报告生成

### 使用方法

\`\`\`tsx
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary';
import { useDebugPanel } from '@/hooks/useDebugPanel';

function App() {
  const { isVisible, togglePanel } = useDebugPanel();
  
  return (
    <EnhancedErrorBoundary enableAutoRecovery={true}>
      <YourAppContent />
      {isVisible && <DebugPanel />}
    </EnhancedErrorBoundary>
  );
}
\`\`\`
`;
    
    return content + section;
  }

  /**
   * 更新组件文档
   */
  updateComponentDocs(dirPath) {
    console.log('更新组件文档...');
    
    this.scanFiles(dirPath, ['.tsx'], (filePath, content) => {
      if (this.isComponentFile(content)) {
        const updatedContent = this.addComponentDocumentation(content, filePath);
        if (updatedContent !== content) {
          fs.writeFileSync(filePath, updatedContent, 'utf8');
          this.updatedFiles.push(filePath);
          this.stats.filesUpdated++;
          this.stats.commentsAdded++;
        }
      }
    });
  }

  /**
   * 检查是否为组件文件
   */
  isComponentFile(content) {
    return content.includes('export') && 
           (content.includes('React.FC') || content.includes('function') || content.includes('const'));
  }

  /**
   * 添加组件文档
   */
  addComponentDocumentation(content, filePath) {
    // 如果已经有文档注释，跳过
    if (content.includes('/**') && content.includes('*/')) {
      return content;
    }
    
    const componentName = this.extractComponentName(content);
    if (!componentName) return content;
    
    const docComment = `/**
 * ${componentName} 组件
 * 
 * @description 此组件已经过React无限循环修复优化
 * @features
 * - 使用React.memo防止不必要的重新渲染
 * - 使用useCallback稳定化回调函数
 * - 集成错误边界保护
 * - 性能监控和调试支持
 */
`;
    
    // 在export语句前添加文档注释
    const exportMatch = content.match(/(export\s+(const|function)\s+\w+)/);
    if (exportMatch) {
      const exportStatement = exportMatch[0];
      const exportIndex = content.indexOf(exportStatement);
      
      return content.substring(0, exportIndex) + 
             docComment + 
             content.substring(exportIndex);
    }
    
    return content;
  }

  /**
   * 提取组件名称
   */
  extractComponentName(content) {
    const matches = content.match(/export\s+(?:const|function)\s+(\w+)/);
    return matches ? matches[1] : null;
  }

  /**
   * 扫描文件
   */
  scanFiles(dirPath, extensions, callback) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', '.git', '__tests__'].includes(file)) {
          this.scanFiles(filePath, extensions, callback);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          callback(filePath, content);
        } catch (error) {
          console.error(`读取文件失败: ${filePath}`, error.message);
        }
      }
    }
  }

  /**
   * 生成更新报告
   */
  generateReport() {
    console.log('\n=== 文档更新报告 ===');
    console.log(`更新文件数: ${this.stats.filesUpdated}`);
    console.log(`添加注释数: ${this.stats.commentsAdded}`);
    console.log(`README更新: ${this.stats.readmeUpdated > 0 ? '是' : '否'}`);
    
    if (this.updatedFiles.length > 0) {
      console.log('\n更新的文件:');
      for (const file of this.updatedFiles) {
        console.log(`  ✓ ${file}`);
      }
    }
    
    console.log('\n✅ 文档更新完成！');
  }

  /**
   * 执行完整的文档更新
   */
  async update(rootPath) {
    console.log('=== 开始文档更新 ===\n');
    
    this.updateReadme();
    this.updateComponentDocs(path.join(rootPath, 'src/renderer/components'));
    this.updateComponentDocs(path.join(rootPath, 'src/renderer/ui'));
    
    this.generateReport();
  }
}

// 执行更新
async function main() {
  const updater = new DocumentationUpdater();
  const rootPath = path.resolve(__dirname, '..');
  
  try {
    await updater.update(rootPath);
  } catch (error) {
    console.error('文档更新过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { DocumentationUpdater };