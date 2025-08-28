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
}

export const ContentBlockPanel: FC<ContentBlockPanelProps> = ({
  onBlockAdd,
  selectedBlockId,
  contentBlocks,
  onBlockSelect,
  onBlockDelete,
  onBlockReorder,
}) => {
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

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <TextFilled />;
      case 'image':
        return <ImageOutlined />;
      case 'button':
        return <AddOutlined />;
      default:
        return <div />;
    }
  };

  const getBlockName = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return block.content.text?.substring(0, 20) || '标题文本';
      case 'image':
        return block.content.alt || '图片';
      case 'button':
        return block.content.text || '按钮';
      default:
        return '未知块';
    }
  };

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
          <div className="section-title">组件图层 ({contentBlocks.length})</div>

          {contentBlocks.length === 0 ? (
            <div className="empty-layers">
              <div className="empty-text">暂无组件</div>
              <div className="empty-hint">从上方添加组件开始创建</div>
            </div>
          ) : (
            <div className="layer-list">
              {contentBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`layer-item ${
                    selectedBlockId === block.id ? 'selected' : ''
                  } ${draggedIndex === index ? 'dragging' : ''}`}
                  onClick={() => onBlockSelect(block.id)}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="layer-drag-handle">⋮⋮</div>

                  <div className="layer-icon">{getBlockIcon(block.type)}</div>

                  <div className="layer-info">
                    <div className="layer-name">{getBlockName(block)}</div>
                    <div className="layer-type">{block.type}</div>
                  </div>

                  <div className="layer-actions">
                    <button
                      type="button"
                      className="delete-button"
                      title="删除内容块"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBlockDelete(block.id);
                      }}
                    >
                      <RemoveOutlined />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
