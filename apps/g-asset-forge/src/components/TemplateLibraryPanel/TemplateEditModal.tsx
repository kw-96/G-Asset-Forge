/**
 * 模板编辑弹窗组件 - 基于现有的表单组件创建模板编辑和保存界面
 */
// import { Button } from '@g-asset-forge/components';
import React, { useCallback, useState } from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';
import {
  type ITemplateCategoryInfo,
  type ITemplateMetadata,
  type ITemplateVariable,
  type TemplateCategory,
} from './types';

interface ITemplateEditModalProps {
  template?: ITemplateMetadata;
  categories: ITemplateCategoryInfo[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Partial<ITemplateMetadata>) => void;
  className?: string;
}

export const TemplateEditModal: React.FC<ITemplateEditModalProps> = ({
  template,
  categories,
  isOpen,
  onClose,
  onSave,
  className,
}) => {
  const [formData, setFormData] = useState<Partial<ITemplateMetadata>>(() => ({
    name: template?.name || '',
    description: template?.description || '',
    type: template?.type || 'design',
    category: template?.category || 'general',
    tags: template?.tags || [],
    variables: template?.variables || [],
    license: template?.license || 'free',
  }));

  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState<Partial<ITemplateVariable>>({
    name: '',
    type: 'text',
    defaultValue: '',
    targetObjectIds: [],
    targetProperty: '',
  });

  const handleInputChange = useCallback(
    (field: keyof ITemplateMetadata, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  }, []);

  const handleAddVariable = useCallback(() => {
    if (newVariable.name && newVariable.type && newVariable.targetProperty) {
      const variable: ITemplateVariable = {
        id: `var_${Date.now()}`,
        name: newVariable.name,
        type: newVariable.type as 'text' | 'image' | 'color',
        defaultValue: newVariable.defaultValue,
        targetObjectIds: newVariable.targetObjectIds || [],
        targetProperty: newVariable.targetProperty,
      };

      setFormData((prev) => ({
        ...prev,
        variables: [...(prev.variables || []), variable],
      }));

      setNewVariable({
        name: '',
        type: 'text',
        defaultValue: '',
        targetObjectIds: [],
        targetProperty: '',
      });
    }
  }, [newVariable]);

  const handleRemoveVariable = useCallback((variableId: string) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables?.filter((v) => v.id !== variableId) || [],
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.name?.trim()) {
      alert('请输入模板名称');
      return;
    }

    const templateData: Partial<ITemplateMetadata> = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      updatedAt: new Date(),
    };

    if (!template) {
      templateData.id = `template_${Date.now()}`;
      templateData.createdAt = new Date();
      templateData.usageCount = 0;
      templateData.isCustom = true;
    }

    onSave(templateData);
    onClose();
  }, [formData, template, onSave, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`template-edit-modal-overlay ${className || ''}`}>
      <div className="template-edit-modal">
        {/* 模态框头部 */}
        <div className="modal-header">
          <h3 className="modal-title">{template ? '编辑模板' : '创建模板'}</h3>
          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
            title="关闭"
          >
            <SvgIcon name="icon.16.close" size={16} />
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="modal-content">
          {/* 基本信息 */}
          <div className="form-section">
            <h4 className="section-title">基本信息</h4>

            <div className="form-group">
              <label className="form-label">模板名称 *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入模板名称"
              />
            </div>

            <div className="form-group">
              <label className="form-label">模板描述</label>
              <textarea
                className="form-textarea"
                value={formData.description || ''}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="请输入模板描述"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">模板类型</label>
                <select
                  title="模板类型"
                  className="form-select"
                  value={formData.type || 'design'}
                  onChange={(e) =>
                    handleInputChange('type', e.target.value as 'design' | 'h5')
                  }
                >
                  <option value="design">设计模式</option>
                  <option value="h5">H5长图</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">分类</label>
                <select
                  title="分类"
                  className="form-select"
                  value={formData.category || 'general'}
                  onChange={(e) =>
                    handleInputChange(
                      'category',
                      e.target.value as TemplateCategory,
                    )
                  }
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">许可证</label>
                <select
                  title="许可证"
                  className="form-select"
                  value={formData.license || 'free'}
                  onChange={(e) =>
                    handleInputChange(
                      'license',
                      e.target.value as 'free' | 'premium' | 'custom',
                    )
                  }
                >
                  <option value="free">免费</option>
                  <option value="premium">付费</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
            </div>
          </div>

          {/* 标签管理 */}
          <div className="form-section">
            <h4 className="section-title">标签</h4>
            <div className="tags-container">
              {formData.tags?.map((tag) => (
                <span key={tag} className="tag-item">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="add-tag-form">
              <input
                type="text"
                className="tag-input"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加标签"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button type="button" className="add-btn" onClick={handleAddTag}>
                添加
              </button>
            </div>
          </div>

          {/* 模板变量 */}
          <div className="form-section">
            <h4 className="section-title">模板变量</h4>
            <div className="variables-list">
              {formData.variables?.map((variable) => (
                <div key={variable.id} className="variable-item">
                  <div className="variable-info">
                    <span className="variable-name">{variable.name}</span>
                    <span className="variable-type">({variable.type})</span>
                    <span className="variable-property">
                      → {variable.targetProperty}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="variable-remove"
                    onClick={() => handleRemoveVariable(variable.id)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>

            <div className="add-variable-form">
              <div className="variable-form-row">
                <input
                  type="text"
                  className="variable-input"
                  value={newVariable.name || ''}
                  onChange={(e) =>
                    setNewVariable((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="变量名称"
                />
                <select
                  title="变量类型"
                  className="variable-select"
                  value={newVariable.type || 'text'}
                  onChange={(e) =>
                    setNewVariable((prev) => ({
                      ...prev,
                      type: e.target.value as 'text' | 'image' | 'color',
                    }))
                  }
                >
                  <option value="text">文本</option>
                  <option value="image">图片</option>
                  <option value="color">颜色</option>
                </select>
                <input
                  type="text"
                  className="variable-input"
                  value={newVariable.targetProperty || ''}
                  onChange={(e) =>
                    setNewVariable((prev) => ({
                      ...prev,
                      targetProperty: e.target.value,
                    }))
                  }
                  placeholder="目标属性"
                />
                <button
                  type="button"
                  className="add-btn"
                  onClick={handleAddVariable}
                >
                  添加变量
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 模态框底部 */}
        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn secondary"
            onClick={handleClose}
          >
            取消
          </button>
          <button
            type="button"
            className="modal-btn primary"
            onClick={handleSave}
          >
            保存模板
          </button>
        </div>
      </div>
    </div>
  );
};
