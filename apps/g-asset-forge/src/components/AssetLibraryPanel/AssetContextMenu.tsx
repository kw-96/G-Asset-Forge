/**
 * 素材右键菜单组件
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { IAssetMetadata } from './types';

interface IAssetContextMenuProps {
  asset: IAssetMetadata | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onRename: (asset: IAssetMetadata) => void;
  onDelete: (asset: IAssetMetadata) => void;
  onExport: (asset: IAssetMetadata) => void;
  onToggleFavorite: (asset: IAssetMetadata) => void;
}

export const AssetContextMenu: React.FC<IAssetContextMenuProps> = ({
  asset,
  position,
  onClose,
  onRename,
  onDelete,
  onExport,
  onToggleFavorite,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (position) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [position, onClose]);

  // ESC键关闭菜单
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (position) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [position, onClose]);

  const handleRename = useCallback(() => {
    if (asset) {
      onRename(asset);
      onClose();
    }
  }, [asset, onRename, onClose]);

  const handleDelete = useCallback(() => {
    if (asset) {
      onDelete(asset);
      onClose();
    }
  }, [asset, onDelete, onClose]);

  const handleExport = useCallback(() => {
    if (asset) {
      onExport(asset);
      onClose();
    }
  }, [asset, onExport, onClose]);

  const handleToggleFavorite = useCallback(() => {
    if (asset) {
      onToggleFavorite(asset);
      onClose();
    }
  }, [asset, onToggleFavorite, onClose]);

  if (!asset || !position) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="asset-context-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '160px',
        padding: '4px 0',
      }}
    >
      <button
        type="button"
        className="context-menu-item"
        onClick={handleRename}
      >
        <span className="menu-icon">✏️</span>
        重命名
      </button>

      <button
        type="button"
        className="context-menu-item"
        onClick={handleToggleFavorite}
      >
        <span className="menu-icon">{asset.isFavorite ? '💔' : '❤️'}</span>
        {asset.isFavorite ? '取消收藏' : '添加收藏'}
      </button>

      <button
        type="button"
        className="context-menu-item"
        onClick={handleExport}
      >
        <span className="menu-icon">📥</span>
        导出
      </button>

      <div className="context-menu-divider" />

      <button
        type="button"
        className="context-menu-item danger"
        onClick={handleDelete}
      >
        <span className="menu-icon">🗑️</span>
        删除
      </button>
    </div>
  );
};
