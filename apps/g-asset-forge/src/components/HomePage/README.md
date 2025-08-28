# HomePage 组件

## 概述

HomePage 是 G-Asset Forge 应用的首页界面组件，作为 WelcomeScreen 完成后的主界面，提供项目管理和模式选择功能。

## 功能特性

### 1. 模式选择

- **设计模式**: 类似 Figma 的专业设计体验，适合创建游戏运营美术素材
- **H5 模式**: 类似秀米的 H5 编辑体验，专门用于创建活动长图素材

### 2. 快速操作

- 创建新项目
- 访问模板库
- 访问项目库
- 访问素材库

### 3. 最近项目

- 显示最近使用的项目（最多 6 个）
- 支持快速打开最近项目
- 显示项目类型和最后修改时间

## 组件接口

```typescript
interface HomePageProps {
  onModeSelect: (mode: 'design' | 'h5') => void;
  onOpenProjectLibrary: () => void;
  onOpenTemplateLibrary: () => void;
  onOpenAssetLibrary: () => void;
  onCreateNewProject: () => void;
  recentProjects?: RecentProject[];
}

interface RecentProject {
  id: string;
  name: string;
  type: 'design' | 'h5';
  lastOpenedAt: string;
  thumbnail?: string;
}
```

## 使用示例

```tsx
import { HomePage } from './components/HomePage';

function App() {
  const handleModeSelect = (mode: 'design' | 'h5') => {
    console.log('选择模式:', mode);
  };

  const handleOpenProjectLibrary = () => {
    console.log('打开项目库');
  };

  // ... 其他处理函数

  return (
    <HomePage
      onModeSelect={handleModeSelect}
      onOpenProjectLibrary={handleOpenProjectLibrary}
      onOpenTemplateLibrary={handleOpenTemplateLibrary}
      onOpenAssetLibrary={handleOpenAssetLibrary}
      onCreateNewProject={handleCreateNewProject}
      recentProjects={recentProjects}
    />
  );
}
```

## 国际化支持

组件支持中英文国际化，使用以下 locale keys：

- `homePage.title`: 应用标题
- `homePage.subtitle`: 应用副标题
- `homePage.selectMode`: 选择编辑模式
- `homePage.designMode`: 设计模式
- `homePage.designModeDesc`: 设计模式描述
- `homePage.h5Mode`: H5 模式
- `homePage.h5ModeDesc`: H5 模式描述
- `homePage.quickStart`: 快速开始
- `homePage.resourceManagement`: 资源管理
- `homePage.createNewProject`: 创建新项目
- `homePage.templateLibrary`: 模板库
- `homePage.projectLibrary`: 项目库
- `homePage.assetLibrary`: 素材库
- `homePage.recentProjects`: 最近项目
- `homePage.designType`: 设计
- `homePage.h5Type`: H5

## 样式特性

- 响应式设计，支持移动端和桌面端
- 现代化的卡片式布局
- 渐变背景和阴影效果
- 悬停动画和交互反馈
- 支持深色和浅色主题

## 文件结构

```t
HomePage/
├── HomePage.tsx          # 主组件文件
├── HomePage.scss         # 样式文件
├── HomePage.test.tsx     # 测试文件
├── index.ts             # 导出文件
└── README.md            # 文档文件
```

## 依赖关系

- `@g-asset-forge/components`: Button 组件
- `react-intl`: 国际化支持
- `../SvgIcon`: 图标组件

## 注意事项

1. 组件需要在 `IntlProvider` 包装下使用
2. 最近项目数据需要从外部传入
3. 所有回调函数都是必需的
4. 组件会自动处理模式选择的视觉反馈
