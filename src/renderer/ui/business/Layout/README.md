# Layout 组件目录

这个目录包含了G-Asset Forge应用的所有布局相关组件，提供了完整的界面布局系统和配置管理功能。

## 📁 目录结构

Layout/
├── MainLayout.tsx                # 主布局容器
├── TopToolbar.tsx               # 顶部工具栏
├── LayersPanel.tsx              # 图层面板
├── RightPropertiesPanel.tsx     # 右侧属性面板
├── StatusBar.tsx                # 状态栏
├── FigmaLayoutCustomizer.tsx    # 布局自定义器
├── LayoutConfigManager.tsx      # 配置管理组件
├── LayoutPreview.tsx            # 布局预览组件
├── index.ts                     # 统一导出
└── README.md                    # 说明文档

## 🎯 核心组件

### 主布局组件

- __MainLayout__: 应用的主要布局容器，管理整体布局结构
- __TopToolbar__: 顶部工具栏，包含主要操作按钮和菜单
<!-- LeftToolPanel：功能已合并到 FigmaLayersPanel 顶部工具条 -->
- __RightPropertiesPanel__: 右侧属性面板，显示选中对象的属性
- __LayersPanel__: 图层管理面板
- __StatusBar__: 底部状态栏，显示应用状态信息

### 布局配置组件

- __FigmaLayoutCustomizer__: Figma风格的布局自定义器
- __LayoutConfigManager__: 配置管理器类，处理配置的保存、加载、导入导出
- __LayoutConfigManagerComponent__: 配置管理界面组件
- __LayoutPreview__: 布局预览组件，用于预设选择

## 🔧 配置管理系统

### LayoutConfigManager 类

提供完整的布局配置管理功能：

```typescript
// 保存配置
await LayoutConfigManager.saveConfig(config, 'user');

// 加载配置
const config = await LayoutConfigManager.loadConfig();

// 导出配置
const jsonString = await LayoutConfigManager.exportConfig();

// 导入配置
const success = await LayoutConfigManager.importConfig(jsonString);

// 重置配置
const defaultConfig = await LayoutConfigManager.resetConfig();
```

### 配置类型

```typescript
interface ExtendedLayoutConfig extends LayoutConfig {
  // 基础布局配置
  leftPanelWidth: number;
  rightPanelWidth: number;
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  toolbarVisible: boolean;
  toolbarPosition: 'top' | 'left' | 'right';
  panelMode: 'docked' | 'floating' | 'overlay';
  
  // 扩展配置
  canvasBackgroundColor?: string;
  canvasBackgroundPattern?: 'none' | 'dots' | 'grid' | 'lines';
  snapToGrid?: boolean;
  snapToObjects?: boolean;
  autoSave?: boolean;
  enableAnimations?: boolean;
  keyboardShortcuts?: Record<string, string>;
  // ... 更多配置选项
}
```

## 🎨 使用示例

### 基本布局使用

```typescript
import { MainLayout, TopToolbar } from '@/components/Layout';

function App() {
  return (
    <MainLayout>
      <TopToolbar />
      {/* LeftToolPanel 已合并至 FigmaLayersPanel 顶部工具条 */}
      {/* 其他组件 */}
    </MainLayout>
  );
}
```

### 配置管理使用

```typescript
import { LayoutConfigManagerComponent } from '@/components/Layout';

function SettingsModal() {
  const [showConfigManager, setShowConfigManager] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowConfigManager(true)}>
        管理配置
      </button>
      
      {showConfigManager && (
        <LayoutConfigManagerComponent
          onClose={() => setShowConfigManager(false)}
        />
      )}
    </>
  );
}
```

### 布局自定义使用

```typescript
import { FigmaLayoutCustomizer } from '@/components/Layout';
import { useLayoutConfig } from '@/contexts/LayoutContext';

function CustomizeLayout() {
  const { config, updateConfig, resetConfig } = useLayoutConfig();
  
  return (
    <FigmaLayoutCustomizer
      config={config}
      onConfigChange={updateConfig}
      onReset={resetConfig}
    />
  );
}
```

## 🔄 上下文集成

布局组件与 `LayoutContext` 紧密集成：

```typescript
import { useLayoutConfig } from '@/contexts/LayoutContext';

function MyComponent() {
  const {
    config,
    updateConfig,
    resetConfig,
    applyPreset,
    saveConfig,
    exportConfig,
    importConfig,
    isLoading
  } = useLayoutConfig();
  
  // 使用配置...
}
```

## 🎯 特性

### 持久化存储

- 双重存储策略：Electron用户数据目录 + 本地存储
- 配置版本管理和自动迁移
- 数据完整性校验

### 配置管理

- 导入/导出JSON格式配置
- 历史记录管理（最多20条）
- 配置统计和分析

### 用户体验

- 实时预览配置变化
- 平滑的动画过渡
- 键盘导航支持
- 无障碍功能支持

### 开发体验

- 完整的TypeScript类型支持
- 全面的测试覆盖
- 详细的错误处理
- 开发模式调试支持

## 🧪 测试

运行布局组件测试：

```bash
npm test -- --testPathPattern=Layout
```

测试覆盖：

- 配置保存和加载
- 配置验证逻辑
- 导入导出功能
- 历史记录管理
- 版本迁移机制

## 📝 开发指南

### 添加新的布局组件

1. 在Layout目录下创建新组件文件
2. 实现组件逻辑和样式
3. 在index.ts中添加导出
4. 编写相应的测试文件
5. 更新README文档

### 扩展配置选项

1. 在ExtendedLayoutConfig接口中添加新字段
2. 在DEFAULT_CONFIG中设置默认值
3. 在validateConfig方法中添加验证逻辑
4. 在FigmaLayoutCustomizer中添加UI控件
5. 更新测试用例

### 版本迁移

1. 在MIGRATIONS数组中添加迁移规则
2. 实现迁移函数
3. 更新CURRENT_VERSION
4. 添加迁移测试用例

## 🔗 相关文档

- [UI集成规格文档](../../../.kiro/specs/ui-integration/)
- [主题系统文档](../ui/theme/)
- [增强组件文档](../Enhanced/)
- [上下文系统文档](../../contexts/)
