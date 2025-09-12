// 组件保存对话框
import './ComponentSaveDialog.scss';

import {
  ComponentDefinition,
  ComponentManager,
  generateProjectThumbnail,
} from '@g-asset-forge/core';
import { type FC, useCallback, useContext, useMemo, useState } from 'react';

import { EditorContext, type EditorContextValue } from '../../context';

interface ComponentSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: ComponentDefinition) => void;
  selectedFrame: any;
}

export const ComponentSaveDialog: FC<ComponentSaveDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedFrame,
}) => {
  const editor: EditorContextValue = useContext(EditorContext);
  const [componentName, setComponentName] = useState('');
  const [componentDescription, setComponentDescription] = useState('');
  const [componentTags, setComponentTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const componentManager = useMemo(() => new ComponentManager(), []);

  // 生成组件ID
  const generateComponentId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `component_${timestamp}_${random}`;
  }, []);

  // 生成组件缩略图
  const generateThumbnail = useCallback((): string => {
    if (!editor?.editor?.canvasElement) {
      return '';
    }

    try {
      // 使用现有的缩略图生成功能
      return generateProjectThumbnail(editor.editor.canvasElement, 200, 150);
    } catch (error) {
      console.error('生成组件缩略图失败:', error);
      return '';
    }
  }, [editor]);

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!componentName.trim()) {
      alert('请输入组件名称');
      return;
    }

    setIsSaving(true);

    // 生成缩略图
    const thumbnail = generateThumbnail();

    // 生成组件定义
    const component: ComponentDefinition = {
      id: generateComponentId(),
      name: componentName.trim(),
      description: componentDescription.trim(),
      version: '1.0.0',
      author: '用户',
      tags: componentTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      icon: 'icon.24.plugin', // 默认图标
      thumbnail: thumbnail, // 添加缩略图
      rootElement: {
        type: 'Frame',
        id: selectedFrame.id || generateComponentId(),
        attrs: {
          x: selectedFrame.attrs?.x || 0,
          y: selectedFrame.attrs?.y || 0,
          width: selectedFrame.attrs?.width || 100,
          height: selectedFrame.attrs?.height || 100,
          // 复制画框的所有属性
          ...selectedFrame.attrs,
        },
        children: selectedFrame.children || [],
      },
      parameters: [], // 暂时没有参数
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      // 使用 ComponentManager 保存组件到网盘路径
      await componentManager.registerComponent(component);

      // 调用父组件的保存回调
      await onSave(component);

      // 重置表单
      setComponentName('');
      setComponentDescription('');
      setComponentTags('');

      onClose();
    } catch (error) {
      console.error('保存组件失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      // 检查是否是重复名称错误
      if (errorMessage.includes('已存在')) {
        const shouldOverwrite = window.confirm(
          `${errorMessage}\n\n是否要覆盖现有组件？`,
        );

        if (shouldOverwrite) {
          // 用户确认覆盖，重新尝试保存
          try {
            // 获取所有组件，找到同名的组件并删除
            const allComponents = await componentManager.getAllComponents();
            const existingComponent = allComponents.find(
              (comp) => comp.name === componentName,
            );

            if (existingComponent) {
              await componentManager.deleteComponent(existingComponent.id);
            }

            // 保存新组件
            await componentManager.registerComponent(component);
            await onSave(component);

            // 重置表单
            setComponentName('');
            setComponentDescription('');
            setComponentTags('');
            onClose();
          } catch (overwriteError) {
            console.error('覆盖组件失败:', overwriteError);
            alert(
              `覆盖组件失败: ${
                overwriteError instanceof Error
                  ? overwriteError.message
                  : '未知错误'
              }`,
            );
          }
        }
      } else {
        alert(`保存组件失败: ${errorMessage}`);
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    componentName,
    componentDescription,
    componentTags,
    selectedFrame,
    generateComponentId,
    generateThumbnail,
    componentManager,
    onSave,
    onClose,
  ]);

  // 处理取消
  const handleCancel = useCallback(() => {
    setComponentName('');
    setComponentDescription('');
    setComponentTags('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="component-save-dialog-overlay">
      <div className="component-save-dialog">
        <div className="dialog-header">
          <h3>添加为组件</h3>
          <button type="button" className="close-button" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="dialog-content">
          <div className="form-group">
            <label htmlFor="component-name">组件名称 *</label>
            <input
              id="component-name"
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="请输入组件名称"
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="component-description">组件描述</label>
            <textarea
              id="component-description"
              value={componentDescription}
              onChange={(e) => setComponentDescription(e.target.value)}
              placeholder="请输入组件描述（可选）"
              rows={3}
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="component-tags">标签</label>
            <input
              id="component-tags"
              type="text"
              value={componentTags}
              onChange={(e) => setComponentTags(e.target.value)}
              placeholder="请输入标签，用逗号分隔（可选）"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="dialog-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={isSaving}
          >
            取消
          </button>
          <button
            type="button"
            className="save-button"
            onClick={handleSave}
            disabled={isSaving || !componentName.trim()}
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};
