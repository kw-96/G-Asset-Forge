// 组件库面板
import './ContentBlockPanel.scss';

import {
  AddOutlined,
  ImageOutlined,
  RemoveOutlined,
  TextFilled,
} from '@g-asset-forge/icons';
import { type FC, useState } from 'react';

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button';
  content: any;
  style: any;
}

interface ContentBlockPanelProps {
  onBlockAdd: (blockType: string) => void;
  selectedBlockId: string;
  contentBlocks: ContentBlock[];
  onBlockSelect: (blockId: string) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockReorder: (dragIndex: number, hoverIndex: number) => void;
  allElements?: any[]; // 添加所有元素的支持
}

export const ContentBlockPanel: FC<ContentBlockPanelProps> = ({
  onBlockAdd,
  selectedBlockId,
  contentBlocks: _contentBlocks, // 未使用，但需要保持接口一致性
  onBlockSelect,
  onBlockDelete,
  onBlockReorder,
  allElements = [],
}) => {
  // 使用 _contentBlocks 来消除 linter 警告
  void _contentBlocks;
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const blockTypes = [
    {
      type: 'text',
      name: '标题文本',
      icon: <TextFilled />,
    },
    {
      type: 'image',
      name: '图片',
      icon: <ImageOutlined />,
    },
    {
      type: 'button',
      name: '按钮',
      icon: <AddOutlined />,
    },
  ];

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onBlockReorder(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 注释掉未使用的函数，但保留以备将来使用
  // const getBlockIcon = (type: string) => {
  //   switch (type) {
  //     case 'text':
  //       return <TextFilled />;
  //     case 'image':
  //       return <ImageOutlined />;
  //     case 'button':
  //       return <AddOutlined />;
  //     default:
  //       return <div />;
  //   }
  // };

  // const getBlockName = (block: ContentBlock) => {
  //   switch (block.type) {
  //     case 'text':
  //       return block.content.text?.substring(0, 20) || '标题文本';
  //     case 'image':
  //       return block.content.alt || '图片';
  //     case 'button':
  //       return block.content.text || '按钮';
  //     default:
  //       return '未知块';
  //   }
  // };

  return (
    <div className="content-block-panel">
      {/* 面板头部 */}
      <div className="panel-header">
        <div className="panel-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'blocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocks')}
          >
            内容块
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
              >
                <div className="block-icon">{blockType.icon}</div>
                <div className="block-info">
                  <div className="block-name">{blockType.name}</div>
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
                    onDragStart={() => handleDragStart(index)}
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
