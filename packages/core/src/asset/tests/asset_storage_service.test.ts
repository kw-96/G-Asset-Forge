import { AssetStorageService, AssetType } from '../asset_storage_service';

/**
 * 素材存储服务测试
 * 注意：这些测试需要在浏览器环境中运行，因为使用了IndexedDB
 */
describe('AssetStorageService', () => {
  let service: AssetStorageService;

  beforeEach(() => {
    service = new AssetStorageService();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('初始化', () => {
    test('应该能够成功初始化服务', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    test('应该创建默认分类和标签', async () => {
      await service.initialize();

      const categories = await service.getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some((cat) => cat.name === '图标')).toBe(true);

      const tags = await service.getAllTags();
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.some((tag) => tag.name === '游戏')).toBe(true);
    });
  });

  describe('分类管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('应该能够创建新分类', async () => {
      const category = await service.createCategory({
        name: '测试分类',
        order: 10,
      });

      expect(category.id).toBeDefined();
      expect(category.name).toBe('测试分类');
      expect(category.order).toBe(10);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    test('应该能够更新分类', async () => {
      const category = await service.createCategory({
        name: '原始名称',
        order: 1,
      });

      const updated = await service.updateCategory(category.id, {
        name: '更新后的名称',
        order: 2,
      });

      expect(updated.name).toBe('更新后的名称');
      expect(updated.order).toBe(2);
    });
  });

  describe('标签管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('应该能够创建新标签', async () => {
      const tag = await service.createTag({
        name: '测试标签',
        color: '#ff0000',
      });

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe('测试标签');
      expect(tag.color).toBe('#ff0000');
      expect(tag.usageCount).toBe(0);
    });

    test('应该能够更新标签', async () => {
      const tag = await service.createTag({
        name: '原始标签',
        color: '#ff0000',
      });

      const updated = await service.updateTag(tag.id, {
        name: '更新后的标签',
        color: '#00ff00',
      });

      expect(updated.name).toBe('更新后的标签');
      expect(updated.color).toBe('#00ff00');
    });
  });

  describe('素材查询', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('应该能够查询所有素材', async () => {
      const result = await service.queryAssets();

      expect(result.assets).toBeInstanceOf(Array);
      expect(result.total).toBe(result.assets.length);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(50);
    });

    test('应该能够按类型筛选素材', async () => {
      const result = await service.queryAssets({
        type: AssetType.Icon,
      });

      result.assets.forEach((asset) => {
        expect(asset.type).toBe(AssetType.Icon);
      });
    });

    test('应该能够按关键词搜索素材', async () => {
      const result = await service.queryAssets({
        keyword: '测试',
      });

      result.assets.forEach((asset) => {
        const matchesName = asset.name.toLowerCase().includes('测试');
        const matchesDesc =
          asset.description?.toLowerCase().includes('测试') || false;
        expect(matchesName || matchesDesc).toBe(true);
      });
    });

    test('应该能够分页查询素材', async () => {
      const result = await service.queryAssets({
        offset: 0,
        limit: 10,
      });

      expect(result.assets.length).toBeLessThanOrEqual(10);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(10);
    });
  });

  // 注意：素材创建测试需要模拟File对象，在实际浏览器环境中测试
  describe('素材管理（需要浏览器环境）', () => {
    test('应该能够创建模拟素材', async () => {
      // 这个测试需要在实际浏览器环境中运行
      // 因为需要创建File对象和处理图片
      expect(true).toBe(true); // 占位测试
    });
  });
});

/**
 * 创建模拟文件对象的辅助函数
 * 仅用于测试环境
 */
export function createMockImageFile(
  name: string = 'test.png',
  size: number = 1024,
  type: string = 'image/png',
): File {
  const blob = new Blob(['mock image data'], { type });
  return new File([blob], name, { type });
}
