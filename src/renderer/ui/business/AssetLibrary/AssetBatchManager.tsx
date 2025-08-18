// 素材批量管理组件
import React, { useState, useCallback } from 'react';
// NOTE: 由于IAssetMetadata、AssetCategory、IAssetCategoryInfo未从AssetLibraryManager导出，需本地定义类型以修复错误
/**
 * 素材元数据接口
 */
export interface IAssetMetadata {
  previewUrl: any;
  id: string;
  name: string;
  category: string;
  tags: string[];
  license: 'free' | 'premium' | 'custom';
  favorite?: boolean;
  // TODO: 根据实际需要补充字段
}

/**
 * 素材分类类型
 */
export type AssetCategory = 'ui' | 'icon' | 'image' | 'audio' | 'video' | string;

/**
 * 素材分类信息接口
 */
export interface IAssetCategoryInfo {
  id: string;
  name: string;
  icon: string;
  subcategories: IAssetCategoryInfo[];
  count: number;
}

export interface IBatchOperation {
  type: 'delete' | 'updateCategory' | 'updateTags' | 'updateLicense' | 'toggleFavorite' | 'export';
  assetIds: string[];
  data?: any;
}

interface IAssetBatchManagerProps {
  assets: IAssetMetadata[];
  categories: IAssetCategoryInfo[];
  selectedAssets: Set<string>;
  onBatchOperation: (operation: IBatchOperation) => Promise<void>;
  onSelectionChange: (selectedAssets: Set<string>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AssetBatchManager: React.FC<IAssetBatchManagerProps> = ({
  assets,
  categories,
  selectedAssets,
  onBatchOperation,
  onSelectionChange,
  className,
  style
}) => {
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [batchCategory, setBatchCategory] = useState<AssetCategory>('ui');
  const [batchTags, setBatchTags] = useState('');
  const [batchLicense, setBatchLicense] = useState<'free' | 'premium' | 'custom'>('custom');
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationProgress, setOperationProgress] = useState<{ current: number; total: number } | null>(null);

  // 获取选中的素材
  const getSelectedAssets = useCallback((): IAssetMetadata[] => {
    return assets.filter(asset => selectedAssets.has(asset.id));
  }, [assets, selectedAssets]);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    const allSelected = assets.length > 0 && assets.every(asset => selectedAssets.has(asset.id));
    
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(assets.map(asset => asset.id)));
    }
  }, [assets, selectedAssets, onSelectionChange]);

  // 按条件选择
  const selectByCondition = useCallback((condition: 'favorites' | 'custom' | 'category', value?: string) => {
    let assetsToSelect: IAssetMetadata[] = [];
    
    switch (condition) {
      case 'favorites':
        assetsToSelect = assets.filter(asset => asset.favorite);
        break;
      case 'custom':
        assetsToSelect = assets.filter(asset => asset.license === 'custom');
        break;
      case 'category':
        if (value) {
          assetsToSelect = assets.filter(asset => asset.category === value);
        }
        break;
    }
    
    const newSelection = new Set(selectedAssets);
    assetsToSelect.forEach(asset => newSelection.add(asset.id));
    onSelectionChange(newSelection);
  }, [assets, selectedAssets, onSelectionChange]);

  // 执行批量操作
  const executeBatchOperation = useCallback(async (operation: IBatchOperation) => {
    if (operation.assetIds.length === 0) return;
    
    setIsProcessing(true);
    setOperationProgress({ current: 0, total: operation.assetIds.length });
    
    try {
      // 模拟进度更新
      const updateProgress = (current: number) => {
        setOperationProgress({ current, total: operation.assetIds.length });
      };
      
      // 分批处理以避免阻塞UI
      const batchSize = 10;
      for (let i = 0; i < operation.assetIds.length; i += batchSize) {
        const batch = operation.assetIds.slice(i, i + batchSize);
        await onBatchOperation({
          ...operation,
          assetIds: batch
        });
        updateProgress(Math.min(i + batchSize, operation.assetIds.length));
        
        // 让出控制权给UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // 清空选择
      onSelectionChange(new Set());
      setShowBatchPanel(false);
      
    } catch (error) {
      console.error('批量操作失败:', error);
    } finally {
      setIsProcessing(false);
      setOperationProgress(null);
    }
  }, [onBatchOperation, onSelectionChange]);

  // 批量删除
  const handleBatchDelete = useCallback(async () => {
    const selectedAssetsList = getSelectedAssets();
    if (selectedAssetsList.length === 0) return;
    
    const confirmMessage = `确定要删除选中的 ${selectedAssetsList.length} 个素材吗？此操作不可撤销。`;
    if (!confirm(confirmMessage)) return;
    
    await executeBatchOperation({
      type: 'delete',
      assetIds: Array.from(selectedAssets)
    });
  }, [selectedAssets, getSelectedAssets, executeBatchOperation]);

  // 批量更新分类
  const handleBatchUpdateCategory = useCallback(async () => {
    await executeBatchOperation({
      type: 'updateCategory',
      assetIds: Array.from(selectedAssets),
      data: { category: batchCategory }
    });
  }, [selectedAssets, batchCategory, executeBatchOperation]);

  // 批量更新标签
  const handleBatchUpdateTags = useCallback(async () => {
    const tags = batchTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (tags.length === 0) return;
    
    await executeBatchOperation({
      type: 'updateTags',
      assetIds: Array.from(selectedAssets),
      data: { tags }
    });
  }, [selectedAssets, batchTags, executeBatchOperation]);

  // 批量更新许可证
  const handleBatchUpdateLicense = useCallback(async () => {
    await executeBatchOperation({
      type: 'updateLicense',
      assetIds: Array.from(selectedAssets),
      data: { license: batchLicense }
    });
  }, [selectedAssets, batchLicense, executeBatchOperation]);

  // 批量切换收藏
  const handleBatchToggleFavorite = useCallback(async () => {
    await executeBatchOperation({
      type: 'toggleFavorite',
      assetIds: Array.from(selectedAssets)
    });
  }, [selectedAssets, executeBatchOperation]);

  // 批量导出
  const handleBatchExport = useCallback(async () => {
    await executeBatchOperation({
      type: 'export',
      assetIds: Array.from(selectedAssets)
    });
  }, [selectedAssets, executeBatchOperation]);

  // 获取选择统计
  const getSelectionStats = useCallback(() => {
    const selectedAssetsList = getSelectedAssets();
    const stats = {
      total: selectedAssetsList.length,
      byCategory: {} as Record<string, number>,
      byLicense: {} as Record<string, number>,
      favorites: 0,
      custom: 0
    };
    
    selectedAssetsList.forEach(asset => {
      // 分类统计
      stats.byCategory[asset.category] = (stats.byCategory[asset.category] || 0) + 1;
      
      // 许可证统计
      stats.byLicense[asset.license] = (stats.byLicense[asset.license] || 0) + 1;
      
      // 收藏统计
      if (asset.favorite) stats.favorites++;
      
      // 自定义统计
      if (asset.license === 'custom') stats.custom++;
    });
    
    return stats;
  }, [getSelectedAssets]);

  const selectionStats = getSelectionStats();

  if (selectedAssets.size === 0) {
    return (
      <div className={className} style={{
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#666',
        fontSize: '12px',
        ...style
      }}>
        选择素材以进行批量操作
      </div>
    );
  }

  return (
    <div className={className} style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      overflow: 'hidden',
      ...style
    }}>
      {/* 选择状态栏 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#e3f2fd',
        borderBottom: '1px solid #bbdefb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1976d2' }}>
            已选择 {selectedAssets.size} 个素材
          </span>
          
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#666' }}>
            {selectionStats.favorites > 0 && (
              <span>❤️ {selectionStats.favorites}</span>
            )}
            {selectionStats.custom > 0 && (
              <span>🔧 {selectionStats.custom}</span>
            )}
            {Object.entries(selectionStats.byCategory).map(([category, count]) => (
              <span key={category}>
                {categories.find(c => c.id === category)?.id} {count}
              </span>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={toggleSelectAll}
            style={{
              padding: '4px 8px',
              border: '1px solid #1976d2',
              backgroundColor: 'white',
              color: '#1976d2',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            {assets.length > 0 && assets.every(asset => selectedAssets.has(asset.id)) ? '取消全选' : '全选'}
          </button>
          
          <button
            type="button"
            onClick={() => onSelectionChange(new Set())}
            style={{
              padding: '4px 8px',
              border: '1px solid #dc3545',
              backgroundColor: 'white',
              color: '#dc3545',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            清空选择
          </button>
        </div>
      </div>

      {/* 快速选择 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>
          快速选择:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button
            type="button"
            onClick={() => selectByCondition('favorites')}
            style={{
              padding: '3px 8px',
              border: '1px solid #dc3545',
              backgroundColor: 'white',
              color: '#dc3545',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            ❤️ 收藏素材
          </button>
          
          <button
            type="button"
            onClick={() => selectByCondition('custom')}
            style={{
              padding: '3px 8px',
              border: '1px solid #28a745',
              backgroundColor: 'white',
              color: '#28a745',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            🔧 自定义素材
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => selectByCondition('category', category.id)}
              style={{
                padding: '3px 8px',
                border: '1px solid #007bff',
                backgroundColor: 'white',
                color: '#007bff',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              {category.id} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 批量操作按钮 */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center'
      }}>
        <button
          type="button"
          onClick={() => setShowBatchPanel(!showBatchPanel)}
          disabled={isProcessing}
          style={{
            padding: '6px 12px',
            border: `1px solid ${showBatchPanel ? '#007bff' : '#ddd'}`,
            backgroundColor: showBatchPanel ? '#007bff' : 'white',
            color: showBatchPanel ? 'white' : '#666',
            borderRadius: '4px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          ⚙️ 批量编辑
        </button>
        
        <button
          type="button"
          onClick={handleBatchToggleFavorite}
          disabled={isProcessing}
          style={{
            padding: '6px 12px',
            border: '1px solid #dc3545',
            backgroundColor: 'white',
            color: '#dc3545',
            borderRadius: '4px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          ❤️ 切换收藏
        </button>
        
        <button
          type="button"
          onClick={handleBatchExport}
          disabled={isProcessing}
          style={{
            padding: '6px 12px',
            border: '1px solid #28a745',
            backgroundColor: 'white',
            color: '#28a745',
            borderRadius: '4px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          📤 批量导出
        </button>
        
        <button
          type="button"
          onClick={handleBatchDelete}
          disabled={isProcessing}
          style={{
            padding: '6px 12px',
            border: '1px solid #dc3545',
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '4px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          🗑️ 批量删除
        </button>
      </div>

      {/* 批量编辑面板 */}
      {showBatchPanel && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0'
        }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold' }}>
            批量编辑 ({selectedAssets.size} 个素材)
          </h5>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* 批量更新分类 */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                更新分类
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value as AssetCategory)}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.id} {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleBatchUpdateCategory}
                  disabled={isProcessing}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '3px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontSize: '10px'
                  }}
                >
                  应用
                </button>
              </div>
            </div>

            {/* 批量添加标签 */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                添加标签
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  value={batchTags}
                  onChange={(e) => setBatchTags(e.target.value)}
                  disabled={isProcessing}
                  placeholder="标签1,标签2,标签3"
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
                <button
                  type="button"
                  onClick={handleBatchUpdateTags}
                  disabled={isProcessing || !batchTags.trim()}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: batchTags.trim() ? '#28a745' : '#6c757d',
                    color: 'white',
                    borderRadius: '3px',
                    cursor: (isProcessing || !batchTags.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '10px'
                  }}
                >
                  添加
                </button>
              </div>
            </div>

            {/* 批量更新许可证 */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                更新许可证
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <select
                  value={batchLicense}
                  onChange={(e) => setBatchLicense(e.target.value as 'free' | 'premium' | 'custom')}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                >
                  <option value="free">🆓 免费</option>
                  <option value="premium">💎 付费</option>
                  <option value="custom">🔧 自定义</option>
                </select>
                <button
                  type="button"
                  onClick={handleBatchUpdateLicense}
                  disabled={isProcessing}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: '#ffc107',
                    color: 'white',
                    borderRadius: '3px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontSize: '10px'
                  }}
                >
                  应用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 操作进度 */}
      {operationProgress && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#e3f2fd',
          borderTop: '1px solid #bbdefb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
              正在处理...
            </span>
            <span style={{ fontSize: '11px', color: '#666' }}>
              {operationProgress.current} / {operationProgress.total}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e9ecef',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(operationProgress.current / operationProgress.total) * 100}%`,
              height: '100%',
              backgroundColor: '#007bff',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetBatchManager;