/**
 * 模板应用模态框
 * 提供模板变量配置和应用选项
 */
import type { TemplateData, TemplateVariable } from '@g-asset-forge/core';
import React, { useCallback, useState } from 'react';

interface TemplateApplicationModalProps {
  template: TemplateData | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (
    variableValues: Record<string, any>,
    options: {
      createNewProject: boolean;
      projectName?: string;
      mergeMode?: 'replace' | 'append';
    },
  ) => void;
}

export const TemplateApplicationModal: React.FC<
  TemplateApplicationModalProps
> = ({ template, isOpen, onClose, onApply }) => {
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [createNewProject, setCreateNewProject] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [mergeMode, setMergeMode] = useState<'replace' | 'append'>('replace');

  // 重置状态
  const resetState = useCallback(() => {
    setVariableValues({});
    setCreateNewProject(true);
    setProjectName('');
    setMergeMode('replace');
  }, []);

  // 处理变量值变化
  const handleVariableChange = useCallback((variableId: string, value: any) => {
    setVariableValues((prev) => ({
      ...prev,
      [variableId]: value,
    }));
  }, []);

  // 处理应用
  const handleApply = useCallback(() => {
    if (!template) return;

    onApply(variableValues, {
      createNewProject,
      projectName: createNewProject ? projectName : undefined,
      mergeMode: createNewProject ? undefined : mergeMode,
    });

    resetState();
    onClose();
  }, [
    template,
    variableValues,
    createNewProject,
    projectName,
    mergeMode,
    onApply,
    onClose,
    resetState,
  ]);

  // 处理关闭
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  if (!isOpen || !template) {
    return null;
  }

  return (
    <div className="template-application-modal-overlay">
      <div className="template-application-modal">
        <div className="modal-header">
          <h3>应用模板: {template.name}</h3>
          <button onClick={handleClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* 模板信息 */}
          <div className="template-info">
            <img
              src={template.thumbnail}
              alt={template.name}
              className="template-thumbnail"
            />
            <div className="template-details">
              <p>{template.description}</p>
              <div className="template-meta">
                <span>
                  类型: {template.type === 'design' ? '设计模式' : 'H5模式'}
                </span>
                <span>使用次数: {template.usageCount}</span>
              </div>
            </div>
          </div>

          {/* 变量配置 */}
          {template.variables && template.variables.length > 0 && (
            <div className="variables-section">
              <h4>配置变量</h4>
              {template.variables.map((variable: TemplateVariable) => (
                <div key={variable.id} className="variable-input">
                  <label>{variable.name}</label>
                  {variable.type === 'text' && (
                    <input
                      type="text"
                      value={
                        variableValues[variable.id] ||
                        variable.defaultValue ||
                        ''
                      }
                      onChange={(e) =>
                        handleVariableChange(variable.id, e.target.value)
                      }
                      placeholder={variable.description}
                    />
                  )}
                  {variable.type === 'color' && (
                    <input
                      title="配置变量"
                      type="color"
                      value={
                        variableValues[variable.id] ||
                        variable.defaultValue ||
                        '#000000'
                      }
                      onChange={(e) =>
                        handleVariableChange(variable.id, e.target.value)
                      }
                    />
                  )}
                  {variable.description && (
                    <small>{variable.description}</small>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 应用选项 */}
          <div className="application-options">
            <h4>应用选项</h4>

            <div className="option-group">
              <label>
                <input
                  type="radio"
                  checked={createNewProject}
                  onChange={() => setCreateNewProject(true)}
                />
                创建新项目
              </label>
              {createNewProject && (
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="项目名称（可选）"
                  className="project-name-input"
                />
              )}
            </div>

            <div className="option-group">
              <label>
                <input
                  type="radio"
                  checked={!createNewProject}
                  onChange={() => setCreateNewProject(false)}
                />
                应用到当前项目
              </label>
              {!createNewProject && (
                <div className="merge-options">
                  <label>
                    <input
                      type="radio"
                      checked={mergeMode === 'replace'}
                      onChange={() => setMergeMode('replace')}
                    />
                    替换当前内容
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={mergeMode === 'append'}
                      onChange={() => setMergeMode('append')}
                    />
                    追加到当前内容
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleClose} className="cancel-btn">
            取消
          </button>
          <button onClick={handleApply} className="apply-btn">
            应用模板
          </button>
        </div>
      </div>
    </div>
  );
};
