/**
 * 模板卡片组件 - 基于现有的BaseCard组件实现
 */
import React, { useCallback, useState } from 'react';

import { BaseCard } from '../Cards/BaseCard';
import { SvgIcon } from '../SvgIcon/SvgIcon';
import { type ITemplateMetadata, type ViewMode } from './types';

interface ITemplateCardProps {
  template: ITemplateMetadata;
  viewMode: ViewMode;
  isSelected?: boolean;
  onSelect?: (template: ITemplateMetadata) => void;
  onPreview?: (template: ITemplateMetadata) => void;
  onApply?: (template: ITemplateMetadata) => void;
  onEdit?: (template: ITemplateMetadata) => void;
  onToggleFavorite?: (template: ITemplateMetadata, e: React.MouseEvent) => void;
}

export const TemplateCard: React.FC<ITemplateCardProps> = ({
  template,
  viewMode,
  isSelected = false,
  onSelect,
  onPreview,
  onApply,
  onEdit,
  onToggleFavorite,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = useCallback(() => {
    onSelect?.(template);
  }, [template, onSelect]);

  const handlePreviewClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPreview?.(template);
    },
    [template, onPreview],
  );

  const handleApplyClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onApply?.(template);
    },
    [template, onApply],
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(template);
    },
    [template, onEdit],
  );

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(template, e);
    },
    [template, onToggleFavorite],
  );

  const getCategoryColor = useCallback((category: string): string => {
    const colors: Record<string, string> = {
      game: '#007bff',
      ui: '#28a745',
      icon: '#17a2b8',
      background: '#6f42c1',
      general: '#6c757d',
      activity: '#fd7e14',
      poster: '#dc3545',
      banner: '#20c997',
    };
    return colors[category] || '#6c757d';
  }, []);

  const getTypeColor = useCallback((type: string): string => {
    return type === 'h5' ? '#e83e8c' : '#007bff';
  }, []);

  if (viewMode === 'list') {
    return (
      <div
        className={`template-card-list ${isSelected ? 'selected' : ''} ${
          isHovered ? 'hovered' : ''
        }`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 缩略图 */}
        <div className="template-thumbnail">
          {template.thumbnail && !imageError ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="template-placeholder">
              <SvgIcon
                name="icon.24.file.design.mods"
                size={32}
                title={template.name}
              />
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <div className="template-info">
          <div className="template-header">
            <h4 className="template-name" title={template.name}>
              {template.name}
            </h4>
            <button
              type="button"
              className="favorite-btn"
              onClick={handleFavoriteClick}
            >
              {template.isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <p className="template-description" title={template.description}>
            {template.description}
          </p>

          <div className="template-meta">
            <span
              className="category-tag"
              style={{ backgroundColor: getCategoryColor(template.category) }}
            >
              {template.category}
            </span>
            <span
              className="type-tag"
              style={{ backgroundColor: getTypeColor(template.type) }}
            >
              {template.type === 'h5' ? 'H5长图' : '设计模式'}
            </span>
            <span className="usage-count">使用 {template.usageCount} 次</span>
            {template.rating && (
              <span className="rating">⭐ {template.rating.toFixed(1)}</span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="template-actions">
          <button
            type="button"
            className="action-btn secondary"
            onClick={handlePreviewClick}
          >
            预览
          </button>
          {template.isCustom && (
            <button
              type="button"
              className="action-btn secondary"
              onClick={handleEditClick}
            >
              编辑
            </button>
          )}
          <button
            type="button"
            className="action-btn primary"
            onClick={handleApplyClick}
          >
            应用
          </button>
        </div>
      </div>
    );
  }

  // 网格视图
  return (
    <BaseCard>
      <div
        className={`template-card-grid ${isSelected ? 'selected' : ''} ${
          isHovered ? 'hovered' : ''
        }`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 收藏按钮 */}
        <button
          type="button"
          className="favorite-btn-overlay"
          onClick={handleFavoriteClick}
          style={{
            opacity: isHovered || template.isFavorite ? 1 : 0,
          }}
        >
          {template.isFavorite ? '❤️' : '🤍'}
        </button>

        {/* 缩略图区域 */}
        <div className="template-thumbnail-grid">
          {template.thumbnail && !imageError ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="template-placeholder">
              <SvgIcon
                name="icon.24.file.design.mods"
                size={48}
                title={template.name}
              />
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <div className="template-info-grid">
          <h4 className="template-name" title={template.name}>
            {template.name}
          </h4>

          <p className="template-description" title={template.description}>
            {template.description}
          </p>

          <div className="template-meta-grid">
            <div className="template-tags">
              <span
                className="category-tag"
                style={{ backgroundColor: getCategoryColor(template.category) }}
              >
                {template.category}
              </span>
              <span
                className="type-tag"
                style={{ backgroundColor: getTypeColor(template.type) }}
              >
                {template.type === 'h5' ? 'H5' : '设计'}
              </span>
            </div>
            <div className="template-stats">
              <span className="usage-count">{template.usageCount}次</span>
              {template.rating && (
                <span className="rating">⭐{template.rating.toFixed(1)}</span>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="template-actions-grid">
            <button
              type="button"
              className="action-btn secondary"
              onClick={handlePreviewClick}
            >
              预览
            </button>
            <button
              type="button"
              className="action-btn primary"
              onClick={handleApplyClick}
            >
              应用
            </button>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};
