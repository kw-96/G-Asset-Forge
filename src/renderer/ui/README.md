# G-Asset Forge UI 设计系统

基于 Figma UI3 设计系统构建的完整 UI 组件库，专为游戏资产创建工具设计。

## 🎨 设计原则

### 1. 一致性 (Consistency)
- 统一的视觉语言和交互模式
- 基于 8px 网格系统的间距规范
- 一致的颜色、字体和圆角使用

### 2. 可访问性 (Accessibility)
- 符合 WCAG 2.1 AA 标准
- 支持键盘导航和屏幕阅读器
- 适当的颜色对比度和焦点指示

### 3. 性能优先 (Performance First)
- 轻量级组件实现
- 优化的动画和过渡效果
- 支持 60fps 流畅交互

### 4. 专业工具感 (Professional Tool Feel)
- 适合长时间使用的界面设计
- 清晰的层次结构和信息架构
- 专业的配色方案和视觉效果

## 🎯 设计令牌 (Design Tokens)

### 颜色系统
```typescript
// 主色调 - 专业蓝紫色
colors.primary[500] // #6366f1

// 中性色 - 界面基础
colors.neutral[0]   // #ffffff (背景)
colors.neutral[700] // #404040 (主要文本)
colors.neutral[500] // #737373 (次要文本)

// 语义色彩
colors.semantic.success[500] // #22c55e (成功)
colors.semantic.warning[500] // #f59e0b (警告)
colors.semantic.error[500]   // #ef4444 (错误)
```

### 间距系统
```typescript
// 基于 8px 网格
spacing[1] // 4px
spacing[2] // 8px
spacing[4] // 16px
spacing[6] // 24px
```

### 字体系统
```typescript
typography.fontSize.xs   // 12px
typography.fontSize.sm   // 14px
typography.fontSize.base // 16px
typography.fontSize.lg   // 18px
```

## 📦 组件库

### 基础组件

#### Button - 按钮
```tsx
import { Button } from '@/ui/components';

// 基础用法
<Button variant="primary" size="md">
  确认
</Button>

// 带图标
<Button variant="outline" icon={<SaveIcon />}>
  保存
</Button>

// 加载状态
<Button loading>
  处理中...
</Button>
```

**变体类型**: `primary` | `secondary` | `outline` | `ghost` | `danger`
**尺寸**: `xs` | `sm` | `md` | `lg`

#### Input - 输入框
```tsx
import { Input } from '@/ui/components';

<Input
  placeholder="请输入内容"
  label="标签"
  helperText="帮助文本"
  error="错误信息"
/>
```

#### Badge - 徽章
```tsx
import { Badge } from '@/ui/components';

<Badge variant="primary">新功能</Badge>
<Badge variant="success" dot />
```

### 交互组件

#### Dropdown - 下拉菜单
```tsx
import { Dropdown, DropdownItem } from '@/ui/components';

<Dropdown trigger={<Button>菜单</Button>}>
  <DropdownItem onClick={handleEdit}>编辑</DropdownItem>
  <DropdownItem onClick={handleDelete} destructive>删除</DropdownItem>
</Dropdown>
```

#### Slider - 滑块
```tsx
import { Slider } from '@/ui/components';

<Slider
  value={opacity}
  onChange={setOpacity}
  min={0}
  max={100}
  label="透明度"
  showValue
/>
```

#### Switch - 开关
```tsx
import { Switch } from '@/ui/components';

<Switch
  checked={enabled}
  onChange={setEnabled}
  label="启用功能"
  description="开启后将应用此设置"
/>
```

#### Progress - 进度条
```tsx
import { Progress } from '@/ui/components';

// 确定进度
<Progress value={75} showLabel />

// 不确定进度
<Progress />
```

### 布局组件

#### Card - 卡片
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/components';

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    内容区域
  </CardContent>
</Card>
```

## 🎨 主题系统

### 使用主题
```tsx
import { ThemeProvider } from '@/ui/theme';
import { lightTheme, darkTheme } from '@/ui/theme';

function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 在组件中使用主题
```tsx
import styled from 'styled-components';
import { colors, spacing } from '@/ui/theme/tokens';

const StyledComponent = styled.div`
  background: ${colors.neutral[0]};
  padding: ${spacing[4]};
  color: ${colors.neutral[700]};
`;
```

## 🚀 最佳实践

### 1. 组件组合
优先使用组件组合而非创建新的复杂组件：

```tsx
// ✅ 推荐
<Card>
  <CardHeader>
    <CardTitle>工具设置</CardTitle>
    <Switch checked={enabled} onChange={setEnabled} />
  </CardHeader>
  <CardContent>
    <Slider value={size} onChange={setSize} label="画笔大小" />
  </CardContent>
</Card>

// ❌ 不推荐
<ToolSettingsCard enabled={enabled} size={size} />
```

### 2. 一致的间距
使用设计令牌中定义的间距值：

```tsx
// ✅ 推荐
<div style={{ padding: spacing[4], margin: spacing[2] }}>

// ❌ 不推荐
<div style={{ padding: '15px', margin: '7px' }}>
```

### 3. 语义化颜色
根据用途选择合适的颜色变体：

```tsx
// ✅ 推荐
<Button variant="danger">删除</Button>
<Badge variant="success">已完成</Badge>

// ❌ 不推荐
<Button style={{ background: 'red' }}>删除</Button>
```

### 4. 可访问性
确保组件具有适当的可访问性属性：

```tsx
// ✅ 推荐
<Button aria-label="保存项目" disabled={isSaving}>
  {isSaving ? '保存中...' : '保存'}
</Button>

// ❌ 不推荐
<div onClick={save}>保存</div>
```

## 🔧 开发指南

### 添加新组件
1. 在 `src/renderer/ui/components/` 下创建组件目录
2. 实现组件并遵循现有的设计模式
3. 添加 TypeScript 类型定义
4. 在 `index.ts` 中导出组件
5. 更新文档和示例

### 自定义主题
```typescript
// 扩展基础主题
const customTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: {
      ...baseTheme.colors.primary,
      500: '#your-custom-color',
    },
  },
};
```

### 性能优化
- 使用 `React.memo` 包装纯组件
- 避免在渲染函数中创建新对象
- 使用 CSS-in-JS 的性能优化特性

## 📱 响应式设计

组件支持响应式设计，使用断点系统：

```typescript
// 断点定义
breakpoints.sm  // 640px
breakpoints.md  // 768px
breakpoints.lg  // 1024px
breakpoints.xl  // 1280px
```

## 🎯 游戏工具专用组件

针对游戏资产创建工具的特殊需求，我们提供了专用组件：

### 画布相关
- 支持画布背景色的组件变体
- 适合工具面板的紧凑布局
- 专业的颜色选择器集成

### 性能监控
- 实时性能指标显示
- 内存使用情况可视化
- 60fps 渲染状态指示

### 文件操作
- 支持拖拽的文件上传组件
- 项目保存状态指示
- 导出进度显示

这个 UI 系统为 G-Asset Forge 提供了完整、一致、专业的用户界面基础，确保用户能够高效地创建游戏资产。