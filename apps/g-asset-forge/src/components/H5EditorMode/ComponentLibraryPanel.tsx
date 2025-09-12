// 组件库面板
import './ComponentLibraryPanel.scss';

import {
  type ComponentDefinition,
  ComponentManager,
} from '@g-asset-forge/core';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
  type ProjectErrorState,
  type ProjectLoadingState,
} from '../../hooks/useProjectManagement';

interface ComponentLibraryPanelProps {
  onComponentDrag: (component: ComponentDefinition) => void;
  loading?: ProjectLoadingState;
  error?: ProjectErrorState;
}

export const ComponentLibraryPanel: FC<ComponentLibraryPanelProps> = ({
  onComponentDrag,
  loading,
  error,
}) => {
  const [components, setComponents] = useState<ComponentDefinition[]>([]);
  const componentManager = useMemo(() => new ComponentManager(), []);
  const [isLoadingComponents, setIsLoadingComponents] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    component: ComponentDefinition | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    component: null,
  });

  // 加载组件列表
  const loadComponents = useCallback(async () => {
    setIsLoadingComponents(true);
    try {
      const loadedComponents = await componentManager.getAllComponents();
      setComponents(loadedComponents);
    } catch (error) {
      console.error('加载组件失败:', error);
    } finally {
      setIsLoadingComponents(false);
    }
  }, [componentManager]);

  // 组件初始化时加载组件列表
  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  // 自动刷新组件列表 - 每30秒检查一次
  useEffect(() => {
    const interval = setInterval(() => {
      loadComponents();
    }, 300000); // 5分钟自动刷新

    return () => clearInterval(interval);
  }, [loadComponents]);

  // 监听窗口焦点变化，当窗口重新获得焦点时刷新组件列表
  useEffect(() => {
    const handleFocus = () => {
      loadComponents();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadComponents]);

  // 监听组件保存事件，自动刷新组件列表
  useEffect(() => {
    const handleComponentSaved = () => {
      console.log('检测到组件保存事件，刷新组件列表');
      loadComponents();
    };

    window.addEventListener('componentSaved', handleComponentSaved);
    return () =>
      window.removeEventListener('componentSaved', handleComponentSaved);
  }, [loadComponents]);

  // 处理组件拖拽开始
  const handleComponentDragStart = useCallback(
    (event: React.DragEvent, component: ComponentDefinition) => {
      event.dataTransfer.setData('application/json', JSON.stringify(component));
      onComponentDrag(component);
    },
    [onComponentDrag],
  );

  // 处理组件右键菜单
  const handleComponentContextMenu = useCallback(
    (event: React.MouseEvent, component: ComponentDefinition) => {
      event.preventDefault();
      event.stopPropagation();

      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        component: component,
      });
    },
    [],
  );

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      component: null,
    });
  }, []);

  // 处理删除组件
  const handleDeleteComponent = useCallback(
    async (component: ComponentDefinition) => {
      if (!window.confirm(`确定要删除组件 "${component.name}" 吗？`)) {
        closeContextMenu(); // 取消删除时也关闭菜单
        return;
      }

      try {
        await componentManager.deleteComponent(component.id);
        // 刷新组件列表
        await loadComponents();
        console.log(`组件 "${component.name}" 已删除`);
      } catch (error) {
        console.error('删除组件失败:', error);
        alert(
          `删除组件失败: ${
            error instanceof Error ? error.message : '未知错误'
          }`,
        );
      } finally {
        // 无论成功还是失败，都关闭右键菜单
        closeContextMenu();
      }
    },
    [componentManager, loadComponents, closeContextMenu],
  );

  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible, closeContextMenu]);

  return (
    <div className="component-library-panel">
      {/* 加载状态指示器 */}
      {(loading?.isLoading || isLoadingComponents) && (
        <div className="panel-loading">
          <div className="loading-spinner" />
          <span>加载中...</span>
        </div>
      )}

      {/* 错误状态指示器 */}
      {error?.error && (
        <div className="panel-error">
          <span className="error-message">{error.error}</span>
        </div>
      )}

      {/* 组件库选择区 */}
      <div className="components-section">
        <div className="components-list">
          {components.length === 0 ? (
            <div className="empty-state">
              <p>暂无组件</p>
              <p className="empty-hint">
                选择画框，右键选择"添加为组件"来创建组件
              </p>
            </div>
          ) : (
            components.map((component) => (
              <div
                key={component.id}
                className="component-item"
                draggable
                onDragStart={(e) => handleComponentDragStart(e, component)}
                onContextMenu={(e) => handleComponentContextMenu(e, component)}
                title={`拖拽到画布或右键菜单: ${component.description}`}
              >
                <div className="component-icon">
                  {/* 这里可以显示组件图标或预览图 */}
                  <div className="component-preview">
                    {component.thumbnail ? (
                      <img src={component.thumbnail} alt={component.name} />
                    ) : (
                      <div className="default-icon">📦</div>
                    )}
                  </div>
                </div>
                <div className="component-info">
                  <div className="component-name">{component.name}</div>
                  <div className="component-description">
                    {component.description || '无描述'}
                  </div>
                  <div className="component-meta">
                    <span className="component-version">
                      v{component.version}
                    </span>
                    {component.tags.length > 0 && (
                      <div className="component-tags">
                        {component.tags
                          .slice(0, 3)
                          .map((tag: string, index: number) => (
                            <span key={index} className="component-tag">
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu.visible && contextMenu.component && (
        <div
          className="component-context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => handleDeleteComponent(contextMenu.component!)}
          >
            <span>删除组件</span>
          </div>
        </div>
      )}
    </div>
  );
};
