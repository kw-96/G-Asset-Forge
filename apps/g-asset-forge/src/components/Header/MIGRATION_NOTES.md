# Header 组件主页按钮迁移说明

## 变更概述

将 Tabs 组件中的主页按钮迁移到 Header 组件的左侧位置，实现更合理的 UI 布局。

## 主要变更

### 1. Tabs 组件修改 (`components/Tabs/Tabs.tsx`)

**移除的功能：**

- 移除了 `onHomePageClick` 属性
- 移除了主页按钮相关的 JSX 代码
- 移除了 `handleHomePageClick` 回调函数

**保留的功能：**

- 标签页的创建、关闭、切换功能
- 标签页重命名功能
- 新建标签页按钮

### 2. Header 组件增强 (`Header.tsx`)

**已有功能：**

- Header 组件已经支持主页按钮显示
- 通过 `showHomeButton` 和 `onBackToHome` 属性控制
- 主页按钮位于 Header 的左侧区域

### 3. 样式调整

**Tabs 样式 (`tabs.scss`)：**

- 移除了 `.tabs-home-button` 相关样式
- 移除了响应式设计中的主页按钮样式

**Header 样式 (`Header.scss`)：**

- 优化了 `.sk-left-area` 样式
- 添加了 `min-width: fit-content` 确保按钮不被压缩
- 添加了 `white-space: nowrap` 防止文字换行
- 添加了 `:active` 状态样式

## 使用方式

### 在 Editor 组件中使用 Header（已实现）

```tsx
<Header
  title="g-asset-forge"
  onBackToHome={onBackToHome}
  showHomeButton={!!onBackToHome}
>
  {/* 其他Header内容 */}
</Header>
```

### 单独使用 Tabs 组件

```tsx
<Tabs
  initialTabs={tabs}
  onTabActivate={handleTabActivate}
  onTabClose={handleTabClose}
  onTabCreate={handleTabCreate}
  onTabRename={handleTabRename}
/>
```

## 兼容性说明

- 现有的 Header 组件使用方式无需修改
- Tabs 组件的 API 有破坏性变更，移除了 `onHomePageClick` 属性
- 如果有其他地方直接使用 Tabs 组件并依赖主页按钮功能，需要迁移到 Header 组件

## 文件变更清单

- ✅ `apps/g-asset-forge/src/components/Header/components/Tabs/Tabs.tsx` - 移除主页按钮
- ✅ `apps/g-asset-forge/src/components/Header/components/Tabs/tabs.scss` - 移除主页按钮样式
- ✅ `apps/g-asset-forge/src/components/Header/Header.scss` - 优化左侧区域样式
- ✅ `apps/g-asset-forge/src/components/Header/index.ts` - 导出 Tabs 组件
- ✅ `apps/g-asset-forge/src/components/Header/components/Tabs/TabsExample.tsx` - 添加使用示例

## 测试建议

1. 验证 Header 组件的主页按钮功能正常
2. 验证 Tabs 组件的标签页操作功能正常
3. 验证响应式布局在不同屏幕尺寸下的表现
4. 验证 Electron 环境下的按钮交互体验
