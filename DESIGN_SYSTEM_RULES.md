# G-Asset Forge 设计系统规则

## 设计令牌 (Design Tokens)

### 颜色系统
```css
/* 主色调 */
--primary-gradient: linear-gradient(135deg, #00c896 0%, #32d896 100%)
--primary-color: #00c896
--primary-light: #32d896

/* 背景色 */
--background-gradient: linear-gradient(135deg, #f0f8ff 0%, #e8f5e8 100%)
--card-background: #ffffff
--section-background: #ffffff

/* 边框和分割线 */
--border-primary: #e8f0fe
--border-light: #e0f7fa
--border-secondary: #e3f2fd

/* 文字颜色 */
--text-primary: #333333
--text-secondary: #666666
--text-tertiary: #555555
--text-white: #ffffff

/* 状态色 */
--success-bg: #e8f5e8
--success-text: #00c896
```

### 字体系统
```css
--font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif
--font-size-xs: 0.85em
--font-size-sm: 0.9em
--font-size-base: 0.95em
--font-size-md: 1.1em
--font-size-lg: 1.2em
--font-size-xl: 1.3em
--font-size-xxl: 1.4em
--font-size-hero: 2.8em
--font-size-display: 2.5em

--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### 间距系统
```css
--spacing-xs: 8px
--spacing-sm: 10px
--spacing-md: 15px
--spacing-lg: 20px
--spacing-xl: 25px
--spacing-xxl: 30px
--spacing-container: 40px

--gap-xs: 8px
--gap-sm: 15px
--gap-md: 20px
--gap-lg: 25px
```

### 圆角系统
```css
--radius-sm: 12px
--radius-md: 15px
--radius-lg: 20px
--radius-tag: 12px
```

### 阴影系统
```css
--shadow-card: 0 4px 20px rgba(0,0,0,0.08)
--shadow-hover: 0 6px 20px rgba(0,0,0,0.1)
--shadow-module: 0 4px 15px rgba(0,0,0,0.06)
--shadow-module-hover: 0 8px 25px rgba(0,0,0,0.12)
--shadow-header: 0 8px 32px rgba(0, 200, 150, 0.3)
--shadow-arch: 0 2px 10px rgba(0,0,0,0.05)
```

## 组件库

### 1. 页面布局组件

#### Container
- 最大宽度: 1400px
- 水平居中对齐
- 内边距: 20px

#### Header
- 背景: 主色调渐变
- 圆角: 20px
- 内边距: 40px
- 文字居中对齐
- 阴影: header阴影

### 2. 卡片组件

#### Main Banner
- 背景: 白色
- 圆角: 20px
- 内边距: 30px
- 边框: 1px solid #e8f0fe
- 阴影: card阴影

#### Banner Header
- 背景: 主色调渐变
- 圆角: 15px
- 内边距: 15px 30px
- 字体: 1.4em, 600权重
- 颜色: 白色
- 负边距实现重叠效果

### 3. 数据展示组件

#### Stat Card
- 背景: 渐变白色 (#fff to #f8fffe)
- 边框: 2px solid #e0f7fa
- 圆角: 15px
- 内边距: 25px
- 顶部装饰条: 4px 主色调渐变
- 居中对齐

#### Feature Card
- 背景: 渐变白色 (#fff to #f0f8ff)
- 边框: 1px solid #e3f2fd
- 圆角: 12px
- 内边距: 20px
- 悬停效果: 上移2px + 阴影变化

### 4. 产品模块组件

#### Module Item
- 背景: 白色
- 边框: 1px solid #e8f0fe
- 圆角: 15px
- 溢出隐藏
- 悬停效果: 上移3px + 阴影变化

#### Module Image
- 高度: 180px
- 背景: 渐变 (#f0f8ff to #e8f5e8)
- 图标大小: 3em
- 图标颜色: #00c896
- 居中对齐

#### Feature Tag
- 背景: #e8f5e8
- 文字颜色: #00c896
- 内边距: 4px 10px
- 圆角: 12px
- 字体大小: 0.85em
- 字体粗细: 500

### 5. 技术架构组件

#### Tech Card
- 背景: 渐变白色 (#fff to #f8fffe)
- 边框: 1px solid #e0f7fa
- 圆角: 15px
- 内边距: 20px
- 顶部装饰条: 3px 主色调渐变

#### Architecture Layer
- 背景: 白色
- 内边距: 20px
- 圆角: 12px
- 左边框: 4px solid #00c896
- 阴影: architecture阴影

### 6. 价值展示组件

#### Value Card
- 背景: 渐变白色 (#fff to #f0f8ff)
- 边框: 1px solid #e3f2fd
- 圆角: 15px
- 内边距: 25px
- 居中对齐
- 顶部装饰条: 4px 主色调渐变

#### Role Card
- 背景: 渐变白色 (#fff to #f8fffe)
- 边框: 1px solid #e0f7fa
- 圆角: 12px
- 内边距: 20px
- 居中对齐

## 响应式设计

### 网格系统
- Stats Grid: repeat(auto-fit, minmax(280px, 1fr))
- Features Grid: repeat(auto-fit, minmax(240px, 1fr))
- Product Modules: repeat(auto-fit, minmax(320px, 1fr))
- Tech Grid: repeat(auto-fit, minmax(280px, 1fr))
- Value Cards: repeat(auto-fit, minmax(300px, 1fr))
- User Roles: repeat(auto-fit, minmax(250px, 1fr))

### 移动端适配 (768px以下)
- Stats Grid: minmax(200px, 1fr)
- Features Grid: minmax(180px, 1fr)

## 动画和过渡

### 悬停动效
- 过渡时间: 0.3s ease
- 变换: translateY(-2px 或 -3px)
- 阴影变化: 增强阴影效果

### 装饰元素
- ::before 伪元素用于顶部装饰条
- 绝对定位
- 渐变背景
- 不同高度(3px/4px)

## Figma 实现指南

1. **创建色彩样式**
   - 设置主色调渐变
   - 创建文字颜色变量
   - 设置边框颜色

2. **建立文字样式**
   - 创建字体家族
   - 设置各级文字大小和粗细
   - 建立层级系统

3. **制作组件**
   - 按模块创建主要组件
   - 设置Auto Layout
   - 添加变量和实例属性

4. **响应式设计**
   - 使用Auto Layout实现网格
   - 设置断点和约束
   - 测试移动端效果

5. **交互效果**
   - 添加悬停状态
   - 设置变换动画
   - 配置阴影变化