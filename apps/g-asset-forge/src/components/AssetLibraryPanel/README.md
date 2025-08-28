# 素材库集成功能

## 概述

本模块实现了完整的素材库管理功能，包括素材的上传、搜索、分类、标签管理、批量操作等功能。该实现基于任务 10 的要求，将素材库界面与真实的数据服务进行了集成。

## 主要功能

### 1. 素材管理

- ✅ 素材上传（支持 PNG、JPG、GIF、SVG、WebP 格式）
- ✅ 素材搜索和筛选
- ✅ 素材重命名
- ✅ 素材删除
- ✅ 素材导出
- ✅ 素材使用统计

### 2. 分类和标签

- ✅ 分类管理（UI 元素、图标、背景、装饰、角色、特效、纹理）
- ✅ 标签管理（自动创建、使用计数）
- ✅ 分类和标签筛选

### 3. 批量操作

- ✅ 批量选择（Ctrl/Cmd + 点击）
- ✅ 批量删除
- ✅ 批量导出
- ✅ 批量更新分类
- ✅ 批量添加标签

### 4. 拖拽集成

- ✅ 拖拽素材到画布
- ✅ 自动记录素材使用
- ✅ 拖拽预览图像

### 5. 用户交互

- ✅ 右键菜单操作
- ✅ 网格/列表视图切换
- ✅ 排序和分页
- ✅ 实时搜索

## 架构设计

### 服务层

- `AssetLibraryService`: 主要的素材库服务，连接 UI 和核心数据服务
- `AssetDragDropService`: 处理拖拽操作的服务
- `AssetStorageService`: 核心数据存储服务（来自 @g-asset-forge/core）

### 组件层

- `AssetLibraryPanel`: 主面板组件
- `AssetGrid`: 素材网格/列表视图
- `AssetCard`: 单个素材卡片
- `AssetUploadDialog`: 上传对话框
- `AssetBatchOperations`: 批量操作面板
- `AssetContextMenu`: 右键菜单
- `AssetRenameDialog`: 重命名对话框

### 数据层

- IndexedDB 存储（通过 AssetStorageService）
- 素材文件和元数据分离存储
- 自动缩略图生成

## 使用方法

### 基本使用

```tsx
import { AssetLibraryPanel } from './components/AssetLibraryPanel';

function App() {
  const handleAssetSelect = (asset) => {
    console.log('选中素材:', asset);
  };

  const handleAssetDragStart = (asset, event) => {
    // 处理拖拽开始
  };

  return (
    <AssetLibraryPanel
      onAssetSelect={handleAssetSelect}
      onAssetDragStart={handleAssetDragStart}
    />
  );
}
```

### 拖拽集成

```tsx
import { assetDragDropService } from './services/AssetDragDropService';

// 在画布组件中处理拖拽放置
const handleCanvasDrop = async (event) => {
  const success = await assetDragDropService.handleCanvasDrop(
    event,
    { x: event.offsetX, y: event.offsetY },
    editorInstance,
  );

  if (success) {
    console.log('素材已添加到画布');
  }
};
```

### 服务初始化

```tsx
import { assetLibraryService } from './services/AssetLibraryService';

// 在应用启动时初始化
useEffect(() => {
  assetLibraryService.initialize().catch(console.error);
}, []);
```

## API 接口

### AssetLibraryService

#### 主要方法

- `initialize()`: 初始化服务
- `searchAssets(options)`: 搜索素材
- `uploadAsset(file, name, category, tags, description)`: 上传素材
- `deleteAsset(id)`: 删除素材
- `renameAsset(id, newName)`: 重命名素材
- `exportAssets(ids)`: 导出素材
- `getCategories()`: 获取分类列表
- `getAllTags()`: 获取标签列表

#### 搜索选项

```typescript
interface IAssetSearchOptions {
  query?: string; // 关键词搜索
  category?: AssetCategory; // 分类筛选
  tags?: string[]; // 标签筛选
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
```

### AssetDragDropService

#### 主要方法

- `startDrag(asset, event)`: 开始拖拽
- `handleCanvasDrop(event, position, editor)`: 处理画布拖拽放置
- `isAssetDrag(event)`: 检查是否为素材拖拽
- `getDragAssetInfo(event)`: 获取拖拽素材信息

## 数据存储

### 存储结构

```
IndexedDB: GAssetForgeAssets
├── assets/          # 素材元数据
├── categories/      # 分类信息
├── tags/           # 标签信息
└── files/          # 素材文件数据
```

### 数据模型

```typescript
interface AssetData {
  id: string;
  name: string;
  type: AssetType;
  categoryId: string;
  tagIds: string[];
  filename: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  thumbnail: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  // ... 其他字段
}
```

## 性能优化

### 已实现的优化

1. **缩略图生成**: 自动生成 200x200 的缩略图，减少显示时的内存占用
2. **分离存储**: 素材文件和元数据分离存储，提高查询性能
3. **索引优化**: 为常用查询字段创建索引
4. **懒加载**: 素材列表支持分页加载
5. **事件节流**: 搜索输入使用防抖处理

### 建议的进一步优化

1. **虚拟滚动**: 对于大量素材的情况，可以实现虚拟滚动
2. **预加载**: 预加载下一页的素材数据
3. **缓存策略**: 实现更智能的缓存策略
4. **Web Workers**: 将图片处理移到 Web Worker 中

## 测试

### 运行测试

```bash
npm test -- AssetLibraryService.test.ts
```

### 测试覆盖

- ✅ 服务初始化
- ✅ 素材搜索
- ✅ 素材上传
- ✅ 分类和标签管理
- ✅ 基本 CRUD 操作

## 故障排除

### 常见问题

1. **IndexedDB 不支持**: 检查浏览器兼容性
2. **文件上传失败**: 检查文件格式和大小限制
3. **拖拽不工作**: 确保正确设置了拖拽事件处理
4. **性能问题**: 检查素材数量和缩略图大小

### 调试技巧

1. 打开浏览器开发者工具的 Application 标签查看 IndexedDB
2. 使用 console.log 查看服务初始化状态
3. 检查网络标签页查看文件上传进度
4. 使用 Performance 标签分析性能瓶颈

## 未来改进

### 计划中的功能

1. **收藏功能**: 完整的收藏和收藏夹管理
2. **素材预览**: 更丰富的预览功能
3. **版本管理**: 素材版本历史
4. **协作功能**: 多用户素材共享
5. **云同步**: 素材云端同步

### 技术改进

1. **TypeScript 严格模式**: 移除 any 类型使用
2. **错误处理**: 更完善的错误处理和用户反馈
3. **国际化**: 完整的多语言支持
4. **无障碍性**: 改进键盘导航和屏幕阅读器支持
