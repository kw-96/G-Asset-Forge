/**
 * 重构后的模板库面板主组件
 * 集成真实数据服务，替换占位实现
 */
import './TemplateLibraryPanel.scss';

import type { TemplateCategory, TemplateData } from '@g-asset-forge/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useTemplateLibrary } from '../../hooks/useTemplateLibrary';
import { TemplateEditModal } from './TemplateEditModal';
import { TemplateFilterPanel } from './TemplateFilterPanel';
import { TemplateGrid } from './TemplateGrid';
import { TemplateLibraryToolbar } from './TemplateLibraryToolbar';
import { TemplateSearchBar } from './TemplateSearchBar';
import {
  type ITemplateCategoryInfo,
  type ITemplateLibraryPanelProps,
  type ITemplateMetadata,
  type ITemplateSearchOptions,
  type ViewMode,
} from './types';

export const TemplateLibraryPanel: React.FC<ITemplateLibraryPanelProps> = ({
  onTemplateSelect,
  onTemplatePreview,
  onTemplateApply,
  onTemplateEdit,
  onTemplateSave,
  className,
  style,
}) => {
  // 使用模板库 Hook
  const {
    isLoading,
    error,
    templates,
    categories,
    availableTags,
    totalCount,
    searchTemplates,
    applyTemplateToNewProject,
    exportTemplate,
    importTemplateFile,
    deleteTemplate,
    clearError,
  } = useTemplateLibrary();

  // 状态管理
  const [searchOptions, setSearchOptions] = useState<
    Partial<ITemplateSearchOptions>
  >({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTemplate, setSelectedTemplate] =
    useState<ITemplateMetadata | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ITemplateMetadata | null>(null);

  // 转换数据格式以兼容现有UI组件
  const convertedTemplates = useMemo(() => {
    return templates.map(
      (template: TemplateData): ITemplateMetadata => ({
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        category: template.categoryId as any,
        tags: template.tags,
        previewImages: template.previewImages,
        variables: template.variables,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        usageCount: template.usageCount,
        rating: 4.5, // 默认评分，后续可扩展
        license: 'free', // 默认许可，后续可扩展
        thumbnail: template.thumbnail,
      }),
    );
  }, [templates]);

  const convertedCategories = useMemo(() => {
    return categories.map(
      (category: TemplateCategory): ITemplateCategoryInfo => ({
        id: category.id as any,
        name: category.name,
        description: category.name, // 使用名称作为描述
      }),
    );
  }, [categories]);

  // 当搜索条件或排序改变时，重新搜索
  useEffect(() => {
    const performSearch = async () => {
      try {
        await searchTemplates({
          keyword: searchOptions.query,
          type: searchOptions.type as any,
          categoryId: searchOptions.category,
          tags: searchOptions.tags,
          sortBy: sortBy as any,
          sortOrder,
        });
      } catch (err) {
        console.error('搜索模板失败:', err);
      }
    };

    performSearch();
  }, [searchOptions, sortBy, sortOrder, searchTemplates]);

  // 事件处理
  const handleSearch = useCallback(
    (options: Partial<ITemplateSearchOptions>) => {
      setSearchOptions((prev) => ({ ...prev, ...options }));
    },
    [],
  );

  const handleFilterChange = useCallback(
    (filter: Partial<ITemplateSearchOptions>) => {
      setSearchOptions(filter);
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    setSearchOptions({});
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    },
    [],
  );

  const handleTemplateSelect = useCallback(
    (template: ITemplateMetadata) => {
      setSelectedTemplate(template);
      onTemplateSelect?.(template);
    },
    [onTemplateSelect],
  );

  const handleTemplatePreview = useCallback(
    (template: ITemplateMetadata) => {
      onTemplatePreview?.(template);
    },
    [onTemplatePreview],
  );

  const handleTemplateApply = useCallback(
    async (template: ITemplateMetadata) => {
      try {
        // 应用模板到新项目
        const result = await applyTemplateToNewProject(template.id);
        onTemplateApply?.(template, result);
      } catch (err) {
        console.error('应用模板失败:', err);
      }
    },
    [applyTemplateToNewProject, onTemplateApply],
  );

  const handleTemplateEdit = useCallback(
    (template: ITemplateMetadata) => {
      setEditingTemplate(template);
      setShowEditModal(true);
      onTemplateEdit?.(template);
    },
    [onTemplateEdit],
  );

  const handleToggleFavorite = useCallback(
    (template: ITemplateMetadata, e: React.MouseEvent) => {
      e.stopPropagation();
      // TODO: 实现收藏功能
      console.log('切换收藏状态:', template.name);
    },
    [],
  );

  const handleCreateTemplate = useCallback(() => {
    setEditingTemplate(null);
    setShowEditModal(true);
  }, []);

  const handleImportTemplate = useCallback(async () => {
    try {
      // 创建文件输入元素
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const result = await importTemplateFile(file);
            console.log('导入模板成功:', result);
          } catch (err) {
            console.error('导入模板失败:', err);
          }
        }
      };
      input.click();
    } catch (err) {
      console.error('导入模板失败:', err);
    }
  }, [importTemplateFile]);

  const handleTemplateSave = useCallback(
    (templateData: Partial<ITemplateMetadata>) => {
      onTemplateSave?.(templateData);
      setShowEditModal(false);
      setEditingTemplate(null);
    },
    [onTemplateSave],
  );

  const handleTemplateDelete = useCallback(
    async (template: ITemplateMetadata) => {
      try {
        await deleteTemplate(template.id);
        console.log('删除模板成功:', template.name);
      } catch (err) {
        console.error('删除模板失败:', err);
      }
    },
    [deleteTemplate],
  );

  const handleTemplateExport = useCallback(
    async (template: ITemplateMetadata) => {
      try {
        const exportData = await exportTemplate(template.id);

        // 创建下载链接
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('导出模板成功:', template.name);
      } catch (err) {
        console.error('导出模板失败:', err);
      }
    },
    [exportTemplate],
  );

  return (
    <div className={`template-library-panel ${className || ''}`} style={style}>
      {/* 搜索栏 */}
      <div className="search-section">
        <TemplateSearchBar
          onSearch={handleSearch}
          placeholder="搜索模板名称、标签..."
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && <div className="loading-message">正在加载模板...</div>}

      {/* 工具栏 */}
      <TemplateLibraryToolbar
        viewMode={viewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        totalCount={totalCount}
        onViewModeChange={setViewMode}
        onSortChange={handleSortChange}
        onCreateTemplate={handleCreateTemplate}
        onImportTemplate={handleImportTemplate}
        onFilterToggle={() => setShowFilter(!showFilter)}
        showFilter={showFilter}
      />

      {/* 筛选面板 */}
      {showFilter && (
        <div className="filter-section">
          <TemplateFilterPanel
            categories={convertedCategories}
            availableTags={availableTags}
            currentFilter={searchOptions}
            onFilterChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        </div>
      )}

      {/* 模板网格 */}
      <div className="templates-section">
        <TemplateGrid
          templates={convertedTemplates}
          viewMode={viewMode}
          selectedTemplate={selectedTemplate || undefined}
          onTemplateSelect={handleTemplateSelect}
          onTemplatePreview={handleTemplatePreview}
          onTemplateApply={handleTemplateApply}
          onTemplateEdit={handleTemplateEdit}
          onToggleFavorite={handleToggleFavorite}
          onTemplateDelete={handleTemplateDelete}
          onTemplateExport={handleTemplateExport}
        />
      </div>

      {/* 编辑模态框 */}
      <TemplateEditModal
        template={editingTemplate || undefined}
        categories={convertedCategories}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTemplate(null);
        }}
        onSave={handleTemplateSave}
      />
    </div>
  );
};
