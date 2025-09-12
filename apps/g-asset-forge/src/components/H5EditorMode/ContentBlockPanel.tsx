// 组件库和图层面板
import './ContentBlockPanel.scss';

import { type ComponentDefinition } from '@g-asset-forge/core';
import { type FC, useState } from 'react';

import type {
  ProjectErrorState,
  ProjectLoadingState,
} from '../../hooks/useProjectManagement';
import { LayerPanel } from '../LayerPanel/LayerPanel';
import { ComponentLibraryPanel } from './ComponentLibraryPanel';

interface ContentBlockPanelProps {
  onComponentDrag: (component: ComponentDefinition) => void;
  loading?: ProjectLoadingState;
  error?: ProjectErrorState;
}

export const ContentBlockPanel: FC<ContentBlockPanelProps> = ({
  onComponentDrag,
  loading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'components' | 'layers'>(
    'components',
  );

  return (
    <div className="content-block-panel">
      {/* 标签页切换 */}
      <div className="panel-tabs">
        <div className="tab-buttons">
          <button
            type="button"
            className={`tab-button ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => setActiveTab('components')}
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
      {activeTab === 'components' && (
        <div className="components-section">
          <ComponentLibraryPanel
            onComponentDrag={onComponentDrag}
            loading={loading}
            error={error}
          />
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
