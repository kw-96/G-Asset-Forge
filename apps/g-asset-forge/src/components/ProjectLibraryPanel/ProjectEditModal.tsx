/**
 * 项目编辑模态框组件 - 基于现有的表单和按钮组件创建项目编辑界面
 */
import React, { useCallback, useEffect, useState } from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';
import { type IProjectMetadata, type ProjectCategory } from './types';

interface IProjectEditModalProps {
  isOpen: boolean;
  mode: 'create' | 'rename' | 'delete';
  project?: IProjectMetadata;
  onClose: () => void;
  onConfirm: (data: any) => void;
  isLoading?: boolean;
}

export const ProjectEditModal: React.FC<IProjectEditModalProps> = ({
  isOpen,
  mode,
  project,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'design' as 'design' | 'h5',
    category: 'other' as ProjectCategory,
    template: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单数据
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setFormData({
          name: '',
          description: '',
          type: 'design',
          category: 'other',
          template: '',
        });
      } else if (mode === 'rename' && project) {
        setFormData({
          name: project.name,
          description: project.description,
          type: project.type,
          category: project.category,
          template: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, project]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '项目名称不能为空';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = '项目名称不能超过50个字符';
    }

    if (formData.description.length > 200) {
      newErrors.description = '项目描述不能超过200个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // 清除对应字段的错误
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    },
    [errors],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (mode === 'create') {
        onConfirm({
          name: formData.name.trim(),
          description: formData.description.trim(),
          type: formData.type,
          category: formData.category,
          template: formData.template || undefined,
        });
      } else if (mode === 'rename') {
        onConfirm({
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
      } else if (mode === 'delete') {
        onConfirm(project);
      }
    },
    [mode, formData, project, onConfirm, validateForm],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit(e as any);
      }
    },
    [onClose, handleSubmit],
  );

  if (!isOpen) {
    return null;
  }

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return '创建新项目';
      case 'rename':
        return '编辑项目';
      case 'delete':
        return '删除项目';
      default:
        return '';
    }
  };

  const getConfirmButtonText = () => {
    if (isLoading) {
      switch (mode) {
        case 'create':
          return '创建中...';
        case 'rename':
          return '保存中...';
        case 'delete':
          return '删除中...';
        default:
          return '处理中...';
      }
    }

    switch (mode) {
      case 'create':
        return '创建项目';
      case 'rename':
        return '保存更改';
      case 'delete':
        return '确认删除';
      default:
        return '确认';
    }
  };

  return (
    <div className="project-edit-modal-overlay" onKeyDown={handleKeyDown}>
      <div className="project-edit-modal">
        {/* 模态框头部 */}
        <div className="modal-header">
          <h3 className="modal-title">{getModalTitle()}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            <SvgIcon name="icon.24.close" size={16} />
          </button>
        </div>

        {/* 模态框内容 */}
        <form className="modal-content" onSubmit={handleSubmit}>
          {mode === 'delete' ? (
            <div className="delete-confirmation">
              <div className="warning-icon">
                <SvgIcon name="icon.24.warning" size={48} />
              </div>
              <p className="delete-message">
                确定要删除项目 <strong>"{project?.name}"</strong> 吗？
              </p>
              <p className="delete-warning">
                此操作不可撤销，项目文件将被永久删除。
              </p>
            </div>
          ) : (
            <div className="form-fields">
              {/* 项目名称 */}
              <div className="form-field">
                <label htmlFor="project-name" className="field-label">
                  项目名称 *
                </label>
                <input
                  id="project-name"
                  type="text"
                  className={`field-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="输入项目名称"
                  disabled={isLoading}
                  maxLength={50}
                />
                {errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>

              {/* 项目描述 */}
              <div className="form-field">
                <label htmlFor="project-description" className="field-label">
                  项目描述
                </label>
                <textarea
                  id="project-description"
                  className={`field-textarea ${
                    errors.description ? 'error' : ''
                  }`}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="输入项目描述（可选）"
                  disabled={isLoading}
                  maxLength={200}
                  rows={3}
                />
                {errors.description && (
                  <span className="field-error">{errors.description}</span>
                )}
              </div>

              {mode === 'create' && (
                <>
                  {/* 项目类型 */}
                  <div className="form-field">
                    <label htmlFor="project-type" className="field-label">
                      项目类型
                    </label>
                    <select
                      id="project-type"
                      className="field-select"
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange('type', e.target.value)
                      }
                      disabled={isLoading}
                    >
                      <option value="design">设计模式</option>
                      <option value="h5">H5长图</option>
                    </select>
                  </div>

                  {/* 项目分类 */}
                  <div className="form-field">
                    <label htmlFor="project-category" className="field-label">
                      项目分类
                    </label>
                    <select
                      id="project-category"
                      className="field-select"
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange('category', e.target.value)
                      }
                      disabled={isLoading}
                    >
                      <option value="other">其他</option>
                      <option value="design">设计</option>
                      <option value="h5">H5</option>
                      <option value="demo">示例</option>
                    </select>
                  </div>

                  {/* 项目模板 */}
                  <div className="form-field">
                    <label htmlFor="project-template" className="field-label">
                      项目模板
                    </label>
                    <select
                      id="project-template"
                      className="field-select"
                      value={formData.template}
                      onChange={(e) =>
                        handleInputChange('template', e.target.value)
                      }
                      disabled={isLoading}
                    >
                      <option value="">无模板</option>
                      <option value="basic-design">基础设计模板</option>
                      <option value="basic-h5">基础H5模板</option>
                      <option value="game-ui">游戏UI模板</option>
                      <option value="activity-poster">活动海报模板</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </form>

        {/* 模态框底部 */}
        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </button>
          <button
            type="button"
            className={`modal-btn ${mode === 'delete' ? 'danger' : 'primary'}`}
            onClick={handleSubmit}
            disabled={isLoading || (mode !== 'delete' && !formData.name.trim())}
          >
            {getConfirmButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};
