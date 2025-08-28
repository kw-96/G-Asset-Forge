/**
 * 素材重命名对话框组件
 */
import React, { useCallback, useEffect, useState } from 'react';
import { IAssetMetadata } from './types';

interface IAssetRenameDialogProps {
  asset: IAssetMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (asset: IAssetMetadata, newName: string) => Promise<void>;
}

export const AssetRenameDialog: React.FC<IAssetRenameDialogProps> = ({
  asset,
  isOpen,
  onClose,
  onRename,
}) => {
  const [newName, setNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // 当对话框打开时，设置初始名称
  useEffect(() => {
    if (isOpen && asset) {
      setNewName(asset.name);
    }
  }, [isOpen, asset]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!asset || !newName.trim()) {
        return;
      }

      if (newName.trim() === asset.name) {
        onClose();
        return;
      }

      setIsRenaming(true);
      try {
        await onRename(asset, newName.trim());
        onClose();
      } catch (error) {
        console.error('重命名失败:', error);
        alert('重命名失败，请重试');
      } finally {
        setIsRenaming(false);
      }
    },
    [asset, newName, onRename, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen || !asset) {
    return null;
  }

  return (
    <div className="asset-rename-dialog-overlay">
      <div className="asset-rename-dialog">
        <div className="dialog-header">
          <h3>重命名素材</h3>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isRenaming}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-content">
          <div className="form-group">
            <label htmlFor="asset-name-input">素材名称</label>
            <input
              id="asset-name-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRenaming}
              autoFocus
              placeholder="请输入新的素材名称"
            />
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isRenaming}
            >
              取消
            </button>
            <button
              type="submit"
              className="rename-button"
              disabled={
                !newName.trim() || newName.trim() === asset.name || isRenaming
              }
            >
              {isRenaming ? '重命名中...' : '确定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
