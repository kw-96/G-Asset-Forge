/**
 * 模板变量编辑器组件
 * 用于创建和编辑模板变量定义
 */
import React, { useCallback, useState } from 'react';

interface TemplateVariable {
  id: string;
  name: string;
  type: 'text' | 'image' | 'color';
  targetObjectIds: string[];
  targetProperty: string;
  description?: string;
  defaultValue?: any;
}

interface TemplateVariableEditorProps {
  variables: TemplateVariable[];
  availableObjects: Array<{
    id: string;
    type: string;
    name?: string;
  }>;
  onChange: (variables: TemplateVariable[]) => void;
}

export const TemplateVariableEditor: React.FC<TemplateVariableEditorProps> = ({
  variables,
  availableObjects,
  onChange,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddVariable = useCallback(() => {
    const newVariable: TemplateVariable = {
      id: `var_${Date.now()}`,
      name: '新变量',
      type: 'text',
      targetObjectIds: [],
      targetProperty: '',
      defaultValue: '',
    };

    onChange([...variables, newVariable]);
    setEditingIndex(variables.length);
  }, [variables, onChange]);

  const handleUpdateVariable = useCallback(
    (index: number, updates: Partial<TemplateVariable>) => {
      const updatedVariables = [...variables];
      updatedVariables[index] = { ...updatedVariables[index], ...updates };
      onChange(updatedVariables);
    },
    [variables, onChange],
  );

  const handleRemoveVariable = useCallback(
    (index: number) => {
      const updatedVariables = variables.filter((_, i) => i !== index);
      onChange(updatedVariables);
      setEditingIndex(null);
    },
    [variables, onChange],
  );

  return (
    <div className="template-variable-editor">
      <div className="variable-list">
        {variables.map((variable, index) => (
          <div key={variable.id} className="variable-item">
            <div className="variable-header">
              <span>{variable.name}</span>
              <button onClick={() => handleRemoveVariable(index)}>删除</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleAddVariable} className="add-variable-btn">
        添加变量
      </button>
    </div>
  );
};
