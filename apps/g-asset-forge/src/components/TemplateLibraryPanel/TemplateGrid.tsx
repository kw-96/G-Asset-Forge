/**
 * 模板网格组件 - 基于现有的Cards组件实现模板卡片视图
 */
import React from 'react';

import { TemplateCard } from './TemplateCard';
import { type ITemplateMetadata, type ViewMode } from './types';

interface ITemplateGridProps {
  templates: ITemplateMetadata[];
  viewMode: ViewMode;
  selectedTemplate?: ITemplateMetadata;
  isLoading?: boolean;
  onTemplateSelect?: (template: ITemplateMetadata) => void;
  onTemplatePreview?: (template: ITemplateMetadata) => void;
  onTemplateApply?: (template: ITemplateMetadata) => void;
  onTemplateEdit?: (template: ITemplateMetadata) => void;
  onToggleFavorite?: (template: ITemplateMetadata, e: React.MouseEvent) => void;
  onTemplateDelete?: (template: ITemplateMetadata) => void;
  onTemplateExport?: (template: ITemplateMetadata) => void;
}

export const TemplateGrid: React.FC<ITemplateGridProps> = ({
  templates,
  viewMode,
  selectedTemplate,
  isLoading = false,
  onTemplateSelect,
  onTemplatePreview,
  onTemplateApply,
  onTemplateEdit,
  onToggleFavorite,
}) => {
  if (isLoading) {
    return (
      <div className="template-grid-loading">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>加载模板中...</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="template-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>暂无模板</h3>
          <p>没有找到符合条件的模板，请尝试调整筛选条件</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`template-grid template-grid-${viewMode}`}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          viewMode={viewMode}
          isSelected={selectedTemplate?.id === template.id}
          onSelect={onTemplateSelect}
          onPreview={onTemplatePreview}
          onApply={onTemplateApply}
          onEdit={onTemplateEdit}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
