// H5模式界面
import './H5EditorMode.scss';

import { H5Service } from '@g-asset-forge/core';
import {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { EditorContext } from '../../context';
import { ContentBlockPanel } from './ContentBlockPanel';
import { H5Canvas } from './H5Canvas';
import { H5PropertyPanel } from './H5PropertyPanel';

interface H5EditorModeProps {
  onModeSwitch?: (mode: 'design' | 'h5') => void;
}

export const H5EditorMode: FC<H5EditorModeProps> = () => {
  const editor = useContext(EditorContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const h5ServiceRef = useRef<H5Service | null>(null);

  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [showPropertyPanel, setShowPropertyPanel] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // 获取块内容
  const getBlockContent = useCallback((block: any) => {
    switch (block.attrs.blockType) {
      case 'text':
        return {
          text: block.attrs.content || '请输入文本内容',
          fontSize: block.attrs.fontSize || 16,
          color: block.attrs.textColor || '#333333',
          textAlign: block.attrs.textAlign || 'left',
        };
      case 'image':
        return {
          src: block.attrs.src || '',
          alt: block.attrs.alt || '图片',
          objectFit: block.attrs.objectFit || 'cover',
        };
      case 'button':
        return {
          text: block.attrs.text || '点击按钮',
          backgroundColor: block.attrs.backgroundColor || '#007AFF',
          textColor: block.attrs.textColor || '#FFFFFF',
          borderRadius: block.attrs.borderRadius || 8,
        };
      default:
        return {};
    }
  }, []);

  // 更新内容块列表
  const updateContentBlocksList = useCallback(() => {
    if (h5ServiceRef.current) {
      const blocks = h5ServiceRef.current.getAllContentBlocks();
      const blockData = blocks.map((block) => ({
        id: block.attrs.id,
        type: block.attrs.blockType,
        content: getBlockContent(block),
        style: block.getBlockStyle(),
        order: block.attrs.order,
      }));
      setContentBlocks(blockData);
    }
  }, [getBlockContent]);

  useEffect(() => {
    if (editor && containerRef.current) {
      try {
        // 初始化 H5 服务
        h5ServiceRef.current = editor?.editor && new H5Service(editor.editor);

        // 初始化 H5 编辑模式
        if (h5ServiceRef.current) {
          const container = h5ServiceRef.current.initializeH5Mode();

          console.log('H5 编辑模式已激活', container);

          // 等待一帧后更新内容块列表，确保容器已完全初始化
          requestAnimationFrame(() => {
            updateContentBlocksList();

            // 强制重新渲染编辑器，确保H5容器可见
            editor?.editor?.render();
          });

          // 监听编辑器选择变化
          const handleSelectionChange = () => {
            const selectedElements = editor?.editor?.selectedElements?.getItems();
            if (selectedElements && selectedElements.length === 1) {
              const selectedElement = selectedElements[0];
              if (
                selectedElement.attrs.id &&
                (selectedElement.attrs as any).blockType
              ) {
                setSelectedBlockId(selectedElement.attrs.id);
                setShowPropertyPanel(true);
              } else {
                setSelectedBlockId('');
                setShowPropertyPanel(false);
              }
            } else {
              setSelectedBlockId('');
              setShowPropertyPanel(false);
            }
          };

          editor?.editor?.selectedElements.on('itemsChange', handleSelectionChange);

          return () => {
            try {
              // 清理事件监听器
              editor?.editor?.selectedElements.off('itemsChange', handleSelectionChange);

              // 销毁H5服务
              if (h5ServiceRef.current) {
                h5ServiceRef.current.destroy();
                h5ServiceRef.current = null;
              }

              // 清理状态
              setSelectedBlockId('');
              setShowPropertyPanel(false);
              setContentBlocks([]);
            } catch (error) {
              console.warn('H5EditorMode清理过程中出现警告:', error);
            }
          };
        }
      } catch (error) {
        console.error('H5EditorMode初始化失败:', error);
      }
    }
  }, [editor, updateContentBlocksList]);

  const handleBlockSelect = (blockId: string) => {
    setSelectedBlockId(blockId);
    if (h5ServiceRef.current) {
      if (blockId) {
        h5ServiceRef.current.selectContentBlock(blockId);
        setShowPropertyPanel(true);
      } else {
        h5ServiceRef.current.clearSelection();
        setShowPropertyPanel(false);
      }
    }
  };

  const handleBlockAdd = (blockType: string) => {
    if (!h5ServiceRef.current) return;

    let newBlock;
    switch (blockType) {
      case 'text':
        newBlock = h5ServiceRef.current.addTextBlock();
        break;
      case 'image':
        newBlock = h5ServiceRef.current.addImageBlock();
        break;
      case 'button':
        newBlock = h5ServiceRef.current.addButtonBlock();
        break;
      default:
        return;
    }

    if (newBlock) {
      updateContentBlocksList();
      // 自动选择新添加的块
      setTimeout(() => {
        handleBlockSelect(newBlock.attrs.id);
      }, 100);
    }
  };

  const handleBlockDelete = (blockId: string) => {
    if (!h5ServiceRef.current) return;

    const success = h5ServiceRef.current.removeContentBlock(blockId);
    if (success) {
      updateContentBlocksList();
      if (selectedBlockId === blockId) {
        setSelectedBlockId('');
        setShowPropertyPanel(false);
      }
    }
  };

  const handleBlockReorder = (dragIndex: number, hoverIndex: number) => {
    if (!h5ServiceRef.current) return;

    const newOrder = [...contentBlocks];
    const draggedBlock = newOrder.splice(dragIndex, 1)[0];
    newOrder.splice(hoverIndex, 0, draggedBlock);

    const reorderedIds = newOrder.map((block) => block.id);
    h5ServiceRef.current.reorderContentBlocks(reorderedIds);
    updateContentBlocksList();
  };

  // 工具栏事件处理
  const handleAddTextBlock = () => handleBlockAdd('text');
  const handleAddImageBlock = () => handleBlockAdd('image');
  const handleAddButtonBlock = () => handleBlockAdd('button');

  const handleDeleteSelected = () => {
    if (selectedBlockId) {
      handleBlockDelete(selectedBlockId);
    }
  };

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleExport = async () => {
    if (!h5ServiceRef.current) return;

    try {
      const resolutions = [
        { width: 375, height: 667, name: '1x' },
        { width: 750, height: 1334, name: '2x' },
        { width: 1125, height: 2001, name: '3x' },
      ];

      const images = await h5ServiceRef.current.exportToImages(resolutions);

      // 下载图片
      Object.entries(images).forEach(([name, blob]) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `h5-long-image-${name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      console.log('H5长图导出成功');
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const handleSettings = () => {
    // TODO: 实现H5设置功能
    console.log('打开H5设置');
  };

  // 属性面板事件处理
  const handleUpdateBlock = (blockId: string, updates: any) => {
    if (!h5ServiceRef.current) return;

    h5ServiceRef.current.updateContentBlock(blockId, updates);
    updateContentBlocksList();
  };

  const handleClosePropertyPanel = () => {
    setShowPropertyPanel(false);
    setSelectedBlockId('');
    if (h5ServiceRef.current) {
      h5ServiceRef.current.clearSelection();
    }
  };

  // 获取选中的内容块
  const selectedBlock =
    contentBlocks.find((block) => block.id === selectedBlockId) || null;

  return (
    <div className="h5-editor-mode g-asset-forge-h5-mode" ref={containerRef}>
      {/* 左侧内容块面板 */}
      <div className="h5-left-panel">
        <ContentBlockPanel
          onBlockAdd={handleBlockAdd}
          selectedBlockId={selectedBlockId}
          contentBlocks={contentBlocks}
          onBlockSelect={handleBlockSelect}
          onBlockDelete={handleBlockDelete}
          onBlockReorder={handleBlockReorder}
        />
      </div>

      {/* H5画布区域 */}
      <div className="h5-canvas-area">
        <div className="editor-canvas-wrapper">
          {/* 编辑器画布将在这里渲染 */}
        </div>
        <H5Canvas
          contentBlocks={contentBlocks}
          selectedBlockId={selectedBlockId}
          onBlockSelect={handleBlockSelect}
          h5Service={h5ServiceRef.current}
        />
      </div>

      {/* 右侧属性面板 */}
      <div className="h5-right-panel">
        {showPropertyPanel && selectedBlock ? (
          <H5PropertyPanel
            selectedBlock={selectedBlock}
            onUpdateBlock={handleUpdateBlock}
            onClose={handleClosePropertyPanel}
          />
        ) : (
          <div className="h5-property-panel-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-title">属性面板</div>
              <div className="placeholder-text">选择一个内容块来编辑其属性</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
