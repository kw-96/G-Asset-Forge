# 素材管理系统

这个模块实现了 G-Asset Forge 的素材管理功能，包括素材的存储、分类、标签和查询等功能。

## 功能特性

- ✅ 基于 IndexedDB 的本地存储
- ✅ 素材分类和标签系统
- ✅ 图片文件处理和缩略图生成
- ✅ 素材搜索和筛选
- ✅ 使用统计和热门标签
- ✅ 完整的增删改查操作

## 架构设计

```
asset/
├── types.ts                    # 类型定义
├── asset_storage_service.ts    # 主服务入口
├── asset_service_facade.ts     # 简化接口门面
├── managers/                   # 管理器模块
│   ├── asset_manager.ts        # 素材管理
│   ├── category_manager.ts     # 分类管理
│   └── tag_manager.ts          # 标签管理
└── utils/                      # 工具模块
    ├── indexeddb_utils.ts      # 数据库工具
    └── image_processor.ts      # 图片处理
```

## 使用示例

### 基本使用

```typescript
import { AssetStorageService, AssetType } from '@g-asset-forge/core';

// 创建服务实例
const assetService = new AssetStorageService();

// 初始化服务
await assetService.initialize();

// 创建素材
const asset = await assetService.createAsset({
  name: '游戏图标',
  type: AssetType.Icon,
  categoryId: 'cat-icons',
  tagIds: ['tag-game', 'tag-ui'],
  file: imageFile, // File 对象
  description: '游戏主界面图标',
  author: '设计师',
});

// 查询素材
const result = await assetService.queryAssets({
  keyword: '图标',
  type: AssetType.Icon,
  limit: 20,
});

// 使用素材
await assetService.recordAssetUsage(asset.id);
const fileBlob = await assetService.getAssetFile(asset.id);
```

### 使用门面接口

```typescript
import { AssetServiceFacade } from '@g-asset-forge/core';

// 使用简化接口
const facade = new AssetServiceFacade();
await facade.initialize();

// 上传素材
await facade.uploadAsset(file, 'cat-icons', ['tag-game']);

// 搜索素材
const assets = await facade.searchAssets('图标', AssetType.Icon);

// 获取分类统计
const categories = await facade.getCategoriesForUI();
```

## 数据模型

### 素材数据 (AssetData)

```typescript
interface AssetData {
  id: string; // 唯一标识
  name: string; // 素材名称
  type: AssetType; // 素材类型
  categoryId: string; // 分类ID
  tagIds: string[]; // 标签ID列表

  // 文件信息
  filename: string; // 原始文件名
  fileSize: number; // 文件大小
  mimeType: string; // MIME类型
  width: number; // 图片宽度
  height: number; // 图片高度
  thumbnail: string; // 缩略图数据URL

  // 统计信息
  usageCount: number; // 使用次数
  lastUsed: Date; // 最后使用时间
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}
```

### 分类数据 (AssetCategory)

```typescript
interface AssetCategory {
  id: string; // 分类ID
  name: string; // 分类名称
  parentId?: string; // 父分类ID
  order: number; // 排序权重
  createdAt: Date; // 创建时间
}
```

### 标签数据 (AssetTag)

```typescript
interface AssetTag {
  id: string; // 标签ID
  name: string; // 标签名称
  color?: string; // 标签颜色
  usageCount: number; // 使用次数
  createdAt: Date; // 创建时间
}
```

## 存储方案

使用 IndexedDB 进行本地存储，包含以下对象存储：

- **assets**: 素材元数据
- **files**: 素材文件数据（Blob）
- **categories**: 分类数据
- **tags**: 标签数据

## 性能优化

- 文件数据与元数据分离存储
- 缩略图自动生成和缓存
- 索引优化查询性能
- 分页查询避免大量数据加载

## 错误处理

- 完整的错误类型定义
- 友好的中文错误信息
- 数据库操作异常处理
- 文件处理错误恢复

## 测试

运行测试（需要浏览器环境）：

```bash
npm test asset_storage_service.test.ts
```

## 注意事项

1. 需要在浏览器环境中运行（依赖 IndexedDB 和 Canvas API）
2. 文件上传需要用户交互触发
3. 大文件处理可能影响性能
4. IndexedDB 有存储限制，需要定期清理

## 扩展计划

- [ ] 云端同步支持
- [ ] 更多文件格式支持
- [ ] 批量操作优化
- [ ] 素材版本管理
- [ ] 协作功能支持
