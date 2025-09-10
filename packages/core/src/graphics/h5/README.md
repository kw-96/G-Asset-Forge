# H5 容器组件

H5 容器组件用于创建和管理 H5 长图容器，提供移动端页面设计功能。

## 文件结构

```t
h5/
├── h5_container.ts           # H5 容器主类
├── h5_container_attrs.ts     # H5 容器属性控制器
├── content_block.ts          # H5 内容块相关类
└── README.md                 # 说明文档
```

## 核心组件

### H5Container

H5 容器的主类，继承自 `GAssetForgeFrame`，提供以下特性：

- **位置锁定**：容器位置固定在左上角 (0,0) 坐标，不可移动
- **尺寸可调**：支持调整宽度和高度
- **自动布局**：支持内容块的自动布局
- **内容管理**：提供内容块的增删改查功能

### H5ContainerAttrsController

H5 容器属性控制器，专门处理 H5 容器的特殊属性控制：

#### 主要功能

1. **属性过滤**：过滤掉位置相关的属性更新
2. **属性验证**：验证属性更新的合法性
3. **权限控制**：控制哪些属性可以更新

#### 核心方法

- `filterAttrsForUpdate()`: 过滤属性更新，禁止移动但允许调整尺寸
- `isAllowedToUpdate()`: 检查是否允许更新指定属性
- `validateAttrsUpdate()`: 验证属性更新是否合法
- `getAllowedAttrs()`: 获取允许更新的属性列表
- `getForbiddenAttrs()`: 获取禁止更新的属性列表

## 使用示例

```typescript
import { H5Container } from './h5_container';
import { H5ContainerAttrsController } from './h5_container_attrs';

// 创建 H5 容器
const container = new H5Container(
  {
    id: 'h5-container-1',
    objectName: 'H5长图容器',
    width: 375,
    height: 667,
    mobileWidth: 375,
    padding: 16,
    gap: 12,
    autoLayout: true,
  },
  opts,
);

// 更新容器尺寸（允许）
container.updateAttrs({
  width: 414,
  height: 896,
});

// 尝试移动容器（会被阻止）
container.updateAttrs({
  x: 100, // 这个属性会被过滤掉
  y: 100, // 这个属性会被过滤掉
});
```

## 设计原则

1. **单一职责**：每个文件负责特定的功能
2. **可维护性**：属性控制逻辑独立，便于维护和测试
3. **可扩展性**：控制器设计支持未来添加更多属性控制规则
4. **类型安全**：使用 TypeScript 提供完整的类型支持

## 注意事项

- H5 容器的位置始终固定在 (0,0) 坐标
- 只有尺寸和样式属性可以更新
- 位置相关的属性（x, y, transform 中的 tx, ty）会被自动过滤
- 属性更新会进行验证，无效更新会输出警告信息
