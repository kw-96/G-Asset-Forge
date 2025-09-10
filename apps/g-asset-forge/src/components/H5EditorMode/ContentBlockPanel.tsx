// 内容块面板 - 重构版本
import './ContentBlockPanel.scss';

import {
  AddOutlined,
  HideOutlined,
  ImageOutlined,
  LockFilled,
  RemoveOutlined,
  ShowOutlined,
  TextFilled,
  UnlockFilled,
} from '@g-asset-forge/icons';
import { type FC, useCallback, useMemo, useRef, useState } from 'react';

import type {
  ProjectErrorState,
  ProjectLoadingState,
} from '../../hooks/useProjectManagement';

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content: any;
  style: any;
  order?: number;
  isVisible?: boolean;
  isLocked?: boolean;
}

interface ContentBlockPanelProps {
  onBlockAdd: (blockType: string) => void;
  selectedBlockId: string;
  contentBlocks: ContentBlock[];
  onBlockSelect: (blockId: string) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockReorder: (dragIndex: number, hoverIndex: number) => void;
  onBlockVisibilityToggle?: (blockId: string, isVisible: boolean) => void;
  onBlockLockToggle?: (blockId: string, isLocked: boolean) => void;
  onBlockNameChange?: (blockId: string, newName: string) => void;
  onBlockZoomToFit?: (blockId: string) => void;
  allElements?: any[];
  loading?: ProjectLoadingState;
  error?: ProjectErrorState;
}

export const ContentBlockPanel: FC<ContentBlockPanelProps> = ({
  onBlockAdd,
  selectedBlockId,
  onBlockSelect,
  onBlockDelete,
  onBlockReorder,
  onBlockVisibilityToggle,
  onBlockLockToggle,
  onBlockNameChange,
  onBlockZoomToFit,
  allElements = [],
  loading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 优化的内容块类型定义
  const blockTypes = useMemo(
    () => [
      {
        type: 'text',
        name: '标题文本',
        icon: <TextFilled />,
        description: '添加文本内容',
      },
      {
        type: 'image',
        name: '图片',
        icon: <ImageOutlined />,
        description: '添加图片内容',
      },
      {
        type: 'button',
        name: '按钮',
        icon: <AddOutlined />,
        description: '添加交互按钮',
      },
    ],
    [],
  );

  // 优化的拖拽处理逻辑
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setIsDragging(true);

    // 设置拖拽数据
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    // 添加拖拽样式
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('dragging');
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      // 防抖处理，避免频繁触发
      if (draggedIndex !== null && draggedIndex !== index && !isDragging) {
        setIsDragging(true);

        // 延迟执行重排序，提高稳定性
        setTimeout(() => {
          onBlockReorder(draggedIndex, index);
          setDraggedIndex(index);
          setIsDragging(false);
        }, 50);
      }
    },
    [draggedIndex, isDragging, onBlockReorder],
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedIndex(null);
    setIsDragging(false);

    // 移除拖拽样式
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('dragging');
    }
  }, []);

  // 编辑相关处理函数
  const handleDoubleClick = useCallback(
    (elementId: string, elementName: string) => {
      setEditingId(elementId);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = elementName;
          inputRef.current.select();
          inputRef.current.focus();
        }
      }, 0);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.currentTarget.blur();
      }
    },
    [],
  );

  const handleBlur = useCallback(() => {
    const inputVal = inputRef.current?.value;
    if (inputVal && onBlockNameChange && editingId) {
      onBlockNameChange(editingId, inputVal);
    }
    setEditingId('');
  }, [editingId, onBlockNameChange]);

  // 可见性切换处理
  const handleVisibilityToggle = useCallback(
    (elementId: string, currentVisible: boolean) => {
      onBlockVisibilityToggle?.(elementId, !currentVisible);
    },
    [onBlockVisibilityToggle],
  );

  // 锁定切换处理
  const handleLockToggle = useCallback(
    (elementId: string, currentLocked: boolean) => {
      onBlockLockToggle?.(elementId, !currentLocked);
    },
    [onBlockLockToggle],
  );

  return (
    <div className="content-block-panel">
      {/* 加载状态指示器 */}
      {loading?.isLoading && (
        <div className="panel-loading">
          <div className="loading-spinner" />
          <span>加载中...</span>
        </div>
      )}

      {/* 错误提示 */}
      {error?.error && (
        <div className="panel-error">
          <span>⚠️ {error.error}</span>
        </div>
      )}

      {/* 面板头部 */}
      <div className="panel-header">
        <div className="panel-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'blocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocks')}
          >
            组件库
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'layers' ? 'active' : ''}`}
            onClick={() => setActiveTab('layers')}
          >
            图层
          </button>
        </div>
      </div>

      {/* 组件库选择区 */}
      {activeTab === 'blocks' && (
        <div className="blocks-section">
          <div className="block-types">
            {blockTypes.map((blockType) => (
              <div
                key={blockType.type}
                className="block-type-item"
                onClick={() => onBlockAdd(blockType.type)}
                title={blockType.description}
              >
                <div className="block-icon">{blockType.icon}</div>
                <div className="block-info">
                  <div className="block-name">{blockType.name}</div>
                  <div className="block-description">
                    {blockType.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图层管理区 */}
      {activeTab === 'layers' && (
        <div className="layers-section">
          {allElements.length === 0 ? (
            <div className="empty-layers">
              <div className="empty-text">暂无图层</div>
              <div className="empty-hint">
                从上方添加组件或使用工具栏开始创建
              </div>
            </div>
          ) : (
            <div className="g-asset-forge-layer-tree">
              {[...allElements].reverse().map((element, index) => {
                const elementId = element.attrs?.id || `element_${index}`;
                const isSelected = selectedBlockId === elementId;
                const isHovered = hoveredId === elementId;
                const isEditing = editingId === elementId;
                const elementType =
                  element.type || element.attrs?.type || 'unknown';
                const elementName =
                  element.attrs?.objectName || `图层 ${index + 1}`;
                const isVisible = element.attrs?.visible !== false;
                const isLocked = element.attrs?.locked === true;

                return (
                  <div
                    key={elementId}
                    className={`sk-layer-item ${
                      isSelected ? 'sk-active' : ''
                    } ${isHovered ? 'sk-layer-highlight' : ''} ${
                      isEditing ? 'sk-editing' : ''
                    } ${!isVisible ? 'sk-hidden' : ''} ${
                      draggedIndex === index ? 'dragging' : ''
                    }`}
                    onMouseDown={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        // 多选逻辑
                        onBlockSelect(elementId);
                      } else {
                        onBlockSelect(elementId);
                      }
                    }}
                    onMouseEnter={() => setHoveredId(elementId)}
                    onMouseLeave={() => setHoveredId('')}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div style={{ width: 0, minWidth: 0 }} />
                    <div className="sk-group-collapse-btn" />
                    <div
                      className="sk-layer-icon"
                      onDoubleClick={() => {
                        onBlockZoomToFit?.(elementId);
                      }}
                    >
                      {elementType === 'H5Container' ? (
                        '📱'
                      ) : elementType === 'H5TextBlock' ? (
                        <TextFilled />
                      ) : elementType === 'H5ImageBlock' ? (
                        <ImageOutlined />
                      ) : elementType === 'H5ButtonBlock' ? (
                        <AddOutlined />
                      ) : elementType === 'Rect' ? (
                        '⬜'
                      ) : elementType === 'Ellipse' ? (
                        '⭕'
                      ) : (
                        '🔷'
                      )}
                    </div>
                    {!isEditing && (
                      <span
                        className="sk-layout-name"
                        onDoubleClick={() =>
                          handleDoubleClick(elementId, elementName)
                        }
                      >
                        {elementName}
                      </span>
                    )}
                    {isEditing && (
                      <input
                        ref={inputRef}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        defaultValue={elementName}
                      />
                    )}
                    <div
                      className={`sk-layer-item-actions ${
                        isLocked || !isVisible ? 'sk-action-visible' : ''
                      }`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="sk-action-btn"
                        style={{
                          visibility: isLocked ? 'visible' : undefined,
                        }}
                        onMouseDown={() =>
                          handleLockToggle(elementId, isLocked)
                        }
                        title={isLocked ? '解锁' : '锁定'}
                      >
                        {isLocked ? <LockFilled /> : <UnlockFilled />}
                      </span>
                      <span
                        className="sk-action-btn"
                        style={{
                          visibility: !isVisible ? 'visible' : undefined,
                        }}
                        onMouseDown={() =>
                          handleVisibilityToggle(elementId, isVisible)
                        }
                        title={isVisible ? '隐藏' : '显示'}
                      >
                        {isVisible ? <ShowOutlined /> : <HideOutlined />}
                      </span>
                      <span
                        className="sk-action-btn"
                        onMouseDown={() => onBlockDelete(elementId)}
                        title="删除图层"
                      >
                        <RemoveOutlined />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
