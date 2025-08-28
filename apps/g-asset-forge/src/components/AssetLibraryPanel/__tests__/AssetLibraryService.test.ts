/**
 * 素材库服务集成测试
 */
import { assetLibraryService } from '../../../services/AssetLibraryService';

describe('AssetLibraryService', () => {
  beforeEach(() => {
    // 清理之前的测试数据
    assetLibraryService.destroy();
  });

  afterEach(() => {
    assetLibraryService.destroy();
  });

  test('应该能够初始化服务', async () => {
    await expect(assetLibraryService.initialize()).resolves.not.toThrow();
  });

  test('应该能够搜索素材', async () => {
    await assetLibraryService.initialize();

    const result = await assetLibraryService.searchAssets({
      query: 'test',
      page: 1,
      pageSize: 10,
    });

    expect(result).toHaveProperty('assets');
    expect(result).toHaveProperty('totalCount');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('pageSize');
    expect(Array.isArray(result.assets)).toBe(true);
  });

  test('应该能够获取分类列表', async () => {
    await assetLibraryService.initialize();

    const categories = await assetLibraryService.getCategories();

    expect(Array.isArray(categories)).toBe(true);
    // 应该有默认分类
    expect(categories.length).toBeGreaterThan(0);
  });

  test('应该能够获取标签列表', async () => {
    await assetLibraryService.initialize();

    const tags = await assetLibraryService.getAllTags();

    expect(Array.isArray(tags)).toBe(true);
  });

  test('应该能够创建模拟文件并上传', async () => {
    await assetLibraryService.initialize();

    // 创建模拟图片文件
    const mockFile = new File(['mock image data'], 'test-image.png', {
      type: 'image/png',
    });

    const asset = await assetLibraryService.uploadAsset(
      mockFile,
      'Test Image',
      'ui',
      ['test', 'mock'],
      'Test description',
    );

    expect(asset).toHaveProperty('id');
    expect(asset.name).toBe('Test Image');
    expect(asset.category).toBe('ui');
  });
});
