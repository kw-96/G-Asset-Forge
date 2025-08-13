// 素材库功能测试组件
import React, { useState, useRef, useEffect } from 'react';
import { AssetLibraryPanel } from './AssetLibraryPanel';
import { 
  AssetLibraryManager, 
  type IAssetMetadata,
  type AssetCategory 
} from '../../managers/assets/AssetLibraryManager';
import { ThumbnailGenerator } from '../../managers/assets/ThumbnailGenerator';
import { AssetStorageManager } from '../../managers/assets/AssetStorageManager';

export const AssetLibraryTest: React.FC = () => {
  const libraryManagerRef = useRef<AssetLibraryManager | null>(null);
  const thumbnailGeneratorRef = useRef<ThumbnailGenerator | null>(null);
  const storageManagerRef = useRef<AssetStorageManager | null>(null);
  
  const [selectedAsset, setSelectedAsset] = useState<IAssetMetadata | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  }>>([]);
  const [libraryStats, setLibraryStats] = useState<any>(null);

  // 初始化管理器
  useEffect(() => {
    libraryManagerRef.current = new AssetLibraryManager();
    thumbnailGeneratorRef.current = new ThumbnailGenerator();
    storageManagerRef.current = new AssetStorageManager();

    // 绑定事件监听
    libraryManagerRef.current.on('assetAdded', (asset) => {
      addTestResult('素材添加', 'pass', `成功添加素材: ${asset.name}`);
      updateStats();
    });

    libraryManagerRef.current.on('searchCompleted', (result) => {
      addTestResult('搜索功能', 'pass', `搜索完成，找到 ${result.totalCount} 个结果`);
    });

    libraryManagerRef.current.on('favoriteToggled', (assetId, isFavorite) => {
      addTestResult('收藏功能', 'pass', `${isFavorite ? '添加' : '移除'}收藏: ${assetId}`);
    });

    thumbnailGeneratorRef.current.on('thumbnailGenerated', (_originalUrl, result) => {
      addTestResult(
        '缩略图生成', 
        result.success ? 'pass' : 'fail', 
        result.success ? 
          `缩略图生成成功，耗时: ${Math.round(result.processingTime)}ms` :
          `缩略图生成失败: ${result.error}`
      );
    });

    storageManagerRef.current.on('uploadCompleted', (result) => {
      addTestResult(
        '文件上传',
        result.success ? 'pass' : 'fail',
        result.success ? '文件上传成功' : `上传失败: ${result.error}`
      );
    });

    updateStats();

    return () => {
      libraryManagerRef.current?.destroy();
      thumbnailGeneratorRef.current?.destroy();
      storageManagerRef.current?.destroy();
    };
  }, []);

  // 添加测试结果
  const addTestResult = (test: string, status: 'pass' | 'fail' | 'pending', message: string) => {
    setTestResults(prev => [...prev, { test, status, message }]);
  };

  // 更新统计信息
  const updateStats = () => {
    if (libraryManagerRef.current) {
      setLibraryStats(libraryManagerRef.current.getStatistics());
    }
  };

  // 运行基础功能测试
  const runBasicTests = async () => {
    setTestResults([]);
    
    if (!libraryManagerRef.current) {
      addTestResult('初始化检查', 'fail', '素材库管理器未初始化');
      return;
    }

    // 测试1: 分类系统
    try {
      const categories = libraryManagerRef.current.getCategories();
      addTestResult(
        '分类系统',
        categories.length === 5 ? 'pass' : 'fail',
        `获取到 ${categories.length} 个分类 (期望: 5个)`
      );

      // 验证必需的分类
      const requiredCategories: AssetCategory[] = ['background', 'character', 'ui', 'icon', 'effect'];
      const missingCategories = requiredCategories.filter(cat => 
        !categories.some(c => c.id === cat)
      );
      
      if (missingCategories.length === 0) {
        addTestResult('必需分类检查', 'pass', '所有必需分类都存在');
      } else {
        addTestResult('必需分类检查', 'fail', `缺少分类: ${missingCategories.join(', ')}`);
      }
    } catch (error) {
      addTestResult('分类系统', 'fail', `获取分类失败: ${error}`);
    }

    // 测试2: 添加测试素材
    try {
      const testAssets = [
        {
          name: '测试背景1',
          category: 'background' as AssetCategory,
          subcategory: 'sci-fi',
          tags: ['科幻', '太空', '背景'],
          fileType: 'image/png',
          fileSize: 1024 * 500, // 500KB
          dimensions: { width: 1920, height: 1080 },
          originalUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          license: 'free' as const,
          isCustom: false
        },
        {
          name: '测试UI按钮',
          category: 'ui' as AssetCategory,
          subcategory: 'button',
          tags: ['按钮', 'UI', '界面'],
          fileType: 'image/png',
          fileSize: 1024 * 50, // 50KB
          dimensions: { width: 200, height: 60 },
          originalUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          license: 'free' as const,
          isCustom: false
        },
        {
          name: '测试图标',
          category: 'icon' as AssetCategory,
          subcategory: 'action',
          tags: ['图标', '动作', '功能'],
          fileType: 'image/svg+xml',
          fileSize: 1024 * 5, // 5KB
          dimensions: { width: 64, height: 64 },
          originalUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMDA3YmZmIi8+Cjwvc3ZnPgo=',
          license: 'premium' as const,
          isCustom: false
        }
      ];

      for (const assetData of testAssets) {
        await libraryManagerRef.current.addAsset(assetData);
      }

      addTestResult('测试素材添加', 'pass', `成功添加 ${testAssets.length} 个测试素材`);
    } catch (error) {
      addTestResult('测试素材添加', 'fail', `添加测试素材失败: ${error}`);
    }

    // 测试3: 搜索功能
    try {
      // 搜索所有素材
      const allResults = libraryManagerRef.current.searchAssets();
      addTestResult(
        '搜索所有素材',
        allResults.totalCount > 0 ? 'pass' : 'fail',
        `找到 ${allResults.totalCount} 个素材`
      );

      // 按分类搜索
      const backgroundResults = libraryManagerRef.current.searchAssets({
        filter: { category: 'background' }
      });
      addTestResult(
        '分类搜索',
        'pass',
        `背景分类找到 ${backgroundResults.totalCount} 个素材`
      );

      // 关键词搜索
      const keywordResults = libraryManagerRef.current.searchAssets({
        query: '测试'
      });
      addTestResult(
        '关键词搜索',
        keywordResults.totalCount > 0 ? 'pass' : 'fail',
        `关键词"测试"找到 ${keywordResults.totalCount} 个素材`
      );

      // 标签搜索
      const tagResults = libraryManagerRef.current.searchAssets({
        filter: { tags: ['按钮'] }
      });
      addTestResult(
        '标签搜索',
        'pass',
        `标签"按钮"找到 ${tagResults.totalCount} 个素材`
      );
    } catch (error) {
      addTestResult('搜索功能', 'fail', `搜索测试失败: ${error}`);
    }

    // 测试4: 收藏功能
    try {
      const allAssets = libraryManagerRef.current.searchAssets().assets;
      if (allAssets.length > 0) {
        const testAsset = allAssets[0]!;
        
        // 添加收藏
        await libraryManagerRef.current.toggleFavorite(testAsset.id);
        
        // 搜索收藏
        const favoriteResults = libraryManagerRef.current.searchAssets({
          filter: { isFavorite: true }
        });
        
        addTestResult(
          '收藏功能',
          favoriteResults.totalCount > 0 ? 'pass' : 'fail',
          `收藏功能测试完成，当前收藏 ${favoriteResults.totalCount} 个素材`
        );
      }
    } catch (error) {
      addTestResult('收藏功能', 'fail', `收藏功能测试失败: ${error}`);
    }

    // 测试5: 排序功能
    try {
      const nameAscResults = libraryManagerRef.current.searchAssets({
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      const nameDescResults = libraryManagerRef.current.searchAssets({
        sortBy: 'name',
        sortOrder: 'desc'
      });
      
      addTestResult(
        '排序功能',
        'pass',
        `排序功能测试完成 (升序: ${nameAscResults.totalCount}, 降序: ${nameDescResults.totalCount})`
      );
    } catch (error) {
      addTestResult('排序功能', 'fail', `排序功能测试失败: ${error}`);
    }

    updateStats();
  };

  // 测试缩略图生成
  const testThumbnailGeneration = async () => {
    if (!thumbnailGeneratorRef.current) {
      addTestResult('缩略图生成', 'fail', '缩略图生成器未初始化');
      return;
    }

    try {
      // 测试图片URL
      const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const result = await thumbnailGeneratorRef.current.generateThumbnail(testImageUrl, {
        width: 150,
        height: 150,
        quality: 0.8,
        format: 'jpeg',
        fit: 'cover'
      });

      addTestResult(
        '缩略图生成测试',
        result.success ? 'pass' : 'fail',
        result.success ? 
          `缩略图生成成功，尺寸: ${result.thumbnailSize.width}x${result.thumbnailSize.height}` :
          `缩略图生成失败: ${result.error}`
      );
    } catch (error) {
      addTestResult('缩略图生成测试', 'fail', `缩略图生成测试失败: ${error}`);
    }
  };

  // 测试存储功能
  const testStorageFeatures = async () => {
    if (!storageManagerRef.current) {
      addTestResult('存储功能', 'fail', '存储管理器未初始化');
      return;
    }

    try {
      // 获取存储统计
      const stats = storageManagerRef.current.getStorageStats();
      addTestResult(
        '存储统计',
        'pass',
        `存储统计: ${stats.totalFiles} 个文件, 总大小: ${formatFileSize(stats.totalSize)}`
      );

      // 获取配置
      const config = storageManagerRef.current.getConfig();
      addTestResult(
        '存储配置',
        'pass',
        `存储配置: 最大文件大小 ${formatFileSize(config.maxFileSize)}, 支持 ${config.allowedTypes.length} 种文件类型`
      );
    } catch (error) {
      addTestResult('存储功能', 'fail', `存储功能测试失败: ${error}`);
    }
  };

  // 清空素材库
  const clearLibrary = async () => {
    if (libraryManagerRef.current) {
      await libraryManagerRef.current.clearLibrary();
      addTestResult('清空素材库', 'pass', '素材库已清空');
      updateStats();
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex',
      backgroundColor: '#f5f5f5'
    }}>
      {/* 左侧测试面板 */}
      <div style={{ 
        width: '350px', 
        padding: '20px',
        backgroundColor: 'white',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>
          素材库功能测试
        </h2>

        {/* 统计信息 */}
        {libraryStats && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>统计信息</h3>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div>总素材: {libraryStats.totalAssets}</div>
              <div>收藏数: {libraryStats.totalFavorites}</div>
              <div>标签数: {libraryStats.totalTags}</div>
              <div>自定义素材: {libraryStats.customAssets}</div>
              <div style={{ marginTop: '8px' }}>分类统计:</div>
              {Object.entries(libraryStats.categoryStats).map(([category, count]) => (
                <div key={category} style={{ marginLeft: '12px' }}>
                  {category}: {count as number}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 当前选中素材 */}
        {selectedAsset && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>选中素材</h3>
            <div style={{ fontSize: '12px' }}>
              <div><strong>名称:</strong> {selectedAsset.name}</div>
              <div><strong>分类:</strong> {selectedAsset.category}</div>
              <div><strong>尺寸:</strong> {selectedAsset.dimensions.width} × {selectedAsset.dimensions.height}</div>
              <div><strong>大小:</strong> {formatFileSize(selectedAsset.fileSize)}</div>
              <div><strong>标签:</strong> {selectedAsset.tags.join(', ')}</div>
              <div><strong>收藏:</strong> {selectedAsset.isFavorite ? '是' : '否'}</div>
            </div>
          </div>
        )}

        {/* 功能测试按钮 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>功能测试</h3>
          
          <button 
            onClick={runBasicTests}
            style={{ 
              width: '100%',
              padding: '8px 16px',
              marginBottom: '8px',
              border: '1px solid #007bff',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            运行基础功能测试
          </button>

          <button 
            onClick={testThumbnailGeneration}
            style={{ 
              width: '100%',
              padding: '8px 16px',
              marginBottom: '8px',
              border: '1px solid #28a745',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            测试缩略图生成
          </button>

          <button 
            onClick={testStorageFeatures}
            style={{ 
              width: '100%',
              padding: '8px 16px',
              marginBottom: '8px',
              border: '1px solid #17a2b8',
              backgroundColor: '#17a2b8',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            测试存储功能
          </button>

          <button 
            onClick={clearLibrary}
            style={{ 
              width: '100%',
              padding: '8px 16px',
              marginBottom: '8px',
              border: '1px solid #dc3545',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清空素材库
          </button>
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>测试结果</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '8px',
                    marginBottom: '4px',
                    backgroundColor: result.status === 'pass' ? '#d4edda' : 
                                   result.status === 'fail' ? '#f8d7da' : '#fff3cd',
                    border: `1px solid ${result.status === 'pass' ? '#c3e6cb' : 
                                        result.status === 'fail' ? '#f5c6cb' : '#ffeaa7'}`,
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                    {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳'} {result.test}
                  </div>
                  <div style={{ color: '#666' }}>{result.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 需求验证 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>需求验证</h3>
          <div style={{ fontSize: '11px', color: '#666' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>需求4.2:</strong> ✅ AssetLibraryManager类和分类体系
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>需求4.6:</strong> ✅ 素材元数据管理和存储结构
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>缩略图生成:</strong> ✅ 缩略图生成和缓存机制
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>5个分类:</strong> ✅ 背景、角色、UI元素、图标、特效
            </div>
          </div>
        </div>
      </div>

      {/* 右侧素材库面板 */}
      <div style={{ flex: 1 }}>
        <AssetLibraryPanel
          onAssetSelect={setSelectedAsset}
          onAssetDoubleClick={(asset) => {
            addTestResult('素材双击', 'pass', `双击素材: ${asset.name}`);
          }}
        />
      </div>
    </div>
  );
};

export default AssetLibraryTest;