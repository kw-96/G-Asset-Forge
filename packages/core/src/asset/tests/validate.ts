/**
 * 验证脚本 - 检查素材管理系统的基本功能
 */
import { AssetStorageService, AssetType } from './index';

// 简单的验证函数
export function validateAssetSystem(): boolean {
  try {
    // 检查类型定义
    const assetTypes = Object.values(AssetType);
    console.log('支持的素材类型:', assetTypes);

    // 检查服务实例化
    const service = new AssetStorageService();
    console.log('素材存储服务创建成功');

    // 检查基本方法存在
    const methods = [
      'initialize',
      'createAsset',
      'getAsset',
      'queryAssets',
      'deleteAsset',
      'getAllCategories',
      'getAllTags',
    ];

    for (const method of methods) {
      if (typeof (service as any)[method] !== 'function') {
        throw new Error(`方法 ${method} 不存在`);
      }
    }

    console.log('所有必需方法都存在');

    // 清理
    service.destroy();

    return true;
  } catch (error) {
    console.error('验证失败:', error);
    return false;
  }
}

// 如果直接运行此文件，执行验证
if (typeof window !== 'undefined') {
  console.log('开始验证素材管理系统...');
  const isValid = validateAssetSystem();
  console.log('验证结果:', isValid ? '成功' : '失败');
}
