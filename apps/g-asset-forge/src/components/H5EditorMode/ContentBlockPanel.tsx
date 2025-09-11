// 组件和图层面板
import './ContentBlockPanel.scss';

import { AddOutlined, ImageOutlined, TextFilled } from '@g-asset-forge/icons';
import { type FC, useCallback, useMemo, useState } from 'react';

import type {
  ProjectErrorState,
  ProjectLoadingState,
} from '../../hooks/useProjectManagement';
import { H5LayerItem } from './H5LayerItem';

interface ContentBlockPanelProps {
  onBlockAdd: (blockType: string) => void;
  selectedBlockId: string;
  contentBlocks: any[];
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
  onBlockSelect,
  onBlockDelete,
  onBlockVisibilityToggle,
  onBlockLockToggle,
  onBlockNameChange,
  onBlockZoomToFit,
  allElements = [],
  loading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');
  const [hoveredId, setHoveredId] = useState<string>('');
  const [activeIds, setActiveIds] = useState<string[]>([]);

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

  // 构建层级结构数据 - 与设计模式保持一致
  const buildLayerStructure = useCallback(() => {
    if (allElements.length === 0) return [];

    // 找到H5容器（第一个元素应该是容器）
    const container = allElements[0];
    if (!container || container.type !== 'H5Container') return allElements;

    // 获取子元素
    const children = allElements.slice(1);

    // 构建层级结构，与设计模式的IObject结构保持一致
    return [
      {
        id: container.attrs?.id || container.id,
        type: container.type,
        name: container.attrs?.objectName || container.name || 'H5长图容器',
        visible: container.attrs?.visible !== false,
        lock: container.attrs?.locked === true,
        children: children.map((child, index) => ({
          id: child.attrs?.id || child.id || `child_${index}`,
          type: child.type,
          name: child.attrs?.objectName || child.name || `图层 ${index + 1}`,
          visible: child.attrs?.visible !== false,
          lock: child.attrs?.locked === true,
          children: [], // H5内容块没有子元素
        })),
      },
    ];
  }, [allElements]);

  // 事件处理函数
  const handleLayerSelect = useCallback(
    (id: string, event: React.MouseEvent) => {
      if (event.ctrlKey || event.metaKey) {
        setActiveIds((prev) =>
          prev.includes(id)
            ? prev.filter((activeId) => activeId !== id)
            : [...prev, id],
        );
      } else {
        setActiveIds([id]);
      }
      onBlockSelect(id);
    },
    [onBlockSelect],
  );

  const handleLayerHover = useCallback((id: string) => {
    setHoveredId(id);
  }, []);

  const handleLayerHoverLeave = useCallback(() => {
    setHoveredId('');
  }, []);

  const handleLayerNameChange = useCallback(
    (id: string, newName: string) => {
      onBlockNameChange?.(id, newName);
    },
    [onBlockNameChange],
  );

  const handleLayerVisibilityToggle = useCallback(
    (id: string, isVisible: boolean) => {
      onBlockVisibilityToggle?.(id, isVisible);
    },
    [onBlockVisibilityToggle],
  );

  const handleLayerLockToggle = useCallback(
    (id: string, isLocked: boolean) => {
      onBlockLockToggle?.(id, isLocked);
    },
    [onBlockLockToggle],
  );

  const handleLayerDelete = useCallback(
    (id: string) => {
      onBlockDelete(id);
    },
    [onBlockDelete],
  );

  const handleLayerZoomToFit = useCallback(
    (id: string) => {
      onBlockZoomToFit?.(id);
    },
    [onBlockZoomToFit],
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

      {/* 错误状态指示器 */}
      {error?.error && (
        <div className="panel-error">
          <span>加载失败: {error.error}</span>
        </div>
      )}

      {/* 标签页切换 */}
      <div className="panel-tabs">
        <div className="tab-buttons">
          <button
            type="button"
            className={`tab-button ${activeTab === 'blocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocks')}
          >
            组件
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
              {buildLayerStructure().map((item) => (
                <H5LayerItem
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  name={item.name}
                  active={activeIds.includes(item.id)}
                  activeSecond={activeIds.includes(item.id)}
                  level={0}
                  children={item.children}
                  activeIds={activeIds}
                  hlId={hoveredId}
                  visible={item.visible}
                  lock={item.lock}
                  onSelect={handleLayerSelect}
                  onHover={handleLayerHover}
                  onHoverLeave={handleLayerHoverLeave}
                  onNameChange={handleLayerNameChange}
                  onVisibilityToggle={handleLayerVisibilityToggle}
                  onLockToggle={handleLayerLockToggle}
                  onDelete={handleLayerDelete}
                  onZoomToFit={handleLayerZoomToFit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
