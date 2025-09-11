// 组件和图层面板
import './ContentBlockPanel.scss';

import { AddOutlined, ImageOutlined, TextFilled } from '@g-asset-forge/icons';
import { type FC, useCallback, useMemo, useState } from 'react';

import type {
  ProjectErrorState,
  ProjectLoadingState,
} from '../../hooks/useProjectManagement';
import { LayerPanel } from '../LayerPanel/LayerPanel';

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

  // LayerPanel会自动处理图层相关功能，这里不需要额外处理

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

      {/* 图层管理区 - 使用设计模式的LayerPanel */}
      {activeTab === 'layers' && (
        <div className="layers-section">
          <LayerPanel />
        </div>
      )}
    </div>
  );
};
