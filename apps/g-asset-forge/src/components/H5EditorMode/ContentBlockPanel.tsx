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
import { type FC, useCallback, useMemo, useState } from 'react';

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
  allElements?: any[];
  loading?: ProjectLoadingState;
  error?: ProjectErrorState;
}

export const ContentBlockPanel: FC<ContentBlockPanelProps> = ({
  onBlockAdd,
  selectedBlockId,
  contentBlocks,
  onBlockSelect,
  onBlockDelete,
  onBlockReorder,
  onBlockVisibilityToggle,
  onBlockLockToggle,
  allElements = [],
  loading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

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

  // 优化的内容块数据处理
  const sortedContentBlocks = useMemo(() => {
    return [...contentBlocks].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [contentBlocks]);

  // 图层数据处理（包含所有元素）
  const layerElements = useMemo(() => {
    return allElements.map((element, index) => ({
      id: element.attrs?.id || `element_${index}`,
      name: element.attrs?.name || element.type || '未命名图层',
      type: element.type,
      isVisible: element.attrs?.visible !== false,
      isLocked: element.attrs?.locked === true,
      order: index,
    }));
  }, [allElements]);

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

  const handleDrop = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

      if (dragIndex !== index) {
        onBlockReorder(dragIndex, index);
      }

      setDraggedIndex(null);
      setIsDragging(false);
    },
    [onBlockReorder],
  );

  // 可见性切换处理
  const handleVisibilityToggle = useCallback(
    (blockId: string, currentVisibility: boolean) => {
      onBlockVisibilityToggle?.(blockId, !currentVisibility);
    },
    [onBlockVisibilityToggle],
  );

  // 锁定切换处理
  const handleLockToggle = useCallback(
    (blockId: string, currentLocked: boolean) => {
      onBlockLockToggle?.(blockId, !currentLocked);
    },
    [onBlockLockToggle],
  );

  // 获取块图标
  const getBlockIcon = useCallback((type: string) => {
    switch (type) {
      case 'text':
        return <TextFilled />;
      case 'image':
        return <ImageOutlined />;
      case 'button':
        return <AddOutlined />;
      default:
        return <div className="unknown-icon">?</div>;
    }
  }, []);

  // 获取块名称
  const getBlockName = useCallback((block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return block.content?.text?.substring(0, 20) || '标题文本';
      case 'image':
        return block.content?.alt || '图片';
      case 'button':
        return block.content?.text || '按钮';
      default:
        return '未知块';
    }
  }, []);

  // 获取块状态描述
  const getBlockStatusText = useCallback((block: ContentBlock) => {
    const status = [];
    if (block.isLocked) status.push('已锁定');
    if (block.isVisible === false) status.push('已隐藏');
    return status.length > 0 ? `(${status.join(', ')})` : '';
  }, []);

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
            内容块 ({sortedContentBlocks.length})
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'layers' ? 'active' : ''}`}
            onClick={() => setActiveTab('layers')}
          >
            图层 ({layerElements.length})
          </button>
        </div>
      </div>

      {/* 内容块选择区 */}
      {activeTab === 'blocks' && (
        <div className="blocks-section">
          <div className="section-title">组件库</div>
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

          {/* 内容块列表 */}
          <div className="section-title">
            内容块列表
            {sortedContentBlocks.length === 0 && (
              <span className="empty-hint">暂无内容块</span>
            )}
          </div>
          <div className="content-blocks-list">
            {sortedContentBlocks.map((block, index) => (
              <div
                key={block.id}
                className={`content-block-item ${
                  selectedBlockId === block.id ? 'selected' : ''
                } ${block.isLocked ? 'locked' : ''} ${
                  block.isVisible === false ? 'hidden' : ''
                }`}
                draggable={!block.isLocked}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => !block.isLocked && onBlockSelect(block.id)}
              >
                <div className="block-main">
                  <div className="block-icon">{getBlockIcon(block.type)}</div>
                  <div className="block-details">
                    <div className="block-name">
                      {getBlockName(block)}
                      <span className="block-status">
                        {getBlockStatusText(block)}
                      </span>
                    </div>
                    <div className="block-type-label">{block.type}</div>
                  </div>
                </div>

                <div className="block-controls">
                  {/* 可见性切换 */}
                  <button
                    type="button"
                    className="control-btn visibility-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisibilityToggle(
                        block.id,
                        block.isVisible !== false,
                      );
                    }}
                    title={block.isVisible === false ? '显示' : '隐藏'}
                  >
                    {block.isVisible === false ? (
                      <HideOutlined />
                    ) : (
                      <ShowOutlined />
                    )}
                  </button>

                  {/* 锁定切换 */}
                  <button
                    type="button"
                    className="control-btn lock-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLockToggle(block.id, block.isLocked === true);
                    }}
                    title={block.isLocked ? '解锁' : '锁定'}
                  >
                    {block.isLocked ? <LockFilled /> : <UnlockFilled />}
                  </button>

                  {/* 删除按钮 */}
                  <button
                    type="button"
                    className="control-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBlockDelete(block.id);
                    }}
                    disabled={block.isLocked}
                    title="删除"
                  >
                    <RemoveOutlined />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图层列表区 */}
      {activeTab === 'layers' && (
        <div className="layers-section">
          <div className="section-title">
            图层列表
            {layerElements.length === 0 && (
              <span className="empty-hint">暂无图层</span>
            )}
          </div>
          <div className="layers-list">
            {layerElements.map((layer) => (
              <div
                key={layer.id}
                className={`layer-item ${
                  selectedBlockId === layer.id ? 'selected' : ''
                } ${layer.isLocked ? 'locked' : ''} ${
                  !layer.isVisible ? 'hidden' : ''
                }`}
                onClick={() => !layer.isLocked && onBlockSelect(layer.id)}
              >
                <div className="layer-main">
                  <div className="layer-icon">{getBlockIcon(layer.type)}</div>
                  <div className="layer-details">
                    <div className="layer-name">{layer.name}</div>
                    <div className="layer-type">{layer.type}</div>
                  </div>
                </div>

                <div className="layer-controls">
                  <button
                    type="button"
                    className="control-btn visibility-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // 这里需要通过allElements来处理图层可见性
                    }}
                    title={layer.isVisible ? '隐藏' : '显示'}
                  >
                    {layer.isVisible ? <ShowOutlined /> : <HideOutlined />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图层管理区 */}
      {activeTab === 'layers' && (
        <div className="layers-section">
          <div className="section-title">图层 ({allElements.length})</div>

          {allElements.length === 0 ? (
            <div className="empty-layers">
              <div className="empty-text">暂无图层</div>
              <div className="empty-hint">
                从上方添加组件或使用工具栏开始创建
              </div>
            </div>
          ) : (
            <div className="layer-list">
              {allElements.map((element, index) => {
                const isSelected = selectedBlockId === element.attrs?.id;
                const elementType =
                  element.type || element.attrs?.type || 'unknown';
                const elementName =
                  element.attrs?.objectName ||
                  element.attrs?.id ||
                  `图层 ${index + 1}`;

                return (
                  <div
                    key={element.attrs?.id || index}
                    className={`layer-item ${isSelected ? 'selected' : ''} ${
                      draggedIndex === index ? 'dragging' : ''
                    }`}
                    onClick={() => onBlockSelect(element.attrs?.id || '')}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="layer-drag-handle">⋮⋮</div>

                    <div className="layer-icon">
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

                    <div className="layer-info">
                      <div className="layer-name">{elementName}</div>
                      <div className="layer-type">{elementType}</div>
                    </div>

                    <div className="layer-actions">
                      <button
                        type="button"
                        className="delete-button"
                        title="删除图层"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBlockDelete(element.attrs?.id || '');
                        }}
                      >
                        <RemoveOutlined />
                      </button>
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
