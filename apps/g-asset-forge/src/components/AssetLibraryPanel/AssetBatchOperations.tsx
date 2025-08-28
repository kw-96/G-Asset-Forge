/**
 * 素材批量操作组件
 */
import React, { useCallback, useState } from 'react';
import { IAssetMetadata, AssetCategory } from './types';

interface IAssetBatchOperationsProps {
  selectedAssets: IAssetMetadata[];
  onBatchDelete: (assetIds: string[]) => Promise<void>;
  onBatchExport: (assetIds: string[]) => Promise<void>;
  onBatchUpdateCategory: (
    assetIds: string[],
    category: AssetCategory,
  ) => Promise<void>;
  onBatchUpdateTags: (assetIds: string[], tags: string[]) => Promise<void>;
  onClearSelection: () => void;
}

export const AssetBatchOperations: React.FC<IAssetBatchOperationsProps> = ({
  selectedAssets,
  onBatchDelete,
  onBatchExport,
  onBatchUpdateCategory,
  onBatchUpdateTags,
  onClearSelection,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCategoryUpdate, setShowCategoryUpdate] = useState(false);
  const [showTagsUpdate, setShowTagsUpdate] = useState(false);
  const [newCategory, setNewCategory] = useState<AssetCategory>('ui');
  const [newTags, setNewTags] = useState('');

  const selectedIds = selectedAssets.map((asset) => asset.id);

  const handleBatchDelete = useCallback(async () => {
    if (
      !confirm(
        `确定要删除选中的 ${selectedAssets.length} 个素材吗？此操作不可撤销。`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await onBatchDelete(selectedIds);
      onClearSelection();
    } catch (error) {
      console.error('批量删除失败:', error);
      alert('批量删除失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAssets, selectedIds, onBatchDelete, onClearSelection]);

  const handleBatchExport = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onBatchExport(selectedIds);
    } catch (error) {
      console.error('批量导出失败:', error);
      alert('批量导出失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, onBatchExport]);

  const handleUpdateCategory = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onBatchUpdateCategory(selectedIds, newCategory);
      setShowCategoryUpdate(false);
      onClearSelection();
    } catch (error) {
      console.error('批量更新分类失败:', error);
      alert('批量更新分类失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, newCategory, onBatchUpdateCategory, onClearSelection]);

  const handleUpdateTags = useCallback(async () => {
    const tagList = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    if (tagList.length === 0) {
      alert('请输入至少一个标签');
      return;
    }

    setIsProcessing(true);
    try {
      await onBatchUpdateTags(selectedIds, tagList);
      setShowTagsUpdate(false);
      setNewTags('');
      onClearSelection();
    } catch (error) {
      console.error('批量更新标签失败:', error);
      alert('批量更新标签失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, newTags, onBatchUpdateTags, onClearSelection]);

  if (selectedAssets.length === 0) {
    return null;
  }

  return (
    <div className="asset-batch-operations">
      <div className="batch-header">
        <span className="selection-count">
          已选择 {selectedAssets.length} 个素材
        </span>
        <button
          type="button"
          className="clear-selection-button"
          onClick={onClearSelection}
          disabled={isProcessing}
        >
          清除选择
        </button>
      </div>

      <div className="batch-actions">
        <button
          type="button"
          className="batch-button export-button"
          onClick={handleBatchExport}
          disabled={isProcessing}
        >
          {isProcessing ? '导出中...' : '导出选中'}
        </button>

        <button
          type="button"
          className="batch-button category-button"
          onClick={() => setShowCategoryUpdate(!showCategoryUpdate)}
          disabled={isProcessing}
        >
          更改分类
        </button>

        <button
          type="button"
          className="batch-button tags-button"
          onClick={() => setShowTagsUpdate(!showTagsUpdate)}
          disabled={isProcessing}
        >
          添加标签
        </button>

        <button
          type="button"
          className="batch-button delete-button"
          onClick={handleBatchDelete}
          disabled={isProcessing}
        >
          {isProcessing ? '删除中...' : '删除选中'}
        </button>
      </div>

      {/* 分类更新面板 */}
      {showCategoryUpdate && (
        <div className="batch-update-panel">
          <div className="panel-header">
            <h4>更改分类</h4>
            <button
              type="button"
              className="close-panel-button"
              onClick={() => setShowCategoryUpdate(false)}
            >
              ×
            </button>
          </div>
          <div className="panel-content">
            <select
              title="选择分类"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as AssetCategory)}
              disabled={isProcessing}
            >
              <option value="ui">UI元素</option>
              <option value="icon">图标</option>
              <option value="background">背景</option>
              <option value="decoration">装饰</option>
              <option value="character">角色</option>
              <option value="effect">特效</option>
              <option value="texture">纹理</option>
            </select>
            <button
              type="button"
              className="apply-button"
              onClick={handleUpdateCategory}
              disabled={isProcessing}
            >
              应用
            </button>
          </div>
        </div>
      )}

      {/* 标签更新面板 */}
      {showTagsUpdate && (
        <div className="batch-update-panel">
          <div className="panel-header">
            <h4>添加标签</h4>
            <button
              type="button"
              className="close-panel-button"
              onClick={() => setShowTagsUpdate(false)}
            >
              ×
            </button>
          </div>
          <div className="panel-content">
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="输入标签，用逗号分隔"
              disabled={isProcessing}
            />
            <button
              type="button"
              className="apply-button"
              onClick={handleUpdateTags}
              disabled={isProcessing}
            >
              应用
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
