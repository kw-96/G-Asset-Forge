# 项目库面板组件

重构后的项目库面板组件，基于现有的 Cards 组件实现项目卡片视图和列表视图，复用现有的搜索、筛选和排序 UI 组件。

## 组件结构

### 主要组件

- **ProjectLibraryPanel** - 主面板组件，整合所有功能
- **ProjectGrid** - 项目网格容器，支持网格和列表视图
- **ProjectCard** - 项目卡片组件，基于 BaseCard 实现
- **ProjectSearchBar** - 搜索和筛选栏
- **ProjectLibraryToolbar** - 工具栏，包含视图切换和操作按钮
- **ProjectEditModal** - 项目编辑模态框（新建、重命名、删除）
- **ProjectTabs** - 项目标签页组件，用于多项目管理

### 类型定义

- **IProjectMetadata** - 项目元数据接口
- **IProjectSearchOptions** - 搜索选项接口
- **IProjectTab** - 项目标签页接口
- **ProjectCategory** - 项目分类类型
- **ViewMode** - 视图模式类型

## 功能特性

### 项目管理

- ✅ 项目列表展示（网格/列表视图）
- ✅ 项目搜索和筛选
- ✅ 项目排序（按名称、创建时间、更新时间等）
- ✅ 项目收藏功能
- ✅ 项目新建、重命名、删除
- ✅ 项目导入功能

### 界面特性

- ✅ 响应式布局，适合弹窗显示
- ✅ 视图模式切换（网格/列表）
- ✅ 拖拽排序支持（标签页）
- ✅ 加载状态和错误处理
- ✅ 空状态展示

### 标签页管理

- ✅ 多项目标签页支持
- ✅ 标签页拖拽排序
- ✅ 标签页关闭功能
- ✅ 脏状态指示器

## 使用示例

### 基本使用

```tsx
import { ProjectLibraryPanel } from './components/ProjectLibraryPanel';

function App() {
  const handleProjectOpen = (project) => {
    console.log('打开项目:', project);
  };

  const handleProjectCreate = () => {
    console.log('创建新项目');
  };

  return (
    <ProjectLibraryPanel
      onProjectOpen={handleProjectOpen}
      onProjectCreate={handleProjectCreate}
      className="my-project-panel"
    />
  );
}
```

### 在 Header 中使用标签页

```tsx
import { Header } from './components/Header';
import { IProjectTab } from './components/ProjectLibraryPanel';

function App() {
  const [tabs, setTabs] = useState<IProjectTab[]>([
    {
      id: '1',
      name: '项目1',
      filePath: '/path/to/project1.gaf',
      isActive: true,
      isDirty: false,
      isClosable: true,
    },
  ]);

  return (
    <Header
      title="G-Asset Forge"
      projectTabs={tabs}
      activeTabId="1"
      onTabSelect={(tabId) => console.log('选择标签页:', tabId)}
      onTabClose={(tabId) => console.log('关闭标签页:', tabId)}
    />
  );
}
```

## 样式定制

组件使用 SCSS 编写样式，支持以下 CSS 变量定制：

```scss
.project-library-panel {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;

  --border-color: #e9ecef;
  --background-color: #f8f9fa;
  --card-background: #ffffff;

  --border-radius: 6px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## 数据接口

### 项目元数据

```typescript
interface IProjectMetadata {
  id: string;
  name: string;
  description: string;
  type: 'design' | 'h5';
  category: ProjectCategory;
  tags: string[];
  filePath?: string;
  fileSize?: number;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  usageCount?: number;
  isTemplate?: boolean;
  isFavorite?: boolean;
}
```

### 搜索选项

```typescript
interface IProjectSearchOptions {
  query?: string;
  type?: 'design' | 'h5';
  category?: ProjectCategory;
  tags?: string[];
  isFavorite?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastOpenedAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
```

## 集成说明

### 与现有组件的复用

1. **BaseCard** - 项目卡片基础样式
2. **SvgIcon** - 图标显示
3. **现有表单组件** - 模态框中的输入控件

### 弹窗集成

组件设计为适合弹窗显示：

- 固定高度布局
- 内部滚动区域
- 响应式宽度
- 最小宽度约束

### 数据服务集成

当前使用模拟数据，实际使用时需要：

1. 替换 `mockProjects` 为真实数据源
2. 实现异步数据加载
3. 集成项目管理服务
4. 添加错误处理和重试机制

## 性能优化

- 使用 `useMemo` 优化筛选和排序计算
- 使用 `useCallback` 优化事件处理函数
- 虚拟滚动支持（大量项目时）
- 图片懒加载
- 防抖搜索

## 可访问性

- 键盘导航支持
- ARIA 标签
- 焦点管理
- 屏幕阅读器支持

## 测试

建议的测试覆盖：

- 组件渲染测试
- 用户交互测试
- 搜索和筛选功能测试
- 模态框操作测试
- 标签页管理测试
