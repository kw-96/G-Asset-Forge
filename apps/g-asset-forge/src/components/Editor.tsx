import './Editor.scss';

import { pick, throttle } from '@g-asset-forge/common';
import { GAssetForgeEditor,type SettingValue } from '@g-asset-forge/core';
import { type FC, useEffect, useRef, useState } from 'react';

import { EditorContext } from '../context';
import { AutoSaveGraphics } from '../store/auto-save-graphs';
import { ContextMenu } from './ContextMenu';
import { Header } from './Header';
import { InfoPanel } from './InfoPanel';
import { LayerPanel } from './LayerPanel';
import { Pages } from './Pages';
import { ToolBar } from './Header/components/Toolbar';

const topMargin = 48;
const leftRightMargin = 240 * 2;

const USER_PREFERENCE_KEY = 'g-asset-forge-user-preference';
const storeKeys: Partial<keyof SettingValue>[] = [
  'enablePixelGrid',
  'snapToGrid',
  'enableRuler',

  'keepToolSelectedAfterUse',
  'invertZoomDirection',
  'highlightLayersOnHover',
  'flipObjectsWhileResizing',
  'snapToObjects',
];

const Editor: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [editor, setEditor] = useState<GAssetForgeEditor | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const userPreferenceEncoded = localStorage.getItem(USER_PREFERENCE_KEY);
      const userPreference = userPreferenceEncoded
        ? (JSON.parse(userPreferenceEncoded) as Partial<SettingValue>)
        : undefined;

      // 确保有有效的尺寸
      const containerWidth = Math.max(document.body.clientWidth - leftRightMargin, 800);
      const containerHeight = Math.max(document.body.clientHeight - topMargin, 600);

      console.log('Editor 初始化尺寸:', { containerWidth, containerHeight, bodyWidth: document.body.clientWidth, bodyHeight: document.body.clientHeight });

      const editor = new GAssetForgeEditor({
        containerElement: containerRef.current,
        width: containerWidth,
        height: containerHeight,
        offsetY: 48,
        offsetX: 240,
        showPerfMonitor: false,
        userPreference: userPreference,
      });

      editor.setting.on(
        'update',
        (value: SettingValue, changedKey: keyof SettingValue) => {
          if (!storeKeys.includes(changedKey)) return;

          localStorage.setItem(
            USER_PREFERENCE_KEY,
            JSON.stringify(pick(value, storeKeys)),
          );
        },
      );

      (window as any).editor = editor;

      new AutoSaveGraphics(editor);
      
      // 尝试手动配置编辑器设置
      try {
        // 确保滚轮缩放功能正常
        if (editor.setting) {
          console.log('编辑器设置管理器可用');
        }
        
        // 尝试启用标尺
        if (editor.setting) {
          console.log('编辑器设置管理器已初始化');
        }
      } catch (error) {
        console.warn('配置编辑器设置时出错:', error);
      }
      
      // 添加调试信息
      console.log('编辑器初始化完成:', {
        editor: !!editor,
        toolManager: !!editor.toolManager,
        viewportManager: !!editor.viewportManager,
        setting: !!editor.setting
      });
      
              // 检查编辑器容器的事件绑定
        if (containerRef.current) {
          const container = containerRef.current;
          // 等待一帧后再次检查尺寸，确保 DOM 已完全渲染
          requestAnimationFrame(() => {
            if (container) {
              console.log('编辑器容器信息 (延迟检查):', {
                element: container,
                hasEventListeners: !!(container as any)._events,
                style: container.style.cssText,
                dimensions: {
                  width: container.offsetWidth,
                  height: container.offsetHeight,
                  clientWidth: container.clientWidth,
                  clientHeight: container.clientHeight
                },
                computedStyle: window.getComputedStyle(container),
                parentDimensions: {
                  parentWidth: container.parentElement?.clientWidth,
                  parentHeight: container.parentElement?.clientHeight
                }
              });
            }
          });
        
        // 强制覆盖编辑器的滚轮事件
        const handleWheel = (e: WheelEvent) => {
          console.log('手动滚轮事件触发:', { deltaY: e.deltaY, target: e.target });
          
          // 阻止默认行为和事件传播
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          if (editor && editor.viewportManager) {
            const delta = e.deltaY;
            const zoomFactor = delta > 0 ? 0.9 : 1.1;
            
            try {
              // 尝试使用正确的方法来缩放
              if ((editor.viewportManager as any).zoom) {
                (editor.viewportManager as any).zoom(zoomFactor);
                console.log('手动滚轮缩放成功:', { delta, zoomFactor });
              } else {
                console.log('viewportManager.zoom 方法不存在，尝试其他方法');
                // 尝试其他可能的缩放方法
                if ((editor.viewportManager as any).setZoom) {
                  const currentZoom = (editor.viewportManager as any).getZoom?.() || 1;
                  (editor.viewportManager as any).setZoom(currentZoom * zoomFactor);
                }
              }
            } catch (error) {
              console.warn('手动滚轮缩放失败:', error);
            }
          }
        };
        
        // 使用 capture: true 来确保我们的处理器最先执行
        containerRef.current.addEventListener('wheel', handleWheel, { 
          passive: false, 
          capture: true 
        });
        
        // 也在 document 级别绑定，确保全局捕获
        document.addEventListener('wheel', handleWheel, { 
          passive: false, 
          capture: true 
        });
        
        console.log('已强制绑定滚轮事件监听器 (capture 模式)');
        
        // 添加更多调试信息
        console.log('编辑器状态检查:', {
          hasEditor: !!editor,
          hasToolManager: !!editor?.toolManager,
          hasViewportManager: !!editor?.viewportManager,
          hasSetting: !!editor?.setting,
          containerElement: !!containerRef.current,
          containerStyle: containerRef.current?.style.cssText
        });
      }

      const changeViewport = throttle(
        () => {
          const newWidth = Math.max(document.body.clientWidth - leftRightMargin, 800);
          const newHeight = Math.max(document.body.clientHeight - topMargin, 600);
          
          console.log('视口尺寸更新:', { newWidth, newHeight });
          
          editor.viewportManager.setViewportSize({
            width: newWidth,
            height: newHeight,
          });
          editor.render();
        },
        10,
        { leading: false },
      );
      
      // 使用 passive: true 来避免滚轮事件冲突
      window.addEventListener('resize', changeViewport, { passive: true });
      setEditor(editor);

      return () => {
        editor.destroy(); // 注销事件
        window.removeEventListener('resize', changeViewport);
        changeViewport.cancel();
      };
    }
  }, [containerRef]);

  return (
    <div>
      <EditorContext.Provider value={editor}>
        <Header title="g-asset-forge" />
        {/* body */}
        <div className="body">
          <div className="g-asset-forge-editor-left-area">
            <Pages />
            <LayerPanel />
          </div>{' '}
          <div
            ref={containerRef}
            style={{ 
              position: 'absolute', 
              left: 240, 
              top: 0,
              width: '100%',
              height: '100%',
              minWidth: '800px',
              minHeight: '600px'
            }}
          />
          {/* 悬浮工具栏 - 位于画布下方中间 */}
          <div className="floating-toolbar-container">
            <ToolBar />
          </div>
          <InfoPanel />
          <ContextMenu />
        </div>
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
