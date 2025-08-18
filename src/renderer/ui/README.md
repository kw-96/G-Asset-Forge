# G-Asset Forge UI 组件库

基于原子设计理论的响应式UI组件库，为G-Asset Forge提供统一的设计系统和用户界面组件。

## 特性

- 🎨 **原子设计** - 基于原子设计理论的组件分层
- 📱 **响应式设计** - 完整的响应式布局支持
- ♿ **可访问性** - WCAG 2.1 AA标准支持
- 🌙 **主题系统** - 亮色/暗色主题切换
- ⚡ **性能优化** - GPU加速和虚拟化支持
- 🔧 **TypeScript** - 完整的类型定义

## 架构

``` t
ui/
├── components/           # 组件库
│   ├── atoms/           # 原子组件
│   ├── molecules/       # 分子组件
│   ├── organisms/       # 有机体组件
│   ├── templates/       # 模板组件
│   └── layout/          # 布局组件
├── theme/               # 主题系统
│   ├── tokens.ts        # 设计令牌
│   ├── mixins.ts        # 样式混合函数
│   └── ThemeProvider.tsx # 主题提供者
├── styles/              # 全局样式
└── accessibility/       # 可访问性工具
```

## 快速开始

### 1. 主题提供者

```tsx
import { ThemeProvider } from '@/ui';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. 使用组件

```tsx
import { Button, Container, Grid, GridItem } from '@/ui';

function MyComponent() {
  return (
    <Container maxWidth="lg">
      <Grid columns={{ xs: 1, sm: 2, lg: 3 }} gap="md">
        <GridItem colSpan={{ xs: 1, sm: 2 }}>
          <Button variant="primary" size="lg">
            主要按钮
          </Button>
        </GridItem>
      </Grid>
    </Container>
  );
}
```

### 3. 使用主题

```tsx
import styled from 'styled-components';
import { mixins } from '@/ui/theme/mixins';

const StyledComponent = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.md};
  
  ${mixins.responsive.above('md')`
    padding: ${({ theme }) => theme.spacing.lg};
  `}
  
  ${mixins.effects.shadow('md')}
  ${mixins.effects.fadeIn()}
`;
```

## 组件分类

### 原子组件 (Atoms)

最基础的UI元素，不可再分解：

- `Button` - 按钮组件
- `Input` - 输入框组件
- `Icon` - 图标组件
- `Text` - 文本组件
- `Label` - 标签组件

### 分子组件 (Molecules)

由原子组件组合而成的简单组件：

- `SearchBox` - 搜索框
- `FormField` - 表单字段
- `Card` - 卡片组件

### 有机体组件 (Organisms)

由分子和原子组件组成的复杂组件：

- `Navbar` - 导航栏
- `Sidebar` - 侧边栏
- `Panel` - 面板组件

### 布局组件 (Layout)

响应式布局系统：

- `Container` - 容器组件
- `Grid` / `GridItem` - 网格布局
- `Flex` / `FlexItem` - 弹性布局
- `VStack` / `HStack` - 垂直/水平堆叠
- `Center` - 居中布局

## 主题系统

### 设计令牌

```typescript
// 颜色
theme.colors.primary        // 主色
theme.colors.text.primary   // 主文本色
theme.colors.background     // 背景色

// 间距
theme.spacing.xs            // 4px
theme.spacing.sm            // 8px
theme.spacing.md            // 16px

// 字体
theme.typography.fontSize.base  // 16px
theme.typography.fontWeight.medium // 500

// 阴影
theme.shadows.sm            // 小阴影
theme.shadows.md            // 中等阴影
```

### 响应式断点

```typescript
theme.breakpoints.xs        // 480px
theme.breakpoints.sm        // 640px
theme.breakpoints.md        // 768px
theme.breakpoints.lg        // 1024px
theme.breakpoints.xl        // 1280px
```

### 混合函数

```typescript
// 响应式
mixins.responsive.above('md')    // 大于md断点
mixins.responsive.below('lg')    // 小于lg断点
mixins.responsive.between('sm', 'lg') // sm到lg之间

// 布局
mixins.layout.flexCenter()       // Flex居中
mixins.layout.container('lg')    // 容器样式
mixins.layout.grid(3, 'md')      // 3列网格

// 效果
mixins.effects.shadow('md')      // 阴影效果
mixins.effects.fadeIn()          // 淡入动画
mixins.effects.hoverScale(1.05)  // 悬停缩放

// 可访问性
mixins.accessibility.focusRing() // 焦点环
mixins.accessibility.srOnly()    // 屏幕阅读器专用
```

## 可访问性

### 键盘导航

所有交互组件都支持键盘导航：

- `Tab` / `Shift+Tab` - 焦点切换
- `Enter` / `Space` - 激活按钮
- `Escape` - 关闭模态框

### 屏幕阅读器

- 语义化HTML结构
- ARIA标签支持
- 焦点管理
- 状态通知

### 颜色对比度

- 文本对比度 ≥ 4.5:1 (WCAG AA)
- 大文本对比度 ≥ 3:1
- 非文本元素对比度 ≥ 3:1

## 性能优化

### 虚拟化

大列表自动启用虚拟化：

```tsx
<VirtualizedList
  items={largeDataSet}
  itemHeight={40}
  threshold={100}
/>
```

### 懒加载

图片和组件支持懒加载：

```tsx
<Image
  src="large-image.jpg"
  lazy
  placeholder="blur"
/>
```

### 代码分割

组件支持动态导入：

```tsx
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

## 开发指南

### 添加新组件

1. 确定组件层级（原子/分子/有机体）
2. 创建组件文件和样式
3. 添加TypeScript类型定义
4. 编写单元测试
5. 更新文档和示例

### 主题定制

```tsx
const customTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#your-brand-color',
  },
};

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### 响应式开发

```tsx
// 使用响应式属性
<Grid columns={{ xs: 1, sm: 2, lg: 3 }}>

// 使用混合函数
const ResponsiveComponent = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  
  ${mixins.responsive.above('md')`
    padding: ${({ theme }) => theme.spacing.lg};
  `}
`;
```

## 浏览器支持

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
