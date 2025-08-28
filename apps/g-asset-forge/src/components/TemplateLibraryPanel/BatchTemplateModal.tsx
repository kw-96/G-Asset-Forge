/**
 * 批量模板应用模态框
 * 支持批量生成多个模板实例
 */
import type { TemplateData } from '@g-asset-forge/core';
import React, { useCallback, useState } from 'react';

interface BatchItem {
  id: string;
  outputName: string;
  variableValues: Record<string, any>;
}

interface BatchTemplateModalProps {
  template: TemplateData | null;
  isOpen: boolean;
  onClose: () => void;
  onBatchApply: (batchItems: BatchItem[]) => void;
}

export const BatchTemplateModal: React.FC<BatchTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
  onBatchApply,
}) => {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);

  // 添加批次项
  const handleAddBatchItem = useCallback(() => {
    const newItem: BatchItem = {
      id: `batch_${Date.now()}`,
      outputName: `输出_${batchItems.length + 1}`,
      variableValues: {},
    };

    setBatchItems((prev) => [...prev, newItem]);
  }, [batchItems.length]);

  // 更新批次项
  const handleUpdateBatchItem = useCallback(
    (id: string, updates: Partial<BatchItem>) => {
      setBatchItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
    },
    [],
  );

  // 删除批次项
  const handleRemoveBatchItem = useCallback((id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 处理变量值变化
  const handleVariableChange = useCallback(
    (itemId: string, variableId: string, value: any) => {
      setBatchItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                variableValues: { ...item.variableValues, [variableId]: value },
              }
            : item,
        ),
      );
    },
    [],
  );

  // 处理批量应用
  const handleBatchApply = useCallback(() => {
    if (batchItems.length === 0) return;

    onBatchApply(batchItems);
    setBatchItems([]);
    onClose();
  }, [batchItems, onBatchApply, onClose]);

  // 处理关闭
  const handleClose = useCallback(() => {
    setBatchItems([]);
    onClose();
  }, [onClose]);

  if (!isOpen || !template) {
    return null;
  }

  return (
    <div className="batch-template-modal-overlay">
      <div className="batch-template-modal">
        <div className="modal-header">
          <h3>批量应用模板: {template.name}</h3>
          <button onClick={handleClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="batch-items">
            {batchItems.map((item) => (
              <div key={item.id} className="batch-item">
                <div className="item-header">
                  <input
                    type="text"
                    value={item.outputName}
                    onChange={(e) =>
                      handleUpdateBatchItem(item.id, {
                        outputName: e.target.value,
                      })
                    }
                    placeholder="输出名称"
                  />
                  <button onClick={() => handleRemoveBatchItem(item.id)}>
                    删除
                  </button>
                </div>

                <div className="item-variables">
                  {template.variables.map((variable) => (
                    <div key={variable.id} className="variable-input">
                      <label>{variable.name}</label>
                      {variable.type === 'text' && (
                        <input
                          type="text"
                          value={item.variableValues[variable.id] || ''}
                          onChange={(e) =>
                            handleVariableChange(
                              item.id,
                              variable.id,
                              e.target.value,
                            )
                          }
                          placeholder={variable.description}
                        />
                      )}
                      {variable.type === 'color' && (
                        <input
                          type="color"
                          value={item.variableValues[variable.id] || '#000000'}
                          onChange={(e) =>
                            handleVariableChange(
                              item.id,
                              variable.id,
                              e.target.value,
                            )
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleAddBatchItem} className="add-batch-item-btn">
            添加批次
          </button>
        </div>

        <div className="modal-footer">
          <button onClick={handleClose} className="cancel-btn">
            取消
          </button>
          <button
            onClick={handleBatchApply}
            className="apply-btn"
            disabled={batchItems.length === 0}
          >
            批量应用 ({batchItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};
